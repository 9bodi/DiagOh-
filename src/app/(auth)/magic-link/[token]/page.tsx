import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import CreatePasswordForm from '@/components/auth/CreatePasswordForm';
import Logo from '@/components/ui/Logo';
import Card from '@/components/ui/Card';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function MagicLinkPage({ params }: PageProps) {
  const { token } = await params;

  const user = await prisma.user.findFirst({
    where: { magicLinkToken: token },
    include: { organization: true },
  });

  // Token invalide
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ohe-slate-50 to-ohe-slate-100 p-4">
        <Card className="max-w-md w-full text-center">
          <Logo />
          <h1 className="text-2xl font-bold text-ohe-slate-900 mt-6 mb-3">Lien invalide</h1>
          <p className="text-ohe-slate-600">
            Ce lien d'activation n'existe pas ou a déjà été utilisé. Contactez votre administrateur.
          </p>
        </Card>
      </div>
    );
  }

  // Token expiré
  if (user.magicLinkExpiresAt && user.magicLinkExpiresAt < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ohe-slate-50 to-ohe-slate-100 p-4">
        <Card className="max-w-md w-full text-center">
          <Logo />
          <h1 className="text-2xl font-bold text-ohe-slate-900 mt-6 mb-3">Lien expiré</h1>
          <p className="text-ohe-slate-600">
            Ce lien d'activation a expiré. Demandez à votre administrateur de vous en renvoyer un nouveau.
          </p>
        </Card>
      </div>
    );
  }

  // Mot de passe déjà créé → redirection vers /login
  if (user.passwordCreated) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ohe-slate-50 to-ohe-slate-100 p-4">
      <Card className="max-w-md w-full">
        <div className="text-center mb-6">
          <Logo />
          <h1 className="text-2xl font-bold text-ohe-slate-900 mt-6 mb-2">
            Bienvenue sur OHé Diag
          </h1>
          <p className="text-ohe-slate-600">
            Vous avez été invité par <strong>{user.organization?.name}</strong>.
            Complétez votre inscription pour commencer.
          </p>
        </div>
        <CreatePasswordForm token={token} email={user.email} />
      </Card>
    </div>
  );
}
