'use client';

import { useState, FormEvent } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo, Badge, Portrait, Eyebrow, PrimaryButton } from '@/components/ui';

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
    <main className="h-screen overflow-hidden grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] bg-ohe-bg text-ohe-ink">
      {/* Colonne gauche : formulaire */}
      <div className="flex flex-col px-6 py-6 sm:px-10 sm:py-8 lg:px-14 lg:py-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 shrink-0">
          <Logo size={48} withLabel />
          <Badge>Espace connexion</Badge>
        </div>

        {/* Bloc central : centré verticalement */}
        <div className="flex-1 flex flex-col justify-center min-h-0">
          <div className="max-w-[460px]">
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
        <div className="shrink-0 pt-5 border-t border-ohe-line flex items-center justify-between gap-3.5">
          <Link
            href="/"
            className="text-sm text-ohe-muted hover:text-ohe-ink transition-colors"
          >
            ← Retour à l&apos;accueil
          </Link>
          <div className="ohe-caption text-ohe-muted">
            OHé Diagnostic
          </div>
        </div>
      </div>

      {/* Colonne droite : panneau tint */}
      <div className="hidden lg:flex bg-ohe-panel-tint border-l border-ohe-line px-12 py-10 flex-col justify-center relative overflow-hidden">
        <div className="max-w-[400px] relative z-10">
          <Eyebrow tone="accent">Diagnostic</Eyebrow>

          <h2 className="mt-6 text-[32px] leading-[1.1] tracking-[-0.02em] font-normal text-balance">
  Un diagnostic simple pour identifier les besoins en{" "}
  <span className="font-serif italic text-ohe-accent">orthographe</span>{" "}
  de vos équipes.
</h2>

<p className="mt-5 text-[15px] leading-[1.55] text-ohe-muted text-pretty">
  L&apos;espace administrateur vous permet d&apos;inviter vos participants, suivre leur progression et consulter les résultats détaillés — individuels et collectifs.
</p>


          <div className="mt-10 pt-6 border-t border-ohe-line flex items-center gap-3.5">
            <Portrait size={42} src="/img/logos/roxane.avif" alt="Roxane Joannidès" />
            <div>
              <div className="ohe-caption text-ohe-muted">Diagnostic conçu par</div>
              <div className="text-sm mt-0.5">
                Roxane Joannidès{" "}
                <span className="text-ohe-muted">· Docteure en sciences du langage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Signe typographique décoratif en fond */}
        <div
          className="absolute pointer-events-none select-none font-serif italic -right-6 -bottom-10 lg:-right-10 lg:-bottom-20"
          style={{
            fontSize: 320,
            lineHeight: 1,
            color: "var(--color-ohe-accent-soft)",
          }}
        >
          &
        </div>
      </div>
    </main>
  );
}
