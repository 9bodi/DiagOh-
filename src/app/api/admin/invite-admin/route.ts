import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import { sendMagicLinkEmail } from '@/lib/email';
import { canManageAdmins } from '@/lib/permissions';

const schema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  organizationId: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== 'ADMIN' && role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }

  const { email, firstName, lastName } = parsed.data;

  // Détermine l'orga cible
  const targetOrgId =
    role === 'SUPERADMIN'
      ? parsed.data.organizationId
      : session.user.organizationId;

  if (!targetOrgId) {
    return NextResponse.json({ error: 'Organisation requise' }, { status: 400 });
  }

  if (!canManageAdmins(role, session.user.organizationId ?? null, targetOrgId)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  // Vérifie que l'orga existe
  const org = await prisma.organization.findUnique({
    where: { id: targetOrgId },
    select: { id: true, name: true },
  });
  if (!org) {
    return NextResponse.json({ error: 'Organisation introuvable' }, { status: 404 });
  }

  // Vérifie unicité email
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existing) {
    return NextResponse.json(
      { error: 'Un compte existe déjà avec cet email.' },
      { status: 400 }
    );
  }

  // Génère magic link (7 jours)
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const newAdmin = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      role: 'ADMIN',
      organizationId: targetOrgId,
      magicLinkToken: token,
      magicLinkExpiresAt: expiresAt,
      passwordCreated: false,
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const magicLinkUrl = `${baseUrl}/magic-link/${token}`;

  try {
    await sendMagicLinkEmail({
      to: email,
      magicLinkUrl,
      organizationName: org.name,
      recipientRole: 'ADMIN',
    });
  } catch (err) {
    return NextResponse.json({
      success: true,
      emailFailed: true,
      magicLinkUrl,
      userId: newAdmin.id,
    });
  }

  return NextResponse.json({
    success: true,
    magicLinkUrl,
    userId: newAdmin.id,
  });
}
