import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canManageParticipant, canAssignToGroup } from '@/lib/permissions';

const schema = z.object({
  userId: z.string().min(1),
  groupId: z.string().nullable(), // null = détacher du groupe
});

export async function POST(request: Request) {
  const session = await auth();

  // 1) Auth (rôle déjà étendu à SUPERVISOR ✓)
  if (
    !session?.user ||
    (session.user.role !== 'ADMIN' &&
      session.user.role !== 'SUPERADMIN' &&
      session.user.role !== 'SUPERVISOR')
  ) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }

  const { userId, groupId } = parsed.data;

  // 2) Vérif droit sur le participant source
  const canAct = await canManageParticipant(
    session.user.id,
    session.user.role,
    session.user.organizationId,
    userId,
  );
  if (!canAct) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: 'Participant introuvable' }, { status: 404 });
  }

  // 3) Cas spécial superviseur : ne peut PAS détacher un participant (groupId = null)
  // car il perdrait la visibilité sur ce participant immédiatement.
  if (session.user.role === 'SUPERVISOR' && groupId === null) {
    return NextResponse.json(
      { error: 'Un référent ne peut pas détacher un participant de tout groupe' },
      { status: 403 },
    );
  }

  // 4) Vérif droit sur le groupe de destination (si non null)
  if (groupId) {
    const canAssign = await canAssignToGroup(
      session.user.id,
      session.user.role,
      session.user.organizationId,
      groupId,
    );
    if (!canAssign) {
      return NextResponse.json(
        { error: "Vous n'avez pas accès au groupe de destination" },
        { status: 403 },
      );
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { groupId },
  });

  return NextResponse.json({ success: true });
}
