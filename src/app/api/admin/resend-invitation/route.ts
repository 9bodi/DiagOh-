import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendMagicLinkEmail } from '@/lib/email';
import crypto from 'crypto';
import { z } from 'zod';

const schema = z.object({
  userId: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }

  const { userId } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { organization: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
  }

  if (user.organizationId !== session.user.organizationId) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  if (user.passwordCreated) {
    return NextResponse.json(
      { error: 'Cet utilisateur a déjà activé son compte.' },
      { status: 400 }
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

  await sendMagicLinkEmail({
    to: user.email,
    magicLinkUrl,
    organizationName: user.organization?.name ?? 'Organisation',
    recipientRole: 'USER',
  });

  return NextResponse.json({ success: true });
}
