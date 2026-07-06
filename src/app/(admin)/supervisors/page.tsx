import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminHeader from '@/components/admin/AdminHeader';
import SupervisorsPageContent from '@/components/admin/SupervisorsPageContent';

export default async function SupervisorsPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERADMIN')) {
    redirect('/login');
  }

  const orgId = session.user.organizationId;
  if (!orgId) redirect('/login');

  const [organization, supervisors, groups] = await Promise.all([
    prisma.organization.findUnique({ where: { id: orgId }, select: { name: true } }),
    prisma.user.findMany({
      where: { organizationId: orgId, role: 'SUPERVISOR' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        passwordCreated: true,
        createdAt: true,
        supervisedGroups: {
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        },
      },
    }),
    prisma.group.findMany({
      where: { organizationId: orgId },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  const supervisorsData = supervisors.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-ohe-cream">
      <AdminHeader
  userName={session.user.name ?? session.user.email}
  orgName={organization?.name ?? ''}
  currentPath="/users"
  userRole={session.user.role}
  isImpersonating={session.user.isImpersonating}   // ← AJOUT
/>


      <SupervisorsPageContent
        supervisors={supervisorsData}
        groups={groups}
        orgName={organization?.name ?? ''}
      />
    </div>
  );
}
