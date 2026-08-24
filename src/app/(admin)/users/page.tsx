import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminHeader from '@/components/admin/AdminHeader';
import UsersPageContent from '@/components/admin/UsersPageContent';
import { buildParticipantsWhereClause, getAccessibleGroupIds } from '@/lib/permissions';

export default async function UsersPage() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== 'ADMIN' &&
      session.user.role !== 'SUPERADMIN' &&
      session.user.role !== 'SUPERVISOR')
  ) {
    redirect('/login');
  }

  const orgId = session.user.organizationId;
  if (!orgId) redirect('/login');

  const [organization, whereClause, accessibleGroupIds] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: orgId },
      select: { name: true, credits: true },
    }),
    buildParticipantsWhereClause(session.user.id, session.user.role, orgId),
    getAccessibleGroupIds(session.user.id, session.user.role, orgId),
  ]);

  const users = await prisma.user.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      group: { select: { id: true, name: true } },
      testSessions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
                select: {
          id: true,
          status: true,
          level: true,
          scoreProcedural: true,
          scoreBloc1: true,
          scoreBloc2: true,
          scoreBloc3: true,
          scoreBloc4: true,
          scoreBloc5: true,
          scoreBloc6: true,
          scoreAdaptation: true,
          scoreInteret: true,
          quadrant: true,
          recommandation: true,
          completedAt: true,
          deadline: true,
          activatedAt: true,
          answers: { select: { timeSpent: true } },
        },

      },
    },
  });

  const groups = await prisma.group.findMany({
    where:
      session.user.role === 'SUPERVISOR'
        ? { id: { in: accessibleGroupIds } }
        : { organizationId: orgId },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });

  const usersData = users.map((u) => {
    const latestSession = u.testSessions[0];

    // Temps moyen par question : uniquement si la session est COMPLETED
    let avgTimePerQuestion: number | null = null;
    if (latestSession?.status === 'COMPLETED' && latestSession.answers.length > 0) {
      const validTimes = latestSession.answers
        .map((a) => a.timeSpent)
        .filter((t): t is number => typeof t === 'number' && t > 0);
      if (validTimes.length > 0) {
        avgTimePerQuestion = validTimes.reduce((sum, t) => sum + t, 0) / validTimes.length;
      }
    }

        return {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      passwordCreated: u.passwordCreated,
      status: latestSession?.status ?? 'PENDING',
      level: latestSession?.level ?? null,
      score: latestSession?.scoreProcedural ?? null,
      scoreBloc1: latestSession?.scoreBloc1 ?? null,
      scoreBloc2: latestSession?.scoreBloc2 ?? null,
      scoreBloc3: latestSession?.scoreBloc3 ?? null,
      scoreBloc4: latestSession?.scoreBloc4 ?? null,
      scoreBloc5: latestSession?.scoreBloc5 ?? null,
      scoreBloc6: latestSession?.scoreBloc6 ?? null,
      scoreAdaptation: latestSession?.scoreAdaptation ?? null,
      scoreInteret: latestSession?.scoreInteret ?? null,
      quadrant: latestSession?.quadrant ?? null,
      recommandation: latestSession?.recommandation ?? null,
      avgTimePerQuestion,
      completedAt: latestSession?.completedAt?.toISOString() ?? null,
      sessionId: latestSession?.id ?? null,
      deadline: latestSession?.deadline?.toISOString() ?? null,
      activatedAt: latestSession?.activatedAt?.toISOString() ?? null,
      groupId: u.groupId,
      groupName: u.group?.name ?? null,
    };

  });

  return (
    <div className="min-h-screen bg-ohe-cream">
      <AdminHeader
  userName={session.user.name ?? session.user.email}
  orgName={organization?.name ?? ''}
  currentPath="/users"
  userRole={session.user.role}
  isImpersonating={session.user.isImpersonating}   // ← AJOUT
/>


  <main style={{ paddingLeft: '40px', paddingRight: '40px', paddingTop: '32px', paddingBottom: '32px' }}>
  <UsersPageContent
    users={usersData}
    groups={groups}
    orgName={organization?.name ?? ''}
    credits={organization?.credits ?? 0}
    userRole={session.user.role}
  />
</main>


    </div>
  );
}

