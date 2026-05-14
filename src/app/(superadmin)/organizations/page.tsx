import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import SuperadminHeader from '@/components/superadmin/SuperadminHeader';
import OrganizationsList from '@/components/superadmin/OrganizationsList';

export default async function OrganizationsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'SUPERADMIN') {
    redirect('/login');
  }

  const organizations = await prisma.organization.findMany({
    include: {
      users: {
        select: { id: true, role: true },
      },
      _count: {
        select: { users: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Compter les tests complétés par organisation
  const orgsWithStats = await Promise.all(
    organizations.map(async (org) => {
      const completedTests = await prisma.testSession.count({
        where: {
          status: 'COMPLETED',
          user: { organizationId: org.id },
        },
      });
      const adminsCount = org.users.filter((u) => u.role === 'ADMIN').length;
      const usersCount = org.users.filter((u) => u.role === 'USER').length;

      return {
        id: org.id,
        name: org.name,
        credits: org.credits,
        adminsCount,
        usersCount,
        completedTests,
        createdAt: org.createdAt,
      };
    })
  );

  return (
    <div className="min-h-screen bg-ohe-slate-50">
      <SuperadminHeader userName={`${session.user.name}`} activePage="organizations" />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <OrganizationsList organizations={orgsWithStats} />
      </main>
    </div>
  );
}
