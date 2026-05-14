import { prisma } from './prisma';
import { Level } from '@prisma/client';

/**
 * Calcule le score procédural d'une session,
 * détermine le niveau CECRL, et calcule le quadrant de la matrice 2x2.
 *
 * MVP : scoring simplifié.
 * V2 : on appliquera le barème par bloc (0/0.5/0.75/1 par compétence).
 */
export async function computeAndSaveScores(sessionId: string) {
  const answers = await prisma.answer.findMany({
    where: { testSessionId: sessionId },
    include: { question: true },
  });

  const procedural = answers.filter((a) => a.question.type === 'PROCEDURAL');
  const declaratif = answers.filter((a) => a.question.type === 'DECLARATIF');

  // Score procédural : nombre de bonnes réponses
  const scoreProcedural = procedural.filter((a) => a.isCorrect).length;
  const totalProcedural = procedural.length;
  const percentage = totalProcedural > 0 ? (scoreProcedural / totalProcedural) * 100 : 0;

  // Niveau CECRL (barème simplifié MVP, on raffinera)
  let level: Level;
  if (percentage < 37) level = Level.A;
  else if (percentage < 60) level = Level.B1;
  else if (percentage < 80) level = Level.B2;
  else level = Level.C;

  // Score déclaratif : somme pondérée par axe
  let interestScore = 0;
  let relevanceScore = 0;
  for (const a of declaratif) {
    if (a.selectedOptionIndex === null) continue;
    const weight = a.question.declarativeWeight ?? 1;
    // Convention MVP : option 0 = très positif (+2), 1 = positif (+1), 2 = négatif (-1), 3 = très négatif (-2)
    const optionScore = [2, 1, -1, -2][a.selectedOptionIndex] ?? 0;
    if (a.question.declarativeAxis === 'INTEREST') {
      interestScore += optionScore * weight;
    } else if (a.question.declarativeAxis === 'RELEVANCE') {
      relevanceScore += optionScore * weight;
    }
  }

  // Quadrant matrice 2x2 :
  // 1 = Intéressé + Pertinent (à former)
  // 2 = Pas intéressé + Pertinent (à convaincre)
  // 3 = Intéressé + Non pertinent (à engager si besoin)
  // 4 = Pas intéressé + Non pertinent (à orienter ailleurs)
  let quadrant: number;
  if (interestScore >= 0 && relevanceScore >= 0) quadrant = 1;
  else if (interestScore < 0 && relevanceScore >= 0) quadrant = 2;
  else if (interestScore >= 0 && relevanceScore < 0) quadrant = 3;
  else quadrant = 4;

  return { scoreProcedural, scoreDeclaratif: interestScore + relevanceScore, level, quadrant };
}
