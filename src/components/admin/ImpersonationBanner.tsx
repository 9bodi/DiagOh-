'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ImpersonationBannerProps {
  orgName: string;
}

export default function ImpersonationBanner({ orgName }: ImpersonationBannerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleStop() {
    setLoading(true);
    try {
      const res = await fetch('/api/superadmin/impersonate', { method: 'DELETE' });
      if (!res.ok) {
        toast.error('Erreur lors de la sortie de la session.');
        setLoading(false);
        return;
      }
      toast.success('Retour au compte superadmin');
      router.push('/organizations');
      router.refresh();
    } catch (e) {
      console.error(e);
      setLoading(false);
      toast.error('Erreur réseau.');
    }
  }

  return (
    <div className="sticky top-0 z-50 bg-ohe-orange text-white px-4 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 text-sm">
          
          <span>
            <strong>Vue Client</strong> - vous êtes connecté en tant qu&apos;admin de{' '}
            <strong>{orgName}</strong>. 
          </span>
        </div>
        <button
          type="button"
          onClick={handleStop}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? '...' : '← Retour superadmin'}
        </button>
      </div>
    </div>
  );
}
