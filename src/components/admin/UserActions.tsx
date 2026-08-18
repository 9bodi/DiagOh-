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
  canEditDeadline?: boolean;
  onEditDeadline?: () => void;
}

export default function UserActions({
  userId,
  userName,
  status,
  sessionId,
  organizationCredits,
  passwordCreated,
  canEditDeadline,
  onEditDeadline,
}: UserActionsProps) {
  const router = useRouter();
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const canDownloadPdf = status === 'COMPLETED' && sessionId;
  const canReset = status === 'IN_PROGRESS' || status === 'COMPLETED';
  const isCompletedReset = status === 'COMPLETED';
  const canResend = true;

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
      if (data.refunded) toast.success(`${userName} supprimé · 1 crédit remboursé`);
      else toast.success(`${userName} supprimé`);
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
      <div className="flex items-center justify-end gap-1">
        {canResend && (
          <ActionLink onClick={handleResend} disabled={resending} tone="blue" title="Renvoyer l'invitation">
            {resending ? '…' : 'Renvoyer'}
          </ActionLink>
        )}
        {canEditDeadline && onEditDeadline && (
          <ActionLink onClick={onEditDeadline} tone="blue" title="Modifier la date limite">
            Deadline
          </ActionLink>
        )}
        {canDownloadPdf && (
          <a
            href={`/api/pdf/client/${userId}`}

            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-md text-[11px] font-medium text-ohe-blue hover:bg-ohe-blue/[0.06] transition-colors"
            title="Télécharger le bilan PDF"
          >
            Bilan PDF
          </a>
        )}
        {canReset && (
          <ActionLink onClick={() => setResetModalOpen(true)} tone="orange" title="Réinitialiser le test">
            Reset
          </ActionLink>
        )}
        <ActionLink onClick={() => setDeleteModalOpen(true)} tone="red" title="Supprimer le participant">
          Supprimer
        </ActionLink>
      </div>

      {/* Modal Reset */}
      {resetModalOpen && (
        <Modal>
          <ModalKicker>✱ Confirmation requise</ModalKicker>
          <ModalTitle>Réinitialiser le test de {userName} ?</ModalTitle>

          {isCompletedReset ? (
            <p className="text-sm text-ohe-slate-600 leading-relaxed mb-4">
              <strong className="text-ohe-slate-900">{userName}</strong> a déjà passé le diagnostic. Un nouveau passage consommera{' '}
              <strong className="text-ohe-slate-900">1 crédit supplémentaire</strong> ({organizationCredits} restant{organizationCredits > 1 ? 's' : ''}).
            </p>
          ) : (
            <p className="text-sm text-ohe-slate-600 leading-relaxed mb-4">
              <strong className="text-ohe-slate-900">{userName}</strong> a un test en cours. La réinitialisation lui permettra de le repasser depuis le début.{' '}
              <strong className="text-ohe-slate-900">Aucun crédit ne sera consommé.</strong>
            </p>
          )}

          {isCompletedReset && organizationCredits === 0 && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg mb-4">
              <p className="text-sm text-red-700">
                Vous n&apos;avez plus de crédits. Contactez OHé pour recharger votre compte.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setResetModalOpen(false)} disabled={loading}>
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
        </Modal>
      )}

      {/* Modal Delete */}
      {deleteModalOpen && (
        <Modal>
          <ModalKicker>✱ Action définitive</ModalKicker>
          <ModalTitle>Supprimer {userName} ?</ModalTitle>

          <p className="text-sm text-ohe-slate-600 leading-relaxed mb-4">
            Cette action est <strong className="text-ohe-slate-900">définitive</strong>. Le participant, son test et toutes ses réponses seront supprimés.
          </p>

          {willRefundOnDelete ? (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg mb-4">
              <p className="text-sm text-emerald-800">
                Ce participant n&apos;a pas activé son compte. <strong>1 crédit sera remboursé</strong> à votre organisation.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-ohe-orange/5 border border-ohe-orange/20 rounded-lg mb-4">
              <p className="text-sm text-ohe-slate-900">
                Ce participant a déjà activé son compte. <strong>Aucun crédit ne sera remboursé.</strong>
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setDeleteModalOpen(false)} disabled={loading}>
              Annuler
            </Button>
            <Button variant="danger" fullWidth onClick={handleDelete} loading={loading}>
              Supprimer définitivement
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

// ============ Sub-components ============

function ActionLink({
  children,
  onClick,
  disabled,
  title,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  tone: 'blue' | 'orange' | 'red';
}) {
  const toneClass = {
    blue: 'text-ohe-slate-600 hover:text-ohe-blue hover:bg-ohe-blue/[0.06]',
    orange: 'text-ohe-slate-600 hover:text-ohe-orange hover:bg-ohe-orange/[0.06]',
    red: 'text-ohe-slate-500 hover:text-red-600 hover:bg-red-50',
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors disabled:opacity-50 ${toneClass}`}
    >
      {children}
    </button>
  );
}

function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-ohe-slate-900/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {children}
      </div>
    </div>
  );
}

function ModalKicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-ohe-orange mb-3">
      {children}
    </p>
  );
}

function ModalTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-serif text-2xl text-ohe-slate-900 mb-3 leading-snug">
      {children}
    </h3>
  );
}
