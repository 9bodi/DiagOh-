import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const schema = z.object({
  token: z.string().min(1),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  password: z.string().min(8).max(100),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }

  const { token, firstName, lastName, password } = parsed.data;

  const user = await prisma.user.findFirst({
    where: { magicLinkToken: token },
  });

  if (!user) {
    return NextResponse.json({ error: 'Lien invalide' }, { status: 404 });
  }

  if (user.magicLinkExpiresAt && user.magicLinkExpiresAt < new Date()) {
    return NextResponse.json({ error: 'Lien expiré' }, { status: 410 });
  }

  if (user.passwordCreated) {
    return NextResponse.json({ error: 'Compte déjà activé' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

const updated = await prisma.user.update({
  where: { id: user.id },
  data: {
    firstName,
    lastName,
    passwordHash,
    passwordCreated: true,
    magicLinkToken: null,
    magicLinkExpiresAt: null,
  },
  select: { role: true },
});

const readySession = await prisma.testSession.findFirst({
  where: { userId: user.id, status: 'READY_TO_START' },
  select: { id: true },
});

return NextResponse.json({
  success: true,
  role: updated.role,
  hasReadySession: !!readySession,
});


}
