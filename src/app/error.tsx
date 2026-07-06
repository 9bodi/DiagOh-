'use client';

import { useEffect } from 'react';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-ohe-slate-50 to-ohe-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <Logo />
        </div>

        <div className="text-6xl mb-4">⚠️</div>

        <h1 className="text-2xl font-bold text-ohe-slate-900 mb-3">
          Une erreur est survenue
        </h1>

        <p className="text-ohe-slate-600 mb-8">
          Désolé, quelque chose s&apos;est mal passé. Vous pouvez réessayer
          ou revenir à l&apos;accueil.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="primary" onClick={reset}>
            🔄 Réessayer
          </Button>
          <a href="/">
            <Button variant="secondary">
              Retour à l&apos;accueil
            </Button>
          </a>
        </div>

        {error.digest && (
          <p className="text-xs text-ohe-slate-400 mt-12">
            Code d&apos;erreur : {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
