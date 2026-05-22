import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { renderToBuffer } from '@react-pdf/renderer';
import BilanPDF, { BilanData } from '@/lib/pdf/BilanPDF';
import React from 'react';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { userId } = await params;

  // L'user peut télécharger son propre bilan, l'admin ceux de son org, le superadmin tous
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organization: true,
      testSessions: {
        where: { status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!targetUser) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
  }

  // Vérif autorisation
  const isOwner = session.user.id === userId;
  const isAdminSameOrg =
    session.user.role === 'ADMIN' &&
    session.user.organizationId === targetUser.organizationId;
  const isSuperadmin = session.user.role === 'SUPERADMIN';

  if (!isOwner && !isAdminSameOrg && !isSuperadmin) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const lastSession = targetUser.testSessions[0];
  if (!lastSession || !lastSession.completedAt) {
    return NextResponse.json(
      { error: 'Aucun test terminé pour cet utilisateur' },
      { status: 404 }
    );
  }

  // Compter le nombre de questions procédurales du test
  const questionsOrder = lastSession.questionsOrder as string[];
  const proceduralCount = await prisma.question.count({
    where: {
      id: { in: questionsOrder },
      type: 'PROCEDURAL',
    },
  });

  const data: BilanData = {
    firstName: targetUser.firstName ?? '',
    lastName: targetUser.lastName ?? '',
    email: targetUser.email,
    organizationName: targetUser.organization?.name ?? 'Organisation',
    completedAt: lastSession.completedAt,
    level: (lastSession.level ?? 'A') as 'A' | 'B1' | 'B2' | 'C',
    scoreProcedural: lastSession.scoreProcedural ?? 0,
    totalQuestions: proceduralCount,
    quadrant: (lastSession.quadrant ?? 1) as 1 | 2 | 3 | 4,
  };

  const buffer = await renderToBuffer(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  React.createElement(BilanPDF as any, { data })
);


  const filename = `bilan-${targetUser.lastName ?? 'user'}-${targetUser.firstName ?? ''}.pdf`
    .toLowerCase()
    .replace(/\s+/g, '-');

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
