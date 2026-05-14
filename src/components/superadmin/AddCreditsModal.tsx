'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface Props {
  organization: { id: string; name: string; credits: number };
  onClose: () => void;
}

export default function AddCreditsModal({ organization, onClose }: Props) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('purchase');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/superadmin/add-credits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organizationId: organization.id,
        amount: parseInt(amount, 10),
        reason,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Une erreur est survenue.');
      setLoading(false);
      return;
    }

    router.refresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-bold text-ohe-slate-900 mb-2">
            Ajouter des crédits
          </h2>
          <p className="text-sm text-ohe-slate-600 mb-4">
            {organization.name} ({organization.credits} crédits actuellement)
          </p>
          <div className="space-y-4">
            <Input
              label="Nombre de crédits à ajouter"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              required
            />
            <div>
              <label className="block text-sm font-medium text-ohe-slate-700 mb-1">
                Motif
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-ohe-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ohe-blue"
              >
                <option value="purchase">Achat</option>
                <option value="commercial_gesture">Geste commercial</option>
                <option value="bug_compensation">Compensation bug</option>
                <option value="other">Autre</option>
              </select>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded">
                {error}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" fullWidth onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" variant="primary" fullWidth loading={loading}>
                Ajouter
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
