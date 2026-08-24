import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getActiveSession } from '@/lib/test-session';
import { isSessionExpired } from '@/lib/deadline';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const testSession = await getActiveSession(session.user.id);
    if (!testSession) {
    const lastCompleted = await prisma.testSession.findFirst({
      where: { userId: session.user.id, status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
    });
    if (lastCompleted) {
      return NextResponse.json({ finished: true, alreadyCompleted: true });
    }
    return NextResponse.json({ error: 'Aucune session active' }, { status: 404 });
  }

  // 🛡️ Garde-fou : vérifie la deadline
  if (isSessionExpired(testSession)) {
    await prisma.testSession.update({
      where: { id: testSession.id },
      data: { status: 'EXPIRED', expiredAt: new Date() },
    });
    return NextResponse.json(
      { error: 'Deadline dépassée. Test clôturé.', expired: true },
      { status: 403 }
    );
  }

  // 🛡️ Garde-fou : statut doit être IN_PROGRESS
  if (testSession.status !== 'IN_PROGRESS') {
    return NextResponse.json(
      { error: 'Session non démarrée ou déjà terminée.' },
      { status: 403 }
    );
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

  // ============ Détection de la 1re question du bloc ============
  let isFirstOfBlock = false;
  if (question.blockNumber != null) {
    if (currentIndex === 0) {
      isFirstOfBlock = true;
    } else {
      const previousQuestionId = questionsOrder[currentIndex - 1];
      const previous = await prisma.question.findUnique({
        where: { id: previousQuestionId },
        select: { blockNumber: true },
      });
      isFirstOfBlock = previous?.blockNumber !== question.blockNumber;
    }
  }

  // A-t-il déjà répondu à une question de ce bloc ?
  // → si oui, on ne réaffiche pas l'interstitiel même en cas de reload
  let hasAnsweredInBlock = false;
  if (question.blockNumber != null) {
    const count = await prisma.answer.count({
      where: {
        testSessionId: testSession.id,
        question: { blockNumber: question.blockNumber },
      },
    });
    hasAnsweredInBlock = count > 0;
  }

 // Incrémenter le compteur (anti-cheat quit-detection)
// MAIS pas si l'interstitiel va être affiché : l'utilisateur ne voit pas
// encore la question, un reload pendant l'interstitiel ne doit pas la marquer fausse.
const willShowInterstitial = isFirstOfBlock && !hasAnsweredInBlock;

if (!willShowInterstitial) {
  await prisma.testSession.update({
    where: { id: testSession.id },
    data: { currentQuestionServedCount: { increment: 1 } },
  });
}


  return NextResponse.json({
    sessionId: testSession.id,
    currentIndex,
    totalQuestions: questionsOrder.length,
    question: {
      id: question.id,
      type: question.type,
      category: question.category,
      subCategory: question.subCategory,
      instruction: question.instruction,
      text: question.questionText,
      sourceText: question.sourceText,
      options: question.options,
      timeLimit: question.timeLimit,
      blockNumber: question.blockNumber,
    },
    isFirstOfBlock,
    hasAnsweredInBlock,
  });
}
