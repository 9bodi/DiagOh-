import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  organizationId: z.string().min(1),
  amount: z.number().int().min(1),
  reason: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }

  const { organizationId, amount, reason } = parsed.data;

  const org = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!org) {
    return NextResponse.json({ error: 'Organisation introuvable' }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.organization.update({
      where: { id: organizationId },
      data: { credits: { increment: amount } },
    }),
    prisma.creditTransaction.create({
      data: {
        organizationId,
        amount,
        reason,
        createdById: session.user.id,
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
