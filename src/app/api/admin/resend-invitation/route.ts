import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendMagicLinkEmail } from '@/lib/email';
import { canManageParticipant } from '@/lib/permissions';
import crypto from 'crypto';
import { z } from 'zod';

const schema = z.object({
  userId: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();

  // 1) Auth étendue à SUPERADMIN et SUPERVISOR
  if (
    !session?.user ||
    (session.user.role !== 'ADMIN' &&
      session.user.role !== 'SUPERADMIN' &&
      session.user.role !== 'SUPERVISOR')
  ) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }

  const { userId } = parsed.data;

  // 2) Vérification via canManageParticipant
  const canAct = await canManageParticipant(
    session.user.id,
    session.user.role,
    session.user.organizationId,
    userId,
  );
  if (!canAct) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { organization: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
  }

  if (user.passwordCreated) {
    return NextResponse.json(
      { error: 'Cet utilisateur a déjà activé son compte.' },
      { status: 400 },
    );
  }

  const magicLinkToken = crypto.randomBytes(32).toString('hex');
  const magicLinkExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { magicLinkToken, magicLinkExpiresAt },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const magicLinkUrl = `${baseUrl}/magic-link/${magicLinkToken}`;

  console.log(`\n📧 Nouveau magic link pour ${user.email}:\n   ${magicLinkUrl}\n`);

  try {
    await sendMagicLinkEmail({
      to: user.email,
      magicLinkUrl,
      organizationName: user.organization?.name ?? 'Organisation',
      recipientRole: 'USER',
    });
  } catch (emailErr) {
    console.error('⚠️ Envoi email échoué:', emailErr);
    // On renvoie le magicLinkUrl pour permettre à l'admin de le copier manuellement
    return NextResponse.json({
      success: true,
      emailFailed: true,
      magicLinkUrl,
    });
  }

  return NextResponse.json({ success: true, magicLinkUrl });
}
