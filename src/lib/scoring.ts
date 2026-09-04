import { prisma } from './prisma';
import { Level, Recommandation } from '@prisma/client';


/**
 * Convertit un nombre de bonnes réponses (sur 8) en points selon le barème CDC v3 :
 *   0-2 / 8 → 0    (Non maîtrisé)
 *   3-4 / 8 → 0.5  (Fragile)
 *   5-6 / 8 → 0.75 (En cours)
 *   7-8 / 8 → 1    (Maîtrisé)
 */
function bloсScore(correctCount: number): number {
  if (correctCount <= 2) return 0;
  if (correctCount <= 4) return 0.5;
  if (correctCount <= 6) return 0.75;
  return 1;
}

/**
 * Convertit le score global procédural (/6) en niveau adapté.
 * Barème en vigueur depuis septembre 2025 :
 *   0    – 2.5 → A   (élémentaire,   0-42 %)
 *   2.5  – 4.1 → B1  (intermédiaire, 43-69 %)
 *   4.1  – 5.1 → B2  (avancé,        70-84 %)
 *   5.1  – 6   → C   (expert,        85-100 %)
 *
 * Note : les tests passés avant cette date conservent le niveau
 * stocké en base (calculé selon l'ancien barème).
 */
function scoreToLevel(scoreTotal: number): Level {
  if (scoreTotal < 2.5) return Level.A;
  if (scoreTotal < 4.1) return Level.B1;
  if (scoreTotal < 5.1) return Level.B2;
  return Level.C;
}


/**
 * Détermine le quadrant de la matrice 2×2 :
 *   1 = Adapté + Intéressé        → Public prioritaire (à former)
 *   2 = Adapté + Non intéressé    → Public à sensibiliser (à convaincre)
 *   3 = Non adapté + Intéressé    → À engager si besoin identifié
 *   4 = Non adapté + Non intéressé → À orienter vers autre solution
 * Seuil pour chaque axe : ≥ 3 / 5.
 */
function computeQuadrant(scoreAdaptation: number, scoreInteret: number): number {
  const adapte = scoreAdaptation >= 3;
  const interesse = scoreInteret >= 3;
  if (adapte && interesse) return 1;
  if (adapte && !interesse) return 2;
  if (!adapte && interesse) return 3;
  return 4;
}

/**
 * Calcule tous les scores d'une session selon le CDC v3 :
 *   - Score par bloc (0 / 0.5 / 0.75 / 1) pour les blocs 1 à 6
 *   - Score global procédural (somme des 6 blocs, /6)
 *   - Niveau (A / B1 / B2 / C)
 *   - Score Adaptation (/5) + Score Intérêt (/5) pour le bloc 7
 *   - Quadrant (1 à 4)
 */
/**
 * Type des 4 catégories de préconisation finales (règles Roxane).
 */

/**
 * Libellés d'affichage des préconisations.
 */
/**
 * Libellés d'affichage des préconisations.
 */
export const RECOMMANDATION_LABELS: Record<Recommandation, string> = {
  A_FORMER: 'À former',
  A_FORMER_ET_ACCOMPAGNER: 'À former et accompagner',
  A_FORMER_SOUS_RESERVES: 'À former sous réserves',
  A_ORIENTER: 'À orienter',
};

/**
 * Calcule la préconisation finale en croisant le niveau et le quadrant.
 *
 * Règles v2 (Roxane, sept. 2025) — simplifiées : la disposition (axe ADAPTATION)
 * est désormais le seul facteur discriminant, l'axe "besoin perçu" n'entre plus
 * dans la décision (mais reste affiché dans le profil).
 *
 * Quadrants :
 *  Q1 = Besoin perçu + Disposé
 *  Q2 = Besoin perçu + Réticent
 *  Q3 = Besoin non perçu + Disposé
 *  Q4 = Besoin non perçu + Réticent
 *
 * Règles :
 *  - B1/B2 + Disposé (Q1 ou Q3)   → À former
 *  - B1/B2 + Réticent (Q2 ou Q4)  → À former et accompagner
 *  - A/C   + Disposé (Q1 ou Q3)   → À former sous réserves
 *  - A/C   + Réticent (Q2 ou Q4)  → À orienter
 *
 * Seule différence avec v1 : B1/B2 + Q3 passe de "sous réserves" à "à former".
 * Les tests passés avant sept. 2025 conservent leur recommandation stockée.
 */
function computeRecommandation(level: Level, quadrant: number): Recommandation {
  const isIntermediate = level === Level.B1 || level === Level.B2;
  const isExtreme = level === Level.A || level === Level.C;
  const isDispose = quadrant === 1 || quadrant === 3;

  if (isIntermediate) {
    return isDispose ? 'A_FORMER' : 'A_FORMER_ET_ACCOMPAGNER';
  }

  if (isExtreme) {
    return isDispose ? 'A_FORMER_SOUS_RESERVES' : 'A_ORIENTER';
  }

  return 'A_FORMER_SOUS_RESERVES';
}



export async function computeAndSaveScores(sessionId: string) {
  const answers = await prisma.answer.findMany({
    where: { testSessionId: sessionId },
    include: { question: true },
  });

  // ============ PARTIE 1 : Score par bloc (procédural) ============
  const scoresByBloc: Record<number, number> = {};
  for (let bloc = 1; bloc <= 6; bloc++) {
    const blocAnswers = answers.filter(
      (a) => a.question.type === 'PROCEDURAL' && a.question.blockNumber === bloc
    );
    const correctCount = blocAnswers.filter((a) => a.isCorrect).length;
    scoresByBloc[bloc] = bloсScore(correctCount);
  }

  const scoreBloc1 = scoresByBloc[1];
  const scoreBloc2 = scoresByBloc[2];
  const scoreBloc3 = scoresByBloc[3];
  const scoreBloc4 = scoresByBloc[4];
  const scoreBloc5 = scoresByBloc[5];
  const scoreBloc6 = scoresByBloc[6];

  // Score global procédural (sur 6)
  const scoreProcedural =
    scoreBloc1 + scoreBloc2 + scoreBloc3 + scoreBloc4 + scoreBloc5 + scoreBloc6;

  // Niveau
  const level = scoreToLevel(scoreProcedural);

  // ============ PARTIE 2 : Bloc déclaratif (axes Adaptation / Intérêt) ============
  const declaratifAnswers = answers.filter((a) => a.question.type === 'DECLARATIF');

  let scoreAdaptation = 0;
  let scoreInteret = 0;

  for (const a of declaratifAnswers) {
    if (a.selectedOptionIndex === null) continue;
    // declarativeWeight stocke l'index de la réponse "positive" (0 = "Plutôt oui", 1 = "Plutôt non")
    const positiveAnswerIndex = a.question.declarativeWeight;
    if (positiveAnswerIndex === null || positiveAnswerIndex === undefined) continue;

    const isPositive = a.selectedOptionIndex === positiveAnswerIndex;
    if (!isPositive) continue;

    if (a.question.declarativeAxis === 'ADAPTATION') scoreAdaptation++;
    else if (a.question.declarativeAxis === 'INTEREST') scoreInteret++;
  }

 // Quadrant
  const quadrant = computeQuadrant(scoreAdaptation, scoreInteret);

  // Préconisation finale (niveau × quadrant)
  const recommandation = computeRecommandation(level, quadrant);

  // Sauvegarde en DB
  await prisma.testSession.update({
    where: { id: sessionId },
    data: {
      scoreBloc1,
      scoreBloc2,
      scoreBloc3,
      scoreBloc4,
      scoreBloc5,
      scoreBloc6,
      scoreProcedural,
      level,
      scoreAdaptation,
      scoreInteret,
      quadrant,
      recommandation,
    },
  });

  return {
    scoreBloc1,
    scoreBloc2,
    scoreBloc3,
    scoreBloc4,
    scoreBloc5,
    scoreBloc6,
    scoreProcedural,
    level,
    scoreAdaptation,
    scoreInteret,
    quadrant,
    recommandation,
  };
}