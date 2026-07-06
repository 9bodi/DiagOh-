import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedCronRequest } from '@/lib/cron-auth';

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();

  // Trouve toutes les sessions qui ont une deadline dépassée et ne sont pas déjà terminées/expirées
  const toExpire = await prisma.testSession.findMany({
    where: {
      deadline: { lt: now },
      status: { in: ['READY_TO_START', 'IN_PROGRESS'] },
    },
    select: { id: true, userId: true },
  });

  if (toExpire.length === 0) {
    return NextResponse.json({ expired: 0, message: 'Aucune session à expirer.' });
  }

  const result = await prisma.testSession.updateMany({
    where: {
      id: { in: toExpire.map((s) => s.id) },
    },
    data: {
      status: 'EXPIRED',
      expiredAt: now,
    },
  });

  console.log(`⏰ Cron expire-sessions : ${result.count} session(s) expirée(s)`);

  return NextResponse.json({
    expired: result.count,
    sessionIds: toExpire.map((s) => s.id),
  });
}
