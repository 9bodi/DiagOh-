import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// ============ PATCH /api/admin/supervisors/[id] ============
const updateSchema = z.object({
  groupIds: z.array(z.string()).min(1, 'Au moins un groupe requis'),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERADMIN')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const orgId = session.user.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: 'Aucune organisation' }, { status: 400 });
  }

  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  // Vérifier que le superviseur appartient à l'organisation
  const supervisor = await prisma.user.findFirst({
    where: { id, organizationId: orgId, role: 'SUPERVISOR' },
  });
  if (!supervisor) {
    return NextResponse.json({ error: 'Référent introuvable.' }, { status: 404 });
  }

  // Vérifier que les groupes appartiennent à l'organisation
  const groups = await prisma.group.findMany({
    where: { id: { in: parsed.data.groupIds }, organizationId: orgId },
    select: { id: true },
  });
  if (groups.length !== parsed.data.groupIds.length) {
    return NextResponse.json(
      { error: 'Un ou plusieurs groupes sont invalides.' },
      { status: 400 }
    );
  }

  // Remplacer les groupes assignés
  const updated = await prisma.user.update({
    where: { id },
    data: {
      supervisedGroups: {
        set: parsed.data.groupIds.map((gid) => ({ id: gid })),
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

  return NextResponse.json({ supervisor: updated });
}

// ============ DELETE /api/admin/supervisors/[id] ============
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERADMIN')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const orgId = session.user.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: 'Aucune organisation' }, { status: 400 });
  }

  const { id } = await params;

  const supervisor = await prisma.user.findFirst({
    where: { id, organizationId: orgId, role: 'SUPERVISOR' },
  });
  if (!supervisor) {
    return NextResponse.json({ error: 'Référent introuvable.' }, { status: 404 });
  }

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
