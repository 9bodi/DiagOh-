import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  IMPERSONATION_COOKIE,
  IMPERSONATION_MAX_AGE,
  signImpersonationToken,
  readImpersonationFromCookies,
} from '@/lib/impersonation';
import { z } from 'zod';

const startSchema = z.object({
  organizationId: z.string().min(1),
});

/** POST — démarre une session d'impersonation */
export async function POST(request: Request) {
  const session = await auth();
  const actualRole = session?.user?.actualRole ?? session?.user?.role;

  if (!session?.user || actualRole !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = startSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'organizationId manquant' }, { status: 400 });
  }
  const { organizationId } = parsed.data;

  // Vérifie que l'organisation existe
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, name: true },
  });
  if (!org) {
    return NextResponse.json({ error: 'Organisation introuvable' }, { status: 404 });
  }

  // Ferme toute impersonation précédente
  const existing = await readImpersonationFromCookies();
  if (existing) {
    await prisma.impersonationLog.updateMany({
      where: { id: existing.logId, endedAt: null },
      data: { endedAt: new Date() },
    });
  }

  // Log d'ouverture
  const headersList = await headers();
  const log = await prisma.impersonationLog.create({
    data: {
      superadminId: session.user.id,
      organizationId: org.id,
      ipAddress: headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
      userAgent: headersList.get('user-agent') ?? null,
    },
  });

  const token = await signImpersonationToken({
    superadminId: session.user.id,
    organizationId: org.id,
    logId: log.id,
  });

  const cookieStore = await cookies();
  cookieStore.set(IMPERSONATION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: IMPERSONATION_MAX_AGE,
    path: '/',
  });

  return NextResponse.json({
    success: true,
    organizationName: org.name,
    redirectUrl: '/dashboard',
  });
}

/** DELETE — arrête la session d'impersonation */
export async function DELETE() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const existing = await readImpersonationFromCookies();
  if (existing) {
    await prisma.impersonationLog.updateMany({
      where: { id: existing.logId, endedAt: null },
      data: { endedAt: new Date() },
    });
  }

  const cookieStore = await cookies();
  cookieStore.delete(IMPERSONATION_COOKIE);

  return NextResponse.json({ success: true });
}
