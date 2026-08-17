'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import GroupSelector from './GroupSelector';

interface GroupOption {
  id: string;
  name: string;
}

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups?: GroupOption[];
  userRole: string;
}

export default function InviteUserModal({
  isOpen,
  onClose,
  groups = [],
  userRole,
}: InviteUserModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [groupId, setGroupId] = useState<string>('');
  const [localGroups, setLocalGroups] = useState<GroupOption[]>(groups);
  const [loading, setLoading] = useState(false);
  const [magicLink, setMagicLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isSupervisor = userRole === 'SUPERVISOR';

  useEffect(() => {
    setLocalGroups(groups);
  }, [groups]);

  useEffect(() => {
    if (isOpen && isSupervisor && groups.length === 1 && !groupId) {
      setGroupId(groups[0].id);
    }
  }, [isOpen, isSupervisor, groups, groupId]);

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (isSupervisor && !groupId) {
      toast.error('Vous devez sélectionner un de vos groupes.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/invite-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, groupId: groupId || null }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        toast.error(data.error ?? "Erreur lors de l'invitation.");
        return;
      }

      toast.success(`Invitation envoyée à ${email}`);
      setMagicLink(data.magicLinkUrl);
      router.refresh();
    } catch (e) {
      console.error(e);
      setLoading(false);
      toast.error('Erreur réseau. Réessayez.');
    }
  }

  function handleCopy() {
    if (!magicLink) return;
    navigator.clipboard.writeText(magicLink);
    setCopied(true);
    toast.success('Lien copié dans le presse-papier');
    setTimeout(() => setCopied(false), 2000);
  }

  function handleClose() {
    setEmail('');
    setGroupId('');
    setMagicLink(null);
    setCopied(false);
    onClose();
  }

  function handleInviteAnother() {
    setEmail('');
    setGroupId(isSupervisor && groups.length === 1 ? groups[0].id : '');
    setMagicLink(null);
    setCopied(false);
  }

  function handleGroupCreated(newGroup: GroupOption) {
    setLocalGroups((prev) => [...prev, newGroup].sort((a, b) => a.name.localeCompare(b.name)));
    router.refresh();
  }

  return (
    <div className="fixed inset-0 bg-ohe-slate-900/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {!magicLink ? (
          <>
            <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-ohe-orange mb-3">
              ✱ Nouveau participant
            </p>
            <h3 className="font-serif text-2xl text-ohe-slate-900 mb-3 leading-snug">
              Inviter un <em className="italic text-ohe-blue">participant</em>
            </h3>
            <p className="text-sm text-ohe-slate-600 leading-relaxed mb-6">
              {isSupervisor
                ? "Saisissez son email et choisissez un de vos groupes. Un lien d'activation lui sera envoyé."
                : "Saisissez son adresse email professionnelle. Un lien d'activation lui sera envoyé automatiquement."}
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

              <GroupSelector
                groups={localGroups}
                value={groupId}
                onChange={setGroupId}
                onGroupCreated={handleGroupCreated}
                allowNone={!isSupervisor}
                allowCreate={!isSupervisor}
              />

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" fullWidth onClick={handleClose}>
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  disabled={isSupervisor && !groupId}
                >
                  Inviter
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <p className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-ohe-orange mb-3">
              ✱ Invitation envoyée
            </p>
            <h3 className="font-serif text-2xl text-ohe-slate-900 mb-3 leading-snug">
              C&apos;est <em className="italic text-ohe-blue">envoyé</em>
            </h3>
            <p className="text-sm text-ohe-slate-600 leading-relaxed mb-4">
              Un email a été envoyé à <strong className="text-ohe-slate-900">{email}</strong>. Vous pouvez aussi lui transmettre directement le lien :
            </p>

            <div className="p-3 bg-ohe-slate-50 border border-ohe-slate-200 rounded-lg mb-4">
              <p className="text-xs font-mono text-ohe-slate-700 break-all">{magicLink}</p>
            </div>

            <div className="mb-4">
              <Button variant="secondary" fullWidth onClick={handleCopy}>
                {copied ? 'Lien copié' : 'Copier le lien'}
              </Button>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={handleClose}>
                Fermer
              </Button>
              <Button variant="primary" fullWidth onClick={handleInviteAnother}>
                Inviter un autre
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
