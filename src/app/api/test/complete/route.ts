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

  // Calcul des scores
  const { scoreProcedural, scoreDeclaratif, level, quadrant } =
    await computeAndSaveScores(active.id);

  // Marque la session comme complétée + sauvegarde les scores
  // Le crédit a déjà été consommé à l'invitation, plus rien à faire ici.
  await prisma.testSession.update({
    where: { id: active.id },
    data: {
      status: TestStatus.COMPLETED,
      completedAt: new Date(),
      scoreProcedural,
      scoreDeclaratif,
      level,
      quadrant,
      creditConsumed: true,
    },
  });

  return NextResponse.json({
    completed: true,
    sessionId: active.id,
    level,
    scoreProcedural,
    quadrant,
  });
}
