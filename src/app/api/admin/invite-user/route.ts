import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

const inviteSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orgId = session.user.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: 'No organization' }, { status: 400 });
  }

  const body = await request.json();
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
  }
  const { email } = parsed.data;

  // Vérifier que l'email n'existe pas déjà
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: 'Un compte avec cet email existe déjà.' },
      { status: 409 }
    );
  }

  // Génère un magic link token unique
  const magicLinkToken = crypto.randomBytes(32).toString('hex');
  const magicLinkExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

  const newUser = await prisma.user.create({
    data: {
      email,
      role: 'USER',
      organizationId: orgId,
      magicLinkToken,
      magicLinkExpiresAt,
      passwordCreated: false,
    },
  });

  // Construit l'URL du magic link
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const magicLinkUrl = `${baseUrl}/magic-link/${magicLinkToken}`;

  // En dev : on log le lien dans la console serveur pour pouvoir le copier
  console.log(`\n📧 Magic link pour ${email}:`);
  console.log(`   ${magicLinkUrl}\n`);

  return NextResponse.json({
    user: { id: newUser.id, email: newUser.email },
    magicLinkUrl,
  });
}
