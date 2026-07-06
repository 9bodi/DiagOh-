import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TestStatus } from '@prisma/client';
import { buildQuestionsOrder } from '@/lib/test-session';
import { isSessionExpired } from '@/lib/deadline';

export async function POST() {
  const session = await auth();

  if (!session || session.user.role !== 'USER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  // Récupère la session la plus récente
  const testSession = await prisma.testSession.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  // Cas 1 : aucune session → l'user n'a pas été invité correctement
  if (!testSession) {
    return NextResponse.json(
      { error: 'Aucune session de test. Contactez votre encadrant.' },
      { status: 403 }
    );
  }

  // Cas 2 : déjà terminée
  if (testSession.status === TestStatus.COMPLETED) {
    return NextResponse.json(
      { error: 'Test already completed', sessionId: testSession.id },
      { status: 409 }
    );
  }

  // Cas 3 : deadline dépassée → on expire
  if (isSessionExpired(testSession)) {
    await prisma.testSession.update({
      where: { id: testSession.id },
      data: { status: TestStatus.EXPIRED, expiredAt: new Date() },
    });
    return NextResponse.json(
      { error: 'Deadline dépassée. Contactez votre encadrant pour une prolongation.' },
      { status: 403 }
    );
  }

  // Cas 4 : en attente d'activation par l'admin
  if (testSession.status === TestStatus.PENDING) {
    return NextResponse.json(
      { error: 'Votre diagnostic n\'a pas encore été activé par votre encadrant.' },
      { status: 403 }
    );
  }

  // Cas 5 : déjà expirée (statut posé auparavant)
  if (testSession.status === TestStatus.EXPIRED) {
    return NextResponse.json(
      { error: 'Deadline dépassée. Contactez votre encadrant pour une prolongation.' },
      { status: 403 }
    );
  }

  // Cas 6 : en cours → on reprend telle quelle
  if (testSession.status === TestStatus.IN_PROGRESS) {
    return NextResponse.json({
      sessionId: testSession.id,
      resumed: true,
      currentQuestionIndex: testSession.currentQuestionIndex,
      questionsOrder: testSession.questionsOrder,
    });
  }

  // Cas 7 : READY_TO_START → on démarre pour de vrai
  // On génère l'ordre des questions et on passe en IN_PROGRESS
  const questionsOrder = await buildQuestionsOrder();

  if (questionsOrder.length === 0) {
    return NextResponse.json({ error: 'No questions available' }, { status: 500 });
  }

  const updatedSession = await prisma.testSession.update({
    where: { id: testSession.id },
    data: {
      status: TestStatus.IN_PROGRESS,
      currentQuestionIndex: 0,
      questionsOrder: questionsOrder,
      startedAt: new Date(),
    },
  });

  return NextResponse.json({
    sessionId: updatedSession.id,
    resumed: false,
    currentQuestionIndex: 0,
    questionsOrder,
  });
}
