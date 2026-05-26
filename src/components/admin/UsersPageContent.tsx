'use client';

import { useState } from 'react';
import UsersTable from './UsersTable';
import InviteUserModal from './InviteUserModal';
import Button from '@/components/ui/Button';

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

type FilterKey = 'all' | 'completed' | 'in_progress' | 'pending';

export default function UsersPageContent({ users, orgName, credits }: UsersPageContentProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [filter, setFilter] = useState<FilterKey>('all');

  const completed = users.filter(u => u.status === 'COMPLETED').length;
  const inProgress = users.filter(u => u.status === 'IN_PROGRESS').length;
  const pending = users.filter(u => !u.passwordCreated).length;

  const filteredUsers = users.filter(u => {
    if (filter === 'all') return true;
    if (filter === 'completed') return u.status === 'COMPLETED';
    if (filter === 'in_progress') return u.status === 'IN_PROGRESS';
    if (filter === 'pending') return !u.passwordCreated;
    return true;
  });

  return (
    <>
      {/* Hero */}
      <div className="flex items-end justify-between gap-6 flex-wrap mb-10">
        <div>
          <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-ohe-orange mb-4">
            ✱ Collaborateurs
          </p>
          <h1 className="font-serif font-normal text-4xl lg:text-[48px] leading-[1.05] tracking-tight text-ohe-slate-900">
            Vos <em className="italic text-ohe-blue">collaborateurs.</em>
          </h1>
          <p className="mt-4 text-base text-ohe-slate-600 leading-relaxed">
            {users.length} collaborateur{users.length > 1 ? 's' : ''} · {credits} crédit
            {credits > 1 ? 's' : ''} restant{credits > 1 ? 's' : ''} pour {orgName}.
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={() => setIsInviteOpen(true)}>
          + Inviter un collaborateur
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-5">
        <FilterTab active={filter === 'all'}         onClick={() => setFilter('all')}         label="Tous"          count={users.length} />
        <FilterTab active={filter === 'completed'}   onClick={() => setFilter('completed')}   label="Terminés"      count={completed}    accent="green" />
        <FilterTab active={filter === 'in_progress'} onClick={() => setFilter('in_progress')} label="En cours"      count={inProgress}   accent="orange" />
        <FilterTab active={filter === 'pending'}     onClick={() => setFilter('pending')}     label="En attente"    count={pending}      accent="slate" />
      </div>

      {/* Table dans un encart blanc */}
      <div className="bg-white rounded-2xl border border-ohe-slate-200/60 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_40px_-20px_rgba(15,23,42,0.12)] overflow-hidden">
        <UsersTable users={filteredUsers} credits={credits} />
      </div>

      <InviteUserModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
    </>
  );
}

// ============ Filter tab ============
function FilterTab({
  active,
  onClick,
  label,
  count,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  accent?: 'green' | 'orange' | 'slate';
}) {
  const dot = accent
    ? {
        green: 'bg-emerald-500',
        orange: 'bg-ohe-orange',
        slate: 'bg-ohe-slate-400',
      }[accent]
    : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all
        ${
          active
            ? 'bg-ohe-blue text-white shadow-sm'
            : 'bg-white border border-ohe-slate-200 text-ohe-slate-700 hover:border-ohe-slate-300 hover:bg-ohe-slate-50'
        }
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white/80' : dot}`} />
      )}
      <span>{label}</span>
      <span
        className={`
          inline-block px-1.5 py-0.5 rounded text-[10.5px] font-mono font-semibold
          ${active ? 'bg-white/20 text-white' : 'bg-ohe-slate-100 text-ohe-slate-600'}
        `}
      >
        {count}
      </span>
    </button>
  );
}
