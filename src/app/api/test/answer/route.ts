import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getActiveSession } from '@/lib/test-session';
import { isSessionExpired } from '@/lib/deadline';
import { z } from 'zod';

const schema = z.object({
  questionId: z.string().min(1),
  selectedOptionIndex: z.number().int().min(0).max(3).nullable(),
  timeSpent: z.number().int().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }

  const { questionId, selectedOptionIndex, timeSpent } = parsed.data;

  const testSession = await getActiveSession(session.user.id);
  if (!testSession) {
    return NextResponse.json({ error: 'Aucune session active' }, { status: 404 });
  }

  // 🛡️ Garde-fou : vérifie la deadline
  // Note : on autorise l'enregistrement de la réponse en cours même si la deadline
  // vient de passer (règle métier : "laisser finir la question en cours").
  // On expire la session APRÈS avoir enregistré la réponse.
  const expiredNow = isSessionExpired(testSession);

  // 🛡️ Garde-fou : statut doit être IN_PROGRESS
  if (testSession.status !== 'IN_PROGRESS') {
    return NextResponse.json(
      { error: 'Session non démarrée ou déjà terminée.' },
      { status: 403 }
    );
  }

  const questionsOrder = testSession.questionsOrder as string[];
  const expectedId = questionsOrder[testSession.currentQuestionIndex];
  if (expectedId !== questionId) {
    return NextResponse.json({ error: 'Question non attendue' }, { status: 400 });
  }

  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) {
    return NextResponse.json({ error: 'Question introuvable' }, { status: 404 });
  }

  const isCorrect =
    question.type === 'PROCEDURAL' &&
    selectedOptionIndex !== null &&
    selectedOptionIndex === question.correctAnswerIndex;

  await prisma.answer.upsert({
    where: {
      testSessionId_questionId: {
        testSessionId: testSession.id,
        questionId,
      },
    },
    update: { selectedOptionIndex, isCorrect, timeSpent },
    create: {
      testSessionId: testSession.id,
      questionId,
      selectedOptionIndex,
      isCorrect,
      timeSpent,
    },
  });

  const nextIndex = testSession.currentQuestionIndex + 1;

  // Si la deadline est passée, on clôture après avoir enregistré cette réponse
  if (expiredNow) {
    await prisma.testSession.update({
      where: { id: testSession.id },
      data: {
        status: 'EXPIRED',
        expiredAt: new Date(),
        currentQuestionServedCount: 0,
      },
    });
    return NextResponse.json({
      saved: true,
      finished: true,
      expired: true,
    });
  }

  await prisma.testSession.update({
    where: { id: testSession.id },
    data: {
      currentQuestionIndex: { increment: 1 },
      currentQuestionServedCount: 0,
    },
  });

  return NextResponse.json({
    saved: true,
    nextIndex,
    finished: nextIndex >= questionsOrder.length,
  });
}
