import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendMagicLinkEmail } from '@/lib/email';

// ============ Helpers ============
function normalizeGroupName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

function normalizeForCompare(name: string): string {
  return normalizeGroupName(name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============ Schéma ============
const rowSchema = z.object({
  email: z.string(),
  group: z.string().optional().nullable(),
});

const bodySchema = z.object({
  rows: z.array(rowSchema).min(1, 'Aucune ligne à importer'),
});

// ============ POST /api/admin/import-users ============
export async function POST(request: Request) {
  const session = await auth();

  // Accès réservé aux ADMIN et SUPERADMIN
  if (
    !session?.user ||
    (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERADMIN')
  ) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const orgId = session.user.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: 'Aucune organisation associée' }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { rows } = parsed.data;

  // ===== Étape 1 : validation ligne par ligne =====
  interface ParsedRow {
    lineNumber: number; // 1-based, incluant la ligne d'en-tête
    email: string;
    groupName: string | null;
  }

  const errors: { line: number; email: string; reason: string }[] = [];
  const validRows: ParsedRow[] = [];

  rows.forEach((row, idx) => {
    const lineNumber = idx + 2; // +2 = ligne d'en-tête + index 0-based
    const rawEmail = (row.email ?? '').trim().toLowerCase();
    const rawGroup = row.group ? row.group.trim() : '';

    if (!rawEmail) {
      errors.push({ line: lineNumber, email: '', reason: 'Email manquant' });
      return;
    }
    if (!isValidEmail(rawEmail)) {
      errors.push({ line: lineNumber, email: rawEmail, reason: 'Email invalide' });
      return;
    }

    validRows.push({
      lineNumber,
      email: rawEmail,
      groupName: rawGroup || null,
    });
  });

  // Dédoublonnage interne au fichier (garde la première occurrence)
  const seenEmails = new Set<string>();
  const dedupedRows: ParsedRow[] = [];
  for (const r of validRows) {
    if (seenEmails.has(r.email)) {
      errors.push({
        line: r.lineNumber,
        email: r.email,
        reason: 'Email dupliqué dans le fichier (ignoré)',
      });
      continue;
    }
    seenEmails.add(r.email);
    dedupedRows.push(r);
  }

  if (dedupedRows.length === 0) {
    return NextResponse.json(
      { error: 'Aucune ligne valide à importer', errors },
      { status: 400 },
    );
  }

  // ===== Étape 2 : récupérer les users existants =====
  const emails = dedupedRows.map((r) => r.email);
  const existingUsers = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: {
      id: true,
      email: true,
      organizationId: true,
      groupId: true,
    },
  });

  const existingByEmail = new Map(existingUsers.map((u) => [u.email, u]));

  // Détecter les emails d'autres orgs → erreurs
  const foreignUsers = existingUsers.filter((u) => u.organizationId !== orgId);
  foreignUsers.forEach((u) => {
    const row = dedupedRows.find((r) => r.email === u.email);
    errors.push({
      line: row?.lineNumber ?? 0,
      email: u.email,
      reason: 'Email déjà utilisé dans une autre organisation',
    });
  });

  const foreignEmails = new Set(foreignUsers.map((u) => u.email));
  const processableRows = dedupedRows.filter((r) => !foreignEmails.has(r.email));

  // ===== Étape 3 : résolution / création des groupes =====
  const uniqueGroupNames = Array.from(
    new Set(
      processableRows
        .map((r) => r.groupName)
        .filter((g): g is string => !!g && g.length > 0),
    ),
  );

  const existingGroups = await prisma.group.findMany({
    where: { organizationId: orgId },
    select: { id: true, name: true },
  });

  const existingGroupByKey = new Map(
    existingGroups.map((g) => [normalizeForCompare(g.name), g]),
  );

  const groupsToCreate: string[] = [];
  const groupResolution = new Map<string, string>(); // groupName (raw) → groupId

  for (const rawName of uniqueGroupNames) {
    const cleanName = normalizeGroupName(rawName);
    const key = normalizeForCompare(cleanName);
    const match = existingGroupByKey.get(key);
    if (match) {
      groupResolution.set(rawName, match.id);
    } else {
      groupsToCreate.push(cleanName);
    }
  }

  // ===== Étape 4 : vérification des crédits AVANT traitement =====
  const newEmails = processableRows.filter((r) => !existingByEmail.has(r.email));
  const creditsNeeded = newEmails.length;

  const organization = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { credits: true, name: true },
  });

  if (!organization) {
    return NextResponse.json({ error: 'Organisation introuvable' }, { status: 404 });
  }

  if (creditsNeeded > organization.credits) {
    return NextResponse.json(
      {
        error: 'Crédits insuffisants',
        newEmailsCount: creditsNeeded,
        creditsAvailable: organization.credits,
        message: `L'import créerait ${creditsNeeded} participant(s) mais il ne reste que ${organization.credits} crédit(s). Import annulé.`,
      },
      { status: 402 },
    );
  }

  // ===== Étape 5 : traitement en transaction =====
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const magicLinksToSend: { email: string; magicLinkUrl: string }[] = [];
  let created = 0;
  let attributed = 0;
  let skipped = 0;
  const groupsCreatedNames: string[] = [];

  await prisma.$transaction(
    async (tx) => {
      // 5a) Créer les nouveaux groupes
      for (const groupName of groupsToCreate) {
        const created = await tx.group.create({
          data: { name: groupName, organizationId: orgId },
        });
        // Retrouver le rawName correspondant pour renseigner groupResolution
        const rawMatch = uniqueGroupNames.find(
          (r) => normalizeForCompare(normalizeGroupName(r)) === normalizeForCompare(groupName),
        );
        if (rawMatch) groupResolution.set(rawMatch, created.id);
        groupsCreatedNames.push(created.name);
      }

      // 5b) Traiter chaque ligne
      for (const row of processableRows) {
        const groupId = row.groupName ? groupResolution.get(row.groupName) ?? null : null;
        const existing = existingByEmail.get(row.email);

        if (existing) {
          // Existant : attribuer le groupe uniquement si l'user n'en a pas ET que le fichier en fournit un
          if (!existing.groupId && groupId) {
            await tx.user.update({
              where: { id: existing.id },
              data: { groupId },
            });
            attributed++;
          } else {
            skipped++;
          }
        } else {
          // Nouveau : créer user + session PENDING + magic-link
          const magicLinkToken = crypto.randomBytes(32).toString('hex');
          const magicLinkExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

          const newUser = await tx.user.create({
            data: {
              email: row.email,
              role: 'USER',
              organizationId: orgId,
              groupId,
              magicLinkToken,
              magicLinkExpiresAt,
              passwordCreated: false,
            },
          });

          await tx.testSession.create({
            data: {
              userId: newUser.id,
              status: 'PENDING',
              questionsOrder: [],
            },
          });

          await tx.organization.update({
            where: { id: orgId },
            data: { credits: { decrement: 1 } },
          });

          await tx.creditTransaction.create({
            data: {
              organizationId: orgId,
              amount: -1,
              reason: 'user_import',
              createdById: session.user.id,
            },
          });

          created++;
          magicLinksToSend.push({
            email: row.email,
            magicLinkUrl: `${baseUrl}/magic-link/${magicLinkToken}`,
          });
        }
      }
    },
    { timeout: 30000 }, // 30s pour gros imports
  );

  // ===== Étape 6 : envoi des emails (best-effort, hors transaction) =====
  const emailErrors: { email: string; error: string }[] = [];
  await Promise.allSettled(
    magicLinksToSend.map(async ({ email, magicLinkUrl }) => {
      try {
        await sendMagicLinkEmail({
          to: email,
          magicLinkUrl,
          organizationName: organization.name,
          recipientRole: 'USER',
        });
        console.log(`📧 Import — Magic link envoyé à ${email}`);
      } catch (err) {
        console.error(`❌ Import — Envoi échoué à ${email}:`, err);
        emailErrors.push({ email, error: String(err) });
      }
    }),
  );

  // ===== Étape 7 : rapport final =====
  const remainingOrg = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { credits: true },
  });

  return NextResponse.json({
    success: true,
    totalRows: rows.length,
    validRows: dedupedRows.length,
    created,
    attributed,
    skipped,
    groupsCreated: groupsCreatedNames,
    creditsUsed: created,
    creditsRemaining: remainingOrg?.credits ?? 0,
    errors,
    emailErrors: emailErrors.length > 0 ? emailErrors : undefined,
  });
}
