'use client';

import { useState, FormEvent } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo, Badge, Eyebrow, PrimaryButton } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!result || result.error) {
      setError('Email ou mot de passe incorrect.');
      return;
    }

    const session = await getSession();

    if (session?.user?.role === 'SUPERADMIN') {
      router.push('/organizations');
    } else if (session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPERVISOR') {
      router.push('/users');
    } else {
      router.push('/welcome');
    }

    router.refresh();
  }

    return (
    <main className="min-h-screen flex flex-col bg-ohe-bg text-ohe-ink px-6 py-6 sm:px-10 sm:py-8 lg:px-14 lg:py-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 shrink-0 max-w-6xl mx-auto w-full flex-wrap">
  <Logo size={40} withLabel />
  <Badge>Espace connexion</Badge>
</div>


      {/* Bloc central : centré */}
      <div className="flex-1 flex flex-col justify-center items-center min-h-0">
        <div className="w-full max-w-[460px]">
          <Eyebrow tone="accent">Connexion</Eyebrow>

          <h1 className="mt-6 text-[40px] sm:text-[54px] lg:text-[68px] leading-[1.02] lg:leading-[0.98] tracking-[-0.028em] font-normal text-balance m-0">
            Accédez à<br />
            votre espace{" "}
            <span className="font-serif italic text-ohe-accent">OHé</span>
          </h1>

          <p className="mt-5 lg:mt-6 text-base lg:text-[17px] leading-[1.55] text-ohe-muted text-pretty">
            Un seul identifiant pour tous les rôles — participant, administrateur ou référent. Nous vous redirigeons automatiquement vers votre espace après connexion.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="ohe-caption text-ohe-muted block mb-2">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="vous@organisation.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3.5 rounded-full border border-ohe-line bg-ohe-panel text-ohe-ink placeholder:text-ohe-muted focus:outline-none focus:border-ohe-accent focus:ring-2 focus:ring-ohe-accent-soft transition-colors text-[15px]"
              />
            </div>

            <div>
              <label htmlFor="password" className="ohe-caption text-ohe-muted block mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3.5 rounded-full border border-ohe-line bg-ohe-panel text-ohe-ink placeholder:text-ohe-muted focus:outline-none focus:border-ohe-accent focus:ring-2 focus:ring-ohe-accent-soft transition-colors text-[15px]"
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-2xl bg-ohe-accent-soft border border-ohe-line">
                <p className="text-sm text-ohe-ink">{error}</p>
              </div>
            )}

            <div className="pt-2 space-y-4">
              <PrimaryButton
                type="submit"
                disabled={loading}
                icon={loading ? "…" : "→"}
              >
                {loading ? 'Connexion…' : 'Se connecter'}
              </PrimaryButton>

              <Link
                href="/forgot-password"
                className="block text-sm text-ohe-muted hover:text-ohe-ink transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Byline : collée en bas */}
      <div className="shrink-0 pt-5 border-t border-ohe-line flex items-center justify-end gap-3.5 max-w-6xl mx-auto w-full">
        <div className="ohe-caption text-ohe-muted">
          OHé Diagnostic
        </div>
      </div>
    </main>
  );

}
