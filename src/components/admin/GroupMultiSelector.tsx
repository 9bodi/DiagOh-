'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface GroupOption {
  id: string;
  name: string;
}

interface GroupMultiSelectorProps {
  groups: GroupOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onGroupCreated?: (group: GroupOption) => void;
  onCreatingChange?: (isCreating: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export default function GroupMultiSelector({
  groups,
  selectedIds,
  onChange,
  onGroupCreated,
  onCreatingChange,
  label = 'Groupes attribués',
  disabled = false,
}: GroupMultiSelectorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [loading, setLoading] = useState(false);

  function setCreating(v: boolean) {
    setIsCreating(v);
    onCreatingChange?.(v);
  }

  function toggleGroup(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((g) => g !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  async function handleCreateGroup() {
    const name = newGroupName.trim();
    if (!name) {
      toast.error('Le nom du groupe est requis.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        toast.error(data.error ?? 'Erreur lors de la création du groupe.');
        return;
      }

      const raw = data.group ?? data;
      if (!raw?.id || !raw?.name) {
        toast.error('Réponse du serveur invalide.');
        return;
      }
      const newGroup: GroupOption = { id: raw.id, name: raw.name };
      toast.success(`Groupe « ${newGroup.name} » créé`);

      onGroupCreated?.(newGroup);
      onChange([...selectedIds, newGroup.id]);
      setCreating(false);
      setNewGroupName('');
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error('Erreur réseau.');
    }
  }

  function handleCancelCreate() {
    setCreating(false);
    setNewGroupName('');
  }

  return (
    <div>
      <label className="block text-xs font-mono uppercase tracking-[0.12em] text-ohe-slate-700 mb-2">
        {label}{' '}
        <span className="text-ohe-slate-400 normal-case tracking-normal font-sans">
          (au moins un)
        </span>
      </label>

      {groups.length === 0 && !isCreating ? (
        <div className="p-3 bg-ohe-slate-50 border border-ohe-slate-200 rounded-lg text-sm text-ohe-slate-600 mb-2">
          Aucun groupe disponible. Créez-en un ci-dessous.
        </div>
      ) : (
        <div className="border border-ohe-slate-200 rounded-lg max-h-40 overflow-y-auto mb-2">
          {groups.map((g) => (
            <label
              key={g.id}
              className="flex items-center gap-3 px-3 py-2 hover:bg-ohe-slate-50 cursor-pointer border-b border-ohe-slate-100 last:border-0"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(g.id)}
                onChange={() => toggleGroup(g.id)}
                disabled={disabled}
                className="w-4 h-4 rounded border-ohe-slate-300 text-ohe-blue focus:ring-ohe-blue"
              />
              <span className="text-sm text-ohe-slate-900">{g.name}</span>
            </label>
          ))}
        </div>
      )}

      {!isCreating ? (
        <button
          type="button"
          onClick={() => {
            setCreating(true);
            setNewGroupName('');
          }}
          disabled={disabled}
          className="text-xs text-ohe-blue hover:underline disabled:opacity-50"
        >
          + Créer un nouveau groupe
        </button>
      ) : (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Nom du groupe"
            autoFocus
            maxLength={60}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreateGroup();
              } else if (e.key === 'Escape') {
                handleCancelCreate();
              }
            }}
            className="flex-1 px-4 py-2 border border-ohe-slate-200 rounded-lg focus:border-ohe-blue focus:ring-2 focus:ring-ohe-blue/20 outline-none text-sm text-ohe-slate-900 bg-white"
          />
          <button
            type="button"
            onClick={handleCreateGroup}
            disabled={loading || !newGroupName.trim()}
            className="px-4 py-2 rounded-lg bg-ohe-orange text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? '…' : 'Créer'}
          </button>
          <button
            type="button"
            onClick={handleCancelCreate}
            disabled={loading}
            className="px-3 py-2 rounded-lg border border-ohe-slate-200 text-sm text-ohe-slate-700 hover:bg-ohe-slate-50 disabled:opacity-50"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
