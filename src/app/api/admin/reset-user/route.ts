import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: 'userId manquant' }, { status: 400 });
  }

  // Vérifier que le user appartient bien à l'organisation de l'admin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      testSessions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!user || user.organizationId !== session.user.organizationId) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
  }

  const lastSession = user.testSessions[0];

  if (!lastSession) {
    return NextResponse.json({ error: 'Aucune session à réinitialiser' }, { status: 400 });
  }

  const wasCompleted = lastSession.status === 'COMPLETED';

  // Supprimer les réponses puis la session (cascade manuelle)
  await prisma.$transaction([
    prisma.answer.deleteMany({ where: { testSessionId: lastSession.id } }),
    prisma.testSession.delete({ where: { id: lastSession.id } }),
  ]);

  return NextResponse.json({ 
    success: true, 
    wasCompleted,
    message: 'Session réinitialisée avec succès'
  });
}
