'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface InviteAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId?: string; // Requis pour superadmin, ignoré pour admin (forcé côté serveur)
  isSuperadmin?: boolean;
}

export default function InviteAdminModal({
  isOpen,
  onClose,
  organizationId,
  isSuperadmin = false,
}: InviteAdminModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const body: Record<string, string> = {
        email: email.trim().toLowerCase(),
      };
      if (firstName.trim()) body.firstName = firstName.trim();
      if (lastName.trim()) body.lastName = lastName.trim();
      if (isSuperadmin && organizationId) body.organizationId = organizationId;

      const res = await fetch('/api/admin/invite-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'invitation');
      }

      setSuccess(`Invitation envoyée à ${email}`);
      setEmail('');
      setFirstName('');
      setLastName('');

      setTimeout(() => {
        onClose();
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="mb-6">
          <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-ohe-orange mb-3">
            ✱ Nouvel administrateur
          </p>
          <h2 className="font-serif text-2xl tracking-tight text-ohe-slate-900">
            Inviter un <em className="italic text-ohe-blue">administrateur.</em>
          </h2>
          <p className="mt-2 text-sm text-ohe-slate-600">
            Il recevra un lien d&apos;activation pour créer son compte. Aucun crédit ne sera consommé.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ohe-slate-700 mb-1.5">
              Email <span className="text-ohe-orange">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-ohe-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ohe-blue/40 focus:border-ohe-blue"
              placeholder="admin@entreprise.com"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-ohe-slate-700 mb-1.5">
                Prénom
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2.5 border border-ohe-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ohe-blue/40 focus:border-ohe-blue"
                placeholder="Jean"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ohe-slate-700 mb-1.5">
                Nom
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2.5 border border-ohe-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ohe-blue/40 focus:border-ohe-blue"
                placeholder="Dupont"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-sm text-ohe-slate-600 hover:text-ohe-slate-900 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="px-5 py-2.5 bg-ohe-blue text-white text-sm font-medium rounded-lg hover:bg-ohe-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Envoi…' : 'Envoyer l\'invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
