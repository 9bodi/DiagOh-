import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Logo, Badge, Portrait, Eyebrow, PrimaryButton } from '@/components/ui';
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

  const currentSession = existingSession
    ? await checkAndExpireSession(existingSession.id)
    : null;

  const status = currentSession?.status ?? 'PENDING';

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
    <main className="min-h-screen bg-ohe-bg text-ohe-ink">
      {/* Header */}
      <header className="px-6 md:px-12 py-6 flex items-center justify-between gap-4 border-b border-ohe-line">
        <Logo size={40} withLabel />

        <div className="flex items-center gap-4">
          {orgName && (
            <div className="hidden sm:flex items-center gap-3">
              <span className="ohe-caption text-ohe-muted text-right leading-tight">
                Mis à disposition par
              </span>
              <Badge tone="accent">{orgName}</Badge>
            </div>
          )}
          <LogoutButton />
        </div>
      </header>

      <div className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-[760px] mx-auto">

          {/* ═══ CAS 1 : PENDING ═══ */}
          {isPending && (
            <>
              <Eyebrow tone="accent">En attente d&apos;activation</Eyebrow>

              <h1 className="mt-6 text-[40px] sm:text-[54px] lg:text-[68px] leading-[1.02] tracking-[-0.028em] font-normal text-balance">
                Bonjour {firstName},<br />
                votre diagnostic<br />
                <span className="font-serif italic text-ohe-accent">arrive bientôt.</span>
              </h1>

              <p className="mt-6 max-w-[520px] text-base lg:text-[17px] leading-[1.55] text-ohe-muted text-pretty">
                Votre encadrant activera bientôt votre diagnostic. Vous recevrez un email et cette page se mettra à jour automatiquement.
              </p>

              <div className="mt-10 p-5 sm:p-6 bg-ohe-panel-tint border border-ohe-line rounded-2xl flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-ohe-accent-soft flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-ohe-accent animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="ohe-caption text-ohe-muted mb-1">Statut</div>
                  <p className="text-[15px] text-ohe-ink font-medium">Votre compte est prêt</p>
                  <p className="text-sm text-ohe-muted mt-0.5">En attente du démarrage par votre encadrant</p>
                </div>
              </div>

              <WaitingPollClient intervalMs={10000} />
            </>
          )}

          {/* ═══ CAS 2 : EXPIRED ═══ */}
          {isExpired && (
            <>
              <Eyebrow tone="accent">Deadline dépassée</Eyebrow>

              <h1 className="mt-6 text-[40px] sm:text-[54px] lg:text-[68px] leading-[1.02] tracking-[-0.028em] font-normal text-balance">
                La date limite<br />
                <span className="font-serif italic text-ohe-accent">est passée.</span>
              </h1>

              <p className="mt-6 max-w-[520px] text-base lg:text-[17px] leading-[1.55] text-ohe-muted text-pretty">
                Vous n&apos;avez plus accès au diagnostic. Contactez votre encadrant si vous souhaitez obtenir une prolongation.
              </p>

              {deadline && (
                <div className="mt-10 p-5 sm:p-6 bg-ohe-panel-tint border border-ohe-line rounded-2xl flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-ohe-accent-soft flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-ohe-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <div className="ohe-caption text-ohe-muted mb-1">Date limite dépassée</div>
                    <p className="text-[15px] text-ohe-ink font-medium">
                      {formatDeadline(deadline)}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ═══ CAS 3 : READY ou IN_PROGRESS ═══ */}
          {(isReady || isInProgress) && (
            <>
              <Eyebrow tone="accent">Diagnostic individuel</Eyebrow>

              <h1 className="mt-6 text-[40px] sm:text-[54px] lg:text-[68px] leading-[1.02] tracking-[-0.028em] font-normal text-balance">
                Bonjour {firstName},<br />
                évaluez votre niveau<br />
                <span className="font-serif italic text-ohe-accent">en français.</span>
              </h1>

              <p className="mt-6 max-w-[520px] text-base lg:text-[17px] leading-[1.55] text-ohe-muted text-pretty">
                Un diagnostic rapide pour situer vos réflexes en orthographe,
                sans jugement et sans préparation.
              </p>

              {/* Deadline */}
              {deadline && (
                <div className="mt-10 p-5 sm:p-6 bg-ohe-panel-tint border border-ohe-line rounded-2xl flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-ohe-accent-soft flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-ohe-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="ohe-caption text-ohe-muted mb-1">Date limite de passage</div>
                    <p className="text-[15px] text-ohe-ink font-medium">
                      {formatDeadline(deadline)}
                    </p>
                  </div>
                </div>
              )}

              {/* Stats row — 3 KPI */}
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-0 border-t border-ohe-line">
                <div className="grid grid-cols-[42px_1fr] gap-4 py-5 sm:pr-6 border-b sm:border-b-0 sm:border-r border-ohe-line-soft">
                  <div className="text-[11px] tracking-[0.2em] text-ohe-accent pt-2 font-medium">01</div>
                  <div>
                    <div className="font-serif italic text-[22px] leading-[1.1] text-ohe-accent">~15 min</div>
                    <div className="text-[13px] text-ohe-muted mt-1.5">durée moyenne</div>
                  </div>
                </div>

                <div className="grid grid-cols-[42px_1fr] gap-4 py-5 sm:px-6 border-b sm:border-b-0 sm:border-r border-ohe-line-soft">
                  <div className="text-[11px] tracking-[0.2em] text-ohe-accent pt-2 font-medium">02</div>
                  <div>
                    <div className="font-serif italic text-[22px] leading-[1.1] text-ohe-accent">{questionsCount} questions</div>
                    <div className="text-[13px] text-ohe-muted mt-1.5">adaptées au niveau</div>
                  </div>
                </div>

                <div className="grid grid-cols-[42px_1fr] gap-4 py-5 sm:pl-6">
                  <div className="text-[11px] tracking-[0.2em] text-ohe-accent pt-2 font-medium">03</div>
                  <div>
                    <div className="font-serif italic text-[22px] leading-[1.1] text-ohe-accent">Immédiat</div>
                    <div className="text-[13px] text-ohe-muted mt-1.5">résultat individuel</div>
                  </div>
                </div>
              </div>

              <div className="border-b border-ohe-line" />

              {/* CTA */}
              <div className="mt-10">
                <Link href="/rules">
                  <PrimaryButton>
                    {isInProgress ? 'Reprendre le diagnostic' : 'Commencer le diagnostic'}
                  </PrimaryButton>
                </Link>
              </div>

              {isInProgress && (
                <div className="mt-6 p-4 bg-ohe-panel-tint border border-ohe-line rounded-2xl">
                  <p className="text-sm text-ohe-ink">
                    <span className="font-medium">Reprise possible :</span> vous avez un test en cours, vous repartirez là où vous vous étiez arrêté(e).
                  </p>
                </div>
              )}

              {/* Auteure */}
              <div className="mt-12 pt-6 border-t border-ohe-line flex items-center gap-3.5">
                <Portrait size={42} src="/img/logos/roxane.avif" alt="Roxane Joannidès" />
                <div>
                  <div className="ohe-caption text-ohe-muted">Diagnostic conçu par</div>
                  <div className="text-sm mt-0.5">
                    Roxane Joannidès{" "}
                    <span className="text-ohe-muted">· Docteure en sciences du langage</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
