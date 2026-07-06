import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canManageParticipant } from '@/lib/permissions';

const bodySchema = z.object({
  userId: z.string().min(1),
  deadline: z.string().datetime({ message: 'Date invalide' }),
});

export async function POST(request: Request) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== 'ADMIN' &&
      session.user.role !== 'SUPERADMIN' &&
      session.user.role !== 'SUPERVISOR')
  ) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }

  const { userId, deadline } = parsed.data;
  const deadlineDate = new Date(deadline);

  if (deadlineDate <= new Date()) {
    return NextResponse.json(
      { error: 'La date limite doit être dans le futur' },
      { status: 400 },
    );
  }

  // Vérifie que l'actor a le droit d'agir sur ce participant
  const canAct = await canManageParticipant(
    session.user.id,
    session.user.role,
    session.user.organizationId,
    userId,
  );
  if (!canAct) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { testSessions: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });

  if (!user) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
  }

  const currentSession = user.testSessions[0];
  if (!currentSession) {
    return NextResponse.json(
      { error: 'Aucune session de test pour cet utilisateur' },
      { status: 404 },
    );
  }

  if (currentSession.status === 'COMPLETED') {
    return NextResponse.json(
      { error: "Impossible de modifier la deadline d'un test terminé" },
      { status: 400 },
    );
  }

  const newStatus = currentSession.status === 'EXPIRED' ? 'READY_TO_START' : currentSession.status;

  await prisma.testSession.update({
    where: { id: currentSession.id },
    data: {
      deadline: deadlineDate,
      status: newStatus,
      expiredAt: newStatus === 'READY_TO_START' ? null : currentSession.expiredAt,
      reminderJ1SentAt: null,
    },
  });

  return NextResponse.json({ success: true });
}
