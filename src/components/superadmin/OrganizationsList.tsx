'use client';

import { useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creditOrg, setCreditOrg] = useState<Org | null>(null);

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
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-ohe-blue">{org.credits}</div>
                    <div className="text-xs text-ohe-slate-500">crédits</div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => setCreditOrg(org)}>
                    + Crédits
                  </Button>
                  <Link href={`/organizations/${org.id}`}>
                    <Button variant="ghost" size="sm">Détails →</Button>
                  </Link>
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
    </>
  );
}
