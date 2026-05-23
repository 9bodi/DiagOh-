import { prisma } from './prisma';
import { TestStatus } from '@prisma/client';

/**
 * Mélange un tableau via Fisher-Yates (in-place, retourne une copie).
 */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Construit l'ordre des questions selon le CDC v3 :
 *   - Blocs 1+2+3 mélangés ENTRE EUX (24 questions, ordre aléatoire global)
 *   - Bloc 4 mélangé seul (8 questions)
 *   - Bloc 5 mélangé seul (8 questions)
 *   - Bloc 6 mélangé seul (8 questions)
 *   - Bloc 7 dans l'ordre original (10 questions)
 * Total : 58 questions.
 */
export async function buildQuestionsOrder(): Promise<string[]> {
  // Récupère toutes les questions actives, regroupées par bloc
  const allQuestions = await prisma.question.findMany({
    where: { active: true },
    select: { id: true, blockNumber: true, createdAt: true },
    orderBy: { createdAt: 'asc' }, // ordre stable pour le bloc 7
  });

  const byBlock = (n: number) =>
    allQuestions.filter((q) => q.blockNumber === n).map((q) => q.id);

  const blocs123 = [...byBlock(1), ...byBlock(2), ...byBlock(3)];
  const bloc4 = byBlock(4);
  const bloc5 = byBlock(5);
  const bloc6 = byBlock(6);
  const bloc7 = byBlock(7); // dans l'ordre

  return [
    ...shuffle(blocs123),
    ...shuffle(bloc4),
    ...shuffle(bloc5),
    ...shuffle(bloc6),
    ...bloc7,
  ];
}

/**
 * Récupère la session active de l'utilisateur (IN_PROGRESS),
 * ou null s'il n'en a pas.
 */
export async function getActiveSession(userId: string) {
  return prisma.testSession.findFirst({
    where: {
      userId,
      status: TestStatus.IN_PROGRESS,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Récupère la dernière session complétée de l'utilisateur,
 * ou null s'il n'en a jamais terminé.
 */
export async function getCompletedSession(userId: string) {
  return prisma.testSession.findFirst({
    where: {
      userId,
      status: TestStatus.COMPLETED,
    },
    orderBy: { completedAt: 'desc' },
  });
}
