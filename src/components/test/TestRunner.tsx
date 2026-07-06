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
  instruction: string | null;   // ← ajout
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

  // 2. Warning avant fermeture/refresh
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
    
    // Deadline dépassée
    if (res.status === 403) {
      const data = await res.json();
      if (data.expired) {
        router.push('/welcome');
        return;
      }
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

// Deadline dépassée pendant le test
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
          <div className="text-3xl mb-4 text-ohe-orange">⚠</div>
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
    <main className="min-h-screen bg-ohe-slate-50 p-4 sm:p-6 lg:p-10 flex">
      <div className="w-full max-w-[1280px] mx-auto bg-white rounded-2xl border border-ohe-slate-200/60 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_48px_-24px_rgba(15,23,42,0.14)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 sm:px-10 lg:px-12 pt-6 sm:pt-8 pb-4 flex items-center justify-between gap-4">
          <Logo size="sm" href={undefined} />
          <div className="flex items-center gap-5 sm:gap-6">
            <div className="flex flex-col items-end leading-tight">
              <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-ohe-slate-600">
                Question
              </span>
              <span className="text-base font-semibold text-ohe-slate-900">
                {currentIndex + 1}
                <span className="font-normal text-ohe-slate-600"> / {totalQuestions}</span>
              </span>
            </div>
            <Timer
              duration={question.timeLimit}
              resetKey={question.id}
              onExpire={() => submitAnswer(selectedIndex)}
            />
          </div>
        </div>

        {/* Progress */}
        <div className="px-6 sm:px-10 lg:px-12">
          <ProgressBar current={currentIndex + 1} total={totalQuestions} />
        </div>

        {/* Body */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 lg:px-12 py-8 sm:py-12">
          <div className="w-full max-w-3xl">
            {question.sourceText && (
              <div className="mb-6 p-5 bg-ohe-slate-50 border-l-2 border-ohe-blue rounded-r-lg">
                <p className="font-mono text-[10.5px] font-medium tracking-[0.14em] uppercase text-ohe-slate-600 mb-2">
                  Texte à lire
                </p>
                <p className="font-serif text-lg text-ohe-slate-900 leading-relaxed">
                  {question.sourceText}
                </p>
              </div>
            )}
            <QuestionCard
              subCategory={question.subCategory}
              instruction={question.instruction}
              questionText={question.text}
              options={question.options}
              selectedIndex={selectedIndex}
              onSelect={setSelectedIndex}
              disabled={submitting}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-10 lg:px-12 py-5 flex items-center justify-between gap-4 flex-wrap">
          <button
            type="button"
            onClick={() => setShowExitModal(true)}
            className="text-xs text-ohe-slate-600 hover:text-ohe-slate-900 transition-colors"
          >
            Quitter le test
          </button>
          <p className="hidden sm:block text-xs text-ohe-slate-600">
            Validation auto à la fin du temps · pas de retour en arrière
          </p>
          <Button
            variant="primary"
            onClick={() => submitAnswer(selectedIndex)}
            disabled={selectedIndex === null || submitting}
            loading={submitting}
          >
            Valider →
          </Button>
        </div>
      </div>

      {/* Modal de sortie */}
      {showExitModal && (
        <div className="fixed inset-0 bg-ohe-slate-900/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-ohe-orange mb-3">
              ✱ Confirmation requise
            </p>
            <h3 className="font-serif text-2xl text-ohe-slate-900 mb-3 leading-snug">
              Quitter le diagnostic ?
            </h3>
            <p className="text-sm text-ohe-slate-600 mb-6 leading-relaxed">
              Si vous quittez maintenant, <strong className="text-ohe-slate-900 font-semibold">la question actuelle sera comptée comme fausse</strong>. Vous reprendrez le test à la question suivante. Cette action est définitive.
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