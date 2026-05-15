'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';

interface UserActionsProps {
  userId: string;
  userName: string;
  status: string;
  sessionId: string | null;
  organizationCredits: number;
  passwordCreated: boolean;
}

export default function UserActions({
  userId,
  userName,
  status,
  sessionId,
  organizationCredits,
  passwordCreated,
}: UserActionsProps) {
  const router = useRouter();
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const canDownloadPdf = status === 'COMPLETED' && sessionId;
  const canReset = status === 'IN_PROGRESS' || status === 'COMPLETED';
  const isCompletedReset = status === 'COMPLETED';
  const canResend = !passwordCreated;
  const willRefundOnDelete = !passwordCreated;

  async function handleReset() {
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
        toast.error(data.error ?? 'Erreur lors du reset.');
        return;
      }

      toast.success(`Test de ${userName} réinitialisé`);
      setResetModalOpen(false);
      router.refresh();
    } catch (e) {
      console.error(e);
      setLoading(false);
      toast.error('Erreur réseau.');
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      const res = await fetch('/api/admin/resend-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      setResending(false);

      if (!res.ok) {
        toast.error(data.error ?? 'Erreur lors du renvoi.');
        return;
      }

      toast.success(`Invitation renvoyée à ${userName}`);
    } catch (e) {
      console.error(e);
      setResending(false);
      toast.error('Erreur réseau.');
    }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        toast.error(data.error ?? 'Erreur lors de la suppression.');
        return;
      }

      if (data.refunded) {
        toast.success(`${userName} supprimé · 1 crédit remboursé`);
      } else {
        toast.success(`${userName} supprimé`);
      }
      setDeleteModalOpen(false);
      router.refresh();
    } catch (e) {
      console.error(e);
      setLoading(false);
      toast.error('Erreur réseau.');
    }
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        {canResend && (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-xs font-medium text-ohe-blue hover:text-ohe-blue-dark transition-colors px-2 py-1 disabled:opacity-50"
          >
            {resending ? '...' : '📨 Renvoyer'}
          </button>
        )}
        {canDownloadPdf && (
          <a
            href={`/api/pdf/${userId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-ohe-blue hover:text-ohe-blue-dark transition-colors px-2 py-1"
          >
            📄 Bilan PDF
          </a>
        )}
        {canReset && (
          <button
            type="button"
            onClick={() => setResetModalOpen(true)}
            className="text-xs font-medium text-ohe-slate-600 hover:text-orange-600 transition-colors px-2 py-1"
          >
            🔄 Reset
          </button>
        )}
        <button
          type="button"
          onClick={() => setDeleteModalOpen(true)}
          className="text-xs font-medium text-ohe-slate-500 hover:text-red-600 transition-colors px-2 py-1"
        >
          🗑️ Supprimer
        </button>
      </div>

      {/* Modal Reset */}
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
                de le repasser depuis le début. <strong>Aucun crédit ne sera consommé</strong>.
              </p>
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

      {/* Modal Delete */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <div className="text-3xl mb-3">🗑️</div>
            <h3 className="text-xl font-bold text-ohe-slate-900 mb-2">
              Supprimer {userName}
            </h3>
            <p className="text-sm text-ohe-slate-600 mb-4">
              Cette action est <strong>définitive</strong>. Le collaborateur, son test
              et toutes ses réponses seront supprimés.
            </p>

            {willRefundOnDelete ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                <p className="text-sm text-green-800">
                  ✓ Ce collaborateur n&apos;a pas activé son compte. <strong>1 crédit sera
                  remboursé</strong> à votre organisation.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg mb-4">
                <p className="text-sm text-orange-800">
                  ⚠️ Ce collaborateur a déjà activé son compte. <strong>Aucun crédit ne sera
                  remboursé</strong>.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setDeleteModalOpen(false)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                fullWidth
                onClick={handleDelete}
                loading={loading}
              >
                Supprimer définitivement
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
