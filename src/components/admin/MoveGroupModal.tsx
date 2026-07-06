'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import GroupSelector from './GroupSelector';

interface GroupOption {
  id: string;
  name: string;
}

interface MoveGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    groupId: string | null;
    groupName: string | null;
  } | null;
  groups: GroupOption[];
  userRole: string; // NOUVEAU
}

export default function MoveGroupModal({
  isOpen,
  onClose,
  user,
  groups,
  userRole,
}: MoveGroupModalProps) {
  const router = useRouter();
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [localGroups, setLocalGroups] = useState<GroupOption[]>(groups);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  const isSupervisor = userRole === 'SUPERVISOR';

  useEffect(() => {
    if (isOpen && user) {
      setSelectedGroupId(user.groupId ?? '');
      setError(null);
      setIsCreatingGroup(false);
      setLoading(false);
    }
  }, [isOpen, user]);

  useEffect(() => {
    setLocalGroups(groups);
  }, [groups]);

  if (!isOpen || !user) return null;

  const userName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
  const currentGroupId = user.groupId ?? '';
  const hasChanged = selectedGroupId !== currentGroupId;

  // Un superviseur ne peut pas valider une sélection "sans groupe"
  const isValidSelection = !(isSupervisor && selectedGroupId === '');

  function handleGroupCreated(newGroup: GroupOption) {
    setLocalGroups((prev) =>
      [...prev, newGroup].sort((a, b) => a.name.localeCompare(b.name))
    );
    router.refresh();
  }

  async function handleSubmit() {
    if (!user || !hasChanged || !isValidSelection) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users/move-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          groupId: selectedGroupId === '' ? null : selectedGroupId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur');
        setLoading(false);
        return;
      }
      const newGroup = localGroups.find((g) => g.id === selectedGroupId);
      toast.success(
        selectedGroupId === ''
          ? `${userName} détaché du groupe`
          : `${userName} déplacé vers « ${newGroup?.name} »`
      );
      setLoading(false);
      router.refresh();
      onClose();
    } catch (e) {
      setError('Erreur réseau');
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-ohe-slate-900/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-ohe-orange mb-3">
          ✱ Groupe du participant
        </p>
        <h3 className="font-serif text-2xl text-ohe-slate-900 mb-3 leading-snug">
          {userName}
        </h3>
        <p className="text-sm text-ohe-slate-600 leading-relaxed mb-6">
          {isSupervisor
            ? 'Choisissez un de vos groupes. Un participant doit obligatoirement être rattaché à un groupe que vous supervisez.'
            : "Choisissez le groupe auquel ce participant appartient. Un participant ne peut appartenir qu'à un seul groupe."}
        </p>

        <div className="mb-4">
          <GroupSelector
            key={user.id}
            groups={localGroups}
            value={selectedGroupId}
            onChange={setSelectedGroupId}
            onGroupCreated={handleGroupCreated}
            onCreatingChange={setIsCreatingGroup}
            label="Groupe"
            allowNone={!isSupervisor}
            allowCreate={!isSupervisor}
            disabled={loading}
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

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
            disabled={!hasChanged || !isValidSelection || isCreatingGroup}
          >
            {isCreatingGroup ? 'Création en cours…' : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </div>
  );
}
