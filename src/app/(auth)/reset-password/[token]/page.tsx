'use client';

import { useState, use, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo, Badge, Eyebrow, PrimaryButton } from '@/components/ui';

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < 8) {
      setStatus('error');
      setErrorMessage('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setErrorMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Une erreur est survenue.');
      }

      setStatus('success');
      setTimeout(() => router.push('/login'), 2200);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Une erreur est survenue.');
    }
  }

  return (
    <main className="h-screen overflow-hidden grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] bg-ohe-bg text-ohe-ink">
      <div className="flex flex-col px-6 py-6 sm:px-10 sm:py-8 lg:px-14 lg:py-10">
        <div className="flex items-center justify-between gap-4 shrink-0">
          <Logo size={48} withLabel />
          <Badge>Nouveau mot de passe</Badge>
        </div>

        <div className="flex-1 flex flex-col justify-center min-h-0">
          <div className="max-w-[460px]">
            <Eyebrow tone="accent">Réinitialisation</Eyebrow>

            <h1 className="mt-6 text-[40px] sm:text-[54px] lg:text-[68px] leading-[1.02] lg:leading-[0.98] tracking-[-0.028em] font-normal text-balance m-0">
              Choisissez votre<br />
              nouveau{" "}
              <span className="font-serif italic text-ohe-accent">mot de passe</span>
            </h1>

            <p className="mt-5 lg:mt-6 text-base lg:text-[17px] leading-[1.55] text-ohe-muted text-pretty">
              Votre nouveau mot de passe doit contenir au moins 8 caractères. Il remplacera immédiatement l&apos;ancien.
            </p>

            {status === 'success' ? (
              <div className="mt-8 space-y-5">
                <div className="px-4 py-4 rounded-2xl bg-ohe-accent-soft border border-ohe-line">
                  <p className="text-sm text-ohe-ink">
                    Mot de passe mis à jour avec succès. Redirection vers la connexion…
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label htmlFor="password" className="ohe-caption text-ohe-muted block mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Au moins 8 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    disabled={status === 'loading'}
                    className="w-full px-4 py-3.5 rounded-full border border-ohe-line bg-ohe-panel text-ohe-ink placeholder:text-ohe-muted focus:outline-none focus:border-ohe-accent focus:ring-2 focus:ring-ohe-accent-soft transition-colors text-[15px]"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="ohe-caption text-ohe-muted block mb-2">
                    Confirmer le mot de passe
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    placeholder="Retapez votre mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    disabled={status === 'loading'}
                    className="w-full px-4 py-3.5 rounded-full border border-ohe-line bg-ohe-panel text-ohe-ink placeholder:text-ohe-muted focus:outline-none focus:border-ohe-accent focus:ring-2 focus:ring-ohe-accent-soft transition-colors text-[15px]"
                  />
                </div>

                {status === 'error' && errorMessage && (
                  <div className="px-4 py-3 rounded-2xl bg-ohe-accent-soft border border-ohe-line">
                    <p className="text-sm text-ohe-ink">{errorMessage}</p>
                  </div>
                )}

                <div className="pt-2 space-y-4">
                  <PrimaryButton
                    type="submit"
                    disabled={status === 'loading'}
                    icon={status === 'loading' ? "…" : "→"}
                  >
                    {status === 'loading' ? 'Mise à jour…' : 'Réinitialiser'}
                  </PrimaryButton>

                  <Link
                    href="/login"
                    className="block text-sm text-ohe-muted hover:text-ohe-ink transition-colors"
                  >
                    ← Retour à la connexion
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>

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

      <div className="hidden lg:flex bg-ohe-panel-tint border-l border-ohe-line px-12 py-10 flex-col justify-center relative overflow-hidden">
        <div className="max-w-[400px] relative z-10">
          <Eyebrow tone="accent">Confidentialité</Eyebrow>

          <h2 className="mt-6 text-[32px] leading-[1.1] tracking-[-0.02em] font-normal text-balance">
            Un mot de passe{" "}
            <span className="font-serif italic text-ohe-accent">sûr</span>
          </h2>

          <p className="mt-5 text-[15px] leading-[1.55] text-ohe-muted text-pretty">
            Choisissez de préférence une phrase de passe longue et unique. Elle sera chiffrée et jamais stockée en clair sur nos serveurs.
          </p>
        </div>

        <div
          className="absolute pointer-events-none select-none font-serif italic -right-6 -bottom-10 lg:-right-10 lg:-bottom-20"
          style={{
            fontSize: 320,
            lineHeight: 1,
            color: "var(--color-ohe-accent-soft)",
          }}
        >
          ✓
        </div>
      </div>
    </main>
  );
}
