import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Logo from '@/components/ui/Logo';
import Card from '@/components/ui/Card';
import LogoutButton from '@/components/LogoutButton';

const LEVEL_LABELS = {
  A: { name: 'Niveau A — élémentaire', color: 'bg-red-100 text-red-800 border-red-200' },
  B1: { name: 'Niveau B1 — intermédiaire', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  B2: { name: 'Niveau B2 — avancé', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  C: { name: 'Niveau C — expert', color: 'bg-green-100 text-green-800 border-green-200' },
};

export default async function ResultPage() {
  const session = await auth();
  if (!session || session.user.role !== 'USER') redirect('/login');

  const testSession = await prisma.testSession.findFirst({
    where: { userId: session.user.id, status: 'COMPLETED' },
    orderBy: { completedAt: 'desc' },
  });

  if (!testSession) redirect('/welcome');

  const levelInfo = testSession.level ? LEVEL_LABELS[testSession.level] : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-ohe-slate-50 to-ohe-slate-100">
      <header className="px-6 py-4 flex items-center justify-between">
        <Logo size="md" />
        <LogoutButton />
      </header>

      <div className="flex items-center justify-center px-6 py-12">
        <Card padding="lg" className="max-w-2xl w-full">
          <div className="text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-ohe-slate-900 mb-2">
              Votre diagnostic est prêt.
            </h1>
            <p className="text-ohe-slate-600 mb-8">
              Voici une première vue de votre résultat.
            </p>

            {levelInfo && (
              <div className={`inline-block px-6 py-3 border rounded-xl mb-6 ${levelInfo.color}`}>
                <p className="text-lg font-bold">{levelInfo.name}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-ohe-slate-50 rounded-xl">
                <p className="text-xs text-ohe-slate-600 uppercase tracking-wider mb-1">Score</p>
                <p className="text-2xl font-bold text-ohe-slate-900">
                  {testSession.scoreProcedural ?? 0}
                </p>
              </div>
              <div className="p-4 bg-ohe-slate-50 rounded-xl">
                <p className="text-xs text-ohe-slate-600 uppercase tracking-wider mb-1">Quadrant</p>
                <p className="text-2xl font-bold text-ohe-slate-900">
                  {testSession.quadrant ?? '-'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-ohe-slate-50 border border-ohe-slate-200 rounded-lg">
              <p className="text-sm text-ohe-slate-600">
                🚧 La restitution complète (forces/faiblesses par compétence, matrice 2x2, PDF
                téléchargeable, préconisations) sera construite à l&apos;étape suivante.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
