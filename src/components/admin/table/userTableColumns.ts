import type { ReactNode } from 'react';

export interface UserRow {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  passwordCreated: boolean;
  status: string;
  level: string | null;
  score: number | null;
  quadrant?: number | null;
  avgTimePerQuestion?: number | null;
  completedAt: string | null;
  sessionId: string | null;
  deadline: string | null;
  activatedAt: string | null;
  groupId: string | null;
  groupName: string | null;
}

export type ColumnKey =
  | 'select'
  | 'participant'
  | 'group'
  | 'status'
  | 'deadline'
  | 'level'
  | 'score'
  | 'quadrant'
  | 'completedAt'
  | 'actions';

export type ColumnVisibility =
  | 'always'
  | 'completed-context'
  | 'active-context'
  | ((filter: string, users: UserRow[]) => boolean);

export interface ColumnConfig {
  key: ColumnKey;
  label: string;
  visibility: ColumnVisibility;
  align?: 'left' | 'center' | 'right';
  width?: string;
  sortable?: boolean; // ← NOUVEAU
}

export const USER_TABLE_COLUMNS: ColumnConfig[] = [
  { key: 'select',      label: '',            visibility: 'always', align: 'center', width: 'w-12' },
  { key: 'participant', label: 'Participant', visibility: 'always', sortable: true },
  { key: 'group',       label: 'Groupe',      visibility: 'always' },
  { key: 'status',      label: 'Statut',      visibility: 'always' },
  { key: 'deadline',    label: 'Deadline',    visibility: 'active-context', sortable: true },
  { key: 'level',       label: 'Niveau',      visibility: 'completed-context' },
  { key: 'score',       label: 'Score',       visibility: 'completed-context', sortable: true },
  { key: 'quadrant',    label: 'Cadran',      visibility: 'completed-context', align: 'center' },
  { key: 'completedAt', label: 'Terminé le',  visibility: 'completed-context', sortable: true },
  { key: 'actions',     label: 'Actions',     visibility: 'always', align: 'right' },
];

export function isColumnVisible(
  col: ColumnConfig,
  filter: string,
  users: UserRow[],
): boolean {
  if (col.visibility === 'always') return true;

  if (col.visibility === 'completed-context') {
    if (filter === 'completed') return true;
    if (filter === 'all') return users.some(u => u.status === 'COMPLETED');
    return false;
  }

  if (col.visibility === 'active-context') {
    if (['all', 'ready', 'in_progress', 'expired'].includes(filter)) return true;
    return false;
  }

  if (typeof col.visibility === 'function') {
    return col.visibility(filter, users);
  }

  return true;
}

export function getVisibleColumns(filter: string, users: UserRow[]): ColumnConfig[] {
  return USER_TABLE_COLUMNS.filter(col => isColumnVisible(col, filter, users));
}

// ─── Tri ───────────────────────────────────────────────────────────

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  key: ColumnKey;
  direction: SortDirection;
}

/**
 * Retourne une valeur comparable pour une colonne donnée.
 * Les null/undefined sont toujours placés en fin (peu importe la direction).
 */
export function getSortValue(u: UserRow, key: ColumnKey): string | number | null {
  switch (key) {
    case 'participant': {
      const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
      return (name || u.email).toLowerCase();
    }
    case 'score':
      return u.score;
    case 'deadline':
      return u.deadline ? new Date(u.deadline).getTime() : null;
    case 'completedAt':
      return u.completedAt ? new Date(u.completedAt).getTime() : null;
    default:
      return null;
  }
}

export function sortUsers(users: UserRow[], sort: SortState | null): UserRow[] {
  if (!sort) return users;
  const arr = [...users];
  arr.sort((a, b) => {
    const va = getSortValue(a, sort.key);
    const vb = getSortValue(b, sort.key);
    if (va === null && vb === null) return 0;
    if (va === null) return 1;   // null toujours en fin
    if (vb === null) return -1;
    if (typeof va === 'number' && typeof vb === 'number') {
      return sort.direction === 'asc' ? va - vb : vb - va;
    }
    const sa = String(va);
    const sb = String(vb);
    return sort.direction === 'asc' ? sa.localeCompare(sb, 'fr') : sb.localeCompare(sa, 'fr');
  });
  return arr;
}

// ─── Recherche ─────────────────────────────────────────────────────

/** Normalise une chaîne : minuscules + sans accents. */
function normalize(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function filterUsersBySearch(users: UserRow[], query: string): UserRow[] {
  const q = normalize(query.trim());
  if (!q) return users;
  return users.filter((u) => {
    const haystack = normalize(
      [u.firstName, u.lastName, u.email].filter(Boolean).join(' ')
    );
    return haystack.includes(q);
  });
}
