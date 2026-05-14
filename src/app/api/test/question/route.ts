import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getActiveSession } from '@/lib/test-session';

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== 'USER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const active = await getActiveSession(session.user.id);
  if (!active) {
    return NextResponse.json({ error: 'No active session' }, { status: 404 });
  }

  const questionsOrder = active.questionsOrder as string[];
  const currentIndex = active.currentQuestionIndex;

  if (currentIndex >= questionsOrder.length) {
    return NextResponse.json({ finished: true });
  }

  const questionId = questionsOrder[currentIndex];
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: {
      id: true,
      type: true,
      category: true,
      subCategory: true,
      questionText: true,
      options: true,
      timeLimit: true,
      // ⚠️ on ne renvoie PAS correctAnswerIndex au client
    },
  });

  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  return NextResponse.json({
    sessionId: active.id,
    currentIndex,
    totalQuestions: questionsOrder.length,
    question,
  });
}
