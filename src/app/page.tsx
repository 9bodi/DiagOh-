import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ohe-slate-50 to-ohe-slate-100 p-6">
      <Card padding="lg" className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <div className="mb-4 flex justify-center">
            <Logo size="lg" href={undefined} />
          </div>
          <p className="text-ohe-slate-600 text-lg">
            Plateforme de diagnostic d&apos;orthographe
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-ohe-slate-600 text-center mb-4">
            Environnement de développement — choisissez un espace :
          </p>

          <Link href="/login" className="block">
            <Button variant="primary" size="lg" fullWidth>
              Connexion admin / superadmin
            </Button>
          </Link>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/welcome">
              <Button variant="secondary" fullWidth>
                Accès utilisateur
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary" fullWidth>
                Espace admin
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-ohe-slate-200">
          <p className="text-xs text-ohe-slate-600/70 text-center">
            v0.1.0 — MVP en développement
          </p>
        </div>
      </Card>
    </main>
  );
}
