'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Logo, Badge, Eyebrow, PrimaryButton } from '@/components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Une erreur est survenue.');
      }

      setStatus('sent');
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
          <Badge>Réinitialisation</Badge>
        </div>

        <div className="flex-1 flex flex-col justify-center min-h-0">
          <div className="max-w-[460px]">
            <Eyebrow tone="accent">Mot de passe oublié</Eyebrow>

            <h1 className="mt-6 text-[40px] sm:text-[54px] lg:text-[68px] leading-[1.02] lg:leading-[0.98] tracking-[-0.028em] font-normal text-balance m-0">
              Réinitialisez<br />
              votre{" "}
              <span className="font-serif italic text-ohe-accent">accès</span>
            </h1>

            <p className="mt-5 lg:mt-6 text-base lg:text-[17px] leading-[1.55] text-ohe-muted text-pretty">
              Saisissez l&apos;adresse email associée à votre compte. Si un compte existe, vous recevrez un lien pour définir un nouveau mot de passe.
            </p>

            {status === 'sent' ? (
              <div className="mt-8 space-y-5">
                <div className="px-4 py-4 rounded-2xl bg-ohe-accent-soft border border-ohe-line">
                  <p className="text-sm text-ohe-ink">
                    Si un compte est associé à cette adresse, un email vient d&apos;être envoyé. Consultez votre boîte de réception (pensez à vérifier les spams).
                  </p>
                </div>
                <Link
                  href="/login"
                  className="block text-sm text-ohe-muted hover:text-ohe-ink transition-colors"
                >
                  ← Retour à la connexion
                </Link>
              </div>
            ) : (
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
                    {status === 'loading' ? 'Envoi…' : 'Envoyer le lien'}
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
          <Eyebrow tone="accent">Sécurité</Eyebrow>

          <h2 className="mt-6 text-[32px] leading-[1.1] tracking-[-0.02em] font-normal text-balance">
            Votre accès est{" "}
            <span className="font-serif italic text-ohe-accent">protégé</span>
          </h2>

          <p className="mt-5 text-[15px] leading-[1.55] text-ohe-muted text-pretty">
            Le lien de réinitialisation est valable pendant une heure et ne peut être utilisé qu&apos;une seule fois. Si vous n&apos;êtes pas à l&apos;origine de cette demande, ignorez simplement l&apos;email.
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
          ?
        </div>
      </div>
    </main>
  );
}
