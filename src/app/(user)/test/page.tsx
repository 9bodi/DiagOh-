import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { isSessionExpired } from '@/lib/deadline';
import TestRunner from '@/components/test/TestRunner';

export default async function TestPage() {
  const session = await auth();

  if (!session || session.user.role !== 'USER') {
    redirect('/login');
  }

  // Garde-fou : mêmes vérifs qu'en /rules
  const testSession = await prisma.testSession.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  if (!testSession) redirect('/welcome');
  if (testSession.status === 'COMPLETED') redirect('/result');
  if (testSession.status === 'PENDING') redirect('/welcome');
  if (testSession.status === 'EXPIRED' || isSessionExpired(testSession)) {
    redirect('/welcome');
  }

  return <TestRunner userName={session.user.name ?? 'Utilisateur'} />;
}
