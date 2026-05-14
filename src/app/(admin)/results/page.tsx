import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminHeader from '@/components/admin/AdminHeader';
import Card from '@/components/ui/Card';

const LEVEL_INFO = {
  A: { name: 'Niveau A — élémentaire', color: 'bg-red-100 text-red-800 border-red-200', badge: 'bg-red-500' },
  B1: { name: 'Niveau B1 — intermédiaire', color: 'bg-orange-100 text-orange-800 border-orange-200', badge: 'bg-orange-500' },
  B2: { name: 'Niveau B2 — avancé', color: 'bg-blue-100 text-blue-800 border-blue-200', badge: 'bg-blue-500' },
  C: { name: 'Niveau C — expert', color: 'bg-green-100 text-green-800 border-green-200', badge: 'bg-green-500' },
};

const QUADRANT_INFO: Record<number, { label: string; description: string; color: string }> = {
  1: { label: 'À former', description: 'Intéressé + formation adaptée', color: 'bg-green-50 border-green-200 text-green-900' },
  2: { label: 'À convaincre', description: 'Non intéressé + formation adaptée', color: 'bg-blue-50 border-blue-200 text-blue-900' },
  3: { label: 'À engager', description: 'Intéressé + formation non adaptée', color: 'bg-orange-50 border-orange-200 text-orange-900' },
  4: { label: 'À orienter ailleurs', description: 'Non intéressé + formation non adaptée', color: 'bg-red-50 border-red-200 text-red-900' },
};

export default async function ResultsPage() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') redirect('/login');

  const orgId = session.user.organizationId;
  if (!orgId) redirect('/login');

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) redirect('/login');

  // Récupère toutes les sessions COMPLETED de l'organisation
  const completedSessions = await prisma.testSession.findMany({
    where: {
      status: 'COMPLETED',
      user: { organizationId: orgId },
    },
    include: { user: true },
  });

  const total = completedSessions.length;

  // Répartition par niveau
  const levelCounts = { A: 0, B1: 0, B2: 0, C: 0 };
  completedSessions.forEach((s) => {
    if (s.level) levelCounts[s.level]++;
  });

  // Score moyen
  const totalScore = completedSessions.reduce((sum, s) => sum + (s.scoreProcedural ?? 0), 0);
  const avgScore = total > 0 ? Math.round((totalScore / total) * 10) / 10 : 0;

  // Répartition par quadrant
  const quadrantCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  completedSessions.forEach((s) => {
    if (s.quadrant) quadrantCounts[s.quadrant]++;
  });

  return (
    <main className="min-h-screen bg-ohe-slate-50">
      <AdminHeader
        userName={session.user.name ?? ''}
        orgName={org.name}
        currentPath="/results"
      />

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-ohe-slate-900 mb-1">Restitution collective</h1>
          <p className="text-ohe-slate-600">
            {total} test{total > 1 ? 's' : ''} complété{total > 1 ? 's' : ''} sur votre organisation.
          </p>
        </div>

        {total === 0 ? (
          <Card padding="lg">
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📊</div>
              <p className="text-ohe-slate-900 font-medium mb-1">Aucun résultat pour le moment.</p>
              <p className="text-sm text-ohe-slate-600">
                Les statistiques apparaîtront ici dès qu&apos;un collaborateur aura complété son
                diagnostic.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Score moyen et résumé */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card padding="md">
                <p className="text-xs text-ohe-slate-600 uppercase tracking-wider mb-1">
                  Score moyen
                </p>
                <p className="text-3xl font-bold text-ohe-slate-900">{avgScore}</p>
                <p className="text-xs text-ohe-slate-600 mt-1">sur l&apos;ensemble</p>
              </Card>

              <Card padding="md">
                <p className="text-xs text-ohe-slate-600 uppercase tracking-wider mb-1">
                  Tests complétés
                </p>
                <p className="text-3xl font-bold text-ohe-slate-900">{total}</p>
                <p className="text-xs text-ohe-slate-600 mt-1">collaborateurs</p>
              </Card>

              <Card padding="md">
                <p className="text-xs text-ohe-slate-600 uppercase tracking-wider mb-1">
                  Niveau dominant
                </p>
                <p className="text-3xl font-bold text-ohe-slate-900">
                  {Object.entries(levelCounts).sort((a, b) => b[1] - a[1])[0][0]}
                </p>
                <p className="text-xs text-ohe-slate-600 mt-1">le plus représenté</p>
              </Card>
            </div>

            {/* Répartition par niveau */}
            <Card padding="lg">
              <h2 className="text-lg font-bold text-ohe-slate-900 mb-4">Répartition par niveau</h2>
              <div className="space-y-3">
                {Object.entries(levelCounts).map(([level, count]) => {
                  const info = LEVEL_INFO[level as keyof typeof LEVEL_INFO];
                  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={level}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-ohe-slate-900">
                          {info.name}
                        </span>
                        <span className="text-sm text-ohe-slate-600">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-ohe-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${info.badge} transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Matrice 2x2 des quadrants */}
            <Card padding="lg">
              <h2 className="text-lg font-bold text-ohe-slate-900 mb-1">
                Matrice intérêt / pertinence
              </h2>
              <p className="text-sm text-ohe-slate-600 mb-4">
                Basée sur les réponses déclaratives.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((q) => {
                  const info = QUADRANT_INFO[q];
                  const count = quadrantCounts[q];
                  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={q} className={`p-4 border rounded-xl ${info.color}`}>
                      <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
                        {info.description}
                      </p>
                      <p className="text-xl font-bold mt-1">{info.label}</p>
                      <p className="text-3xl font-bold mt-2">
                        {percentage}%
                        <span className="text-sm font-normal opacity-70 ml-2">
                          ({count} pers.)
                        </span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Note placeholder pour évolutions */}
            <div className="p-4 bg-ohe-slate-50 border border-ohe-slate-200 rounded-lg">
              <p className="text-sm text-ohe-slate-600">
                🚧 À venir : graphique radar des forces / faiblesses par compétence (orthographe
                lexicale, conjugaison, syntaxe, etc.) lorsque la banque de questions complète sera
                intégrée.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
