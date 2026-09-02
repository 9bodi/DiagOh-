'use client';

import UserActions from './UserActions';
import {
  getVisibleColumns,
  getAdminStatus,
  getEffectiveTestStatus,
  type UserRow,
  type ColumnKey,
  type SortState,
} from './table/userTableColumns';


export type { UserRow };

// Badges Statut candidat (Importé / Inscrit)
const ADMIN_STATUS_BADGE: Record<string, { label: string; className: string }> = {
  IMPORTED:   { label: 'Importé', className: 'bg-ohe-slate-100 text-ohe-slate-600' },
  REGISTERED: { label: 'Inscrit', className: 'bg-emerald-50 text-emerald-700' },
};

// Badges Statut test (En attente / Démarré / En cours / Terminé / Hors délais)
const TEST_STATUS_BADGE: Record<string, { label: string; className: string }> = {
  PENDING:        { label: 'En attente',   className: 'bg-ohe-slate-100 text-ohe-slate-600' },
  READY_TO_START: { label: 'Démarré',      className: 'bg-ohe-blue/10 text-ohe-blue' },
  IN_PROGRESS:    { label: 'En cours',     className: 'bg-ohe-orange/10 text-ohe-orange' },
  COMPLETED:      { label: 'Terminé',      className: 'bg-emerald-50 text-emerald-700' },
  EXPIRED:        { label: 'Hors délais',  className: 'bg-red-50 text-red-700' },
  RESET:          { label: 'Réinitialisé', className: 'bg-ohe-slate-100 text-ohe-slate-600' },
};

const LEVEL_BADGE: Record<string, string> = {
  A:  'bg-red-50 text-red-700',
  B1: 'bg-ohe-orange/10 text-ohe-orange',
  B2: 'bg-ohe-blue/10 text-ohe-blue',
  C:  'bg-emerald-50 text-emerald-700',
};

interface UsersTableProps {
  users: UserRow[];
  filter: string;
  credits: number;
  selectedIds: string[];
  sort: SortState | null;
  onToggleSort: (key: ColumnKey) => void;
  onToggleSelect: (userId: string) => void;
  onToggleSelectAll: () => void;
  onEditDeadline: (user: UserRow) => void;
  onMoveGroup: (user: UserRow) => void;
}

export default function UsersTable({
  users, filter, credits, selectedIds, sort,
  onToggleSort, onToggleSelect, onToggleSelectAll, onEditDeadline, onMoveGroup,
}: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="p-16 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-ohe-slate-50 border border-ohe-slate-200 flex items-center justify-center">
          <svg className="w-6 h-6 text-ohe-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-base font-semibold text-ohe-slate-900 mb-2">
          Aucun participant dans cette catégorie.
        </p>
        <p className="text-sm text-ohe-slate-600">
          Cliquez sur « Inviter un participant » pour démarrer.
        </p>
      </div>
    );
  }

  const visibleColumns = getVisibleColumns(filter, users);

  const selectableUsers = users.filter((u) => u.status === 'PENDING');
  const allSelectableSelected =
    selectableUsers.length > 0 &&
    selectableUsers.every((u) => selectedIds.includes(u.id));
  const someSelected = selectedIds.length > 0 && !allSelectableSelected;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-ohe-slate-200 bg-ohe-slate-50/60">
            {visibleColumns.map((col) => {
              const isSortable = !!col.sortable;
              const isActiveSort = sort?.key === col.key;
              const alignClass =
                col.align === 'right' ? 'text-right' :
                col.align === 'center' ? 'text-center' : 'text-left';
              return (
                <th
                  key={col.key}
                  className={`px-6 py-3 font-mono text-[10px] font-semibold text-ohe-slate-500 tracking-[0.14em] uppercase ${alignClass} ${col.width ?? ''}`}
                >
                  {col.key === 'select' ? (
                    <Checkbox
                      checked={allSelectableSelected}
                      indeterminate={someSelected}
                      onChange={onToggleSelectAll}
                      disabled={selectableUsers.length === 0}
                      ariaLabel="Tout sélectionner"
                    />
                  ) : col.key === 'actions' ? (
                    ''
                  ) : isSortable ? (
                    <button
                      type="button"
                      onClick={() => onToggleSort(col.key)}
                      className={`inline-flex items-center gap-1 hover:text-ohe-slate-900 transition-colors ${
                        isActiveSort ? 'text-ohe-blue' : ''
                      }`}
                    >
                      <span>{col.label}</span>
                      <SortIcon direction={isActiveSort ? sort!.direction : null} />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isSelected = selectedIds.includes(u.id);
            return (
              <tr
                key={u.id}
                className={`border-b border-ohe-slate-100 last:border-b-0 transition-colors ${
                  isSelected ? 'bg-ohe-blue/[0.04]' : 'hover:bg-ohe-slate-50/40'
                }`}
              >
                {visibleColumns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-6 py-4 ${
                      col.align === 'center' ? 'text-center' :
                      col.align === 'right'  ? 'text-right'  : ''
                    }`}
                  >
                    {renderCell(col.key, u, {
                      credits,
                      selectedIds,
                      onToggleSelect,
                      onEditDeadline,
                      onMoveGroup,
                    })}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface CellContext {
  credits: number;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onEditDeadline: (u: UserRow) => void;
  onMoveGroup: (u: UserRow) => void;
}

function renderCell(key: ColumnKey, u: UserRow, ctx: CellContext) {
  const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ') || '—';
  const userNameForActions = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
  const isSelectable = u.status === 'PENDING';
  const isSelected = ctx.selectedIds.includes(u.id);
  const canEditDeadline =
    u.status === 'READY_TO_START' || u.status === 'IN_PROGRESS' || u.status === 'EXPIRED';

  switch (key) {
    case 'select':
      return (
        <Checkbox
          checked={isSelected}
          onChange={() => ctx.onToggleSelect(u.id)}
          disabled={!isSelectable}
          ariaLabel={`Sélectionner ${fullName}`}
        />
      );

    case 'participant':
      return (
        <div className="min-w-0">
          <p className="text-sm font-medium text-ohe-slate-900 truncate">{fullName}</p>
          <p className="text-xs text-ohe-slate-600 truncate">{u.email}</p>
        </div>
      );

    case 'group':
      return (
        <button
          type="button"
          onClick={() => ctx.onMoveGroup(u)}
          className="inline-flex items-center gap-1.5 text-sm text-ohe-slate-700 hover:text-ohe-blue transition-colors"
          title="Modifier le groupe"
        >
          {u.groupName ? (
            <span className="px-2 py-0.5 bg-ohe-slate-100 hover:bg-ohe-blue/[0.08] rounded-md text-[11px] font-medium transition-colors">
              {u.groupName}
            </span>
          ) : (
            <span className="text-[11px] text-ohe-slate-400 hover:text-ohe-blue italic">
              Assigner…
            </span>
          )}
        </button>
      );

    case 'adminStatus': {
      const admin = getAdminStatus(u);
      const info = ADMIN_STATUS_BADGE[admin];
      return (
        <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium ${info.className}`}>
          {info.label}
        </span>
      );
    }

    case 'testStatus': {
  const effectiveStatus = getEffectiveTestStatus(u);
  const info = TEST_STATUS_BADGE[effectiveStatus] ?? TEST_STATUS_BADGE.PENDING;
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium ${info.className}`}>
      {info.label}
    </span>
  );
}


    case 'deadline':
      return u.deadline ? (
        <button
          type="button"
          onClick={() => canEditDeadline && ctx.onEditDeadline(u)}
          disabled={!canEditDeadline}
          className={`text-sm ${
            canEditDeadline
              ? 'text-ohe-slate-700 hover:text-ohe-blue hover:underline cursor-pointer'
              : 'text-ohe-slate-500 cursor-default'
          }`}
        >
          {formatDeadline(u.deadline)}
        </button>
      ) : (
        <span className="text-sm text-ohe-slate-300">—</span>
      );

    case 'level':
      return u.level ? (
        <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${LEVEL_BADGE[u.level] ?? ''}`}>
          {u.level}
        </span>
      ) : (
        <span className="text-sm text-ohe-slate-300">—</span>
      );

    case 'score':
      return u.score !== null ? (
                <span className="font-mono text-sm font-semibold text-ohe-slate-900">
          {Math.round((u.score / 6) * 100)} %
        </span>

      ) : (
        <span className="text-sm text-ohe-slate-300">—</span>
      );

    case 'quadrant':
      return u.status === 'COMPLETED' && u.quadrant ? (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ohe-blue/10 text-ohe-blue font-semibold text-sm">
          {u.quadrant}
        </span>
      ) : (
        <span className="text-sm text-ohe-slate-300">—</span>
      );

    case 'completedAt':
      return u.completedAt ? (
        <span className="text-sm text-ohe-slate-600">
          {new Date(u.completedAt).toLocaleDateString('fr-FR', {
            day: '2-digit', month: 'short', year: 'numeric',
          })}
        </span>
      ) : (
        <span className="text-sm text-ohe-slate-300">—</span>
      );

    case 'actions':
      return (
        <UserActions
          userId={u.id}
          userName={userNameForActions}
          status={u.status}
          sessionId={u.sessionId}
          organizationCredits={ctx.credits}
          passwordCreated={u.passwordCreated}
          canEditDeadline={canEditDeadline}
          onEditDeadline={() => ctx.onEditDeadline(u)}
        />
      );

    default:
      return null;
  }
}

function formatDeadline(iso: string): string {
  const d = new Date(iso);
  const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  const timeStr = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
  return `${dateStr} · ${timeStr}`;
}

function SortIcon({ direction }: { direction: 'asc' | 'desc' | null }) {
  if (direction === null) {
    return (
      <svg className="w-3 h-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
      </svg>
    );
  }
  return direction === 'asc' ? (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
    </svg>
  ) : (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

function Checkbox({ checked, indeterminate, onChange, disabled, ariaLabel }: CheckboxProps) {
  return (
    <label className={`inline-flex items-center justify-center ${disabled ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        aria-label={ariaLabel}
        ref={(el) => { if (el) el.indeterminate = !!indeterminate; }}
        className="w-4 h-4 rounded border-ohe-slate-300 text-ohe-blue focus:ring-2 focus:ring-ohe-blue/30 focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed"
      />
    </label>
  );
}
