'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import UsersTable from './UsersTable';
import InviteUserModal from './InviteUserModal';

interface UserRow {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  passwordCreated: boolean;
  status: string;
  level: string | null;
  score: number | null;
  completedAt: string | null;
  sessionId: string | null;
}

interface UsersPageContentProps {
  users: UserRow[];
  orgName: string;
  credits: number;
}

export default function UsersPageContent({ users, orgName, credits }: UsersPageContentProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  return (
    <>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-ohe-slate-900 mb-1">Collaborateurs</h1>
          <p className="text-ohe-slate-600">
            {users.length} collaborateur{users.length > 1 ? 's' : ''} · {credits} crédit
            {credits > 1 ? 's' : ''} restant{credits > 1 ? 's' : ''} ({orgName})
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsInviteOpen(true)}>
          + Inviter un collaborateur
        </Button>
      </div>

      <Card padding="none">
        <UsersTable users={users} credits={credits} />

      </Card>

      <InviteUserModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
    </>
  );
}
