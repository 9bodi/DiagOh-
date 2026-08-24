import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TestStatus } from '@prisma/client';
import { getActiveSession } from '@/lib/test-session';
import { computeAndSaveScores } from '@/lib/scoring';
import { sendResultsAvailableEmail } from '@/lib/email';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://diag-oh.vercel.app';

export async function POST() {
  const session = await auth();
  if (!session || session.user.role !== 'USER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const active = await getActiveSession(session.user.id);

  // 🔁 Idempotence : si pas de session active, vérifier s'il y en a une déjà complétée
  if (!active) {
    const lastCompleted = await prisma.testSession.findFirst({
      where: { userId: session.user.id, status: TestStatus.COMPLETED },
      orderBy: { completedAt: 'desc' },
    });
    if (lastCompleted) {
      return NextResponse.json({
        completed: true,
        alreadyCompleted: true,
        sessionId: lastCompleted.id,
        level: lastCompleted.level,
        scoreProcedural: lastCompleted.scoreProcedural,
        scoreAdaptation: lastCompleted.scoreAdaptation,
        scoreInteret: lastCompleted.scoreInteret,
        quadrant: lastCompleted.quadrant,
      });
    }
    return NextResponse.json({ error: 'No active session' }, { status: 404 });
  }

  const scores = await computeAndSaveScores(active.id);

  await prisma.testSession.update({
    where: { id: active.id },
    data: {
      status: TestStatus.COMPLETED,
      completedAt: new Date(),
      scoreBloc1: scores.scoreBloc1,
      scoreBloc2: scores.scoreBloc2,
      scoreBloc3: scores.scoreBloc3,
      scoreBloc4: scores.scoreBloc4,
      scoreBloc5: scores.scoreBloc5,
      scoreBloc6: scores.scoreBloc6,
      scoreProcedural: scores.scoreProcedural,
      level: scores.level,
      scoreAdaptation: scores.scoreAdaptation,
      scoreInteret: scores.scoreInteret,
      quadrant: scores.quadrant,
      creditConsumed: true,
    },
  });

  // NOTIFICATION EMAIL (best-effort)
  try {
    const participant = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: { select: { name: true } } },
    });

    if (participant?.email && participant.organization) {
      await sendResultsAvailableEmail({
        to: participant.email,
        firstName: participant.firstName,
        organizationName: participant.organization.name,
        appUrl: APP_URL,
      });
    }
  } catch (err) {
    console.error('❌ Failed to send results email:', err);
  }

  return NextResponse.json({
    completed: true,
    alreadyCompleted: false,
    sessionId: active.id,
    level: scores.level,
    scoreProcedural: scores.scoreProcedural,
    scoreAdaptation: scores.scoreAdaptation,
    scoreInteret: scores.scoreInteret,
    quadrant: scores.quadrant,
  });
}
