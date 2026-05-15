import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendMagicLinkEmail } from '@/lib/email';
import { z } from 'zod';
import crypto from 'crypto';

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
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

  const { email } = parsed.data;

  const organization = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
  });

  if (!organization) {
    return NextResponse.json({ error: 'Organisation introuvable' }, { status: 404 });
  }

  // Blocage si crédits insuffisants
  if (organization.credits <= 0) {
    return NextResponse.json(
      { error: 'Crédits insuffisants. Contactez OHé pour recharger votre compte.' },
      { status: 402 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: 'Cet email est déjà utilisé.' },
      { status: 409 }
    );
  }

  const magicLinkToken = crypto.randomBytes(32).toString('hex');
  const magicLinkExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Transaction : créer user + décrémenter crédit + log transaction
  const newUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        role: 'USER',
        organizationId: organization.id,
        magicLinkToken,
        magicLinkExpiresAt,
        passwordCreated: false,
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

  console.log(`\n📧 Magic link pour ${email}:\n   ${magicLinkUrl}\n`);

  await sendMagicLinkEmail({
    to: newUser.email,
    magicLinkUrl,
    organizationName: organization.name,
    recipientRole: 'USER',
  });

  return NextResponse.json({
    user: { id: newUser.id, email: newUser.email },
    magicLinkUrl,
  });
}
