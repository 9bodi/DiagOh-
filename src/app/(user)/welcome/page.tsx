import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LogoutButton from '@/components/LogoutButton';

export default async function WelcomePage() {
  const session = await auth();

  if (!session || session.user.role !== 'USER') {
    redirect('/login');
  }

  // Compter les questions actives pour afficher le nombre dans l'écran
  const questionsCount = await prisma.question.count({
    where: { active: true, type: 'PROCEDURAL' },
  });

  // Vérifier si l'user a déjà une session de test
  const existingSession = await prisma.testSession.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  const isResume = existingSession?.status === 'IN_PROGRESS';
  const isCompleted = existingSession?.status === 'COMPLETED';

  // Si déjà complété → directement la page résultat
  if (isCompleted) {
    redirect('/result');
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-ohe-slate-50 to-ohe-slate-100">
      <header className="px-6 py-4 flex items-center justify-between">
        <Logo size="md" />
        <div className="flex items-center gap-4">
          <p className="text-xs text-ohe-slate-600 hidden sm:block">
            Mis à disposition par <span className="font-medium text-ohe-slate-900">{session.user.organizationName}</span>
          </p>
          <LogoutButton />
        </div>
      </header>

      <div className="flex items-center justify-center px-6 py-12 min-h-[calc(100vh-80px)]">
        <Card padding="lg" className="max-w-2xl w-full">
          <div className="mb-2">
            <span className="text-xs font-semibold tracking-wider text-ohe-blue uppercase">
              Diagnostic orthographe
            </span>
          </div>

          <h1 className="text-4xl font-bold text-ohe-slate-900 leading-tight mb-4">
            Bonjour {session.user.name?.split(' ')[0] ?? 'à vous'},
            <br />
            évaluez votre niveau<br />
            en français.
          </h1>

          <p className="text-ohe-slate-600 mb-8 text-lg">
            Un diagnostic rapide pour situer vos réflexes en orthographe.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-ohe-slate-50 rounded-xl">
            <div className="text-center">
              <div className="text-2xl mb-1">⏱️</div>
              <p className="text-lg font-bold text-ohe-slate-900">15 min</p>
              <p className="text-xs text-ohe-slate-600">durée totale</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">⚡</div>
              <p className="text-lg font-bold text-ohe-slate-900">{questionsCount}</p>
              <p className="text-xs text-ohe-slate-600">questions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🎯</div>
              <p className="text-lg font-bold text-ohe-slate-900">Immédiat</p>
              <p className="text-xs text-ohe-slate-600">résultat individuel</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/rules" className="flex-1">
              <Button variant="primary" size="lg" fullWidth>
                {isResume ? 'Reprendre le diagnostic →' : 'Commencer le diagnostic →'}
              </Button>
            </Link>
            <Button variant="secondary" size="lg">
              En savoir plus
            </Button>
          </div>

          {isResume && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                ℹ️ Vous avez un test en cours. Vous reprendrez là où vous vous êtes arrêté(e).
              </p>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
