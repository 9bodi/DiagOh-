import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Normalisation d'un nom de groupe : trim + collapse des espaces
function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

// Clé de comparaison insensible à la casse et aux accents pour détecter les doublons
function normalizeForCompare(name: string): string {
  return normalizeName(name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// ============ GET /api/admin/groups ============
export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERADMIN')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const orgId = session.user.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: 'Aucune organisation' }, { status: 400 });
  }

  const groups = await prisma.group.findMany({
    where: { organizationId: orgId },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { participants: true, supervisors: true },
      },
    },
  });

  return NextResponse.json({ groups });
}

// ============ POST /api/admin/groups ============
const createSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(60, 'Maximum 60 caractères'),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERADMIN')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const orgId = session.user.organizationId;
  if (!orgId) {
    return NextResponse.json({ error: 'Aucune organisation' }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  }

  const cleanName = normalizeName(parsed.data.name);
  const compareKey = normalizeForCompare(cleanName);

  // Vérif doublon (insensible casse/accents)
  const existing = await prisma.group.findMany({
    where: { organizationId: orgId },
    select: { id: true, name: true },
  });
  const duplicate = existing.find((g) => normalizeForCompare(g.name) === compareKey);
  if (duplicate) {
    return NextResponse.json(
      { error: `Un groupe "${duplicate.name}" existe déjà.` },
      { status: 409 }
    );
  }

  const group = await prisma.group.create({
    data: {
      name: cleanName,
      organizationId: orgId,
    },
  });

  return NextResponse.json({ group });
}
