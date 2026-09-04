import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AdminHeader from '@/components/admin/AdminHeader';
import { getAccessibleGroupIds } from '@/lib/permissions';
import { RECOMMANDATION_LABELS } from '@/lib/scoring';
import type { Recommandation } from '@prisma/client';
import ResultRadar from '@/components/result/ResultRadar';


// ============ Métadonnées ============
const LEVEL_META: Record<string, { name: string; bar: string; badge: string; dot: string; desc: string }> = {
  A:  { name: 'Niveau A · Élémentaire',   bar: 'bg-red-400',     badge: 'bg-red-50 text-red-700',                    dot: 'bg-red-400',     desc: 'besoins de base' },
  B1: { name: 'Niveau B1 · Intermédiaire', bar: 'bg-ohe-orange',  badge: 'bg-ohe-orange/10 text-ohe-orange',          dot: 'bg-ohe-orange',  desc: 'besoins techniques' },
  B2: { name: 'Niveau B2 · Avancé',        bar: 'bg-ohe-blue',    badge: 'bg-ohe-blue/10 text-ohe-blue',              dot: 'bg-ohe-blue',    desc: 'besoins professionnels' },
  C:  { name: 'Niveau C · Expert',         bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700',            dot: 'bg-emerald-500', desc: 'besoins experts' },
};

// Libellés Roxane pour les quadrants (au lieu des anciens "À former en priorité", etc.)
const QUADRANT_META: Record<number, { label: string; tone: string }> = {
  1: {
    label: 'Besoin perçu · Disposé',
    tone: 'bg-sky-50 border-sky-200 text-sky-900',
  },
  2: {
    label: 'Besoin perçu · Moins disposé',
    tone: 'bg-sky-50 border-sky-200 text-sky-900',
  },
  3: {
    label: 'Pas de besoin perçu · Disposé',
    tone: 'bg-sky-50 border-sky-200 text-sky-900',
  },
  4: {
    label: 'Pas de besoin perçu · Moins disposé',
    tone: 'bg-neutral-100 border-neutral-200 text-neutral-600',
  },
};




// Métadonnées des 4 catégories de préconisation Roxane
const RECOMMANDATION_META: Record<Recommandation, { label: string; tone: string; desc: string }> = {
  A_FORMER: {
    label: 'À former',
    tone: 'bg-sky-50 border-sky-200 text-sky-900',
    desc: 'Le niveau correspond, le besoin est identifié et la disposition à se former est forte.',
  },
  A_FORMER_ET_ACCOMPAGNER: {
    label: 'À former et accompagner',
    tone: 'bg-sky-50 border-sky-200 text-sky-900',
    desc: "Le niveau correspond, mais il faut travailler l'adhésion.",
  },
  A_FORMER_SOUS_RESERVES: {
    label: 'À former sous réserves',
    tone: 'bg-sky-50 border-sky-200 text-sky-900',
    desc: 'La personne exprime une demande ou un besoin, mais son niveau invite à vérifier la pertinence de la formation.',
  },
  A_ORIENTER: {
    label: "À orienter vers d'autres solutions",
    tone: 'bg-neutral-100 border-neutral-200 text-neutral-600',
    desc: 'Niveau hors cible, trop élevé ou insuffisant.',
  },
};



const BLOCKS = [
  { num: 1, label: 'Singulier / Pluriel' },
  { num: 2, label: 'Conjugaison' },
  { num: 3, label: 'Participe passé' },
  { num: 4, label: 'Orthographe lexicale' },
  { num: 5, label: 'Syntaxe' },
  { num: 6, label: 'Compréhension' },
] as const;

function scoreToLabel(score: number): { label: string; tone: 'strong' | 'mid' | 'low' } {
  if (score >= 0.75) return { label: 'Maîtrisé',      tone: 'strong' };
  if (score >= 0.5)  return { label: 'Fragile',       tone: 'mid' };
  return                 { label: 'Non maîtrisé',     tone: 'low' };
}

export default async function ResultsPage() {
  const session = await auth();

  if (
    !session ||
    (session.user.role !== 'ADMIN' &&
      session.user.role !== 'SUPERADMIN' &&
      session.user.role !== 'SUPERVISOR')
  ) {
    redirect('/login');
  }

  const orgId = session.user.organizationId;
  if (!orgId) redirect('/login');

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) redirect('/login');

  const isSupervisor = session.user.role === 'SUPERVISOR';

  // ===== Filtrage par rôle =====
  let userFilter: any = { organizationId: orgId };

  if (isSupervisor) {
    const accessibleGroupIds = await getAccessibleGroupIds(
      session.user.id,
      session.user.role,
      orgId,
    );
    userFilter = {
      organizationId: orgId,
      groupId: { in: accessibleGroupIds },
    };
  }

  // ===== Sessions COMPLETED de l'orga (filtrées si superviseur) =====
  const completedSessions = await prisma.testSession.findMany({
    where: {
      status: 'COMPLETED',
      user: userFilter,
    },
    include: { user: true },
  });

  const total = completedSessions.length;
    // ===== Temps moyen par question (en secondes) =====
  const completedSessionIds = completedSessions.map(s => s.id);
  const proceduralAnswers = await prisma.answer.findMany({
    where: {
      testSessionId: { in: completedSessionIds },
      question: { type: 'PROCEDURAL' },
      timeSpent: { not: null, gt: 0 },
    },
    select: { timeSpent: true },
  });
  const totalTime = proceduralAnswers.reduce((sum, a) => sum + (a.timeSpent ?? 0), 0);
  const avgTimePerQuestionSec =
    proceduralAnswers.length > 0 ? totalTime / proceduralAnswers.length : 0;


  // ===== Répartition par niveau =====
  const levelCounts = { A: 0, B1: 0, B2: 0, C: 0 } as Record<string, number>;
  completedSessions.forEach(s => { if (s.level) levelCounts[s.level]++; });

  // ===== Score moyen procédural (converti en %) =====
  const totalScore = completedSessions.reduce((sum, s) => sum + (s.scoreProcedural ?? 0), 0);
  const avgScore = total > 0 ? totalScore / total : 0;
  const avgScorePct = (avgScore * 100) / 6;

  // ===== Quadrants =====
  const quadrantCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  completedSessions.forEach(s => { if (s.quadrant) quadrantCounts[s.quadrant]++; });

  // ===== Moyenne par bloc (/1) =====
  const blockAverages = BLOCKS.map(b => {
    const key = `scoreBloc${b.num}` as keyof typeof completedSessions[number];
    const values = completedSessions
      .map(s => s[key] as number | null)
      .filter((v): v is number => v !== null && v !== undefined);
    const avg = values.length > 0 ? values.reduce((a, c) => a + c, 0) / values.length : 0;
    return { ...b, avg };
  });

  // ===== Répartition des préconisations =====
  const recommandationCounts: Record<Recommandation, number> = {
    A_FORMER: 0,
    A_FORMER_ET_ACCOMPAGNER: 0,
    A_FORMER_SOUS_RESERVES: 0,
    A_ORIENTER: 0,
  };
  completedSessions.forEach(s => {
    if (s.recommandation) recommandationCounts[s.recommandation]++;
  });

  const dominantLevel = Object.entries(levelCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  return (
    <main className="min-h-screen bg-ohe-slate-50">
      <AdminHeader
        userName={session.user.name ?? session.user.email}
        orgName={org.name}
        currentPath="/results"
        userRole={session.user.role}
        isImpersonating={session.user.isImpersonating}
      />

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-10">
          
          <h1 className="font-serif font-normal text-4xl lg:text-[48px] leading-[1.05] tracking-tight text-ohe-slate-900">
            Restitution <em className="italic text-ohe-blue">collective.</em>
          </h1>
          <p className="mt-4 text-base text-ohe-slate-600 leading-relaxed">
            {total === 0
              ? isSupervisor
                ? `Aucun diagnostic complété pour le moment dans vos groupes.`
                : `Aucun diagnostic complété pour le moment chez ${org.name}.`
              : isSupervisor
                ? `${total} diagnostic${total > 1 ? 's' : ''} complété${total > 1 ? 's' : ''} dans vos groupes chez ${org.name}.`
                : `${total} diagnostic${total > 1 ? 's' : ''} complété${total > 1 ? 's' : ''} chez ${org.name}.`}
          </p>
        </div>

        {total === 0 ? (
          <div className="bg-white rounded-2xl border border-ohe-slate-200/60 p-12 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_40px_-20px_rgba(15,23,42,0.12)]">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-ohe-slate-50 border border-ohe-slate-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-ohe-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-base font-semibold text-ohe-slate-900 mb-2">
              Aucun résultat pour le moment.
            </p>
            <p className="text-sm text-ohe-slate-600">
              Les statistiques apparaîtront dès qu&apos;un participant aura complété son diagnostic.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
                      {/* 4 KPI */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                label="Score moyen"
                value={avgScorePct.toFixed(1).replace('.', ',')}
                suffix="%"
                hint="sur l'ensemble des diagnostics"
                accent="blue"
              />
              <KpiCard
                label="Diagnostics complétés"
                value={String(total)}
                hint={total > 1 ? 'participants évalués' : 'participant évalué'}
                accent="slate"
              />
              <KpiCard
                label="Niveau dominant"
                value={dominantLevel}
                hint="le plus représenté"
                accent="orange"
              />
              <KpiCard
                label="Temps moyen / Q"
                value={avgTimePerQuestionSec.toFixed(1).replace('.', ',')}
                suffix="s"
                hint="par question, sur l'ensemble"
                accent="slate"
              />
            </div>


            {/* Niveau de maîtrise global */}
            <Section
              title={<>Niveau de maîtrise <em className="italic text-ohe-blue">global.</em></>}
            >
              <p className="text-sm text-ohe-slate-600 leading-relaxed mb-4">
                Le test évalue les compétences des participants à partir de 58 questions et permet de les situer sur les niveaux de référence retenus pour le diagnostic&nbsp;:
              </p>
              <ul className="space-y-1.5 mb-6 text-sm text-ohe-slate-700">
                {(['A', 'B1', 'B2', 'C'] as const).map(level => {
                  const info = LEVEL_META[level];
                  return (
                    <li key={level} className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full ${info.dot}`} />
                      <span><strong className="font-medium">{info.name}</strong> : {info.desc}</span>
                    </li>
                  );
                })}
              </ul>

                           {/* Histogramme vertical */}
              <div className="flex items-end justify-around gap-4 h-56 px-4 pt-6 pb-2 border-b border-ohe-slate-200">
                {(['A', 'B1', 'B2', 'C'] as const).map(level => {
                  const info = LEVEL_META[level];
                  const count = levelCounts[level];
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={level} className="flex-1 flex flex-col items-center gap-2 h-full">
                      {/* % au-dessus */}
                      <span className="font-mono text-xs font-semibold text-ohe-slate-700">
                        {pct}%
                      </span>

                      {/* Barre verticale */}
                      <div className="flex-1 w-full max-w-[64px] flex items-end">
                        <div
                          className={`w-full rounded-t-md ${info.bar} transition-all duration-500`}
                          style={{ height: `${pct}%`, minHeight: pct > 0 ? '4px' : '0' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Labels + counts sous les barres */}
              <div className="flex items-start justify-around gap-4 px-4 pt-3">
                {(['A', 'B1', 'B2', 'C'] as const).map(level => {
                  const info = LEVEL_META[level];
                  const count = levelCounts[level];
                  return (
                    <div key={level} className="flex-1 flex flex-col items-center gap-1 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${info.badge}`}>
                        {level}
                      </span>
                      <span className="text-[11px] text-ohe-slate-600 leading-tight">
                        {count}&nbsp;pers.
                      </span>
                    </div>
                  );
                })}
              </div>

            </Section>

                       {/* Profil de compétences (radar) */}
            <Section
              title={<>Profil <em className="italic text-ohe-blue">de compétences.</em></>}
              subtitle="Moyenne collective par compétence."
            >
              <div className="flex justify-center">
                <ResultRadar
                  scores={{
                    bloc1: blockAverages[0]?.avg ?? 0,
                    bloc2: blockAverages[1]?.avg ?? 0,
                    bloc3: blockAverages[2]?.avg ?? 0,
                    bloc4: blockAverages[3]?.avg ?? 0,
                    bloc5: blockAverages[4]?.avg ?? 0,
                    bloc6: blockAverages[5]?.avg ?? 0,
                  }}
                  size={520}
                />
              </div>
            </Section>


            {/* Déclarations du participant (matrice 2x2) */}
            <Section
              title={<>Déclarations <em className="italic text-ohe-blue">du participant.</em></>}
            >
              <p className="text-sm text-ohe-slate-600 leading-relaxed mb-6">
                Cette partie présente les réponses des participants sur leur besoin perçu et leur disposition à suivre une formation.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map(q => {
  const info = QUADRANT_META[q];
  const count = quadrantCounts[q];
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div key={q} className={`p-5 rounded-2xl border ${info.tone}`}>

                      <p className="font-serif text-xl tracking-tight mb-3 leading-snug">
                        {info.label}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-3xl">{pct}%</span>
                        <span className="text-xs opacity-70">
                          ({count}&nbsp;{count > 1 ? 'pers.' : 'pers.'})
                        </span>
                      </div>
                    </div>

                  );
                })}
              </div>
            </Section>

            {/* Préconisation */}
            <Section
              title={<>Précon<em className="italic text-ohe-blue">isation.</em></>}
            >
              <p className="text-sm text-ohe-slate-600 leading-relaxed mb-6">
                Cette préconisation croise les résultats du test et les déclarations du participant, afin de déterminer la suite la plus adaptée.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {(Object.keys(RECOMMANDATION_META) as Recommandation[]).map(key => {
                  const info = RECOMMANDATION_META[key];
                  const count = recommandationCounts[key];
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={key} className={`p-5 rounded-2xl border ${info.tone}`}>
                      <p className="font-serif text-lg tracking-tight mb-2 leading-snug">
                        {RECOMMANDATION_LABELS[key]}
                      </p>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="font-serif text-3xl">{pct}%</span>
                        <span className="text-xs opacity-70">
                          ({count}&nbsp;{count > 1 ? 'pers.' : 'pers.'})
                        </span>
                      </div>
                      <p className="text-xs opacity-80 leading-relaxed">
                        {info.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Section>
          </div>
        )}
      </div>
    </main>
  );
}

// ============ Sub-components ============

function KpiCard({ label, value, suffix, hint, accent }: {
  label: string;
  value: string;
  suffix?: string;
  hint: string;
  accent: 'blue' | 'slate' | 'orange';
}) {
  const accentColor = {
    blue: 'text-ohe-blue',
    slate: 'text-ohe-slate-900',
    orange: 'text-ohe-orange',
  }[accent];
  return (
    <div className="bg-white rounded-2xl border border-ohe-slate-200/60 p-5">
      <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-ohe-slate-500 mb-3">
        {label}
      </p>
      <p className={`font-serif text-4xl lg:text-[44px] leading-none ${accentColor}`}>
        {value}
        {suffix && <span className="text-base text-ohe-slate-400 font-normal ml-2">{suffix}</span>}
      </p>
      <p className="text-xs text-ohe-slate-600 mt-3">{hint}</p>
    </div>
  );
}

function Section({ kicker, title, subtitle, children }: {
  kicker?: string;
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-ohe-slate-200/60 p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_40px_-20px_rgba(15,23,42,0.12)]">
      {kicker && (
        <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-ohe-orange mb-3">
          {kicker}
        </p>
      )}
      <h2 className="font-serif text-2xl lg:text-[28px] tracking-tight leading-tight text-ohe-slate-900 mb-1">
        {title}
      </h2>
      {subtitle && <p className="text-sm text-ohe-slate-600 mb-6">{subtitle}</p>}
      {!subtitle && <div className="mb-6" />}
      {children}
    </div>
  );
}
