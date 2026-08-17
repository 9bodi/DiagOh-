import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { renderToBuffer } from '@react-pdf/renderer';
import BilanParticipantPDF, {
  BilanData,
  BilanBlock,
} from '@/lib/pdf/BilanParticipantPDF';
import React from 'react';
import fs from 'fs';
import path from 'path';


const BLOCK_LABELS: Record<number, { key: BilanBlock['key']; label: string }> = {
  1: { key: 'bloc1', label: 'Singulier / Pluriel' },
  2: { key: 'bloc2', label: 'Conjugaison' },
  3: { key: 'bloc3', label: 'Participe passé' },
  4: { key: 'bloc4', label: 'Orthographe lexicale' },
  5: { key: 'bloc5', label: 'Syntaxe' },
  6: { key: 'bloc6', label: 'Compréhension' },
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
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
      { status: 404 },
    );
  }

  const answers = await prisma.answer.findMany({
    where: { testSessionId: lastSession.id },
    include: { question: true },
  });

  const proceduralAnswers = answers.filter((a) => a.question.type === 'PROCEDURAL');
  const correctTotal = proceduralAnswers.filter((a) => a.isCorrect).length;

  const blocks: BilanBlock[] = [];
  for (let n = 1; n <= 6; n++) {
    const blockAnswers = proceduralAnswers.filter((a) => a.question.blockNumber === n);
    const correctCount = blockAnswers.filter((a) => a.isCorrect).length;
    const scoreKey = `scoreBloc${n}` as keyof typeof lastSession;
    const score = (lastSession[scoreKey] as number | null) ?? 0;
    blocks.push({
      key: BLOCK_LABELS[n].key,
      label: BLOCK_LABELS[n].label,
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
const logoPath = path.join(process.cwd(), 'public/img/logos/ohe-logo.png');
const logoDataUri = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`;

  const data: BilanData = {
    firstName: targetUser.firstName ?? '',
    lastName: targetUser.lastName ?? '',
    email: targetUser.email,
    organizationName: targetUser.organization?.name ?? 'Organisation',
    completedAt: lastSession.completedAt,
    level: (lastSession.level ?? 'A') as 'A' | 'B1' | 'B2' | 'C',
    scoreProcedural: lastSession.scoreProcedural ?? 0,
    correctTotal,
    blocks,
    quadrant: (lastSession.quadrant ?? null) as 1 | 2 | 3 | 4 | null,
    scoreAdaptation: lastSession.scoreAdaptation ?? null,
    scoreInteret: lastSession.scoreInteret ?? null,
    reference,
    logoDataUri,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(BilanParticipantPDF, { data }) as any;
  const buffer = await renderToBuffer(element);

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
