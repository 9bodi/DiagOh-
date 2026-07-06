import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendMagicLinkEmail } from '@/lib/email';

// ============ GET /api/admin/supervisors ============
export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERADMIN')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const orgId = session.user.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: 'Aucune organisation' }, { status: 400 });
  }

  const supervisors = await prisma.user.findMany({
    where: {
      organizationId: orgId,
      role: 'SUPERVISOR',
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      passwordCreated: true,
      createdAt: true,
      supervisedGroups: {
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      },
    },
  });

  return NextResponse.json({ supervisors });
}

// ============ POST /api/admin/supervisors ============
const createSchema = z.object({
  email: z.string().email('Email invalide'),
  groupIds: z.array(z.string()).min(1, 'Au moins un groupe requis'),
});


export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERADMIN')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const orgId = session.user.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: 'Aucune organisation' }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { email, groupIds } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  // Vérifier que l'email n'est pas déjà utilisé
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json(
      { error: 'Un utilisateur avec cet email existe déjà.' },
      { status: 409 }
    );
  }

  // Vérifier que tous les groupes appartiennent à l'organisation
  const groups = await prisma.group.findMany({
    where: { id: { in: groupIds }, organizationId: orgId },
    select: { id: true },
  });
  if (groups.length !== groupIds.length) {
    return NextResponse.json(
      { error: 'Un ou plusieurs groupes sont invalides.' },
      { status: 400 }
    );
  }

  // Générer le magic link
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 jours

  const supervisor = await prisma.user.create({
    data: {
      email: normalizedEmail,
      role: 'SUPERVISOR',
      organizationId: orgId,
      magicLinkToken: token,
      magicLinkExpiresAt: expiresAt,
      passwordCreated: false,
      supervisedGroups: {
        connect: groupIds.map((id) => ({ id })),
      },
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      supervisedGroups: { select: { id: true, name: true } },
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
const magicLinkUrl = `${baseUrl}/magic-link/${token}`;


  // Récupérer le nom de l'organisation pour l'email
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { name: true },
  });

  // Envoi de l'email d'invitation (rôle ADMIN pour reprendre le style existant)
  await sendMagicLinkEmail({
    to: normalizedEmail,
    magicLinkUrl,
    organizationName: org?.name ?? 'votre organisation',
    recipientRole: 'ADMIN', // ou 'SUPERVISOR' si tu ajoutes ce cas dans email.ts
  });

  return NextResponse.json({ supervisor, magicLinkUrl }, { status: 201 });
}
