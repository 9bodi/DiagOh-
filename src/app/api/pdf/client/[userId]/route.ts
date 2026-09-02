import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { renderToBuffer } from '@react-pdf/renderer';
import BilanAdminIndividuelPDF, {
  AdminIndivData,
  AdminIndivBlock,
} from '@/lib/pdf/BilanAdminIndividuelPDF';
import React from 'react';
import fs from 'fs';
import path from 'path';

const BLOCK_LABELS: Record<number, string> = {
  1: 'Singulier / Pluriel',
  2: 'Conjugaison',
  3: 'Participe passé',
  4: 'Orthographe lexicale',
  5: 'Syntaxe',
  6: 'Compréhension',
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { userId } = await params;

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organization: true,
      group: true,
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

  const isAdminSameOrg =
    (session.user.role === 'ADMIN' || session.user.role === 'SUPERVISOR') &&
    session.user.organizationId === targetUser.organizationId;
  const isSuperadmin = session.user.role === 'SUPERADMIN';

  if (!isAdminSameOrg && !isSuperadmin) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const lastSession = targetUser.testSessions[0];
  if (!lastSession || !lastSession.completedAt) {
    return NextResponse.json(
      { error: 'Aucun test terminé pour cet utilisateur' },
      { status: 404 }
    );
  }

  const answers = await prisma.answer.findMany({
    where: { testSessionId: lastSession.id },
    include: { question: true },
  });

  const proceduralAnswers = answers.filter(a => a.question.type === 'PROCEDURAL');
  const correctTotal = proceduralAnswers.filter(a => a.isCorrect).length;

  const totalTimeSeconds = answers
    .filter(a => a.timeSpent != null && a.timeSpent > 0)
    .reduce((sum, a) => sum + (a.timeSpent ?? 0), 0);

  const blocks: AdminIndivBlock[] = [];
  for (let blockNum = 1; blockNum <= 6; blockNum++) {
    const blockAnswers = proceduralAnswers.filter(
      a => a.question.blockNumber === blockNum
    );
    const correctCount = blockAnswers.filter(a => a.isCorrect).length;
    const scoreKey = `scoreBloc${blockNum}` as keyof typeof lastSession;
    const score = (lastSession[scoreKey] as number | null) ?? 0;
    blocks.push({
      label: BLOCK_LABELS[blockNum],
      score,
      correctCount,
    });
  }

  const orgSlug = (targetUser.organization?.name ?? 'OHE')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 10);
  const d = new Date(lastSession.completedAt);
  const reference = `OHE-${orgSlug}-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = lastSession as any;
  const data: AdminIndivData = {
    firstName: targetUser.firstName ?? '',
    lastName: targetUser.lastName ?? '',
    email: targetUser.email,
    organizationName: targetUser.organization?.name ?? 'Organisation',
    groupName: targetUser.group?.name ?? null,
    completedAt: lastSession.completedAt,
    reference,
    scoreProcedural: lastSession.scoreProcedural ?? 0,
    correctTotal,
    level: (lastSession.level ?? 'A') as 'A' | 'B1' | 'B2' | 'C',
    totalTimeSeconds: Math.round(totalTimeSeconds),
    blocks,
    quadrant: (s.quadrant ?? 3) as 1 | 2 | 3 | 4,
    recommandation: (s.recommandation ?? null) as AdminIndivData['recommandation'],
  };

  const logoPath = path.join(process.cwd(), 'public', 'img', 'logos', 'ohe-logo.png');
  const logo = fs.existsSync(logoPath) ? fs.readFileSync(logoPath) : undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(BilanAdminIndividuelPDF, { data, logo }) as any;
  const buffer = await renderToBuffer(element);

  const filename = `bilan-individuel-${targetUser.lastName ?? 'user'}-${targetUser.firstName ?? ''}.pdf`
    .toLowerCase()
    .replace(/\s+/g, '-');

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
