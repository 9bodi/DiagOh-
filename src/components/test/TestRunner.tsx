'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import Timer from './Timer';
import ProgressBar from './ProgressBar';
import QuestionCard from './QuestionCard';

interface Question {
  id: string;
  type: 'PROCEDURAL' | 'DECLARATIF';
  category: string | null;
  subCategory: string | null;
  text: string;
  sourceText?: string | null;
  options: string[];
  timeLimit: number;
}

interface QuestionPayload {
  sessionId: string;
  currentIndex: number;
  totalQuestions: number;
  question: Question;
}

export default function TestRunner({ userName }: { userName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<QuestionPayload | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const questionStartRef = useRef<number>(Date.now());

  // 1. Initialisation : démarre ou reprend la session
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

        setData(payload);
        setSelectedIndex(null);
        questionStartRef.current = Date.now();
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

  // 2. Warning avant fermeture/refresh de la page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // 3. Récupère la question suivante
  const fetchNextQuestion = useCallback(async () => {
    try {
      const res = await fetch('/api/test/question');
      if (res.status === 404) {
        await completeTest();
        return;
      }
      const payload = await res.json();
      if (payload.finished) {
        await completeTest();
        return;
      }
      setData(payload);
      setSelectedIndex(null);
      questionStartRef.current = Date.now();
    } catch (e) {
      console.error(e);
      setError('Erreur lors du chargement de la question.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 4. Soumet une réponse (peut être null = timeout)
  const submitAnswer = useCallback(
    async (answer: number | null) => {
      if (!data || submitting) return;
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
    [data, submitting, fetchNextQuestion]
  );

  // 5. Termine le test
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
      <main className="min-h-screen bg-ohe-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-ohe-blue/20 border-t-ohe-blue rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ohe-slate-600">Préparation de votre test...</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen bg-ohe-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-ohe-slate-900 mb-4">{error}</p>
          <Button variant="primary" onClick={() => router.push('/welcome')}>
            Retour à l&apos;accueil
          </Button>
        </div>
      </main>
    );
  }

  if (!data) return null;

  const { question, currentIndex, totalQuestions } = data;

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-ohe-slate-200 flex items-center justify-between gap-4">
        <Logo size="sm" href={undefined} />
        <div className="flex-1 max-w-md">
          <div className="flex items-center justify-between text-xs text-ohe-slate-600 mb-1">
            <span className="font-semibold text-ohe-slate-900">
              Question {currentIndex + 1} / {totalQuestions}
            </span>
          </div>
          <ProgressBar current={currentIndex + 1} total={totalQuestions} />
        </div>
        <Timer
          duration={question.timeLimit}
          resetKey={question.id}
          onExpire={() => submitAnswer(selectedIndex)}
        />
      </header>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl">
          {question.sourceText && (
            <div className="mb-6 p-5 bg-ohe-slate-50 border-l-4 border-ohe-blue rounded-r-lg">
              <p className="text-xs font-semibold text-ohe-slate-500 uppercase tracking-wide mb-2">
                Texte à lire
              </p>
              <p className="text-base text-ohe-slate-900 leading-relaxed">
                {question.sourceText}
              </p>
            </div>
          )}
          <QuestionCard
            subCategory={question.subCategory}
            questionText={question.text}
            options={question.options}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            disabled={submitting}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-ohe-slate-200 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setShowExitModal(true)}
          className="text-xs text-ohe-slate-600 hover:text-ohe-slate-900 underline"
        >
          Quitter le test
        </button>
        <p className="text-xs text-ohe-slate-600 hidden sm:block">
          Validation auto à la fin du temps · pas de retour
        </p>
        <Button
          variant="primary"
          onClick={() => submitAnswer(selectedIndex)}
          disabled={selectedIndex === null || submitting}
          loading={submitting}
        >
          Valider
        </Button>
      </footer>

      {/* Modal de sortie */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-ohe-slate-900 mb-2">
              Confirmez-vous votre sortie ?
            </h3>
            <p className="text-sm text-ohe-slate-600 mb-6">
              Si vous quittez maintenant, <strong>la question actuelle sera comptée comme fausse</strong>.
              Vous reprendrez le test à la question suivante. Cette action est définitive.
            </p>

            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setShowExitModal(false)}>
                Annuler
              </Button>
              <Button
                variant="danger"
                fullWidth
                onClick={async () => {
                  setShowExitModal(false);
                  await submitAnswer(null);
                  router.push('/welcome');
                }}
              >
                Quitter
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
