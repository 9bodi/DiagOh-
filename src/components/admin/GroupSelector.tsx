'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface GroupOption {
  id: string;
  name: string;
}

interface GroupSelectorProps {
  groups: GroupOption[];
  value: string;
  onChange: (groupId: string) => void;
  onGroupCreated?: (group: GroupOption) => void;
  onCreatingChange?: (isCreating: boolean) => void;
  label?: string;
  allowNone?: boolean;
  disabled?: boolean;
  allowCreate?: boolean;
}

const CREATE_SENTINEL = '__create__';

export default function GroupSelector({
  groups,
  value,
  onChange,
  onGroupCreated,
  onCreatingChange,
  label = 'Groupe',
  allowNone = true,
  allowCreate = true, // 👈 NOUVEAU
  disabled = false,
}: GroupSelectorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [loading, setLoading] = useState(false);

  function setCreating(v: boolean) {
    setIsCreating(v);
    onCreatingChange?.(v);
  }

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value;
    if (v === CREATE_SENTINEL) {
      setCreating(true);
      setNewGroupName('');
    } else {
      setCreating(false);
      onChange(v);
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
      
console.log('🔍 POST /api/admin/groups response:', data);
setLoading(false);

      

      if (!res.ok) {
        toast.error(data.error ?? 'Erreur lors de la création du groupe.');
        return;
      }

      const raw = data.group ?? data;
const newGroup: GroupOption = { id: raw.id, name: raw.name };
      toast.success(`Groupe « ${newGroup.name} » créé`);

      onGroupCreated?.(newGroup);
      onChange(newGroup.id);
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
          (optionnel)
        </span>
      </label>

      {!isCreating ? (
       <select value={value} onChange={handleSelectChange} disabled={disabled} className="...">
  {allowNone && <option value="">— Sans groupe —</option>}
  {groups.map(g => (<option key={g.id} value={g.id}>{g.name}</option>))}
  {allowCreate && (
    <option value={CREATE_SENTINEL}>+ Créer un nouveau groupe…</option>
  )}
</select>


      ) : (
        <div className="flex gap-2">
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
            className="flex-1 px-4 py-2.5 border border-ohe-slate-200 rounded-lg focus:border-ohe-blue focus:ring-2 focus:ring-ohe-blue/20 outline-none text-sm text-ohe-slate-900 bg-white"
          />
          <button
            type="button"
            onClick={handleCreateGroup}
            disabled={loading || !newGroupName.trim()}
            className="px-4 py-2.5 rounded-lg bg-ohe-orange text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? '…' : 'Créer'}
          </button>
          <button
            type="button"
            onClick={handleCancelCreate}
            disabled={loading}
            className="px-3 py-2.5 rounded-lg border border-ohe-slate-200 text-sm text-ohe-slate-700 hover:bg-ohe-slate-50 disabled:opacity-50"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
