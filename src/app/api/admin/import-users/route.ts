import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendMagicLinkEmail } from '@/lib/email';

export const maxDuration = 60; // 60 secondes max pour cette route

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
    lineNumber: number;
    email: string;
    groupName: string | null;
  }

  const errors: { line: number; email: string; reason: string }[] = [];
  const validRows: ParsedRow[] = [];

  rows.forEach((row, idx) => {
    const lineNumber = idx + 2;
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
  const groupResolution = new Map<string, string>();

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

  // Capture les valeurs pour les closures async
  const orgName = organization.name;

  // ===== Étape 5 : traitement en transaction =====
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const magicLinksToSend: { email: string; magicLinkUrl: string }[] = [];
  let created = 0;
  let attributed = 0;
  let skipped = 0;
  const groupsCreatedNames: string[] = [];

  await prisma.$transaction(
    async (tx) => {
      for (const groupName of groupsToCreate) {
        const newGroup = await tx.group.create({
          data: { name: groupName, organizationId: orgId },
        });
        const rawMatch = uniqueGroupNames.find(
          (r) => normalizeForCompare(normalizeGroupName(r)) === normalizeForCompare(groupName),
        );
        if (rawMatch) groupResolution.set(rawMatch, newGroup.id);
        groupsCreatedNames.push(newGroup.name);
      }

      const usersToUpdate: { id: string; groupId: string }[] = [];
      const newUserRows: {
        id: string;
        email: string;
        groupId: string | null;
        magicLinkToken: string;
        magicLinkUrl: string;
      }[] = [];

      for (const row of processableRows) {
        const groupId = row.groupName ? groupResolution.get(row.groupName) ?? null : null;
        const existing = existingByEmail.get(row.email);

        if (existing) {
          if (!existing.groupId && groupId) {
            usersToUpdate.push({ id: existing.id, groupId });
            attributed++;
          } else {
            skipped++;
          }
        } else {
          const id = crypto.randomUUID();
          const magicLinkToken = crypto.randomBytes(32).toString('hex');
          newUserRows.push({
            id,
            email: row.email,
            groupId,
            magicLinkToken,
            magicLinkUrl: `${baseUrl}/magic-link/${magicLinkToken}`,
          });
        }
      }

      for (const u of usersToUpdate) {
        await tx.user.update({ where: { id: u.id }, data: { groupId: u.groupId } });
      }

      if (newUserRows.length > 0) {
        const magicLinkExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await tx.user.createMany({
          data: newUserRows.map((u) => ({
            id: u.id,
            email: u.email,
            role: 'USER',
            organizationId: orgId,
            groupId: u.groupId,
            magicLinkToken: u.magicLinkToken,
            magicLinkExpiresAt,
            passwordCreated: false,
          })),
        });

        await tx.testSession.createMany({
          data: newUserRows.map((u) => ({
            userId: u.id,
            status: 'PENDING',
            questionsOrder: [],
          })),
        });

        await tx.organization.update({
          where: { id: orgId },
          data: { credits: { decrement: newUserRows.length } },
        });

        await tx.creditTransaction.createMany({
          data: newUserRows.map(() => ({
            organizationId: orgId,
            amount: -1,
            reason: 'user_import',
            createdById: session.user.id,
          })),
        });

        created = newUserRows.length;
        magicLinksToSend.push(
          ...newUserRows.map((u) => ({ email: u.email, magicLinkUrl: u.magicLinkUrl })),
        );
      }
    },
    { timeout: 30000 },
  );

  // ===== Étape 6 : envoi des emails (séquentiel avec throttle + retry) =====
  const emailErrors: { email: string; error: string }[] = [];
  const emailsSent: string[] = [];

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  async function sendWithRetry(
    email: string,
    magicLinkUrl: string,
    maxRetries = 3,
  ): Promise<void> {
    let lastError: unknown = null;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await sendMagicLinkEmail({
          to: email,
          magicLinkUrl,
          organizationName: orgName,
          recipientRole: 'USER',
        });
        return;
      } catch (err) {
        lastError = err;
        const msg = String(err);
        const isRateLimit = msg.includes('429') || msg.toLowerCase().includes('rate');
        if (!isRateLimit || attempt === maxRetries - 1) break;
        const backoff = 1000 * Math.pow(2, attempt);
        console.warn(`⏳ Rate limit sur ${email}, retry dans ${backoff}ms (tentative ${attempt + 2}/${maxRetries})`);
        await sleep(backoff);
      }
    }
    throw lastError;
  }

  for (const { email, magicLinkUrl } of magicLinksToSend) {
    try {
      await sendWithRetry(email, magicLinkUrl);
      emailsSent.push(email);
      console.log(`📧 Import — Magic link envoyé à ${email}`);
    } catch (err) {
      console.error(`❌ Import — Envoi échoué à ${email}:`, err);
      emailErrors.push({ email, error: String(err) });
    }
    await sleep(200);
  }

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
    emailsSent: emailsSent.length,
    emailErrors: emailErrors.length > 0 ? emailErrors : undefined,
  });
}
