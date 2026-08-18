import { prisma } from '@/lib/prisma';
import type { TestSession } from '@prisma/client';

/**
 * Vérifie si une session est expirée (deadline dépassée et pas encore terminée).
 */
export function isSessionExpired(session: Pick<TestSession, 'deadline' | 'status'>): boolean {
  if (!session.deadline) return false;
  if (session.status === 'COMPLETED') return false;
  return new Date() > session.deadline;
}

/**
 * Vérifie une session côté serveur et la passe en EXPIRED si nécessaire.
 * Renvoie la session (potentiellement mise à jour).
 * À appeler dans les endpoints sensibles (welcome, question, submit).
 */
export async function checkAndExpireSession(sessionId: string): Promise<TestSession | null> {
  const session = await prisma.testSession.findUnique({ where: { id: sessionId } });
  if (!session) return null;

  if (isSessionExpired(session) && session.status !== 'EXPIRED') {
    return prisma.testSession.update({
      where: { id: sessionId },
      data: {
        status: 'EXPIRED',
        expiredAt: new Date(),
      },
    });
  }
  return session;
}

/**
 * Format lisible d'une deadline pour les emails et l'UI.
 * Ex: "15 septembre 2026 à 18h00"
 */
export function formatDeadline(deadline: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
    
  })
    .format(deadline)
    .replace(':', 'h');
}


/**
 * Renvoie le nombre d'heures entre maintenant et la deadline.
 * Négatif si la deadline est passée.
 */
export function hoursUntilDeadline(deadline: Date): number {
  return (deadline.getTime() - Date.now()) / (1000 * 60 * 60);
}
