'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

interface UpdateDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  currentDeadline: Date | null;
}

function formatForInput(d: Date | null): string {
  if (!d) {
    const def = new Date();
    def.setDate(def.getDate() + 7);
    def.setHours(18, 0, 0, 0);
    d = def;
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getMinDeadline(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function UpdateDeadlineModal({
  isOpen,
  onClose,
  userId,
  userName,
  currentDeadline,
}: UpdateDeadlineModalProps) {
  const router = useRouter();
  const [deadline, setDeadline] = useState(formatForInput(currentDeadline));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDeadline(formatForInput(currentDeadline));
      setError(null);
    }
  }, [isOpen, currentDeadline]);

  if (!isOpen) return null;

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/update-deadline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, deadline: new Date(deadline).toISOString() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue');
        setLoading(false);
        return;
      }

      router.refresh();
      onClose();
    } catch (err) {
      setError('Erreur réseau');
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ohe-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-ohe-orange mb-3">
          ✱ Modifier la deadline
        </p>
        <h2 className="font-serif text-2xl text-ohe-slate-900 mb-2">
          {userName}
        </h2>
        <p className="text-sm text-ohe-slate-600 mb-6 leading-relaxed">
          Choisissez une nouvelle date limite pour ce participant.
        </p>

        <div className="mb-6">
          <label htmlFor="new-deadline" className="block text-xs font-mono uppercase tracking-[0.12em] text-ohe-slate-700 mb-2">
            Nouvelle date limite
          </label>
          <input
            id="new-deadline"
            type="datetime-local"
            value={deadline}
            min={getMinDeadline()}
            onChange={(e) => setDeadline(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2.5 border border-ohe-slate-200 rounded-lg focus:border-ohe-blue focus:ring-2 focus:ring-ohe-blue/20 outline-none text-sm text-ohe-slate-900"
          />
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
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </div>
  );
}
