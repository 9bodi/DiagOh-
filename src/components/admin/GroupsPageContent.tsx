'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';

interface Group {
  id: string;
  name: string;
  participantsCount: number;
  supervisorsCount: number;
  createdAt: string;
}

interface GroupsPageContentProps {
  groups: Group[];
  orgName: string;
}

export default function GroupsPageContent({ groups, orgName }: GroupsPageContentProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [deleteGroup, setDeleteGroup] = useState<Group | null>(null);

  return (
    <>
      {/* Hero */}
      <div className="flex items-end justify-between gap-6 flex-wrap mb-10">
        <div>
          <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-ohe-orange mb-4">
            ✱ Groupes
          </p>
          <h1 className="font-serif font-normal text-4xl lg:text-[48px] leading-[1.05] tracking-tight text-ohe-slate-900">
            Vos <em className="italic text-ohe-blue">groupes.</em>
          </h1>
          <p className="mt-4 text-base text-ohe-slate-600 leading-relaxed">
            {groups.length} groupe{groups.length > 1 ? 's' : ''} dans {orgName}. Organisez vos participants par classe, promotion ou service.
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setCreateOpen(true)}>
          + Nouveau groupe
        </Button>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-2xl border border-ohe-slate-200/60 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_40px_-20px_rgba(15,23,42,0.12)] overflow-hidden">
        {groups.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-ohe-slate-50 border border-ohe-slate-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-ohe-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857" />
              </svg>
            </div>
            <p className="text-base font-semibold text-ohe-slate-900 mb-2">
              Aucun groupe pour le moment.
            </p>
            <p className="text-sm text-ohe-slate-600">
              Créez votre premier groupe pour organiser vos participants.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-ohe-slate-100">
            {groups.map((g) => (
              <li
                key={g.id}
                className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-ohe-slate-50/40 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-base font-semibold text-ohe-slate-900 truncate">{g.name}</p>
                  <p className="text-xs text-ohe-slate-600 mt-0.5">
                    {g.participantsCount} participant{g.participantsCount > 1 ? 's' : ''}
                    {g.supervisorsCount > 0 && (
                      <> · {g.supervisorsCount} superviseur{g.supervisorsCount > 1 ? 's' : ''}</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <ActionLink onClick={() => setEditGroup(g)} tone="blue">
                    Renommer
                  </ActionLink>
                  <ActionLink onClick={() => setDeleteGroup(g)} tone="red">
                    Supprimer
                  </ActionLink>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modales */}
      {createOpen && (
        <CreateGroupModal
          onClose={() => setCreateOpen(false)}
          onSuccess={() => {
            setCreateOpen(false);
            router.refresh();
          }}
        />
      )}
      {editGroup && (
        <RenameGroupModal
          group={editGroup}
          onClose={() => setEditGroup(null)}
          onSuccess={() => {
            setEditGroup(null);
            router.refresh();
          }}
        />
      )}
      {deleteGroup && (
        <DeleteGroupModal
          group={deleteGroup}
          onClose={() => setDeleteGroup(null)}
          onSuccess={() => {
            setDeleteGroup(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

// ============ Modales ============

function CreateGroupModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur');
        setLoading(false);
        return;
      }
      toast.success(`Groupe "${data.group.name}" créé`);
      onSuccess();
    } catch (e) {
      setError('Erreur réseau');
      setLoading(false);
    }
  }

  return (
    <Modal>
      <ModalKicker>✱ Nouveau groupe</ModalKicker>
      <ModalTitle>Créer un groupe</ModalTitle>
      <label htmlFor="new-group-name" className="block text-xs font-mono uppercase tracking-[0.12em] text-ohe-slate-700 mb-2">
        Nom du groupe
      </label>
      <input
        id="new-group-name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="Promo 2026, Équipe RH, Classe A…"
        disabled={loading}
        autoFocus
        className="w-full px-4 py-2.5 border border-ohe-slate-200 rounded-lg focus:border-ohe-blue focus:ring-2 focus:ring-ohe-blue/20 outline-none text-sm text-ohe-slate-900 mb-4"
      />
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex gap-3">
        <Button variant="secondary" fullWidth onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button variant="primary" fullWidth onClick={handleSubmit} loading={loading} disabled={!name.trim()}>
          Créer
        </Button>
      </div>
    </Modal>
  );
}

function RenameGroupModal({
  group,
  onClose,
  onSuccess,
}: {
  group: Group;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(group.name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!name.trim() || name.trim() === group.name) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/groups/${group.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur');
        setLoading(false);
        return;
      }
      toast.success('Groupe renommé');
      onSuccess();
    } catch (e) {
      setError('Erreur réseau');
      setLoading(false);
    }
  }

  return (
    <Modal>
      <ModalKicker>✱ Renommer</ModalKicker>
      <ModalTitle>{group.name}</ModalTitle>
      <label htmlFor="rename-group" className="block text-xs font-mono uppercase tracking-[0.12em] text-ohe-slate-700 mb-2">
        Nouveau nom
      </label>
      <input
        id="rename-group"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        disabled={loading}
        autoFocus
        className="w-full px-4 py-2.5 border border-ohe-slate-200 rounded-lg focus:border-ohe-blue focus:ring-2 focus:ring-ohe-blue/20 outline-none text-sm text-ohe-slate-900 mb-4"
      />
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex gap-3">
        <Button variant="secondary" fullWidth onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          variant="primary"
          fullWidth
          onClick={handleSubmit}
          loading={loading}
          disabled={!name.trim() || name.trim() === group.name}
        >
          Enregistrer
        </Button>
      </div>
    </Modal>
  );
}

function DeleteGroupModal({
  group,
  onClose,
  onSuccess,
}: {
  group: Group;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/groups/${group.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur');
        setLoading(false);
        return;
      }
      if (data.detachedParticipants > 0) {
        toast.success(
          `Groupe supprimé · ${data.detachedParticipants} participant${data.detachedParticipants > 1 ? 's' : ''} détaché${data.detachedParticipants > 1 ? 's' : ''}`
        );
      } else {
        toast.success('Groupe supprimé');
      }
      onSuccess();
    } catch (e) {
      setError('Erreur réseau');
      setLoading(false);
    }
  }

  return (
    <Modal>
      <ModalKicker>✱ Action définitive</ModalKicker>
      <ModalTitle>Supprimer {group.name} ?</ModalTitle>
      <p className="text-sm text-ohe-slate-600 leading-relaxed mb-4">
        Cette action est <strong className="text-ohe-slate-900">définitive</strong>. Les participants du groupe seront <strong>détachés</strong> (leur compte et leurs résultats sont conservés).
      </p>
      {group.participantsCount > 0 && (
        <div className="p-3 bg-ohe-orange/5 border border-ohe-orange/20 rounded-lg mb-4">
          <p className="text-sm text-ohe-slate-900">
            <strong>{group.participantsCount} participant{group.participantsCount > 1 ? 's' : ''}</strong>{' '}
            {group.participantsCount > 1 ? 'seront détachés' : 'sera détaché'} de ce groupe.
          </p>
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex gap-3">
        <Button variant="secondary" fullWidth onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button variant="danger" fullWidth onClick={handleSubmit} loading={loading}>
          Supprimer définitivement
        </Button>
      </div>
    </Modal>
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

function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-ohe-slate-900/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">{children}</div>
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
    <h3 className="font-serif text-2xl text-ohe-slate-900 mb-3 leading-snug">{children}</h3>
  );
}
