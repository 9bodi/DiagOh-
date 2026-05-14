import { prisma } from './prisma';
import { TestStatus } from '@prisma/client';

/**
 * Tire aléatoirement N questions de chaque catégorie procédurale
 * + les questions déclaratives, et retourne l'ordre final.
 *
 * Pour le MVP : on prend toutes les questions actives.
 * Plus tard : on tirera 8 questions par bloc/catégorie.
 */
export async function buildQuestionsOrder() {
  // Pour le MVP, on prend simplement toutes les questions actives,
  // procédurales d'abord (mélangées), puis déclaratives à la fin.
  const procedural = await prisma.question.findMany({
    where: { active: true, type: 'PROCEDURAL' },
    select: { id: true },
  });

  const declaratif = await prisma.question.findMany({
    where: { active: true, type: 'DECLARATIF' },
    select: { id: true },
  });

  // Shuffle Fisher-Yates pour les procédurales
  const shuffled = [...procedural].sort(() => Math.random() - 0.5);

  return [...shuffled.map((q) => q.id), ...declaratif.map((q) => q.id)];
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
