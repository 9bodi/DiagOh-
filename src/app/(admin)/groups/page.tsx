import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminHeader from '@/components/admin/AdminHeader';
import GroupsPageContent from '@/components/admin/GroupsPageContent';

export default async function GroupsPage() {
  const session = await auth();
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERADMIN')) {
    redirect('/login');
  }

  const orgId = session.user.organizationId;
  if (!orgId) redirect('/login');

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) redirect('/login');

  const groups = await prisma.group.findMany({
    where: { organizationId: orgId },
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { participants: true, supervisors: true } },
    },
  });

  const groupsData = groups.map((g) => ({
    id: g.id,
    name: g.name,
    participantsCount: g._count.participants,
    supervisorsCount: g._count.supervisors,
    createdAt: g.createdAt.toISOString(),
  }));

  return (
    <main className="min-h-screen bg-ohe-cream">

      <AdminHeader
  userName={session.user.name ?? session.user.email}
  orgName={org.name}
  currentPath="/groups"
  userRole={session.user.role}
  isImpersonating={session.user.isImpersonating}
/>



      <div className="max-w-6xl mx-auto p-6">
        <GroupsPageContent groups={groupsData} orgName={org.name} />
      </div>
    </main>
  );
}
