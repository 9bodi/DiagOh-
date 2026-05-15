import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  userId: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }

  const { userId } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { organization: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
  }

  if (user.organizationId !== session.user.organizationId) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  if (user.role !== 'USER') {
    return NextResponse.json(
      { error: 'Seuls les collaborateurs peuvent être supprimés ici.' },
      { status: 400 }
    );
  }

  // Remboursement uniquement si non activé
  const shouldRefund = !user.passwordCreated;

  await prisma.$transaction(async (tx) => {
    const sessions = await tx.testSession.findMany({
      where: { userId },
      select: { id: true },
    });
    const sessionIds = sessions.map((s) => s.id);

    if (sessionIds.length > 0) {
      await tx.answer.deleteMany({ where: { testSessionId: { in: sessionIds } } });
      await tx.testSession.deleteMany({ where: { id: { in: sessionIds } } });
    }

    await tx.user.delete({ where: { id: userId } });

    if (shouldRefund && user.organization) {
      await tx.organization.update({
        where: { id: user.organization.id },
        data: { credits: { increment: 1 } },
      });

      await tx.creditTransaction.create({
        data: {
          organizationId: user.organization.id,
          amount: 1,
          reason: 'user_deletion_refund',
          createdById: session.user.id,
        },
      });
    }
  });

  return NextResponse.json({
    success: true,
    refunded: shouldRefund,
  });
}
