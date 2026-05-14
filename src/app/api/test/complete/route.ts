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
  const { scoreProcedural, scoreDeclaratif, level, quadrant } = await computeAndSaveScores(active.id);

  // Transaction : marquer COMPLETED + consommer 1 crédit organisation
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true },
  });

  await prisma.$transaction(async (tx) => {
    // Marque la session comme complétée + sauvegarde les scores
    await tx.testSession.update({
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

    // Consomme 1 crédit organisation (si l'user appartient à une orga)
    if (user?.organizationId && !active.creditConsumed) {
      await tx.organization.update({
        where: { id: user.organizationId },
        data: { credits: { decrement: 1 } },
      });
      await tx.creditTransaction.create({
        data: {
          organizationId: user.organizationId,
          amount: -1,
          reason: `Test completed by user ${session.user.email}`,
        },
      });
    }
  });

  return NextResponse.json({
    completed: true,
    sessionId: active.id,
    level,
    scoreProcedural,
    quadrant,
  });
}
