import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getActiveSession } from '@/lib/test-session';

const answerSchema = z.object({
  questionId: z.string(),
  selectedOptionIndex: z.number().int().min(0).max(3).nullable(),
  timeSpent: z.number().int().min(0).optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== 'USER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = answerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  const { questionId, selectedOptionIndex, timeSpent } = parsed.data;

  const active = await getActiveSession(session.user.id);
  if (!active) {
    return NextResponse.json({ error: 'No active session' }, { status: 404 });
  }

  // Vérifie qu'on attend bien cette question (anti-triche basique)
  const questionsOrder = active.questionsOrder as string[];
  const expectedQuestionId = questionsOrder[active.currentQuestionIndex];
  if (expectedQuestionId !== questionId) {
    return NextResponse.json({ error: 'Question mismatch' }, { status: 400 });
  }

  // Récupère la question pour comparer la bonne réponse
  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });
  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  const isCorrect =
    question.type === 'PROCEDURAL' &&
    selectedOptionIndex !== null &&
    selectedOptionIndex === question.correctAnswerIndex;

  // Sauvegarde la réponse (upsert pour éviter doublons si retry)
  await prisma.answer.upsert({
    where: {
      testSessionId_questionId: {
        testSessionId: active.id,
        questionId,
      },
    },
    update: {
      selectedOptionIndex,
      isCorrect,
      timeSpent,
      answeredAt: new Date(),
    },
    create: {
      testSessionId: active.id,
      questionId,
      selectedOptionIndex,
      isCorrect,
      timeSpent,
    },
  });

  // Avance l'index
  const newIndex = active.currentQuestionIndex + 1;
  const isFinished = newIndex >= questionsOrder.length;

  await prisma.testSession.update({
    where: { id: active.id },
    data: { currentQuestionIndex: newIndex },
  });

  return NextResponse.json({
    saved: true,
    nextIndex: newIndex,
    finished: isFinished,
  });
}
