import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default async function RulesPage() {
  const session = await auth();

  if (!session || session.user.role !== 'USER') {
    redirect('/login');
  }

  return (
    <main className="min-h-screen flex flex-col lg:flex-row">
      {/* Côté gauche : titre + CTA */}
      <div className="flex-1 bg-white flex items-center justify-center p-8 lg:p-16">
        <div className="max-w-md w-full">
          <div className="mb-4">
            <span className="text-xs font-semibold tracking-wider text-ohe-slate-600 uppercase">
              Avant de démarrer
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-ohe-slate-900 leading-tight mb-6">
            Court, chronométré,<br />
            en une seule fois.
          </h1>

          <p className="text-ohe-slate-600 mb-8 text-lg">
            Prenez le temps de lire chaque question, mais répondez sans hésiter trop longtemps.
          </p>

          <Link href="/test">
            <Button variant="primary" size="lg">
              J&apos;ai compris, je démarre →
            </Button>
          </Link>
        </div>
      </div>

      {/* Côté droit : règles (fond bleu OHé) */}
      <div className="flex-1 bg-ohe-blue text-white flex items-center justify-center p-8 lg:p-16">
        <div className="max-w-md w-full space-y-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-sm font-bold">
              01
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1 flex items-center gap-2">
                <span>⏱️</span> Chronométré
              </h3>
              <p className="text-white/75 text-sm">
                15 secondes par question.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-sm font-bold">
              02
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1 flex items-center gap-2">
                <span>→</span> Définitif
              </h3>
              <p className="text-white/75 text-sm">
                Aucun retour en arrière possible.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-sm font-bold">
              03
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1 flex items-center gap-2">
                <span>⚡</span> Une seule session
              </h3>
              <p className="text-white/75 text-sm">
                À faire en une fois, sans interruption.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
