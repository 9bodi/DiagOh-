'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import CreateOrganizationModal from './CreateOrganizationModal';
import AddCreditsModal from './AddCreditsModal';

interface Org {
  id: string;
  name: string;
  credits: number;
  adminsCount: number;
  usersCount: number;
  completedTests: number;
  createdAt: Date;
}

export default function OrganizationsList({ organizations }: { organizations: Org[] }) {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creditOrg, setCreditOrg] = useState<Org | null>(null);
  const [deleteOrg, setDeleteOrg] = useState<Org | null>(null);
  const [confirmName, setConfirmName] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

  async function handleDelete() {
    if (!deleteOrg) return;

    setDeleting(true);
    try {
      const res = await fetch('/api/superadmin/delete-organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: deleteOrg.id }),
      });
      const data = await res.json();
      setDeleting(false);

      if (!res.ok) {
        toast.error(data.error ?? 'Erreur lors de la suppression.');
        return;
      }

      toast.success(`Organisation "${deleteOrg.name}" supprimée`);
      setDeleteOrg(null);
      setConfirmName('');
      router.refresh();
    } catch (e) {
      console.error(e);
      setDeleting(false);
      toast.error('Erreur réseau.');
    }
  }

  function closeDeleteModal() {
    setDeleteOrg(null);
    setConfirmName('');
  }

  async function handleImpersonate(org: Org) {
  setImpersonatingId(org.id);
  try {
    const res = await fetch('/api/superadmin/impersonate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organizationId: org.id }),
    });
    const data = await res.json();

    if (!res.ok) {
      setImpersonatingId(null);
      toast.error(data.error ?? 'Erreur lors de l\'accès à l\'organisation.');
      return;
    }

    toast.success(`Connexion à ${org.name}`);
    // Navigation dans le même onglet
    window.location.href = data.redirectUrl ?? '/dashboard';
  } catch (e) {
    console.error(e);
    setImpersonatingId(null);
    toast.error('Erreur réseau.');
  }
}


  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ohe-slate-900">Organisations</h1>
          <p className="text-sm text-ohe-slate-600 mt-1">
            {organizations.length} organisation{organizations.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          + Créer une organisation
        </Button>
      </div>

      {organizations.length === 0 ? (
        <Card>
          <p className="text-center text-ohe-slate-600 py-8">
            Aucune organisation. Créez la première !
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {organizations.map((org) => (
            <Card key={org.id}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-ohe-slate-900">{org.name}</h2>
                  <div className="flex gap-6 mt-2 text-sm text-ohe-slate-600">
                    <span>👤 {org.adminsCount} admin{org.adminsCount > 1 ? 's' : ''}</span>
                    <span>👥 {org.usersCount} collaborateur{org.usersCount > 1 ? 's' : ''}</span>
                    <span>✅ {org.completedTests} test{org.completedTests > 1 ? 's' : ''} terminé{org.completedTests > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-ohe-blue">{org.credits}</div>
                    <div className="text-xs text-ohe-slate-500">crédits</div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => setCreditOrg(org)}>
                    + Crédits
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleImpersonate(org)}
                    loading={impersonatingId === org.id}
                    disabled={impersonatingId !== null}
                  >
                    Accéder
                  </Button>
                  <Link href={`/organizations/${org.id}`}>
                    <Button variant="ghost" size="sm">Détails →</Button>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleteOrg(org)}
                    className="text-xs font-medium text-ohe-slate-500 hover:text-red-600 transition-colors px-2 py-1"
                    title="Supprimer l'organisation"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateOrganizationModal onClose={() => setShowCreateModal(false)} />
      )}
      {creditOrg && (
        <AddCreditsModal
          organization={creditOrg}
          onClose={() => setCreditOrg(null)}
        />
      )}

      {/* Modal Delete */}
      {deleteOrg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <div className="text-3xl mb-3">🗑️</div>
            <h3 className="text-xl font-bold text-ohe-slate-900 mb-2">
              Supprimer l&apos;organisation &quot;{deleteOrg.name}&quot;
            </h3>
            <p className="text-sm text-ohe-slate-600 mb-4">
              Cette action est <strong>définitive</strong> et supprimera :
            </p>
            <ul className="text-sm text-ohe-slate-600 mb-4 ml-4 list-disc">
              <li>{deleteOrg.adminsCount} admin{deleteOrg.adminsCount > 1 ? 's' : ''}</li>
              <li>{deleteOrg.usersCount} collaborateur{deleteOrg.usersCount > 1 ? 's' : ''}</li>
              <li>Tous les tests et résultats associés</li>
              <li>L&apos;historique des transactions de crédits</li>
            </ul>
            <p className="text-sm text-ohe-slate-700 mb-3">
              Pour confirmer, saisissez exactement <strong>{deleteOrg.name}</strong> :
            </p>
            <Input
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={deleteOrg.name}
              autoFocus
            />

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" fullWidth onClick={closeDeleteModal} disabled={deleting}>
                Annuler
              </Button>
              <Button
                variant="danger"
                fullWidth
                onClick={handleDelete}
                loading={deleting}
                disabled={confirmName !== deleteOrg.name}
              >
                Supprimer définitivement
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
