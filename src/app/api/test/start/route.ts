import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TestStatus } from '@prisma/client';
import { buildQuestionsOrder, getActiveSession, getCompletedSession } from '@/lib/test-session';

export async function POST() {
  const session = await auth();

  if (!session || session.user.role !== 'USER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  // 1. Si une session est déjà complétée → refuse
  const completed = await getCompletedSession(userId);
  if (completed) {
    return NextResponse.json(
      { error: 'Test already completed', sessionId: completed.id },
      { status: 409 }
    );
  }

  // 2. Si une session est en cours → on la reprend
  const active = await getActiveSession(userId);
  if (active) {
    return NextResponse.json({
      sessionId: active.id,
      resumed: true,
      currentQuestionIndex: active.currentQuestionIndex,
      questionsOrder: active.questionsOrder,
    });
  }

  // 3. Sinon, on en crée une nouvelle
  const questionsOrder = await buildQuestionsOrder();

  if (questionsOrder.length === 0) {
    return NextResponse.json({ error: 'No questions available' }, { status: 500 });
  }

  const newSession = await prisma.testSession.create({
    data: {
      userId,
      status: TestStatus.IN_PROGRESS,
      currentQuestionIndex: 0,
      questionsOrder: questionsOrder,
      startedAt: new Date(),
    },
  });

  return NextResponse.json({
    sessionId: newSession.id,
    resumed: false,
    currentQuestionIndex: 0,
    questionsOrder,
  });
}
