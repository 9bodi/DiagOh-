import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendMagicLinkEmail } from '@/lib/email';
import { canAssignToGroup } from '@/lib/permissions';
import { z } from 'zod';
import crypto from 'crypto';

const schema = z.object({
  email: z.string().email(),
  groupId: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  const session = await auth();

  // 1) Auth étendue à SUPERVISOR
  if (
    !session?.user ||
    (session.user.role !== 'ADMIN' &&
      session.user.role !== 'SUPERADMIN' &&
      session.user.role !== 'SUPERVISOR')
  ) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  if (!session.user.organizationId) {
    return NextResponse.json({ error: 'Aucune organisation associée' }, { status: 400 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
  }

  const { email, groupId } = parsed.data;

  // 2) Superviseur : groupId obligatoire
  if (session.user.role === 'SUPERVISOR' && !groupId) {
    return NextResponse.json(
      { error: 'Un référent doit assigner le participant à un de ses groupes' },
      { status: 400 },
    );
  }

  const organization = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
  });

  if (!organization) {
    return NextResponse.json({ error: 'Organisation introuvable' }, { status: 404 });
  }

  if (organization.credits <= 0) {
    return NextResponse.json(
      { error: 'Crédits insuffisants. Contactez OHé pour recharger votre compte.' },
      { status: 402 },
    );
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json(
      { error: 'Cet email est déjà utilisé.' },
      { status: 409 },
    );
  }

  // 3) Vérif groupe + droit d'assignation via canAssignToGroup
  if (groupId) {
    const canAssign = await canAssignToGroup(
      session.user.id,
      session.user.role,
      session.user.organizationId,
      groupId,
    );
    if (!canAssign) {
      return NextResponse.json(
        { error: "Vous n'avez pas accès à ce groupe" },
        { status: 403 },
      );
    }
  }

  const magicLinkToken = crypto.randomBytes(32).toString('hex');
  const magicLinkExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const newUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: normalizedEmail,
        role: 'USER',
        organizationId: organization.id,
        groupId: groupId ?? null,
        magicLinkToken,
        magicLinkExpiresAt,
        passwordCreated: false,
      },
    });

    await tx.testSession.create({
      data: {
        userId: user.id,
        status: 'PENDING',
        questionsOrder: [],
      },
    });

    await tx.organization.update({
      where: { id: organization.id },
      data: { credits: { decrement: 1 } },
    });

    await tx.creditTransaction.create({
      data: {
        organizationId: organization.id,
        amount: -1,
        reason: 'user_invitation',
        createdById: session.user.id,
      },
    });

    return user;
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const magicLinkUrl = `${baseUrl}/magic-link/${magicLinkToken}`;

  console.log(`\n📧 Magic link pour ${normalizedEmail}:\n   ${magicLinkUrl}\n`);

  try {
    await sendMagicLinkEmail({
      to: newUser.email,
      magicLinkUrl,
      organizationName: organization.name,
      recipientRole: 'USER',
    });
  } catch (emailErr) {
    console.error('⚠️ Envoi email participant échoué:', emailErr);
    // On continue — le magic link est renvoyé au front pour copie manuelle
  }

  return NextResponse.json({
    user: { id: newUser.id, email: newUser.email },
    magicLinkUrl,
  });
}
