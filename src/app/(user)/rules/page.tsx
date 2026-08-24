import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Logo, Eyebrow, PrimaryButton } from '@/components/ui';
import { isSessionExpired } from '@/lib/deadline';

export default async function RulesPage() {
  const session = await auth();

  if (!session || session.user.role !== 'USER') {
    redirect('/login');
  }

  const testSession = await prisma.testSession.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  if (!testSession) redirect('/welcome');
  if (testSession.status === 'COMPLETED') redirect('/result');
  if (testSession.status === 'PENDING') redirect('/welcome');
  if (testSession.status === 'EXPIRED' || isSessionExpired(testSession)) {
    redirect('/welcome');
  }

  const rules = [
    {
      num: '01',
      title: 'Chronométré',
      body: 'Chaque question a un temps limité affiché à l\u2019écran. Validation automatique à la fin du temps.',
    },
    {
      num: '02',
      title: 'Définitif',
      body: 'Aucun retour en arrière une fois la réponse validée. Suivez vos intuitions.',
    },
    {
      num: '03',
      title: 'En une session',
      body: 'À faire d\u2019une traite, sans interruption. Prévoyez environ 15 minutes.',
    },
  ];

  return (
    <main className="h-screen overflow-hidden grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] bg-ohe-bg text-ohe-ink">
      {/* Colonne gauche : titre + CTA */}
      <div className="flex flex-col px-6 py-6 sm:px-10 sm:py-8 lg:px-14 lg:py-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 shrink-0">
          <Logo size={40} withLabel />
        </div>

        {/* Bloc central */}
        <div className="flex-1 flex flex-col justify-center min-h-0">
          <Eyebrow tone="accent">Avant de démarrer</Eyebrow>

          <h1 className="mt-6 text-[40px] sm:text-[54px] lg:text-[68px] leading-[1.02] lg:leading-[0.98] tracking-[-0.028em] font-normal text-balance m-0">
            Court, chronométré,<br />
            <span className="font-serif italic text-ohe-accent">en une seule fois.</span>
          </h1>

          <p className="mt-5 lg:mt-6 text-base lg:text-[17px] leading-[1.55] text-ohe-muted max-w-[460px] text-pretty">
            Prenez le temps de lire chaque question, mais répondez sans hésiter trop longtemps.
            Vos premières intuitions sont souvent les meilleures.
          </p>

          <div className="mt-7 lg:mt-8 flex items-center gap-6 flex-wrap">
            <Link href="/test">
              <PrimaryButton>J&apos;ai compris, je démarre</PrimaryButton>
            </Link>
            <Link
              href="/welcome"
              className="text-sm text-ohe-muted hover:text-ohe-ink transition-colors underline underline-offset-4"
            >
              Revenir à l&apos;accueil
            </Link>
          </div>
        </div>

        {/* Byline */}
        <div className="shrink-0 pt-5 border-t border-ohe-line">
          <div className="ohe-caption text-ohe-muted">
            OHé Diagnostic
          </div>
        </div>
      </div>

      {/* Colonne droite : panneau tint avec les 3 règles */}
      <div className="bg-ohe-panel-tint border-t lg:border-t-0 lg:border-l border-ohe-line px-6 py-8 sm:px-10 lg:px-12 lg:py-10 flex flex-col justify-center relative overflow-hidden">
        <div className="flex flex-col">
          {rules.map((rule, i) => {
            const isFirst = i === 0;
            const isLast = i === rules.length - 1;
            return (
              <div
                key={rule.num}
                className={`
                  grid grid-cols-[46px_1fr] gap-[18px] py-[22px]
                  ${isFirst ? 'border-t border-ohe-line' : ''}
                  ${isLast ? 'border-b border-ohe-line' : 'border-b border-ohe-line-soft'}
                `}
              >
                <div className="text-[11px] tracking-[0.2em] text-ohe-accent pt-2 font-medium">
                  {rule.num}
                </div>
                <div>
                  <div className="font-serif italic text-[22px] lg:text-[26px] leading-[1.1] text-ohe-accent">
                    {rule.title}
                  </div>
                  <div className="text-[13px] text-ohe-muted mt-1.5 text-pretty leading-relaxed">
                    {rule.body}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

       
          
        
      </div>
    </main>
  );
}
