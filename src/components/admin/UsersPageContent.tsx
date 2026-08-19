'use client';

import { useState, useMemo } from 'react';
import UsersTable from './UsersTable';
import InviteUserModal from './InviteUserModal';
import BulkActivateBar from './BulkActivateBar';
import ActivateTestsModal from './ActivateTestsModal';
import UpdateDeadlineModal from './UpdateDeadlineModal';
import MoveGroupModal from './MoveGroupModal';
import Button from '@/components/ui/Button';
import ImportUsersModal from './ImportUsersModal';
import {
  sortUsers,
  filterUsersBySearch,
  getEffectiveTestStatus,
  type UserRow,
  type SortState,
  type ColumnKey,
} from './table/userTableColumns';

import { exportUsersToExcel } from '@/lib/exportToExcel';
import { exportUsersToPdf } from '@/lib/exportToPdf';


interface UsersPageContentProps {
  users: UserRow[];
  groups: { id: string; name: string }[];
  orgName: string;
  credits: number;
  userRole: string;
}

type TestFilterKey = 'all' | 'pending' | 'ready' | 'in_progress' | 'completed' | 'expired';

export default function UsersPageContent({
  users, orgName, credits, groups, userRole,
}: UsersPageContentProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [testFilter, setTestFilter] = useState<TestFilterKey>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isActivateOpen, setIsActivateOpen] = useState(false);
  const [deadlineUser, setDeadlineUser] = useState<UserRow | null>(null);
  const [moveUser, setMoveUser] = useState<UserRow | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortState | null>(null);

  const testCounts = useMemo(() => {
    const effective = users.map((u) => getEffectiveTestStatus(u));
    return {
      all: users.length,
      pending: effective.filter((s) => s === 'PENDING').length,
      ready: effective.filter((s) => s === 'READY_TO_START').length,
      in_progress: effective.filter((s) => s === 'IN_PROGRESS').length,
      completed: effective.filter((s) => s === 'COMPLETED').length,
      expired: effective.filter((s) => s === 'EXPIRED').length,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    let list = users;

    // 1) Filtre statut test (utilise le statut effectif)
    list = list.filter((u) => {
      const eff = getEffectiveTestStatus(u);
      if (testFilter === 'all') return true;
      if (testFilter === 'pending' && eff !== 'PENDING') return false;
      if (testFilter === 'ready' && eff !== 'READY_TO_START') return false;
      if (testFilter === 'in_progress' && eff !== 'IN_PROGRESS') return false;
      if (testFilter === 'completed' && eff !== 'COMPLETED') return false;
      if (testFilter === 'expired' && eff !== 'EXPIRED') return false;
      return true;
    });

    // 2) Filtre groupe
    list = list.filter((u) => {
      if (groupFilter === 'none' && u.groupId !== null) return false;
      if (groupFilter !== 'all' && groupFilter !== 'none' && u.groupId !== groupFilter) return false;
      return true;
    });

    // 3) Recherche
    list = filterUsersBySearch(list, search);

    // 4) Tri (ordre par défaut si sort === null)
    list = sortUsers(list, sort);

    return list;
  }, [users, testFilter, groupFilter, search, sort]);

  const visibleIds = new Set(filteredUsers.map((u) => u.id));
  const cleanSelectedIds = selectedIds.filter((id) => visibleIds.has(id));

  const hasActiveFilters =
    testFilter !== 'all' || groupFilter !== 'all' || search !== '';

  function resetFilters() {
    setTestFilter('all');
    setGroupFilter('all');
    setSearch('');
    setSort(null);
  }

  function toggleSelect(userId: string) {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }

  function toggleSelectAll() {
    const selectableIds = filteredUsers
      .filter((u) => u.status === 'PENDING')
      .map((u) => u.id);
    const allSelected = selectableIds.every((id) => cleanSelectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !selectableIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...selectableIds])));
    }
  }

  function toggleSort(key: ColumnKey) {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  }

  return (
    <>
      {/* Hero */}
      <div className="flex items-end justify-between gap-6 flex-wrap mb-10">
        <div>
          <h1 className="font-serif font-normal text-4xl lg:text-[48px] leading-[1.05] tracking-tight text-ohe-slate-900">
            Vos <em className="italic text-ohe-blue">participants.</em>
          </h1>
          <p className="mt-4 text-base text-ohe-slate-600 leading-relaxed">
            {users.length} participant{users.length > 1 ? 's' : ''} · {credits} crédit{credits > 1 ? 's' : ''} restant{credits > 1 ? 's' : ''} pour {orgName}.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {userRole !== 'SUPERVISOR' && (
            <Button variant="secondary" size="lg" onClick={() => setIsImportOpen(true)}>
              Importer
            </Button>
          )}
          <Button variant="primary" size="lg" onClick={() => setIsInviteOpen(true)}>
            + Inviter un participant
          </Button>
        </div>
      </div>

      {/* Recherche + Filtre groupe + Export */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ohe-slate-400 pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un participant (nom, email)…"
            className="w-full pl-9 pr-3 py-2 border border-ohe-slate-200 rounded-lg bg-white text-sm text-ohe-slate-900 placeholder:text-ohe-slate-400 focus:border-ohe-blue focus:ring-2 focus:ring-ohe-blue/20 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-ohe-slate-600 hover:text-ohe-blue transition-colors"
              title="Réinitialiser tous les filtres"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
              Réinitialiser
            </button>
          )}

          {groups.length > 0 && (
            <>
              <label htmlFor="group-filter" className="text-xs font-mono uppercase tracking-[0.12em] text-ohe-slate-600">
                Groupe :
              </label>
              <select
                id="group-filter"
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="px-3 py-1.5 border border-ohe-slate-200 rounded-lg bg-white text-sm text-ohe-slate-900 focus:border-ohe-blue focus:ring-2 focus:ring-ohe-blue/20 outline-none"
              >
                <option value="all">Tous les groupes</option>
                <option value="none">— Sans groupe —</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </>
          )}

          <button
            type="button"
            onClick={() => exportUsersToExcel(filteredUsers, orgName)}
            disabled={filteredUsers.length === 0}
            className="inline-flex items-center gap-2 px-3 py-1.5 border border-ohe-slate-200 rounded-lg bg-white text-sm font-medium text-ohe-slate-700 hover:border-ohe-slate-300 hover:bg-ohe-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Exporter la vue filtrée au format Excel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
            </svg>
            Excel
          </button>

          <button
            type="button"
            onClick={() => {
              const testLabels: Record<string, string> = {
                all: '', pending: 'En attente', ready: 'Démarré', in_progress: 'En cours',
                completed: 'Terminé', expired: 'Hors délais',
              };
              const groupLabel = groupFilter === 'all'
                ? ''
                : groupFilter === 'none'
                  ? 'Sans groupe'
                  : groups.find((g) => g.id === groupFilter)?.name ?? '';
              exportUsersToPdf(filteredUsers, orgName, {
                status: testLabels[testFilter] || undefined,
                group: groupLabel || undefined,
                search: search || undefined,
              });
            }}
            disabled={filteredUsers.length === 0}
            className="inline-flex items-center gap-2 px-3 py-1.5 border border-ohe-slate-200 rounded-lg bg-white text-sm font-medium text-ohe-slate-700 hover:border-ohe-slate-300 hover:bg-ohe-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Exporter la vue filtrée au format PDF"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PDF
          </button>
        </div>
      </div>

      {/* Filtres Statut test */}
      <div className="mb-5">
        <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-ohe-slate-500 mb-2">
          Statut test
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterTab active={testFilter === 'all'} onClick={() => setTestFilter('all')} label="Tous" count={testCounts.all} />
          <FilterTab active={testFilter === 'pending'} onClick={() => setTestFilter('pending')} label="En attente" count={testCounts.pending} accent="slate" />
          <FilterTab active={testFilter === 'ready'} onClick={() => setTestFilter('ready')} label="Démarré" count={testCounts.ready} accent="blue" />
          <FilterTab active={testFilter === 'in_progress'} onClick={() => setTestFilter('in_progress')} label="En cours" count={testCounts.in_progress} accent="orange" />
          <FilterTab active={testFilter === 'completed'} onClick={() => setTestFilter('completed')} label="Terminé" count={testCounts.completed} accent="green" />
          {testCounts.expired > 0 && (
            <FilterTab active={testFilter === 'expired'} onClick={() => setTestFilter('expired')} label="Hors délais" count={testCounts.expired} accent="red" />
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-ohe-slate-200/60 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_40px_-20px_rgba(15,23,42,0.12)] overflow-hidden">
        <UsersTable
          users={filteredUsers}
          filter={testFilter}
          credits={credits}
          selectedIds={cleanSelectedIds}
          sort={sort}
          onToggleSort={toggleSort}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onEditDeadline={(u) => setDeadlineUser(u)}
          onMoveGroup={(u) => setMoveUser(u)}
        />
      </div>

      {/* Bandeau */}
      <BulkActivateBar
        count={cleanSelectedIds.length}
        onActivate={() => setIsActivateOpen(true)}
        onClear={() => setSelectedIds([])}
      />

      {/* Modales */}
      <InviteUserModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        groups={groups}
        userRole={userRole}
      />
      <ActivateTestsModal
        isOpen={isActivateOpen}
        onClose={() => setIsActivateOpen(false)}
        userIds={cleanSelectedIds}
        userCount={cleanSelectedIds.length}
        onSuccess={() => setSelectedIds([])}
      />
      <UpdateDeadlineModal
        isOpen={deadlineUser !== null}
        onClose={() => setDeadlineUser(null)}
        userId={deadlineUser?.id ?? ''}
        userName={
          deadlineUser
            ? [deadlineUser.firstName, deadlineUser.lastName].filter(Boolean).join(' ') || deadlineUser.email
            : ''
        }
        currentDeadline={deadlineUser?.deadline ? new Date(deadlineUser.deadline) : null}
      />
      <MoveGroupModal
        isOpen={moveUser !== null}
        onClose={() => setMoveUser(null)}
        user={moveUser}
        groups={groups}
        userRole={userRole}
      />
      <ImportUsersModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
    </>
  );
}

function FilterTab({
  active, onClick, label, count, accent,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  accent?: 'green' | 'orange' | 'slate' | 'blue' | 'red';
}) {
  const dot = accent
    ? { green: 'bg-emerald-500', orange: 'bg-ohe-orange', slate: 'bg-ohe-slate-400', blue: 'bg-ohe-blue', red: 'bg-red-500' }[accent]
    : null;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-ohe-blue text-white shadow-sm'
          : 'bg-white border border-ohe-slate-200 text-ohe-slate-700 hover:border-ohe-slate-300 hover:bg-ohe-slate-50'
      }`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white/80' : dot}`} />}
      <span>{label}</span>
      <span className={`inline-block px-1.5 py-0.5 rounded text-[10.5px] font-mono font-semibold ${
        active ? 'bg-white/20 text-white' : 'bg-ohe-slate-100 text-ohe-slate-600'
      }`}>
        {count}
      </span>
    </button>
  );
}
