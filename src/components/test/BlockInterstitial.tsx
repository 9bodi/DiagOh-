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
    <main className="min-h-screen bg-ohe-bg text-ohe-ink flex flex-col">
      {/* Header */}
      <header className="px-6 md:px-12 py-6 flex items-center justify-between gap-4 border-b border-ohe-line">
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
      <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
        <div className="w-full max-w-[720px]">
          {config.eyebrow && (
            <Eyebrow tone="accent">{config.eyebrow.replace(/^✱\s*/, '')}</Eyebrow>
          )}

          <h1 className="mt-6 text-[36px] sm:text-[48px] lg:text-[58px] leading-[1.02] tracking-[-0.028em] font-normal text-balance">
            {config.title.split(' ').slice(0, -1).join(' ')}{' '}
            <span className="font-serif italic text-ohe-accent">
              {config.title.split(' ').slice(-1)}
            </span>
          </h1>

          <div className="mt-6 space-y-4 max-w-[600px]">
            {config.body.map((paragraph, i) => (
              <p
                key={i}
                className="text-base lg:text-[17px] text-ohe-muted leading-[1.55] text-pretty"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {config.example && (
            <div className="mt-10 p-5 sm:p-6 bg-ohe-panel-tint border border-ohe-line rounded-2xl">
              <div className="ohe-caption text-ohe-muted mb-4">
                {config.example.label}
              </div>
              <div className="space-y-3">
                {config.example.items.map((item, i) => {
                  const badgeClass =
                    item.highlight === 'correct'
                      ? 'bg-ohe-accent text-ohe-accent-ink border-transparent'
                      : item.highlight === 'wrong'
                      ? 'bg-ohe-panel text-ohe-muted border-ohe-line line-through decoration-ohe-muted/50'
                      : 'bg-ohe-panel text-ohe-ink border-ohe-line';

                  return (
                    <div key={i} className="flex items-center gap-4 flex-wrap">
                      <div
                        className={`font-serif italic text-[22px] px-5 py-2 rounded-full border ${badgeClass}`}
                      >
                        {item.text}
                      </div>
                      {item.caption && (
                        <span className="text-sm text-ohe-muted">{item.caption}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-10">
            <PrimaryButton onClick={onContinue}>
              {config.ctaLabel ?? 'Continuer'}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </main>
  );
}
