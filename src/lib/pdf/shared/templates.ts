const BASE_BY_LEVEL: Record<'A' | 'B1' | 'B2' | 'C', string> = {
  A:  "Votre diagnostic révèle un besoin important de consolidation des fondamentaux orthographiques. Une formation OHé adaptée vous permettra de gagner en aisance et en confiance dans votre communication écrite.",
  B1: "Vous disposez de bases solides mais certaines notions méritent d'être renforcées. Une formation OHé ciblée vous aidera à progresser efficacement vers une maîtrise complète.",
  B2: "Bonne maîtrise globale. Quelques points spécifiques peuvent encore être améliorés. Une formation OHé vous permettra d'atteindre l'excellence et de viser le niveau C.",
  C:  "Excellent niveau. Vous maîtrisez très bien l'orthographe et la grammaire. Une formation OHé peut vous accompagner sur les derniers points les plus subtils.",
};

export function buildParticipantRecommendation(
  level: 'A' | 'B1' | 'B2' | 'C',
  weakBlocks: string[],
): string {
  const base = BASE_BY_LEVEL[level];
  if (weakBlocks.length === 0) return base;
  const list =
    weakBlocks.length === 1
      ? weakBlocks[0]
      : `${weakBlocks.slice(0, -1).join(', ')} et ${weakBlocks[weakBlocks.length - 1]}`;
  return `${base} Nous vous recommandons en particulier de travailler sur : ${list}.`;
}
// ---------- CLIENT PDF HELPERS ----------

export function buildExecutiveSummary(params: {
  firstName: string;
  level: 'A' | 'B1' | 'B2' | 'C';
  scoreProcedural: number; // /6
  weakBlockNames: string[];
  strongBlockNames: string[];
}): string {
  const { firstName, level, scoreProcedural, weakBlockNames, strongBlockNames } = params;
  const levelLabel = { A: 'élémentaire', B1: 'intermédiaire', B2: 'avancé', C: 'expert' }[level];

  let summary = `${firstName} obtient un score procédural global de ${scoreProcedural.toFixed(1)} sur 6, ce qui correspond à un niveau ${levelLabel} (${level}). `;

  if (strongBlockNames.length > 0) {
    summary += `Points forts observés : ${strongBlockNames.slice(0, 3).join(', ')}. `;
  }

  if (weakBlockNames.length === 0) {
    summary += `Aucune fragilité majeure n'est identifiée. Le participant présente un profil homogène.`;
  } else if (weakBlockNames.length >= 4) {
    summary += `Plusieurs axes de progression sont identifiés (${weakBlockNames.length} blocs fragiles). Une remise à niveau globale est recommandée.`;
  } else {
    summary += `Axes de progression prioritaires : ${weakBlockNames.join(', ')}.`;
  }

  return summary;
}

export function buildClientRecommendations(params: {
  level: 'A' | 'B1' | 'B2' | 'C';
  weakBlocks: { name: string; score: number }[];
}): string[] {
  const { level, weakBlocks } = params;
  const recos: string[] = [];

  const byBlock: Record<string, string> = {
    'Singulier / Pluriel': 'Travailler les règles d\'accord du nom et du groupe nominal via des ateliers courts (10 min/jour).',
    'Conjugaison': 'Réviser les temps de l\'indicatif (présent, imparfait, futur, passé composé) avec exercices ciblés.',
    'Participe passé': 'Reprendre les règles d\'accord du participe passé (être, avoir, verbes pronominaux) — bloc à forte valeur professionnelle.',
    'Orthographe lexicale': 'Constituer un carnet de mots-difficultés du métier ; dictées ciblées 2×/semaine.',
    'Syntaxe': 'Exercices de reformulation et de ponctuation ; travail sur la structure de la phrase complexe.',
    'Compréhension': 'Lecture active de textes professionnels avec questions de compréhension fine.',
  };

  const sorted = [...weakBlocks].sort((a, b) => a.score - b.score).slice(0, 3);
  sorted.forEach((b) => {
    if (byBlock[b.name]) recos.push(byBlock[b.name]);
  });

  if (recos.length === 0) {
    if (level === 'C' || level === 'B2') {
      recos.push('Maintenir le niveau via des exercices de perfectionnement ponctuels.');
    } else {
      recos.push('Programme de consolidation générale recommandé sur 8 à 12 semaines.');
    }
  }

  return recos;
}

export function buildProfileInterpretation(params: {
  quadrant: 1 | 2 | 3 | 4;
  scoreAdaptation: number; // /5
  scoreInteret: number; // /5
}): string {
  const { quadrant, scoreAdaptation, scoreInteret } = params;

  const map: Record<1 | 2 | 3 | 4, string> = {
    1: `Profil engagé et adaptable (adaptation ${scoreAdaptation}/5, intérêt ${scoreInteret}/5). Le participant est ouvert à l'apprentissage et motivé. Terrain favorable à toute action de formation.`,
    2: `Profil intéressé mais peu adaptable (adaptation ${scoreAdaptation}/5, intérêt ${scoreInteret}/5). Motivé mais peut résister au changement de pratiques. Prévoir un accompagnement pédagogique rassurant.`,
    3: `Profil à sensibiliser (adaptation ${scoreAdaptation}/5, intérêt ${scoreInteret}/5). L'engagement et l'ouverture sont limités. Travailler d'abord le sens et l'utilité concrète avant tout dispositif de formation.`,
    4: `Profil adaptable mais peu intéressé (adaptation ${scoreAdaptation}/5, intérêt ${scoreInteret}/5). Ouvert au changement mais faible motivation intrinsèque. Un cadre incitatif (objectif métier clair) est nécessaire.`,
  };

  return map[quadrant];
}
