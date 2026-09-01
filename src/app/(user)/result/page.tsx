import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Logo from '@/components/ui/Logo';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Badge } from '@/components/ui/Badge';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import ResultRadar from '@/components/result/ResultRadar';
import BlockResultRow from '@/components/result/BlockResultRow';
import LogoutButton from '@/components/LogoutButton';

const LEVEL_INFO: Record<string, { label: string; tagline: string }> = {
  A:  { label: 'Élémentaire',   tagline: 'Des bases à consolider.' },
  B1: { label: 'Intermédiaire', tagline: 'Une base en construction.' },
  B2: { label: 'Avancé',        tagline: 'Une maîtrise solide.' },
  C:  { label: 'Expert',        tagline: 'Une excellente maîtrise.' },
};

const BLOCKS = [
  { key: 'scoreBloc1', name: 'Singulier / Pluriel' },
  { key: 'scoreBloc2', name: 'Conjugaison' },
  { key: 'scoreBloc3', name: 'Participe passé' },
  { key: 'scoreBloc4', name: 'Orthographe lexicale' },
  { key: 'scoreBloc5', name: 'Syntaxe' },
  { key: 'scoreBloc6', name: 'Compréhension' },
] as const;

export default async function ResultPage() {
  const session = await auth();
  if (!session || session.user.role !== 'USER') redirect('/login');

  const testSession = await prisma.testSession.findFirst({
    where: { userId: session.user.id, status: 'COMPLETED' },
    orderBy: { completedAt: 'desc' },
  });

  if (!testSession) redirect('/welcome');

  const level = (testSession.level ?? 'A') as keyof typeof LEVEL_INFO;
  const levelInfo = LEVEL_INFO[level] ?? LEVEL_INFO.A;
  const scoreTotal = testSession.scoreProcedural ?? 0;
  const firstName = session.user.name?.split(' ')[0] ?? '';
  const completedDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(
    testSession.completedAt ?? new Date()
  );

  return (
    <div className="min-h-screen bg-ohe-bg">
      {/* Header */}
      <header className="border-b border-ohe-line bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size={40} />
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <section className="mb-16">
          <Eyebrow tone="accent">Bilan du diagnostic</Eyebrow>
          <h1
            className="text-5xl md:text-6xl text-ohe-ink mt-4 text-balance"
            style={{ fontFamily: 'var(--font-instrument-serif)' }}
          >
            {firstName ? `Bravo ${firstName}, ` : 'Bravo, '}voici votre{' '}
            <span className="italic text-ohe-accent">résultat</span>.
          </h1>
          <p className="ohe-caption text-ohe-muted mt-6">Bilan édité le {completedDate}</p>
        </section>

        {/* Niveau global + Score */}
        <section className="mb-20 grid md:grid-cols-2 gap-8">
          <div className="border border-ohe-line rounded-3xl p-10 bg-white">
            <Eyebrow tone="muted">Niveau global</Eyebrow>
            <div
              className="text-8xl text-ohe-accent mt-4 mb-2"
              style={{ fontFamily: 'var(--font-instrument-serif)', fontStyle: 'italic' }}
            >
              {level}
            </div>
            <p
              className="text-2xl text-ohe-ink"
              style={{ fontFamily: 'var(--font-instrument-serif)' }}
            >
              {levelInfo.label}
            </p>
            <p className="text-ohe-muted mt-2">{levelInfo.tagline}</p>
          </div>
          <div className="border border-ohe-line rounded-3xl p-10 bg-ohe-panel-tint flex flex-col justify-center">
  <Eyebrow tone="muted">Score global</Eyebrow>
  <div className="flex items-baseline gap-2 mt-4">
    <span
      className="text-6xl text-ohe-ink"
      style={{ fontFamily: 'var(--font-instrument-serif)', fontStyle: 'italic' }}
    >
      {Math.round((scoreTotal / 6) * 100)}
    </span>
    <span className="text-2xl text-ohe-muted">%</span>
  </div>
  <p className="text-sm text-ohe-muted mt-4">
    Pourcentage global de bonnes réponses sur les 48 questions procédurales du diagnostic.
  </p>
</div>

        </section>

        {/* Radar */}
        <section className="mb-20">
          <Eyebrow tone="accent">Vos compétences</Eyebrow>
          <h2
            className="text-4xl text-ohe-ink mt-3 mb-10"
            style={{ fontFamily: 'var(--font-instrument-serif)' }}
          >
            Cartographie <span className="italic text-ohe-accent"></span>
          </h2>
          <div className="border border-ohe-line rounded-3xl p-10 bg-white">
            <ResultRadar
              scores={{
                bloc1: testSession.scoreBloc1 ?? 0,
                bloc2: testSession.scoreBloc2 ?? 0,
                bloc3: testSession.scoreBloc3 ?? 0,
                bloc4: testSession.scoreBloc4 ?? 0,
                bloc5: testSession.scoreBloc5 ?? 0,
                bloc6: testSession.scoreBloc6 ?? 0,
              }}
            />
          </div>
        </section>

        {/* Détail par bloc */}
        <section className="mb-20">
          <Eyebrow tone="accent">Détail par bloc</Eyebrow>
          <h2
            className="text-4xl text-ohe-ink mt-3 mb-10"
            style={{ fontFamily: 'var(--font-instrument-serif)' }}
          >
            Vos résultats <span className="italic text-ohe-accent">détaillés</span>
          </h2>
          <div className="border border-ohe-line rounded-3xl px-8 py-2 bg-white">
            {BLOCKS.map((block, i) => (
              <BlockResultRow
                key={block.key}
                index={i + 1}
                name={block.name}
                score={((testSession as any)[block.key] as number | null) ?? 0}
              />
            ))}
          </div>
        </section>

       

        {/* Actions */}
        <section className="mb-20">
          <div className="border border-ohe-line rounded-3xl p-10 bg-white">
            <Eyebrow tone="accent">Emporter votre bilan</Eyebrow>
            <h2
              className="text-3xl text-ohe-ink mt-3 mb-8"
              style={{ fontFamily: 'var(--font-instrument-serif)' }}
            >
              Téléchargez vos <span className="italic text-ohe-accent">livrables</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <a
  href={`/api/pdf/participant/${session.user.id}`}
  target="_blank"
  rel="noopener noreferrer"
>

                <PrimaryButton>Télécharger mon bilan PDF</PrimaryButton>
              </a>
              <div className="inline-flex items-center gap-3">
               <a
  href={`/api/badge/${session.user.id}`}
  download="badge-ohe.png"
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-ohe-ink text-ohe-ink hover:bg-ohe-ink hover:text-white transition-colors font-medium"
>
  Télécharger mon badge LinkedIn
</a>


              </div>
            </div>
          </div>
        </section>

        {/* Footer signature */}
        <footer className="border-t border-ohe-line pt-10 text-center">
          <p
            className="text-ohe-muted italic"
            style={{ fontFamily: 'var(--font-instrument-serif)' }}
          >
            Diagnostic conçu par Roxane Joannidès
          </p>
          <p className="ohe-caption text-ohe-muted mt-1">Docteure en sciences du langage</p>
        </footer>
      </main>
    </div>
  );
}
