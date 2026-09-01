'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

interface ActivateTestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userIds: string[];
  userCount: number;
  onSuccess: () => void;
}

// Deadline par défaut : +7 jours à 18h00
function getDefaultDeadline(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(18, 0, 0, 0);
  // Format YYYY-MM-DDTHH:mm pour input datetime-local
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Min = maintenant
function getMinDeadline(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ActivateTestsModal({
  isOpen,
  onClose,
  userIds,
  userCount,
  onSuccess,
}: ActivateTestsModalProps) {
  const router = useRouter();
  const [deadline, setDeadline] = useState(getDefaultDeadline());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ activated: number; skipped: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDeadline(getDefaultDeadline());
      setError(null);
      setResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    try {
      const deadlineISO = new Date(deadline).toISOString();
      const res = await fetch('/api/admin/activate-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds, deadline: deadlineISO }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || data.error || 'Une erreur est survenue');
        setLoading(false);
        return;
      }

      setResult({ activated: data.activated, skipped: data.skipped });
      router.refresh();
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1800);
    } catch (err) {
      setError('Erreur réseau');
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ohe-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {result ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-serif text-2xl text-ohe-slate-900 mb-2">
              Tests activés !
            </h3>
            <p className="text-sm text-ohe-slate-600">
              {result.activated} participant{result.activated > 1 ? 's ont' : ' a'} reçu un email d&apos;invitation.
              {result.skipped > 0 && (
                <span className="block mt-1 text-ohe-slate-500">
                  {result.skipped} ignoré{result.skipped > 1 ? 's' : ''} (déjà activé{result.skipped > 1 ? 's' : ''} ou compte non créé).
                </span>
              )}
            </p>
          </div>
        ) : (
          <>
            <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-ohe-orange mb-3">
              Démarrer le test
            </p>
            <h2 className="font-serif text-2xl text-ohe-slate-900 mb-2">
              Activer {userCount} diagnostic{userCount > 1 ? 's' : ''}
            </h2>
            <p className="text-sm text-ohe-slate-600 mb-6 leading-relaxed">
              Les participants sélectionnés recevront un email pour lancer leur diagnostic.
              Ils auront jusqu&apos;à la date limite définie ci-dessous pour le passer.
            </p>

            <div className="mb-6">
              <label htmlFor="deadline" className="block text-xs font-mono uppercase tracking-[0.12em] text-ohe-slate-700 mb-2">
                Date limite de passage
              </label>
              <input
                id="deadline"
                type="datetime-local"
                value={deadline}
                min={getMinDeadline()}
                onChange={(e) => setDeadline(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 border border-ohe-slate-200 rounded-lg focus:border-ohe-blue focus:ring-2 focus:ring-ohe-blue/20 outline-none text-sm text-ohe-slate-900"
              />
              <p className="mt-2 text-xs text-ohe-slate-500">
                Après cette date, l&apos;accès au test sera automatiquement bloqué.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm text-ohe-slate-600 hover:text-ohe-slate-900 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={loading || !deadline}
              >
                {loading ? 'Activation…' : 'Confirmer et envoyer'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
