import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { z } from 'zod';
import { sendMagicLinkEmail } from '@/lib/email';


const schema = z.object({
  name: z.string().min(1).max(100),
  adminEmail: z.string().email(),
  credits: z.number().int().min(0),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }

  const { name, adminEmail, credits } = parsed.data;

  // Vérifier que l'email n'est pas déjà utilisé
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    return NextResponse.json(
      { error: 'Cet email est déjà utilisé.' },
      { status: 409 }
    );
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Transaction : créer org + admin + transaction de crédits
  const result = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: { name, credits },
    });

    const admin = await tx.user.create({
      data: {
        email: adminEmail,
        role: 'ADMIN',
        organizationId: org.id,
        magicLinkToken: token,
        magicLinkExpiresAt: expiresAt,
        passwordCreated: false,
      },
    });

    if (credits > 0) {
      await tx.creditTransaction.create({
        data: {
          organizationId: org.id,
          amount: credits,
          reason: 'initial_credits',
          createdById: session.user.id,
        },
      });
    }

    return { org, admin };
  });

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const magicLinkUrl = `${baseUrl}/magic-link/${token}`;

  console.log(`🔗 Magic link admin (${adminEmail}): ${magicLinkUrl}`);

    await sendMagicLinkEmail({
    to: adminEmail,
    magicLinkUrl,
    organizationName: name,
    recipientRole: 'ADMIN',
  });

  return NextResponse.json({
    success: true,
    organizationId: result.org.id,
    magicLinkUrl,
  });
}
