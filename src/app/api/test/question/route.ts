import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getActiveSession } from '@/lib/test-session';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const testSession = await getActiveSession(session.user.id);
  if (!testSession) {
    return NextResponse.json({ error: 'Aucune session active' }, { status: 404 });
  }

  const questionsOrder = testSession.questionsOrder as string[];
  let currentIndex = testSession.currentQuestionIndex;
  let servedCount = testSession.currentQuestionServedCount;

  // Anti-cheat : si la question courante a déjà été servie >= 2 fois → quit détecté
  if (servedCount >= 1 && currentIndex < questionsOrder.length) {
    const previousQuestionId = questionsOrder[currentIndex];

    await prisma.answer.upsert({
      where: {
        testSessionId_questionId: {
          testSessionId: testSession.id,
          questionId: previousQuestionId,
        },
      },
      update: { selectedOptionIndex: null, isCorrect: false },
      create: {
        testSessionId: testSession.id,
        questionId: previousQuestionId,
        selectedOptionIndex: null,
        isCorrect: false,
      },
    });

    await prisma.testSession.update({
      where: { id: testSession.id },
      data: {
        currentQuestionIndex: { increment: 1 },
        currentQuestionServedCount: 0,
      },
    });

    currentIndex = currentIndex + 1;
    servedCount = 0;
  }

  // Test fini ?
  if (currentIndex >= questionsOrder.length) {
    return NextResponse.json({ finished: true });
  }

  const questionId = questionsOrder[currentIndex];
  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    return NextResponse.json({ error: 'Question introuvable' }, { status: 404 });
  }

  // Incrémenter le compteur
  await prisma.testSession.update({
    where: { id: testSession.id },
    data: { currentQuestionServedCount: { increment: 1 } },
  });

  return NextResponse.json({
    sessionId: testSession.id,
    currentIndex,
    totalQuestions: questionsOrder.length,
    question: {
  id: question.id,
  type: question.type,
  category: question.category,
  subCategory: question.subCategory,
  text: question.questionText,
  sourceText: question.sourceText,
  options: question.options,
  timeLimit: question.timeLimit,
},

  });
}
