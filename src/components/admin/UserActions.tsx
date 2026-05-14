'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

interface UserActionsProps {
  userId: string;
  userName: string;
  status: string;
  sessionId: string | null;
  organizationCredits: number;
}

export default function UserActions({
  userId,
  userName,
  status,
  sessionId,
  organizationCredits,
}: UserActionsProps) {
  const router = useRouter();
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canDownloadPdf = status === 'COMPLETED' && sessionId;
  const canReset = status === 'IN_PROGRESS' || status === 'COMPLETED';
  const isCompletedReset = status === 'COMPLETED';

  async function handleReset() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reset-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error ?? 'Erreur lors du reset.');
        return;
      }

      setResetModalOpen(false);
      router.refresh();
    } catch (e) {
      console.error(e);
      setLoading(false);
      setError('Erreur réseau.');
    }
  }

  function handleDownloadPdf() {
    // Placeholder pour l'étape G (génération PDF)
    alert(
      'La génération PDF sera implémentée à l\'étape suivante.\n\nElle ouvrira un PDF avec le bilan complet du collaborateur (niveau, scores par compétence, préconisations).'
    );
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        {canDownloadPdf && (
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="text-xs font-medium text-ohe-blue hover:text-ohe-blue-dark transition-colors px-2 py-1"
          >
            📄 Bilan PDF
          </button>
        )}
        {canReset && (
          <button
            type="button"
            onClick={() => setResetModalOpen(true)}
            className="text-xs font-medium text-ohe-slate-600 hover:text-red-600 transition-colors px-2 py-1"
          >
            🔄 Reset
          </button>
        )}
        {!canReset && !canDownloadPdf && (
          <span className="text-xs text-ohe-slate-400">—</span>
        )}
      </div>

      {resetModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <div className="text-3xl mb-3">⚠️</div>
            <h3 className="text-xl font-bold text-ohe-slate-900 mb-2">
              Réinitialiser le test de {userName}
            </h3>

            {isCompletedReset ? (
              <p className="text-sm text-ohe-slate-600 mb-4">
                <strong>{userName} a déjà passé le diagnostic.</strong> Un nouveau passage
                consommera <strong>1 crédit supplémentaire</strong> (
                {organizationCredits} crédit{organizationCredits > 1 ? 's' : ''} restant
                {organizationCredits > 1 ? 's' : ''}). Confirmer ?
              </p>
            ) : (
              <p className="text-sm text-ohe-slate-600 mb-4">
                <strong>{userName}</strong> a un test en cours. La réinitialisation lui permettra
                de le repasser depuis le début. <strong>Aucun crédit ne sera consommé</strong> tant
                que le nouveau test n&apos;est pas terminé.
              </p>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {isCompletedReset && organizationCredits === 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                <p className="text-sm text-red-700">
                  Vous n&apos;avez plus de crédits. Contactez OHé pour recharger votre compte.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setResetModalOpen(false)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                fullWidth
                onClick={handleReset}
                loading={loading}
                disabled={isCompletedReset && organizationCredits === 0}
              >
                Confirmer le reset
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
