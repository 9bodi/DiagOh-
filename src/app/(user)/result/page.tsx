import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import type { Level } from '@prisma/client';
import Logo from '@/components/ui/Logo';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Badge } from '@/components/ui/Badge';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import ResultRadar from '@/components/result/ResultRadar';
import QuadrantMatrix from '@/components/result/QuadrantMatrix';
import BlockResultRow from '@/components/result/BlockResultRow';
import LogoutButton from '@/components/LogoutButton';

const LEVEL_INFO: Record<Level, { label: string; tagline: string }> = {
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

function safeQuadrant(q: number | null | undefined): 1 | 2 | 3 | 4 {
  if (q === 1 || q === 2 || q === 3 || q === 4) return q;
  return 3; // fallback neutre
}

export default async function ResultPage() {
  const session = await auth();
  if (!session || session.user.role !== 'USER') redirect('/login');

  const testSession = await prisma.testSession.findFirst({
    where: { userId: session.user.id, status: 'COMPLETED' },
    orderBy: { completedAt: 'desc' },
  });

  if (!testSession) redirect('/welcome');

  const level: Level = testSession.level ?? 'A';
  const levelInfo = LEVEL_INFO[level];
  const scoreTotal = testSession.scoreProcedural ?? 0;
  const firstName = session.user.name?.split(' ')[0] ?? '';
  const completedDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(
    testSession.completedAt ?? new Date()
  );
  const hasDeclarative = testSession.quadrant !== null && testSession.quadrant !== undefined;

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
        {/* ... (rest identical to your current file, just replace two things:) ... */}

        {/* Radar — no more (as any) needed */}
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

        {/* Détail par bloc — remove (as any) */}
        {BLOCKS.map((block, i) => (
          <BlockResultRow
            key={block.key}
            index={i + 1}
            name={block.name}
            score={(testSession[block.key] as number | null) ?? 0}
          />
        ))}

        {/* Quadrant — only render if declarative was answered */}
        {hasDeclarative && (
          <section className="mb-20">
            <Eyebrow tone="accent">Profil déclaratif</Eyebrow>
            <h2 className="text-4xl text-ohe-ink mt-3 mb-10"
                style={{ fontFamily: 'var(--font-instrument-serif)' }}>
              Adaptation <span className="italic text-ohe-accent">& intérêt</span>
            </h2>
            <QuadrantMatrix
              quadrant={safeQuadrant(testSession.quadrant)}
              scoreAdaptation={testSession.scoreAdaptation ?? 0}
              scoreInteret={testSession.scoreInteret ?? 0}
            />
          </section>
                  )}

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
