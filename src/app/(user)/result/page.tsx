import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import LogoutButton from '@/components/LogoutButton';

// ============ Métadonnées niveau CECRL ============
const LEVEL_META: Record<string, { letter: string; name: string; tagline: string }> = {
  A:  { letter: 'A',  name: 'Élémentaire',   tagline: 'Des bases à consolider.' },
  B1: { letter: 'B1', name: 'Intermédiaire', tagline: 'Une base en construction.' },
  B2: { letter: 'B2', name: 'Avancé',        tagline: 'Une maîtrise solide.' },
  C:  { letter: 'C',  name: 'Expert',        tagline: 'Une excellente maîtrise.' },
};

// ============ Libellés des 6 blocs procéduraux ============
const BLOCKS = [
  { key: 'scoreBloc1', label: 'Singulier / Pluriel' },
  { key: 'scoreBloc2', label: 'Conjugaison' },
  { key: 'scoreBloc3', label: 'Participe passé' },
  { key: 'scoreBloc4', label: 'Orthographe lexicale' },
  { key: 'scoreBloc5', label: 'Syntaxe' },
  { key: 'scoreBloc6', label: 'Compréhension' },
] as const;

// ============ Score par bloc → libellé qualitatif ============
function scoreToLabel(score: number | null | undefined): {
  label: string;
  tone: 'strong' | 'mid' | 'low' | 'none';
} {
  if (score === null || score === undefined) return { label: '—', tone: 'none' };
  if (score >= 1)    return { label: 'Maîtrisé',             tone: 'strong' };
  if (score >= 0.75) return { label: "En cours d'acquisition", tone: 'mid' };
  if (score >= 0.5)  return { label: 'Fragile',              tone: 'mid' };
  return { label: 'Non maîtrisé', tone: 'low' };
}

export default async function ResultPage() {
  const session = await auth();
  if (!session || session.user.role !== 'USER') redirect('/login');

  const testSession = await prisma.testSession.findFirst({
    where: { userId: session.user.id, status: 'COMPLETED' },
    orderBy: { completedAt: 'desc' },
  });

  if (!testSession) redirect('/welcome');

  const levelInfo = testSession.level ? LEVEL_META[testSession.level] : null;
  const scoreTotal = testSession.scoreProcedural ?? 0;
  const firstName = session.user.name?.split(' ')[0] ?? '';

  // Calcul forces / faiblesses (top 2 forts, top 2 faibles)
  const blocksWithScore = BLOCKS.map(b => ({
    label: b.label,
    score: (testSession[b.key as keyof typeof testSession] as number | null) ?? 0,
  }));
  const sorted = [...blocksWithScore].sort((a, b) => b.score - a.score);
  const strengths = sorted.filter(b => b.score >= 0.75).slice(0, 2);
  const weaknesses = sorted.filter(b => b.score < 0.5).slice(-2).reverse();

  return (
    <main className="min-h-screen bg-ohe-slate-50">
      {/* Top bar */}
      <header className="px-6 md:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo size="md" />
          <div className="hidden md:block w-px h-5 bg-ohe-slate-200" />
          <p className="hidden md:block font-mono text-[10px] tracking-[0.14em] uppercase text-ohe-slate-600">
            Votre diagnostic
          </p>
        </div>
        <LogoutButton />
      </header>

      <div className="px-4 sm:px-8 lg:px-16 pb-16">
        <div className="w-full max-w-6xl mx-auto bg-white rounded-3xl border border-ohe-slate-200/60 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_48px_-24px_rgba(15,23,42,0.18)] overflow-hidden grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] min-h-[640px]">

          {/* ============== LEFT — Score global + CECRL + CTA ============== */}
          <div className="p-10 lg:p-14 flex flex-col justify-between gap-10">
            <div>
              <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-ohe-orange mb-5">
                ✱ Diagnostic terminé
              </p>

              <h1 className="font-serif font-normal text-4xl lg:text-[52px] leading-[1.05] tracking-tight text-ohe-slate-900">
                {firstName ? `Bravo ${firstName},` : 'Bravo,'}
                <br />
                <em className="italic text-ohe-blue">voici votre résultat.</em>
              </h1>

              <p className="mt-5 text-base lg:text-lg text-ohe-slate-600 leading-relaxed max-w-md">
                {levelInfo?.tagline ?? 'Votre niveau de maîtrise de l\'orthographe a été évalué.'}
              </p>

              {/* Bloc Niveau + Score */}
<div className="mt-9 flex items-center gap-6 p-6 bg-ohe-slate-50 border border-ohe-slate-100 rounded-2xl">
  <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-ohe-blue text-white flex-shrink-0">
    <span className="font-serif text-5xl leading-none">
      {levelInfo?.letter ?? '—'}
    </span>
  </div>
  <div className="leading-tight min-w-0">
    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ohe-slate-600 mb-1.5">
      Niveau atteint
    </p>
    <p className="font-serif text-2xl text-ohe-slate-900 mb-2">
      {levelInfo?.name ?? 'Non évalué'}
    </p>
    <p className="text-sm text-ohe-slate-600">
      Score global :{' '}
      <span className="font-semibold text-ohe-slate-900">
        {scoreTotal.toFixed(2).replace('.', ',')} / 6
      </span>
    </p>
  </div>
</div>


              {/* Forces / faiblesses */}
              {(strengths.length > 0 || weaknesses.length > 0) && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {strengths.length > 0 && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-emerald-700 mb-2">
                        ✓ Vos forces
                      </p>
                      <ul className="space-y-1">
                        {strengths.map(s => (
                          <li key={s.label} className="text-sm text-ohe-slate-900 font-medium">
                            {s.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {weaknesses.length > 0 && (
                    <div className="p-4 rounded-xl bg-ohe-orange/5 border border-ohe-orange/20">
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ohe-orange mb-2">
                        ✱ À renforcer
                      </p>
                      <ul className="space-y-1">
                        {weaknesses.map(w => (
                          <li key={w.label} className="text-sm text-ohe-slate-900 font-medium">
                            {w.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-4 flex-wrap mt-10">

              <a href={`/api/pdf/${session.user.id}`} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="lg">
                  Télécharger mon bilan PDF →
                </Button>
              </a>
              <p className="text-xs text-ohe-slate-600">
                Votre badge sera disponible prochainement.
              </p>
            </div>
          </div>

          {/* ============== RIGHT — Détail des 6 blocs ============== */}
          <div className="relative p-10 lg:p-14 flex flex-col gap-6 bg-gradient-to-br from-ohe-indigo to-[#2A2580] text-white overflow-hidden">
            {/* Subtle warm glow */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at 80% 20%, rgba(255,107,53,0.18), transparent 50%)',
              }}
            />

            <div className="relative">
              <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-white/60 mb-2">
                ✱ Détail par compétence
              </p>
              <h2 className="font-serif text-2xl lg:text-[28px] tracking-tight leading-tight">
                Vos résultats <em className="italic text-ohe-orange-light">bloc par bloc.</em>
              </h2>
            </div>

            <div className="relative flex flex-col gap-3.5 mt-2">
              {blocksWithScore.map((b, i) => {
                const meta = scoreToLabel(b.score);
                const pct = Math.round(b.score * 100);
                const barColor =
                  meta.tone === 'strong'
                    ? 'bg-emerald-400'
                    : meta.tone === 'mid'
                    ? 'bg-ohe-orange'
                    : meta.tone === 'low'
                    ? 'bg-red-400'
                    : 'bg-white/30';

                return (
                  <div
                    key={b.label}
                    className="p-4 rounded-xl bg-white/[0.06] border border-white/[0.10]"
                  >
                    <div className="flex items-baseline justify-between gap-3 mb-2">
                      <div className="flex items-baseline gap-2.5 min-w-0">
                        <span className="font-mono text-[10.5px] tracking-[0.14em] text-white/50 flex-shrink-0">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <p className="font-semibold text-[15px] tracking-tight truncate">
                          {b.label}
                        </p>
                      </div>
                      <span className="font-mono text-[11px] tracking-wider text-white/70 flex-shrink-0">
                        {meta.label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
