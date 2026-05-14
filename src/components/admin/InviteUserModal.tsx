'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteUserModal({ isOpen, onClose }: InviteUserModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicLink, setMagicLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/invite-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error ?? 'Erreur lors de l\'invitation.');
        return;
      }

      setMagicLink(data.magicLinkUrl);
      router.refresh(); // recharge la liste des users en arrière-plan
    } catch (e) {
      console.error(e);
      setLoading(false);
      setError('Erreur réseau. Réessayez.');
    }
  }

  function handleCopy() {
    if (!magicLink) return;
    navigator.clipboard.writeText(magicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleClose() {
    setEmail('');
    setMagicLink(null);
    setError('');
    setCopied(false);
    onClose();
  }

  function handleInviteAnother() {
    setEmail('');
    setMagicLink(null);
    setError('');
    setCopied(false);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {!magicLink ? (
          <>
            <h3 className="text-xl font-bold text-ohe-slate-900 mb-2">
              Inviter un collaborateur
            </h3>
            <p className="text-sm text-ohe-slate-600 mb-6">
              Saisissez son adresse email professionnelle. Un lien d&apos;activation lui permettra
              de créer son compte et passer le diagnostic.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="prenom.nom@organisation.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" fullWidth onClick={handleClose}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary" fullWidth loading={loading}>
                  Inviter
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="text-3xl mb-3">✅</div>
            <h3 className="text-xl font-bold text-ohe-slate-900 mb-2">Invitation créée</h3>
            <p className="text-sm text-ohe-slate-600 mb-4">
              Le collaborateur <strong>{email}</strong> a été ajouté. Voici son lien
              d&apos;activation :
            </p>

            <div className="p-3 bg-ohe-slate-50 border border-ohe-slate-200 rounded-lg mb-4">
              <p className="text-xs font-mono text-ohe-slate-700 break-all">{magicLink}</p>
            </div>

            <div className="flex gap-3 mb-4">
              <Button variant="secondary" fullWidth onClick={handleCopy}>
                {copied ? '✓ Copié !' : '📋 Copier le lien'}
              </Button>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <p className="text-xs text-yellow-900">
                <strong>ℹ️ Mode développement :</strong> l&apos;envoi automatique par email sera
                configuré plus tard. Pour l&apos;instant, copiez ce lien et envoyez-le manuellement.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={handleClose}>
                Fermer
              </Button>
              <Button variant="primary" fullWidth onClick={handleInviteAnother}>
                Inviter un autre
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
