import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendTestActivatedEmail } from '@/lib/email';
import { canManageParticipant } from '@/lib/permissions';

const bodySchema = z.object({
  userIds: z.array(z.string().min(1)).min(1, 'Au moins un utilisateur requis'),
  deadline: z.string().datetime({ message: 'Date invalide' }),
});

export async function POST(request: Request) {
  const session = await auth();

  // 1) Auth étendue à SUPERVISOR
  if (
    !session?.user ||
    (session.user.role !== 'ADMIN' &&
      session.user.role !== 'SUPERADMIN' &&
      session.user.role !== 'SUPERVISOR')
  ) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { userIds, deadline } = parsed.data;
  const deadlineDate = new Date(deadline);

  if (deadlineDate <= new Date()) {
    return NextResponse.json(
      { error: 'La date limite doit être dans le futur' },
      { status: 400 },
    );
  }

  // 2) Vérifier les droits sur chaque userId — un seul refus = 403
  const permissionChecks = await Promise.all(
    userIds.map((uid) =>
      canManageParticipant(
        session.user.id,
        session.user.role,
        session.user.organizationId,
        uid,
      ),
    ),
  );
  const forbidden = permissionChecks.some((allowed) => !allowed);
  if (forbidden) {
    return NextResponse.json(
      { error: 'Vous n\'avez pas accès à certains participants sélectionnés' },
      { status: 403 },
    );
  }

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    include: {
      organization: true,
      testSessions: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  if (users.length === 0) {
    return NextResponse.json({ error: 'Aucun utilisateur trouvé' }, { status: 404 });
  }

  // 3) L'ancien check org manuel est supprimé (géré par canManageParticipant)

  // Filtre les users éligibles à l'activation :
 const eligible = users.filter((u) => {
  const currentSession = u.testSessions[0];
  return currentSession && currentSession.status === 'PENDING';
});

const skipped = users.length - eligible.length;

if (eligible.length === 0) {
  return NextResponse.json(
    {
      error: 'Aucun utilisateur éligible',
      detail:
        "Les utilisateurs sélectionnés n'ont pas de session en attente (déjà activés, en cours ou terminés).",
    },
    { status: 400 },
  );
}

  const now = new Date();

  // Activation en transaction
  await prisma.$transaction(
    eligible.map((u) =>
      prisma.testSession.update({
        where: { id: u.testSessions[0].id },
        data: {
          status: 'READY_TO_START',
          deadline: deadlineDate,
          activatedAt: now,
          activatedBy: session.user.id,
        },
      }),
    ),
  );

  // Envoi des emails en parallèle (best-effort)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const emailResults = await Promise.allSettled(
  eligible.map((u) =>
    sendTestActivatedEmail({
      to: u.email,
      firstName: u.firstName,
      deadline: deadlineDate,
      organizationName: u.organization?.name ?? 'votre organisation',
      appUrl,
      passwordCreated: u.passwordCreated,
      magicLinkToken: u.magicLinkToken, // NOUVEAU
    }),
  ),
);


  const emailErrors: { email: string; error: string }[] = [];
  emailResults.forEach((result, idx) => {
    if (result.status === 'rejected') {
      emailErrors.push({ email: eligible[idx].email, error: String(result.reason) });
    }
  });

  return NextResponse.json({
    success: true,
    activated: eligible.length,
    skipped,
    emailErrors: emailErrors.length > 0 ? emailErrors : undefined,
  });
}
