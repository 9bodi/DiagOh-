import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { canManageAdmins, canDeleteAdmin } from '@/lib/permissions';

const schema = z.object({
  userId: z.string(),
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

  const { userId } = parsed.data;

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, organizationId: true, email: true },
  });

  if (!target) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
  }

  if (target.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Cet utilisateur n\'est pas un admin.' },
      { status: 400 }
    );
  }

  if (!target.organizationId) {
    return NextResponse.json(
      { error: 'Admin sans organisation.' },
      { status: 400 }
    );
  }

  if (!canManageAdmins(role, session.user.organizationId ?? null, target.organizationId)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const check = await canDeleteAdmin(session.user.id, target.id, target.organizationId);
  if (!check.ok) {
    return NextResponse.json({ error: check.reason }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ success: true });
}
