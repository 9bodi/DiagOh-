import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';
import { z } from 'zod';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://diag-oh.vercel.app';

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Adresse email invalide' }, { status: 400 });
  }

  const { email } = parsed.data;

  // On cherche l'utilisateur — mais on renvoie toujours 200
  // pour ne pas révéler si un email existe ou non (best practice sécu)
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (user && user.passwordCreated) {
    // Génère un token cryptographiquement sûr
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpiresAt: expiresAt,
      },
    });

    const resetUrl = `${APP_URL}/reset-password/${token}`;

    await sendPasswordResetEmail({
      to: user.email,
      firstName: user.firstName,
      resetUrl,
    });
  }

  // Toujours 200, même si l'utilisateur n'existe pas
  return NextResponse.json({ success: true });
}
