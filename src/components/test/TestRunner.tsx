'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Logo, Eyebrow, PrimaryButton } from '@/components/ui';
import Timer from './Timer';
import ProgressBar from './ProgressBar';
import QuestionCard from './QuestionCard';
import BlockInterstitial from './BlockInterstitial';
import { getInterstitialForBlock, type InterstitialConfig } from '@/lib/interstitials';

interface Question {
  id: string;
  type: 'PROCEDURAL' | 'DECLARATIF';
  category: string | null;
  subCategory: string | null;
  instruction: string | null;
  text: string;
  sourceText?: string | null;
  options: string[];
  timeLimit: number;
  blockNumber: number | null;
}

interface QuestionPayload {
  sessionId: string;
  currentIndex: number;
  totalQuestions: number;
  question: Question;
  isFirstOfBlock: boolean;
  hasAnsweredInBlock: boolean;
}

export default function TestRunner({ userName }: { userName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<QuestionPayload | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingInterstitial, setPendingInterstitial] = useState<InterstitialConfig | null>(null);
  const questionStartRef = useRef<number>(Date.now());

  const applyPayload = useCallback((payload: QuestionPayload) => {
    setData(payload);
    setSelectedIndex(null);

    const config = getInterstitialForBlock(payload.question.blockNumber);
    if (config && payload.isFirstOfBlock && !payload.hasAnsweredInBlock) {
      setPendingInterstitial(config);
    } else {
      setPendingInterstitial(null);
      questionStartRef.current = Date.now();
    }
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const startRes = await fetch('/api/test/start', { method: 'POST' });
        if (startRes.status === 409) {
          router.push('/result');
          return;
        }
        if (!startRes.ok) throw new Error('Failed to start');

        const questionRes = await fetch('/api/test/question');
        if (questionRes.status === 404) {
          await completeTest();
          return;
        }
        if (!questionRes.ok) throw new Error('Failed to fetch question');

        const payload = await questionRes.json();
        if (payload.finished) {
          await completeTest();
          return;
        }

        applyPayload(payload);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setError('Impossible de démarrer le test. Réessayez plus tard.');
        setLoading(false);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const fetchNextQuestion = useCallback(async () => {
    try {
      const res = await fetch('/api/test/question');

      if (res.status === 404) {
        await completeTest();
        return;
      }

      if (res.status === 403) {
        const errData = await res.json();
        if (errData.expired) {
          router.push('/welcome');
          return;
        }
      }

      const payload = await res.json();
      if (payload.finished) {
        await completeTest();
        return;
      }
      applyPayload(payload);
    } catch (e) {
      console.error(e);
      setError('Erreur lors du chargement de la question.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyPayload]);

  const submitAnswer = useCallback(
    async (answer: number | null) => {
      if (!data || submitting || pendingInterstitial) return;
      setSubmitting(true);

      const timeSpent = Math.round((Date.now() - questionStartRef.current) / 1000);

      try {
        const res = await fetch('/api/test/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId: data.question.id,
            selectedOptionIndex: answer,
            timeSpent,
          }),
        });
        const result = await res.json();
        setSubmitting(false);

        if (result.expired) {
          router.push('/welcome');
          return;
        }

        if (result.finished) {
          await completeTest();
        } else {
          await fetchNextQuestion();
        }
      } catch (e) {
        console.error(e);
        setSubmitting(false);
        setError("Erreur lors de l'enregistrement de la réponse.");
      }
    },
    [data, submitting, pendingInterstitial, fetchNextQuestion]
  );

  async function completeTest() {
    try {
      await fetch('/api/test/complete', { method: 'POST' });
      router.push('/result');
    } catch (e) {
      console.error(e);
      setError('Erreur lors de la finalisation du test.');
    }
  }

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-ohe-bg text-ohe-ink flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-ohe-line border-t-ohe-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="ohe-caption text-ohe-muted">Préparation du diagnostic</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen bg-ohe-bg text-ohe-ink flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <Eyebrow tone="accent">Erreur</Eyebrow>
          <p className="mt-6 text-ohe-ink text-lg leading-relaxed">{error}</p>
          <div className="mt-8">
            <PrimaryButton onClick={() => router.push('/welcome')}>
              Retour à l&apos;accueil
            </PrimaryButton>
          </div>
        </div>
      </main>
    );
  }

  if (!data) return null;

  // Interstitiel prioritaire
  if (pendingInterstitial) {
    return (
      <BlockInterstitial
        config={pendingInterstitial}
        currentIndex={data.currentIndex}
        totalQuestions={data.totalQuestions}
        onContinue={() => {
          setPendingInterstitial(null);
          questionStartRef.current = Date.now();
        }}
      />
    );
  }

  const { question, currentIndex, totalQuestions } = data;

  return (
    <main className="h-screen bg-ohe-bg text-ohe-ink flex flex-col overflow-hidden">
            {/* Header */}
      <header className="px-6 sm:px-10 lg:px-14 pt-4 pb-3 grid grid-cols-3 items-center gap-4 border-b border-ohe-line shrink-0">
        {/* Gauche : Logo */}
        <div className="flex justify-start">
          <Logo size={40} withLabel />
        </div>

        {/* Centre : Timer proéminent */}
        <div className="flex justify-center">
          <Timer
            duration={question.timeLimit}
            resetKey={question.id}
            onExpire={() => submitAnswer(selectedIndex)}
          />
        </div>

        {/* Droite : Compteur de questions */}
        <div className="flex justify-end">
          <div className="flex flex-col items-end leading-tight">
            <span className="ohe-caption text-ohe-muted">Question</span>
            <span className="font-serif italic text-ohe-accent text-[22px] leading-none mt-1">
              {String(currentIndex + 1).padStart(2, '0')}
              <span className="text-ohe-muted text-[14px]"> / {totalQuestions}</span>
            </span>
          </div>
        </div>
      </header>


      {/* Progress bar fine */}
      <div className="px-6 sm:px-10 lg:px-14">
        <ProgressBar current={currentIndex + 1} total={totalQuestions} />
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex items-center justify-center px-6 sm:px-10 lg:px-14 py-4 sm:py-6 overflow-y-auto">
                   <div key={question.id} className="w-full max-w-3xl animate-question-fade">
          {question.blockNumber === 4 && (
            <div className="mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-ohe-accent" />
              <p className="font-serif italic text-[14px] text-ohe-accent">
                Ces mots n&apos;existent pas — c&apos;est normal.
              </p>
            </div>
          )}

          {/* Consigne bloc 6 : petite et grise, tout en haut */}
          {question.blockNumber === 6 && question.instruction && (
            <p className="mb-4 text-[13px] text-ohe-muted leading-relaxed">
              {question.instruction}
            </p>
          )}

          {question.sourceText && (
            <div className="mt-4 p-5 sm:p-4 bg-ohe-panel-tint border-l-2 border-ohe-accent rounded-r-2xl">
              <div className="ohe-caption text-ohe-muted mb-2">Texte à lire</div>
              <p className="font-serif text-lg sm:text-xl text-ohe-ink leading-relaxed">
                {question.sourceText}
              </p>
            </div>
          )}

          <div className="mt-5">
            <QuestionCard
              subCategory={null}
              instruction={question.blockNumber === 6 ? null : question.instruction}
              questionText={question.text}
              options={question.options}
              selectedIndex={selectedIndex}
              onSelect={setSelectedIndex}
              disabled={submitting}
            />
          </div>
        </div>


      </div>

      {/* Footer */}
      <footer className="border-t border-ohe-line px-6 sm:px-10 lg:px-14 py-4 flex items-center justify-between gap-4 flex-wrap shrink-0">
        <button
          type="button"
          onClick={() => setShowExitModal(true)}
          className="text-sm text-ohe-muted hover:text-ohe-ink transition-colors underline underline-offset-4"
        >
          Quitter le diagnostic
        </button>

        <p className="hidden sm:block text-xs text-ohe-muted">
          Validation auto à la fin du temps · pas de retour en arrière
        </p>

        <PrimaryButton
          onClick={() => submitAnswer(selectedIndex)}
          disabled={selectedIndex === null || submitting}
        >
          {submitting ? 'Validation…' : 'Valider'}
        </PrimaryButton>
      </footer>

      {/* Modal de sortie */}
      {showExitModal && (
        <div className="fixed inset-0 bg-ohe-ink/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-ohe-panel border border-ohe-line rounded-2xl shadow-xl p-8 max-w-md w-full">
            <Eyebrow tone="accent">Confirmation requise</Eyebrow>

            <h3 className="mt-5 text-2xl leading-snug tracking-tight text-ohe-ink">
              Quitter le{' '}
              <span className="font-serif italic text-ohe-accent">diagnostic</span> ?
            </h3>

            <p className="text-sm text-ohe-muted mt-4 mb-8 leading-relaxed">
              Si vous quittez maintenant,{' '}
              <span className="text-ohe-ink font-medium">
                la question actuelle sera comptée comme fausse
              </span>
              . Vous reprendrez le test à la question suivante. Cette action est définitive.
            </p>

            <div className="flex gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="flex-1 px-5 py-3 rounded-full border border-ohe-line text-ohe-ink text-sm font-medium hover:bg-ohe-panel-tint transition-colors"
              >
                Revenir
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowExitModal(false);
                  if (!data || submitting) return;

                  const timeSpent = Math.round((Date.now() - questionStartRef.current) / 1000);
                  try {
                    await fetch('/api/test/answer', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        questionId: data.question.id,
                        selectedOptionIndex: null,
                        timeSpent,
                      }),
                    });
                  } catch (e) {
                    console.error(e);
                  }
                  router.push('/welcome');
                }}
                className="flex-1 px-5 py-3 rounded-full bg-ohe-ink text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Quitter
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
