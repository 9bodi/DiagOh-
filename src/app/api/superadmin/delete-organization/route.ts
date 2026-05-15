import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  organizationId: z.string().min(1),
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

  const { organizationId } = parsed.data;

  const org = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!org) {
    return NextResponse.json({ error: 'Organisation introuvable' }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    const users = await tx.user.findMany({
      where: { organizationId },
      select: { id: true },
    });
    const userIds = users.map((u) => u.id);

    if (userIds.length > 0) {
      const sessions = await tx.testSession.findMany({
        where: { userId: { in: userIds } },
        select: { id: true },
      });
      const sessionIds = sessions.map((s) => s.id);

      if (sessionIds.length > 0) {
        await tx.answer.deleteMany({ where: { testSessionId: { in: sessionIds } } });
        await tx.testSession.deleteMany({ where: { id: { in: sessionIds } } });
      }

      await tx.user.deleteMany({ where: { id: { in: userIds } } });
    }

    await tx.creditTransaction.deleteMany({ where: { organizationId } });
    await tx.organization.delete({ where: { id: organizationId } });
  });

  return NextResponse.json({ success: true });
}
