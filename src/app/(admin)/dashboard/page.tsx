import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Logo from '@/components/ui/Logo';
import Card from '@/components/ui/Card';
import LogoutButton from '@/components/LogoutButton';

export default async function DashboardPage() {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  const orgId = session.user.organizationId;
  if (!orgId) redirect('/login');

  // Récupère l'organisation et les stats
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      users: {
        where: { role: 'USER' },
        include: {
          testSessions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  });

  if (!org) redirect('/login');

  // Calcule les stats
  const totalUsers = org.users.length;
  const completedTests = org.users.filter(
    (u) => u.testSessions[0]?.status === 'COMPLETED'
  ).length;
  const inProgressTests = org.users.filter(
    (u) => u.testSessions[0]?.status === 'IN_PROGRESS'
  ).length;
  const notStartedTests = totalUsers - completedTests - inProgressTests;

  return (
    <main className="min-h-screen bg-ohe-slate-50">
      <header className="px-6 py-4 bg-white border-b border-ohe-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size="md" />
          <span className="px-2 py-1 bg-ohe-slate-100 text-ohe-slate-600 text-xs font-semibold rounded">
            ADMIN
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-ohe-slate-900">{session.user.name}</p>
            <p className="text-xs text-ohe-slate-600">{org.name}</p>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ohe-slate-900 mb-1">
            Tableau de bord
          </h1>
          <p className="text-ohe-slate-600">Vue d&apos;ensemble de votre organisation.</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card padding="md">
            <p className="text-xs text-ohe-slate-600 uppercase tracking-wider mb-1">
              Crédits restants
            </p>
            <p className="text-3xl font-bold text-ohe-blue">{org.credits}</p>
            <p className="text-xs text-ohe-slate-600 mt-1">tests disponibles</p>
          </Card>

          <Card padding="md">
            <p className="text-xs text-ohe-slate-600 uppercase tracking-wider mb-1">
              Collaborateurs
            </p>
            <p className="text-3xl font-bold text-ohe-slate-900">{totalUsers}</p>
            <p className="text-xs text-ohe-slate-600 mt-1">au total</p>
          </Card>

          <Card padding="md">
            <p className="text-xs text-ohe-slate-600 uppercase tracking-wider mb-1">
              Tests terminés
            </p>
            <p className="text-3xl font-bold text-green-600">{completedTests}</p>
            <p className="text-xs text-ohe-slate-600 mt-1">résultats disponibles</p>
          </Card>

          <Card padding="md">
            <p className="text-xs text-ohe-slate-600 uppercase tracking-wider mb-1">
              En cours / À démarrer
            </p>
            <p className="text-3xl font-bold text-ohe-orange">
              {inProgressTests + notStartedTests}
            </p>
            <p className="text-xs text-ohe-slate-600 mt-1">
              {inProgressTests} en cours · {notStartedTests} pas démarrés
            </p>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/users">
            <Card padding="md" className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-ohe-blue/10 rounded-lg flex items-center justify-center text-2xl">
                  👥
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-ohe-slate-900 mb-1">Collaborateurs</h3>
                  <p className="text-sm text-ohe-slate-600">
                    Inviter, suivre et gérer les passages de vos collaborateurs.
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/results">
            <Card padding="md" className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-ohe-orange/10 rounded-lg flex items-center justify-center text-2xl">
                  📊
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-ohe-slate-900 mb-1">Restitution collective</h3>
                  <p className="text-sm text-ohe-slate-600">
                    Voir les résultats agrégés et les niveaux moyens.
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {org.credits === 0 && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-900">
              <strong>⚠️ Plus de crédits disponibles.</strong> Contactez l&apos;équipe OHé pour
              recharger votre compte.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
