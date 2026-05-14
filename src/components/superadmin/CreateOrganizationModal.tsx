'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function CreateOrganizationModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [credits, setCredits] = useState('10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicLink, setMagicLink] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/superadmin/create-organization', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        adminEmail,
        credits: parseInt(credits, 10),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Une erreur est survenue.');
      setLoading(false);
      return;
    }

    setMagicLink(data.magicLinkUrl);
    setLoading(false);
    router.refresh();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        {magicLink ? (
          <>
            <h2 className="text-xl font-bold text-ohe-slate-900 mb-3">
              ✅ Organisation créée
            </h2>
            <p className="text-sm text-ohe-slate-600 mb-4">
              Voici le lien d'activation à transmettre à l'admin :
            </p>
            <div className="bg-ohe-slate-50 border border-ohe-slate-200 rounded p-3 mb-4 text-xs break-all font-mono">
              {magicLink}
            </div>
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                navigator.clipboard.writeText(magicLink);
              }}
            >
              📋 Copier le lien
            </Button>
            <Button variant="ghost" fullWidth onClick={handleClose} className="mt-2">
              Fermer
            </Button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 className="text-xl font-bold text-ohe-slate-900 mb-4">
              Créer une organisation
            </h2>
            <div className="space-y-4">
              <Input
                label="Nom de l'organisation"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: DomusVi"
                required
              />
              <Input
                label="Email de l'admin"
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@organisation.fr"
                required
              />
              <Input
                label="Crédits initiaux"
                type="number"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                min="0"
                required
              />
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded">
                  {error}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" fullWidth onClick={handleClose}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary" fullWidth loading={loading}>
                  Créer
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
