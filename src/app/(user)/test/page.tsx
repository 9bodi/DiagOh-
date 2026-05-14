import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import TestRunner from '@/components/test/TestRunner';

export default async function TestPage() {
  const session = await auth();

  if (!session || session.user.role !== 'USER') {
    redirect('/login');
  }

  return <TestRunner userName={session.user.name ?? 'Utilisateur'} />;
}
