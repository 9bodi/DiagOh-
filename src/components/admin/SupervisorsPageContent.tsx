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
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(supervisor: Supervisor) {
    const name =
      [supervisor.firstName, supervisor.lastName].filter(Boolean).join(' ') ||
      supervisor.email;
    if (!confirm(`Supprimer le superviseur « ${name} » ? Cette action est irréversible.`)) {
      return;
    }
    setDeletingId(supervisor.id);
    try {
      const res = await fetch(`/api/admin/supervisors/${supervisor.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      setDeletingId(null);
      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de la suppression');
        return;
      }
      toast.success(`Superviseur « ${name} » supprimé`);
      router.refresh();
    } catch (e) {
      setDeletingId(null);
      toast.error('Erreur réseau');
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between mb-8 gap-6">
        <div>
          <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-ohe-orange mb-2">
            ✱ Superviseurs
          </p>
          <h1 className="font-serif text-4xl text-ohe-slate-900 mb-2">
            Vos superviseurs
          </h1>
          <p className="text-sm text-ohe-slate-600">
            Chaque superviseur consulte uniquement les participants des groupes qui lui sont
            attribués.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
          + Ajouter un superviseur
        </Button>
      </div>

      {supervisors.length === 0 ? (
  <div className="bg-white rounded-2xl border border-ohe-slate-200 p-10 text-center">
    <p className="text-ohe-slate-600 mb-4">Aucun superviseur pour le moment.</p>
    <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
      + Ajouter un superviseur
    </Button>
  </div>
) : (

        <div className="bg-white rounded-2xl border border-ohe-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-ohe-slate-50 border-b border-ohe-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-mono uppercase tracking-[0.12em] text-ohe-slate-600">
                  Superviseur
                </th>
                <th className="text-left px-6 py-3 text-xs font-mono uppercase tracking-[0.12em] text-ohe-slate-600">
                  Groupes
                </th>
                <th className="text-left px-6 py-3 text-xs font-mono uppercase tracking-[0.12em] text-ohe-slate-600">
                  Statut
                </th>
                <th className="text-right px-6 py-3 text-xs font-mono uppercase tracking-[0.12em] text-ohe-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {supervisors.map((s) => {
                const name =
                  [s.firstName, s.lastName].filter(Boolean).join(' ') || s.email;
                return (
                  <tr key={s.id} className="border-b border-ohe-slate-100 last:border-0">
                    <td className="px-6 py-4">
                      <div className="text-sm text-ohe-slate-900 font-medium">{name}</div>
                      <div className="text-xs text-ohe-slate-500">{s.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {s.supervisedGroups.length === 0 ? (
                          <span className="text-xs text-ohe-slate-400">Aucun</span>
                        ) : (
                          s.supervisedGroups.map((g) => (
                            <span
                              key={g.id}
                              className="inline-block px-2 py-0.5 rounded-full bg-ohe-blue/10 text-ohe-blue text-xs font-medium"
                            >
                              {g.name}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {s.passwordCreated ? (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                          Actif
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                          En attente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setEditTarget(s)}
                        className="text-xs text-ohe-blue hover:underline mr-4"
                      >
                        Modifier groupes
                      </button>
                      <button
                        onClick={() => handleDelete(s)}
                        disabled={deletingId === s.id}
                        className="text-xs text-red-600 hover:underline disabled:opacity-50"
                      >
                        {deletingId === s.id ? '…' : 'Supprimer'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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
    </main>
  );
}
