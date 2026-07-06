import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import LogoutButton from '@/components/LogoutButton';
import { checkAndExpireSession, formatDeadline } from '@/lib/deadline';
import WaitingPollClient from '@/components/user/WaitingPollClient';

export default async function WelcomePage() {
  const session = await auth();

  if (!session || session.user.role !== 'USER') {
    redirect('/login');
  }

  const questionsCount = await prisma.question.count({
    where: { active: true },
  });

  const existingSession = await prisma.testSession.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  // Vérifie et expire la session si la deadline est dépassée
  const currentSession = existingSession
    ? await checkAndExpireSession(existingSession.id)
    : null;

  const status = currentSession?.status ?? 'PENDING';

  // Redirect vers /result si le test est terminé
  if (status === 'COMPLETED') {
    redirect('/result');
  }

  const isPending = status === 'PENDING' || !currentSession;
  const isReady = status === 'READY_TO_START';
  const isInProgress = status === 'IN_PROGRESS';
  const isExpired = status === 'EXPIRED';

  const firstName = session.user.name?.split(' ')[0] ?? 'à vous';
  const orgName = session.user.organizationName ?? '';
  const deadline = currentSession?.deadline ?? null;

  return (
    <main className="min-h-screen bg-ohe-slate-50">
      {/* Top bar */}
      <header className="px-6 md:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo size="md" />
          <div className="hidden md:block w-px h-5 bg-ohe-slate-200" />
          <p className="hidden md:block font-mono text-[10px] tracking-[0.14em] uppercase text-ohe-slate-600">
            Diagnostic orthographe
          </p>
        </div>
        <div className="flex items-center gap-4">
          {orgName && (
            <div className="hidden sm:flex items-center gap-2.5">
              <span className="font-mono text-[9.5px] tracking-[0.08em] uppercase text-ohe-slate-600 text-right leading-tight">
                Mis à disposition par
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-ohe-slate-200 rounded-lg text-sm font-bold text-ohe-blue">
                <span className="w-2 h-2 rounded-full bg-ohe-blue" />
                {orgName}
              </span>
            </div>
          )}
          <LogoutButton />
        </div>
      </header>

      <div className="px-4 sm:px-6 pb-16">
        <div className="max-w-[720px] mx-auto bg-white rounded-2xl border border-ohe-slate-200/60 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_40px_-20px_rgba(15,23,42,0.15)] p-8 sm:p-12">
          {/* === CAS 1 : PENDING (en attente d'activation) === */}
          {isPending && (
            <>
              <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-ohe-orange mb-5">
                ✱ En attente d&apos;activation
              </p>
              <h1 className="font-serif font-normal text-4xl sm:text-5xl md:text-[56px] leading-[1.05] tracking-tight text-ohe-slate-900">
                Bonjour {firstName},
                <br />
                votre diagnostic
                <br />
                <em className="italic text-ohe-blue">arrive bientôt.</em>
              </h1>
              <p className="mt-5 mb-8 max-w-md text-base text-ohe-slate-600 leading-relaxed">
                Votre encadrant activera bientôt votre diagnostic. Vous recevrez un email et cette page se mettra à jour automatiquement.
              </p>

              <div className="flex items-center gap-3 px-4 py-3.5 bg-ohe-slate-50 border border-ohe-slate-100 rounded-2xl mb-2">
                <div className="w-10 h-10 rounded-full bg-ohe-blue/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-ohe-blue animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="leading-tight">
                  <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ohe-slate-600 mb-0.5">
                    Statut
                  </p>
                  <p className="text-sm font-semibold text-ohe-slate-900">Votre compte est prêt</p>
                  <p className="text-xs text-ohe-slate-600">En attente du démarrage par votre encadrant</p>
                </div>
              </div>

              {/* Polling silencieux : reload la page toutes les 10s */}
              <WaitingPollClient intervalMs={10000} />
            </>
          )}

          {/* === CAS 2 : EXPIRED === */}
          {isExpired && (
            <>
              <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-red-600 mb-5">
                ✱ Deadline dépassée
              </p>
              <h1 className="font-serif font-normal text-4xl sm:text-5xl md:text-[56px] leading-[1.05] tracking-tight text-ohe-slate-900">
                La date limite
                <br />
                <em className="italic text-red-600">est passée.</em>
              </h1>
              <p className="mt-5 mb-8 max-w-md text-base text-ohe-slate-600 leading-relaxed">
                Vous n&apos;avez plus accès au diagnostic. Contactez votre encadrant si vous souhaitez obtenir une prolongation.
              </p>

              {deadline && (
                <div className="flex items-center gap-3 px-4 py-3.5 bg-red-50 border border-red-100 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="leading-tight">
                    <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-red-700 mb-0.5">
                      Date limite dépassée
                    </p>
                    <p className="text-sm font-semibold text-ohe-slate-900">
                      {formatDeadline(deadline)}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* === CAS 3 : READY ou IN_PROGRESS (peut commencer/reprendre) === */}
          {(isReady || isInProgress) && (
            <>
              <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-ohe-orange mb-5">
                ✱ Diagnostic individuel
              </p>

              <h1 className="font-serif font-normal text-4xl sm:text-5xl md:text-[56px] leading-[1.05] tracking-tight text-ohe-slate-900">
                Bonjour {firstName},
                <br />
                évaluez votre niveau
                <br />
                <em className="italic text-ohe-blue">en français.</em>
              </h1>

              <p className="mt-5 mb-7 max-w-md text-base text-ohe-slate-600 leading-relaxed">
                Un diagnostic rapide pour situer vos réflexes en orthographe,
                sans jugement et sans préparation.
              </p>

              {/* Deadline */}
              {deadline && (
                <div className="flex items-center gap-3 px-4 py-3.5 bg-ohe-orange/5 border border-ohe-orange/20 rounded-2xl mb-6">
                  <div className="w-10 h-10 rounded-full bg-ohe-orange/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-ohe-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="leading-tight">
                    <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ohe-slate-600 mb-0.5">
                      Date limite de passage
                    </p>
                    <p className="text-sm font-semibold text-ohe-slate-900">
                      {formatDeadline(deadline)}
                    </p>
                  </div>
                </div>
              )}

              {/* Auteure */}
              <div className="flex items-center gap-3.5 px-4 py-3.5 bg-ohe-slate-50 border border-ohe-slate-100 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-ohe-blue text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                  RJ
                </div>
                <div className="leading-tight">
                  <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ohe-slate-600 mb-0.5">
                    Conçu par
                  </p>
                  <p className="text-sm font-semibold text-ohe-slate-900">Roxane Joannidès</p>
                  <p className="text-xs text-ohe-slate-600">Docteure en sciences du langage</p>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-x-7 gap-y-4 my-7">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-ohe-blue/10 text-ohe-blue flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-ohe-slate-900">15 min</p>
                    <p className="text-[11px] text-ohe-slate-600">durée moyenne</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-ohe-orange/10 text-ohe-orange flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-ohe-slate-900">{questionsCount} questions</p>
                    <p className="text-[11px] text-ohe-slate-600">adaptées au niveau</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-ohe-indigo/10 text-ohe-indigo flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-ohe-slate-900">Immédiat</p>
                    <p className="text-[11px] text-ohe-slate-600">résultat individuel</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Link href="/rules">
                <Button variant="primary" size="lg">
                  {isInProgress ? 'Reprendre le diagnostic →' : 'Commencer le diagnostic →'}
                </Button>
              </Link>

              {isInProgress && (
                <div className="mt-6 p-4 bg-ohe-orange/5 border border-ohe-orange/20 rounded-lg">
                  <p className="text-sm text-ohe-slate-700">
                    <span className="font-semibold">Reprise possible :</span> vous avez un test en cours, vous repartirez là où vous vous étiez arrêté(e).
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
