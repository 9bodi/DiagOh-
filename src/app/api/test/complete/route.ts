import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TestStatus } from '@prisma/client';
import { getActiveSession } from '@/lib/test-session';
import { computeAndSaveScores } from '@/lib/scoring';

export async function POST() {
  const session = await auth();
  if (!session || session.user.role !== 'USER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const active = await getActiveSession(session.user.id);
  if (!active) {
    return NextResponse.json({ error: 'No active session' }, { status: 404 });
  }

  const scores = await computeAndSaveScores(active.id);

  // Marque la session comme complétée + sauvegarde tous les scores
  // Le crédit a déjà été consommé à l'invitation, plus rien à faire ici.
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

  return NextResponse.json({
    completed: true,
    sessionId: active.id,
    level: scores.level,
    scoreProcedural: scores.scoreProcedural,
    scoreAdaptation: scores.scoreAdaptation,
    scoreInteret: scores.scoreInteret,
    quadrant: scores.quadrant,
  });
}
