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

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  let magicLinkUrl: string;
  let mode: 'invitation' | 'reminder';

  if (user.passwordCreated) {
    // Utilisateur déjà inscrit → rappel vers /login
    magicLinkUrl = `${baseUrl}/login`;
    mode = 'reminder';
  } else {
    // Non inscrit → nouveau magic link
    const magicLinkToken = crypto.randomBytes(32).toString('hex');
    const magicLinkExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { magicLinkToken, magicLinkExpiresAt },
    });

    magicLinkUrl = `${baseUrl}/magic-link/${magicLinkToken}`;
    mode = 'invitation';
  }

  console.log(`\n📧 ${mode === 'reminder' ? 'Rappel' : 'Magic link'} pour ${user.email}:\n   ${magicLinkUrl}\n`);

  try {
    await sendMagicLinkEmail({
      to: user.email,
      magicLinkUrl,
      organizationName: user.organization?.name ?? 'Organisation',
      recipientRole: 'USER',
      mode,
    });
  } catch (emailErr) {
    console.error('⚠️ Envoi email échoué:', emailErr);
    return NextResponse.json({
      success: true,
      emailFailed: true,
      magicLinkUrl,
    });
  }

  return NextResponse.json({ success: true, magicLinkUrl });
}
