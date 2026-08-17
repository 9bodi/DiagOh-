import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { renderToBuffer } from '@react-pdf/renderer';
import { BilanClientPDF, type BilanClientData, type BilanClientBlock } from '@/lib/pdf/BilanClientPDF';

import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

const BLOCK_MAP: { key: `scoreBloc${1|2|3|4|5|6}`; name: string; blockNumber: number }[] = [
  { key: 'scoreBloc1', name: 'Singulier / Pluriel', blockNumber: 1 },
  { key: 'scoreBloc2', name: 'Conjugaison', blockNumber: 2 },
  { key: 'scoreBloc3', name: 'Participe passé', blockNumber: 3 },
  { key: 'scoreBloc4', name: 'Orthographe lexicale', blockNumber: 4 },
  { key: 'scoreBloc5', name: 'Syntaxe', blockNumber: 5 },
  { key: 'scoreBloc6', name: 'Compréhension', blockNumber: 6 },
];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Accès : ADMIN (même org) ou SUPERADMIN uniquement (pas le participant lui-même)
  const role = session.user.role;
  if (role !== 'ADMIN' && role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { userId } = await params;

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { organization: true, group: true },
  });
  if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // ADMIN limité à sa propre organisation
  if (role === 'ADMIN' && targetUser.organizationId !== session.user.organizationId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const testSession = await prisma.testSession.findFirst({
    where: { userId, status: 'COMPLETED' },
    orderBy: { completedAt: 'desc' },
  });
  if (!testSession || !testSession.completedAt) {
    return NextResponse.json({ error: 'No completed test' }, { status: 404 });
  }

  const answers = await prisma.answer.findMany({
    where: { testSessionId: testSession.id },
    include: { question: true },
  });

  // Blocs procéduraux
  const blocks: BilanClientBlock[] = BLOCK_MAP.map(({ key, name, blockNumber }) => {
    const blockAnswers = answers.filter(
      (a) => a.question.type === 'PROCEDURAL' && a.question.blockNumber === blockNumber
    );
    const correctCount = blockAnswers.filter((a) => a.isCorrect).length;
    const totalCount = blockAnswers.length;
    const dontKnowCount = blockAnswers.filter(
      (a) =>
        a.selectedOptionIndex !== null &&
        Array.isArray(a.question.options) &&
        a.selectedOptionIndex === (a.question.options as unknown[]).length - 1
    ).length;

    const timedAnswers = blockAnswers.filter((a) => a.timeSpent !== null && a.timeSpent !== undefined);
    const avgTimeSec =
      timedAnswers.length > 0
        ? timedAnswers.reduce((s, a) => s + (a.timeSpent ?? 0), 0) / timedAnswers.length
        : null;

    const score = testSession[key as keyof typeof testSession] as number | null ?? 0;


    return {
      name,
      score,
      correctCount,
      totalCount,
      dontKnowCount,
      avgTimeSec,
    };
  });

  // Durée réelle
  const startedAt = testSession.startedAt ?? testSession.createdAt;
  const durationMin =
    startedAt && testSession.completedAt
      ? Math.max(1, Math.round((testSession.completedAt.getTime() - startedAt.getTime()) / 60000))
      : 0;

  // Référence
  const orgSlug =
    (targetUser.organization?.name ?? 'OHE')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 6) || 'OHE';
  const d = testSession.completedAt;
  const reference = `OHE-${orgSlug}-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;

  // Logo base64
  const logoPath = path.join(process.cwd(), 'public/img/logos/ohe-logo.png');
  const logoDataUri = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`;

  // firstName / lastName (fallback si champ name unique)
 // ✅ Nouvelle version
const firstName = targetUser.firstName ?? '';
const lastName = targetUser.lastName ?? '';


  const data: BilanClientData = {
    logoDataUri,
    firstName,
    lastName,
    email: targetUser.email,
    organizationName: targetUser.organization?.name ?? '—',
    groupName: targetUser.group?.name ?? null,
    completedAt: testSession.completedAt,
    durationMin,
    level: (testSession.level ?? 'A') as 'A' | 'B1' | 'B2' | 'C',
    scoreProcedural: testSession.scoreProcedural ?? 0,
    blocks,
    quadrant: (testSession.quadrant as 1 | 2 | 3 | 4 | null) ?? null,
    scoreAdaptation: testSession.scoreAdaptation ?? null,
    scoreInteret: testSession.scoreInteret ?? null,
    reference,
  };


const buffer = await renderToBuffer(<BilanClientPDF data={data} />);

  const filename = `bilan-client-${(lastName || 'participant').toLowerCase()}-${firstName.toLowerCase()}.pdf`;

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
