import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: 'userId manquant' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organization: true,
      testSessions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!user || user.organizationId !== session.user.organizationId) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
  }

  const lastSession = user.testSessions[0];

  if (!lastSession) {
    return NextResponse.json({ error: 'Aucune session à réinitialiser' }, { status: 400 });
  }

  const wasCompleted = lastSession.status === 'COMPLETED';

  // Si reset d'un test terminé → on consomme 1 nouveau crédit
  if (wasCompleted) {
    if (!user.organization || user.organization.credits <= 0) {
      return NextResponse.json(
        { error: 'Crédits insuffisants pour faire repasser le test.' },
        { status: 402 }
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    // Suppression de la session et ses réponses
    await tx.answer.deleteMany({ where: { testSessionId: lastSession.id } });
    await tx.testSession.delete({ where: { id: lastSession.id } });

    // Si reset d'un test COMPLETED → décrément crédit + transaction
    if (wasCompleted && user.organization) {
      await tx.organization.update({
        where: { id: user.organization.id },
        data: { credits: { decrement: 1 } },
      });

      await tx.creditTransaction.create({
        data: {
          organizationId: user.organization.id,
          amount: -1,
          reason: 'retest_after_completion',
          createdById: session.user.id,
        },
      });
    }
  });

  return NextResponse.json({
    success: true,
    wasCompleted,
    message: 'Session réinitialisée avec succès',
  });
}
