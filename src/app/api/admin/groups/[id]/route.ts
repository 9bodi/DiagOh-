import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

function normalizeForCompare(name: string): string {
  return normalizeName(name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

async function checkAccess(request: Request, groupId: string) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERADMIN')) {
    return { error: NextResponse.json({ error: 'Non autorisé' }, { status: 401 }) };
  }

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) {
    return { error: NextResponse.json({ error: 'Groupe introuvable' }, { status: 404 }) };
  }

  if (session.user.role === 'ADMIN' && group.organizationId !== session.user.organizationId) {
    return { error: NextResponse.json({ error: 'Accès refusé' }, { status: 403 }) };
  }

  return { session, group };
}

// ============ PATCH /api/admin/groups/[id] ============
const patchSchema = z.object({
  name: z.string().min(1).max(60),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await checkAccess(request, id);
  if ('error' in access) return access.error;

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Nom invalide' }, { status: 400 });
  }

  const cleanName = normalizeName(parsed.data.name);
  const compareKey = normalizeForCompare(cleanName);

  const siblings = await prisma.group.findMany({
    where: { organizationId: access.group.organizationId, id: { not: id } },
    select: { id: true, name: true },
  });
  const duplicate = siblings.find((g) => normalizeForCompare(g.name) === compareKey);
  if (duplicate) {
    return NextResponse.json(
      { error: `Un groupe "${duplicate.name}" existe déjà.` },
      { status: 409 }
    );
  }

  const updated = await prisma.group.update({
    where: { id },
    data: { name: cleanName },
  });

  return NextResponse.json({ group: updated });
}

// ============ DELETE /api/admin/groups/[id] ============
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await checkAccess(request, id);
  if ('error' in access) return access.error;

  // Compte le nombre de participants avant suppression pour le retour
  const participantsCount = await prisma.user.count({
    where: { groupId: id },
  });

  // La contrainte onDelete: SetNull détache automatiquement les participants
  // La table de jointure GroupSupervisors est purgée par Prisma
  await prisma.group.delete({ where: { id } });

  return NextResponse.json({
    success: true,
    detachedParticipants: participantsCount,
  });
}
