import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ohe-slate-50 to-ohe-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <Logo />
        </div>

        <div className="text-8xl font-bold text-ohe-blue mb-4">
          4<span className="text-ohe-orange">0</span>4
        </div>

        <h1 className="text-2xl font-bold text-ohe-slate-900 mb-3">
          Page introuvable
        </h1>

        <p className="text-ohe-slate-600 mb-8">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
          Vérifiez l&apos;URL ou retournez à l&apos;accueil.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="primary">
              ← Retour à l&apos;accueil
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary">
              Se connecter
            </Button>
          </Link>
        </div>

        <p className="text-xs text-ohe-slate-400 mt-12">
          Erreur 404 · OHé Diag
        </p>
      </div>
    </div>
  );
}
