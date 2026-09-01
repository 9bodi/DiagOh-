'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import GroupMultiSelector from './GroupMultiSelector';

interface Group {
  id: string;
  name: string;
}

interface CreateSupervisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: Group[];
}

export default function CreateSupervisorModal({
  isOpen,
  onClose,
  groups,
}: CreateSupervisorModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [localGroups, setLocalGroups] = useState<Group[]>(groups);
  const [loading, setLoading] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [magicLink, setMagicLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalGroups(groups);
    }
  }, [isOpen, groups]);

  if (!isOpen) return null;

  function resetForm() {
    setEmail('');
    setSelectedGroupIds([]);
    setLoading(false);
    setIsCreatingGroup(false);
    setMagicLink(null);
    setCopied(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleAddAnother() {
    resetForm();
  }

  function handleGroupCreated(newGroup: Group) {
    setLocalGroups((prev) =>
      [...prev, newGroup].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
    );
    router.refresh();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (selectedGroupIds.length === 0) {
      toast.error('Sélectionnez au moins un groupe.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/supervisors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          groupIds: selectedGroupIds,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de la création.');
        return;
      }
      toast.success(`Référent invité (${email})`);
      setMagicLink(data.magicLinkUrl);
      router.refresh();
    } catch (err) {
      setLoading(false);
      toast.error('Erreur réseau.');
    }
  }

  function handleCopy() {
    if (!magicLink) return;
    navigator.clipboard.writeText(magicLink);
    setCopied(true);
    toast.success('Lien copié dans le presse-papier');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 bg-ohe-slate-900/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {!magicLink ? (
          <>
            <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-ohe-orange mb-3">
              Nouveau référent
            </p>
            <h3 className="font-serif text-2xl text-ohe-slate-900 mb-3 leading-snug">
              Ajouter un référent
            </h3>
            <p className="text-sm text-ohe-slate-600 leading-relaxed mb-6">
              Le référent recevra un email d&apos;invitation pour créer son compte. Il pourra
              consulter uniquement les participants des groupes que vous lui attribuez.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="prenom.nom@organisation.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />

              <GroupMultiSelector
                groups={localGroups}
                selectedIds={selectedGroupIds}
                onChange={setSelectedGroupIds}
                onGroupCreated={handleGroupCreated}
                onCreatingChange={setIsCreatingGroup}
                disabled={loading}
              />

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={handleClose}
                  disabled={loading || isCreatingGroup}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  disabled={selectedGroupIds.length === 0 || isCreatingGroup}
                >
                  {isCreatingGroup ? 'Création en cours…' : 'Inviter'}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="text-3xl mb-3">✅</div>
            <h3 className="font-serif text-2xl text-ohe-slate-900 mb-3">
              Référent invité
            </h3>
            <p className="text-sm text-ohe-slate-600 mb-4">
              Un email a été envoyé à <strong>{email}</strong>. Vous pouvez aussi lui
              transmettre directement le lien :
            </p>

            <div className="p-3 bg-ohe-slate-50 border border-ohe-slate-200 rounded-lg mb-4">
              <p className="text-xs font-mono text-ohe-slate-700 break-all">{magicLink}</p>
            </div>

            <div className="flex gap-3 mb-4">
              <Button variant="secondary" fullWidth onClick={handleCopy}>
                {copied ? '✓ Copié !' : '📋 Copier le lien'}
              </Button>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={handleClose}>
                Fermer
              </Button>
              <Button variant="primary" fullWidth onClick={handleAddAnother}>
                Ajouter un autre
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
