import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { renderToBuffer } from '@react-pdf/renderer';
import BilanCollectifPDF, {
  CollectifData,
} from '@/lib/pdf/BilanCollectifPDF';
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

interface Body {
  userIds: string[];
  filters?: {
    status?: string;
    group?: string;
    search?: string;
  };
}

export async function POST(request: Request) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== 'ADMIN' &&
      session.user.role !== 'SUPERADMIN' &&
      session.user.role !== 'SUPERVISOR')
  ) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const body = (await request.json()) as Body;
  const { userIds, filters = {} } = body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return NextResponse.json({ error: 'Aucun participant sélectionné' }, { status: 400 });
  }

  const orgId = session.user.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: 'Organisation introuvable' }, { status: 400 });
  }

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) {
    return NextResponse.json({ error: 'Organisation introuvable' }, { status: 404 });
  }

  // Récupère les users filtrés (limités à l'orga du demandeur pour la sécurité)
  const users = await prisma.user.findMany({
    where: {
      id: { in: userIds },
      organizationId: orgId,
    },
    include: {
      testSessions: {
        where: { status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  const totalParticipants = users.length;
  const completedSessions = users
    .map((u) => u.testSessions[0])
    .filter((s): s is NonNullable<typeof s> => !!s);
  const completedCount = completedSessions.length;

  // ===== Agrégats =====

  // Score global moyen (sur COMPLETED)
  const avgGlobalScore =
    completedCount > 0
      ? completedSessions.reduce((sum, s) => sum + (s.scoreProcedural ?? 0) / 6, 0) /
        completedCount
      : 0;

  // Moyenne par bloc
  const blocks = [1, 2, 3, 4, 5, 6].map((n) => {
    const scores = completedSessions
      .map((s) => (s as any)[`scoreBloc${n}`] as number | null)
      .filter((v): v is number => v !== null && v !== undefined);
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return { label: BLOCK_LABELS[n], avgScore: avg };
  });

  // Répartition par niveau
  const levelCounts: Record<'A' | 'B1' | 'B2' | 'C', number> = { A: 0, B1: 0, B2: 0, C: 0 };
  completedSessions.forEach((s) => {
    const lvl = s.level as 'A' | 'B1' | 'B2' | 'C' | null;
    if (lvl && lvl in levelCounts) levelCounts[lvl]++;
  });
  const levels = (['A', 'B1', 'B2', 'C'] as const).map((level) => ({
    level,
    count: levelCounts[level],
    pct: completedCount > 0 ? Math.round((levelCounts[level] / completedCount) * 100) : 0,
  }));

  // Niveau dominant
  let dominantLevel: 'A' | 'B1' | 'B2' | 'C' | null = null;
  let maxCount = 0;
  (['A', 'B1', 'B2', 'C'] as const).forEach((lvl) => {
    if (levelCounts[lvl] > maxCount) {
      maxCount = levelCounts[lvl];
      dominantLevel = lvl;
    }
  });

  // Répartition par quadrant
  const quadrantCounts: Record<1 | 2 | 3 | 4, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  completedSessions.forEach((s) => {
    const q = s.quadrant as 1 | 2 | 3 | 4 | null;
    if (q && q in quadrantCounts) quadrantCounts[q]++;
  });
  const quadrants = ([1, 2, 3, 4] as const).map((quadrant) => ({
    quadrant,
    count: quadrantCounts[quadrant],
    pct: completedCount > 0 ? Math.round((quadrantCounts[quadrant] / completedCount) * 100) : 0,
  }));

  // Répartition par recommandation
  const recoCounts: Record<
    'A_FORMER' | 'A_FORMER_ET_ACCOMPAGNER' | 'A_FORMER_SOUS_RESERVES' | 'A_ORIENTER',
    number
  > = {
    A_FORMER: 0,
    A_FORMER_ET_ACCOMPAGNER: 0,
    A_FORMER_SOUS_RESERVES: 0,
    A_ORIENTER: 0,
  };
  completedSessions.forEach((s) => {
    const r = s.recommandation as keyof typeof recoCounts | null;
    if (r && r in recoCounts) recoCounts[r]++;
  });
  const recos = (
    ['A_FORMER', 'A_FORMER_ET_ACCOMPAGNER', 'A_FORMER_SOUS_RESERVES', 'A_ORIENTER'] as const
  ).map((key) => ({
    key,
    count: recoCounts[key],
    pct: completedCount > 0 ? Math.round((recoCounts[key] / completedCount) * 100) : 0,
  }));

  // Temps moyen (somme Answer.timeSpent / nb participants complétés)
  let avgTimeSeconds = 0;
  if (completedCount > 0) {
    const sessionIds = completedSessions.map((s) => s.id);
    const timeAgg = await prisma.answer.aggregate({
      where: {
        testSessionId: { in: sessionIds },
        question: { type: 'PROCEDURAL' },
      },
      _sum: { timeSpent: true },
    });
    const totalSec = timeAgg._sum.timeSpent ?? 0;
    avgTimeSeconds = Math.round(totalSec / completedCount);
  }

  const data: CollectifData = {
    organizationName: org.name,
    generatedAt: new Date(),
    totalParticipants,
    completedCount,
    avgGlobalScore,
    dominantLevel,
    avgTimeSeconds,
    blocks,
    levels,
    quadrants,
    recos,
    filters,
  };

  // Logo
  const logoPath = path.join(process.cwd(), 'public', 'img', 'logos', 'ohe-logo.png');
  const logo = fs.existsSync(logoPath) ? fs.readFileSync(logoPath) : undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(BilanCollectifPDF, { data, logo }) as any;
  const buffer = await renderToBuffer(element);

  const orgSlug = org.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  const today = new Date().toISOString().slice(0, 10);
  const filename = `bilan-collectif-${orgSlug}-${today}.pdf`;

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
