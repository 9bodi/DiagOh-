'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import InviteAdminModal from './InviteAdminModal';

interface AdminItem {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  passwordCreated: boolean;
  createdAt: string | Date;
}

interface AdminsListSectionProps {
  admins: AdminItem[];
  currentUserId: string;
  organizationId: string;
  isSuperadmin?: boolean;
}

export default function AdminsListSection({
  admins,
  currentUserId,
  organizationId,
  isSuperadmin = false,
}: AdminsListSectionProps) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const adminCount = admins.length;

  const handleDelete = async (userId: string, email: string) => {
    if (userId === currentUserId) {
      setError('Vous ne pouvez pas supprimer votre propre compte.');
      return;
    }
    if (adminCount <= 1) {
      setError('Impossible de supprimer le dernier administrateur.');
      return;
    }
    if (!confirm(`Supprimer définitivement l'administrateur ${email} ?`)) return;

    setDeletingId(userId);
    setError(null);

    try {
      const res = await fetch('/api/admin/delete-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la suppression');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setDeletingId(null);
    }
  };

  const displayName = (a: AdminItem) => {
    const full = [a.firstName, a.lastName].filter(Boolean).join(' ').trim();
    return full || a.email;
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-ohe-slate-200/60 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_40px_-20px_rgba(15,23,42,0.15)] p-8 lg:p-10 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-7">
          <div>
            <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-ohe-orange mb-3">
              Équipe admin
            </p>
            <h2 className="font-serif text-2xl lg:text-[28px] tracking-tight leading-tight text-ohe-slate-900">
              Vos <em className="italic text-ohe-blue">administrateurs.</em>
            </h2>
            <p className="mt-2 text-sm text-ohe-slate-600 max-w-md">
              {adminCount} administrateur{adminCount > 1 ? 's' : ''} · aucun crédit consommé.
            </p>
          </div>
          <button
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-ohe-blue text-white text-sm font-medium rounded-lg hover:bg-ohe-blue/90 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Inviter un admin
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="border border-ohe-slate-200/60 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ohe-slate-50/60 border-b border-ohe-slate-200/60">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-ohe-slate-600 text-xs uppercase tracking-wider">Nom</th>
                <th className="text-left px-4 py-3 font-medium text-ohe-slate-600 text-xs uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 font-medium text-ohe-slate-600 text-xs uppercase tracking-wider">Statut</th>
                <th className="text-right px-4 py-3 font-medium text-ohe-slate-600 text-xs uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => {
                const isSelf = admin.id === currentUserId;
                const isLastAdmin = adminCount <= 1;
                const disabled = isSelf || isLastAdmin || deletingId === admin.id;
                const tooltip = isSelf
                  ? 'Vous ne pouvez pas vous supprimer'
                  : isLastAdmin
                  ? 'Au moins un admin doit rester'
                  : '';

                return (
                  <tr key={admin.id} className="border-b border-ohe-slate-200/40 last:border-0 hover:bg-ohe-slate-50/30">
                    <td className="px-4 py-3 text-ohe-slate-900">
                      {displayName(admin)}
                      {isSelf && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 text-[10px] font-medium bg-ohe-blue/10 text-ohe-blue rounded uppercase tracking-wider">
                          Vous
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ohe-slate-600">{admin.email}</td>
                    <td className="px-4 py-3">
                      {admin.passwordCreated ? (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-ohe-slate-100 text-ohe-slate-600 rounded">
                          Invité
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(admin.id, admin.email)}
                        disabled={disabled}
                        title={tooltip}
                        className="text-sm text-red-600 hover:text-red-700 disabled:text-ohe-slate-300 disabled:cursor-not-allowed"
                      >
                        {deletingId === admin.id ? 'Suppression…' : 'Supprimer'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <InviteAdminModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        organizationId={organizationId}
        isSuperadmin={isSuperadmin}
      />
    </>
  );
}
