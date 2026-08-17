'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import CreateSupervisorModal from './CreateSupervisorModal';
import EditSupervisorGroupsModal from './EditSupervisorGroupsModal';

interface Group {
  id: string;
  name: string;
}

interface Supervisor {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  passwordCreated: boolean;
  createdAt: string;
  supervisedGroups: Group[];
}

interface SupervisorsPageContentProps {
  supervisors: Supervisor[];
  groups: Group[];
  orgName: string;
}

export default function SupervisorsPageContent({
  supervisors,
  groups,
  orgName,
}: SupervisorsPageContentProps) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Supervisor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supervisor | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    const name =
      [deleteTarget.firstName, deleteTarget.lastName].filter(Boolean).join(' ') ||
      deleteTarget.email;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/supervisors/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      setDeleting(false);
      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de la suppression');
        return;
      }
      toast.success(`Superviseur « ${name} » supprimé`);
      setDeleteTarget(null);
      router.refresh();
    } catch (e) {
      setDeleting(false);
      toast.error('Erreur réseau');
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      {/* Hero */}
      <div className="flex items-end justify-between gap-6 flex-wrap mb-10">
        <div>
          <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-ohe-orange mb-4">
            ✱ Superviseurs
          </p>
          <h1 className="font-serif font-normal text-4xl lg:text-[48px] leading-[1.05] tracking-tight text-ohe-slate-900">
            Vos <em className="italic text-ohe-blue">superviseurs.</em>
          </h1>
          <p className="mt-4 text-base text-ohe-slate-600 leading-relaxed">
            {supervisors.length} superviseur{supervisors.length > 1 ? 's' : ''} chez {orgName}. Chaque superviseur consulte uniquement les participants des groupes qui lui sont attribués.
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setIsCreateOpen(true)}>
          + Ajouter un superviseur
        </Button>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-2xl border border-ohe-slate-200/60 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_40px_-20px_rgba(15,23,42,0.12)] overflow-hidden">
        {supervisors.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-ohe-slate-50 border border-ohe-slate-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-ohe-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-base font-semibold text-ohe-slate-900 mb-2">
              Aucun superviseur pour le moment.
            </p>
            <p className="text-sm text-ohe-slate-600 mb-6">
              Ajoutez un superviseur pour lui donner accès à des groupes de participants.
            </p>
            <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
              + Ajouter un superviseur
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ohe-slate-200 bg-ohe-slate-50/60">
                  <th className="text-left px-6 py-3 font-mono text-[10px] font-semibold text-ohe-slate-500 tracking-[0.14em] uppercase">
                    Superviseur
                  </th>
                  <th className="text-left px-6 py-3 font-mono text-[10px] font-semibold text-ohe-slate-500 tracking-[0.14em] uppercase">
                    Groupes
                  </th>
                  <th className="text-left px-6 py-3 font-mono text-[10px] font-semibold text-ohe-slate-500 tracking-[0.14em] uppercase">
                    Statut
                  </th>
                  <th className="text-right px-6 py-3 font-mono text-[10px] font-semibold text-ohe-slate-500 tracking-[0.14em] uppercase">
                    {/* Actions */}
                  </th>
                </tr>
              </thead>
              <tbody>
                {supervisors.map((s) => {
                  const name =
                    [s.firstName, s.lastName].filter(Boolean).join(' ') || s.email;
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-ohe-slate-100 last:border-b-0 hover:bg-ohe-slate-50/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-ohe-slate-900 truncate">
                          {name}
                        </div>
                        <div className="text-xs text-ohe-slate-600 truncate">{s.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {s.supervisedGroups.length === 0 ? (
                            <span className="text-xs text-ohe-slate-400 italic">Aucun</span>
                          ) : (
                            s.supervisedGroups.map((g) => (
                              <span
                                key={g.id}
                                className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-ohe-blue/10 text-ohe-blue"
                              >
                                {g.name}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {s.passwordCreated ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700">
                            Actif
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700">
                            En attente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <ActionLink onClick={() => setEditTarget(s)} tone="blue">
                            Modifier groupes
                          </ActionLink>
                          <ActionLink onClick={() => setDeleteTarget(s)} tone="red">
                            Supprimer
                          </ActionLink>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modales */}
      <CreateSupervisorModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        groups={groups}
      />

      <EditSupervisorGroupsModal
        isOpen={editTarget !== null}
        onClose={() => setEditTarget(null)}
        supervisor={editTarget}
        groups={groups}
      />

      {/* Delete modal (freemium style) */}
      {deleteTarget && (
        <DeleteSupervisorModal
          supervisor={deleteTarget}
          loading={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </main>
  );
}

// ============ Sub-components ============

function ActionLink({
  children,
  onClick,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone: 'blue' | 'red';
}) {
  const toneClass = {
    blue: 'text-ohe-slate-600 hover:text-ohe-blue hover:bg-ohe-blue/[0.06]',
    red: 'text-ohe-slate-500 hover:text-red-600 hover:bg-red-50',
  }[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${toneClass}`}
    >
      {children}
    </button>
  );
}

function DeleteSupervisorModal({
  supervisor,
  loading,
  onCancel,
  onConfirm,
}: {
  supervisor: Supervisor;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const name =
    [supervisor.firstName, supervisor.lastName].filter(Boolean).join(' ') ||
    supervisor.email;
  const groupCount = supervisor.supervisedGroups.length;

  return (
    <div className="fixed inset-0 bg-ohe-slate-900/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-ohe-orange mb-3">
          ✱ Action définitive
        </p>
        <h3 className="font-serif text-2xl text-ohe-slate-900 mb-3 leading-snug">
          Supprimer {name} ?
        </h3>
        <p className="text-sm text-ohe-slate-600 leading-relaxed mb-4">
          Cette action est <strong className="text-ohe-slate-900">définitive</strong>. Le superviseur perdra son accès à l&apos;espace admin. Les groupes qu&apos;il supervisait ne seront pas supprimés.
        </p>
        {groupCount > 0 && (
          <div className="p-3 bg-ohe-orange/5 border border-ohe-orange/20 rounded-lg mb-4">
            <p className="text-sm text-ohe-slate-900">
              <strong>{groupCount} groupe{groupCount > 1 ? 's' : ''}</strong> seront libéré{groupCount > 1 ? 's' : ''} (les participants restent en place).
            </p>
          </div>
        )}
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onCancel} disabled={loading}>
            Annuler
          </Button>
          <Button variant="danger" fullWidth onClick={onConfirm} loading={loading}>
            Supprimer définitivement
          </Button>
        </div>
      </div>
    </div>
  );
}
