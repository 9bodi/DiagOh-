'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import GroupMultiSelector from './GroupMultiSelector';

interface Group {
  id: string;
  name: string;
}

interface Supervisor {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  supervisedGroups: Group[];
}

interface EditSupervisorGroupsModalProps {
  isOpen: boolean;
  onClose: () => void;
  supervisor: Supervisor | null;
  groups: Group[];
}

export default function EditSupervisorGroupsModal({
  isOpen,
  onClose,
  supervisor,
  groups,
}: EditSupervisorGroupsModalProps) {
  const router = useRouter();
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [localGroups, setLocalGroups] = useState<Group[]>(groups);
  const [loading, setLoading] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  useEffect(() => {
    if (isOpen && supervisor) {
      setSelectedGroupIds(supervisor.supervisedGroups.map((g) => g.id));
      setLocalGroups(groups);
      setLoading(false);
      setIsCreatingGroup(false);
    }
  }, [isOpen, supervisor, groups]);

  if (!isOpen || !supervisor) return null;

  const name =
    [supervisor.firstName, supervisor.lastName].filter(Boolean).join(' ') || supervisor.email;

  function handleGroupCreated(newGroup: Group) {
    setLocalGroups((prev) =>
      [...prev, newGroup].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
    );
    router.refresh();
  }

  async function handleSubmit() {
    if (selectedGroupIds.length === 0) {
      toast.error('Sélectionnez au moins un groupe.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/supervisors/${supervisor!.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupIds: selectedGroupIds }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        toast.error(data.error || 'Erreur');
        return;
      }
      toast.success(`Groupes mis à jour pour ${name}`);
      router.refresh();
      onClose();
    } catch (e) {
      setLoading(false);
      toast.error('Erreur réseau');
    }
  }

  return (
    <div className="fixed inset-0 bg-ohe-slate-900/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-ohe-orange mb-3">
          ✱ Groupes attribués
        </p>
        <h3 className="font-serif text-2xl text-ohe-slate-900 mb-3 leading-snug">{name}</h3>
        <p className="text-sm text-ohe-slate-600 mb-6">
          Choisissez les groupes que ce superviseur peut consulter.
        </p>

        <div className="mb-4">
          <GroupMultiSelector
            key={supervisor.id}
            groups={localGroups}
            selectedIds={selectedGroupIds}
            onChange={setSelectedGroupIds}
            onGroupCreated={handleGroupCreated}
            onCreatingChange={setIsCreatingGroup}
            label="Groupes"
            disabled={loading}
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={onClose}
            disabled={loading || isCreatingGroup}
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={handleSubmit}
            loading={loading}
            disabled={selectedGroupIds.length === 0 || isCreatingGroup}
          >
            {isCreatingGroup ? 'Création en cours…' : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </div>
  );
}
