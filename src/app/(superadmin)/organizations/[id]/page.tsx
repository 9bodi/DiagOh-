import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import SuperadminHeader from '@/components/superadmin/SuperadminHeader';
import Card from '@/components/ui/Card';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrganizationDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SUPERADMIN') redirect('/login');

  const { id } = await params;

  const org = await prisma.organization.findUnique({
    where: { id },
    include: {
      users: { orderBy: { createdAt: 'desc' } },
      creditTransactions: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!org) notFound();

  return (
    <div className="min-h-screen bg-ohe-slate-50">
      <SuperadminHeader userName={session.user.name || ''} activePage="organizations" />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/organizations" className="text-sm text-ohe-blue hover:underline mb-4 inline-block">
          ← Retour
        </Link>
        <h1 className="text-2xl font-bold text-ohe-slate-900 mb-1">{org.name}</h1>
        <p className="text-sm text-ohe-slate-600 mb-6">{org.credits} crédits disponibles</p>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <h2 className="font-bold text-ohe-slate-900 mb-3">Utilisateurs ({org.users.length})</h2>
            <div className="space-y-2">
              {org.users.map((u) => (
                <div key={u.id} className="flex justify-between text-sm py-1 border-b border-ohe-slate-100 last:border-0">
                  <span>{u.email}</span>
                  <span className="text-xs font-medium text-ohe-slate-500">{u.role}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="font-bold text-ohe-slate-900 mb-3">Historique crédits</h2>
            <div className="space-y-2">
              {org.creditTransactions.length === 0 ? (
                <p className="text-sm text-ohe-slate-500">Aucune transaction.</p>
              ) : (
                org.creditTransactions.map((t) => (
                  <div key={t.id} className="flex justify-between text-sm py-1 border-b border-ohe-slate-100 last:border-0">
                    <div>
                      <div className={t.amount > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {t.amount > 0 ? '+' : ''}{t.amount}
                      </div>
                      <div className="text-xs text-ohe-slate-500">{t.reason}</div>
                    </div>
                    <span className="text-xs text-ohe-slate-400">
                      {new Date(t.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
