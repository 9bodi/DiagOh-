import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(100),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }

  const { token, password } = parsed.data;

  const user = await prisma.user.findFirst({
    where: { passwordResetToken: token },
  });

  if (!user) {
    return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 404 });
  }

  if (user.passwordResetExpiresAt && user.passwordResetExpiresAt < new Date()) {
    return NextResponse.json({ error: 'Ce lien a expiré. Refaites une demande.' }, { status: 410 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    },
  });

  return NextResponse.json({ success: true });
}
