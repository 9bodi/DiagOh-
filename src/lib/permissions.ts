import { prisma } from '@/lib/prisma';

/**
 * Retourne la liste des IDs de groupes qu'un utilisateur peut consulter/gérer.
 * - ADMIN / SUPERADMIN : tous les groupes de leur organisation
 * - SUPERVISOR : uniquement les groupes qu'il supervise
 * - USER : aucun (n'a pas accès au back-office)
 */
export async function getAccessibleGroupIds(
  userId: string,
  role: string,
  organizationId: string | null
): Promise<string[]> {
  if (!organizationId) return [];

  if (role === 'ADMIN' || role === 'SUPERADMIN') {
    const groups = await prisma.group.findMany({
      where: { organizationId },
      select: { id: true },
    });
    return groups.map((g) => g.id);
  }

  if (role === 'SUPERVISOR') {
    const supervisor = await prisma.user.findUnique({
      where: { id: userId },
      select: { supervisedGroups: { select: { id: true } } },
    });
    return supervisor?.supervisedGroups.map((g) => g.id) ?? [];
  }

  return [];
}

/**
 * Construit le filtre Prisma pour les participants visibles par un utilisateur.
 * ADMIN / SUPERADMIN : tous les USER de l'organisation.
 * SUPERVISOR : uniquement les USER dont le groupId est dans ses groupes supervisés.
 */
export async function buildParticipantsWhereClause(
  userId: string,
  role: string,
  organizationId: string | null
) {
  if (!organizationId) {
    return { id: '__none__' }; // filtre impossible → aucun résultat
  }

  const baseWhere = {
    organizationId,
    role: 'USER' as const,
  };

  if (role === 'ADMIN' || role === 'SUPERADMIN') {
    return baseWhere;
  }

  if (role === 'SUPERVISOR') {
    const accessibleGroupIds = await getAccessibleGroupIds(userId, role, organizationId);
    return {
      ...baseWhere,
      groupId: { in: accessibleGroupIds },
    };
  }

  return { id: '__none__' };
}

/**
 * Vérifie qu'un utilisateur a le droit d'agir sur un participant donné.
 * Retourne true si autorisé, false sinon.
 */
export async function canManageParticipant(
  actorUserId: string,
  actorRole: string,
  actorOrgId: string | null,
  targetUserId: string
): Promise<boolean> {
  if (!actorOrgId) return false;

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { organizationId: true, groupId: true, role: true },
  });

  if (!target || target.organizationId !== actorOrgId) return false;
  if (target.role !== 'USER') return false;

  if (actorRole === 'ADMIN' || actorRole === 'SUPERADMIN') return true;

  if (actorRole === 'SUPERVISOR') {
    if (!target.groupId) return false;
    const accessibleGroupIds = await getAccessibleGroupIds(
      actorUserId,
      actorRole,
      actorOrgId
    );
    return accessibleGroupIds.includes(target.groupId);
  }

  return false;
}

/**
 * Vérifie qu'un utilisateur peut assigner un participant à un groupe donné.
 * Un SUPERVISOR ne peut assigner qu'à ses groupes supervisés.
 */
export async function canAssignToGroup(
  actorUserId: string,
  actorRole: string,
  actorOrgId: string | null,
  targetGroupId: string | null
): Promise<boolean> {
  if (!actorOrgId) return false;

  // Cas "Sans groupe"
  if (targetGroupId === null) {
    // Seuls ADMIN/SUPERADMIN peuvent détacher/inviter sans groupe
    return actorRole === 'ADMIN' || actorRole === 'SUPERADMIN';
  }

  // Vérifie que le groupe existe dans l'org
  const group = await prisma.group.findUnique({
    where: { id: targetGroupId },
    select: { organizationId: true },
  });
  if (!group || group.organizationId !== actorOrgId) return false;

  if (actorRole === 'ADMIN' || actorRole === 'SUPERADMIN') return true;

  if (actorRole === 'SUPERVISOR') {
    const accessibleGroupIds = await getAccessibleGroupIds(
      actorUserId,
      actorRole,
      actorOrgId
    );
    return accessibleGroupIds.includes(targetGroupId);
  }

  return false;
}
