'use client';

import { Logo, Eyebrow, PrimaryButton } from '@/components/ui';
import type { InterstitialConfig } from '@/lib/interstitials';

interface Props {
  config: InterstitialConfig;
  currentIndex: number;
  totalQuestions: number;
  onContinue: () => void;
}

export default function BlockInterstitial({
  config,
  currentIndex,
  totalQuestions,
  onContinue,
}: Props) {
  return (
    <main className="h-screen bg-ohe-bg text-ohe-ink flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-6 md:px-12 py-4 flex items-center justify-between gap-4 border-b border-ohe-line shrink-0">
        <Logo size={40} withLabel />
        <div className="flex flex-col items-end leading-tight">
          <span className="ohe-caption text-ohe-muted">Progression</span>
          <span className="text-base font-medium text-ohe-ink mt-1">
            {currentIndex + 1}
            <span className="text-ohe-muted"> / {totalQuestions}</span>
          </span>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center px-6 py-6 sm:px-10 sm:py-8 lg:px-14">
        <div className="w-full max-w-[720px]">
          {/* Eyebrow */}
          {config.eyebrow && (
            <Eyebrow tone="accent">{config.eyebrow}</Eyebrow>
          )}

          {/* Titre */}
          <h1 className="mt-3 text-[30px] sm:text-[38px] lg:text-[46px] leading-[1.05] tracking-[-0.028em] font-normal text-balance">
            {config.title.split(' ').slice(0, -1).join(' ')}{' '}
            <span className="font-serif italic text-ohe-accent">
              {config.title.split(' ').slice(-1)}
            </span>
          </h1>

          {/* Sous-titre (ex: "L'exercice change.") */}
          {config.subtitle && (
            <p className="mt-3 font-serif italic text-[16px] lg:text-[18px] text-ohe-muted leading-[1.4]">
              {config.subtitle}
            </p>
          )}

          {/* Corps */}
          <div className="mt-4 space-y-2.5 max-w-[600px]">
            {config.body.map((paragraph, i) => (
              <p
                key={i}
                className="text-[14px] lg:text-[15px] text-ohe-muted leading-[1.5] text-pretty"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Exemple */}
          {config.example && (
            <div className="mt-5 p-4 sm:p-5 bg-ohe-panel-tint border border-ohe-line rounded-2xl">
              <div className="ohe-caption text-ohe-muted mb-3">
                {config.example.label}
              </div>
              <div className="space-y-2">
                {config.example.items.map((item, i) => {
                  const badgeClass =
                    item.highlight === 'correct'
                      ? 'bg-ohe-accent text-ohe-accent-ink border-transparent'
                      : item.highlight === 'wrong'
                      ? 'bg-ohe-panel text-ohe-muted border-ohe-line line-through decoration-ohe-muted/50'
                      : 'bg-ohe-panel text-ohe-ink border-ohe-line';

                  return (
                    <div key={i} className="flex items-center gap-3 flex-wrap">
                      <div
                        className={`font-serif italic text-[18px] px-4 py-1.5 rounded-full border ${badgeClass}`}
                      >
                        {item.text}
                      </div>
                      {item.caption && (
                        <span className="text-[13px] text-ohe-muted">{item.caption}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footnote (petit texte sous l'encadré exemple) */}
          {config.footnote && (
            <p className="mt-3 text-[11px] text-ohe-muted/80 leading-[1.5] italic">
              * {config.footnote}
            </p>
          )}

          {/* CTA */}
          <div className="mt-6">
            <PrimaryButton onClick={onContinue}>
              {config.ctaLabel ?? 'Continuer'}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </main>
  );
}
