import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminHeader from '@/components/admin/AdminHeader';
import UsersPageContent from '@/components/admin/UsersPageContent';

export default async function UsersPage() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') redirect('/login');

  const orgId = session.user.organizationId;
  if (!orgId) redirect('/login');

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) redirect('/login');

  const users = await prisma.user.findMany({
    where: { organizationId: orgId, role: 'USER' },
    orderBy: { createdAt: 'desc' },
    include: {
      testSessions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  const usersData = users.map((u) => {
    const latestSession = u.testSessions[0];
    return {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      passwordCreated: u.passwordCreated,
      status: latestSession?.status ?? 'NOT_STARTED',
      level: latestSession?.level ?? null,
      score: latestSession?.scoreProcedural ?? null,
      completedAt: latestSession?.completedAt?.toISOString() ?? null,
      sessionId: latestSession?.id ?? null,
    };
  });

  return (
    <main className="min-h-screen bg-ohe-slate-50">
      <AdminHeader
        userName={session.user.name ?? ''}
        orgName={org.name}
        currentPath="/users"
      />

      <div className="max-w-6xl mx-auto p-6">
        <UsersPageContent users={usersData} orgName={org.name} credits={org.credits} />
      </div>
    </main>
  );
}
