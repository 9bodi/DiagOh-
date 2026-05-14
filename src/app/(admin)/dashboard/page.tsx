import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import Card from '@/components/ui/Card';
import LogoutButton from '@/components/LogoutButton';

export default async function DashboardPage() {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-ohe-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-ohe-slate-900">{session.user.name}</p>
              <p className="text-xs text-ohe-slate-600">{session.user.organizationName}</p>
            </div>
            <LogoutButton />
          </div>
        </header>

        <Card padding="lg">
          <h1 className="text-2xl font-bold text-ohe-slate-900 mb-2">
            Bienvenue, {session.user.name} 👋
          </h1>
          <p className="text-ohe-slate-600 mb-6">
            Espace administrateur — {session.user.organizationName}
          </p>

          <div className="p-4 bg-ohe-slate-50 border border-ohe-slate-200 rounded-lg">
            <p className="text-sm text-ohe-slate-600">
              🚧 Cette page sera construite à l&apos;étape suivante.
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
