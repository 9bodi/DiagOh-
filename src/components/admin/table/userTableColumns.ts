export interface UserRow {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  passwordCreated: boolean;
  status: string;
  level: string | null;
  score: number | null;
  scoreBloc1?: number | null;
  scoreBloc2?: number | null;
  scoreBloc3?: number | null;
  scoreBloc4?: number | null;
  scoreBloc5?: number | null;
  scoreBloc6?: number | null;
  scoreAdaptation?: number | null;
  scoreInteret?: number | null;
  quadrant?: number | null;
  recommandation?: string | null;
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
  | 'adminStatus'
  | 'testStatus'
  | 'deadline'
  | 'level'
  | 'profile'
  | 'recommandation'
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
  sortable?: boolean;
}

export const USER_TABLE_COLUMNS: ColumnConfig[] = [
    { key: 'select',         label: '',            visibility: 'always',           align: 'center', width: 'w-12' },
  { key: 'participant',    label: 'Participant', visibility: 'always',           sortable: true,  width: 'w-64' },
  { key: 'group',          label: 'Groupe',      visibility: 'always' },
  { key: 'adminStatus',    label: 'Compte',      visibility: 'always',           sortable: true,  width: 'w-28' },
  { key: 'testStatus',     label: 'Test',        visibility: 'always',           sortable: true,  width: 'w-28' },
  { key: 'deadline',       label: 'Deadline',    visibility: 'active-context',   sortable: true },
  { key: 'level',          label: 'Niveau',      visibility: 'completed-context', sortable: true, width: 'w-24' },
  { key: 'profile',        label: 'Profil',      visibility: 'always',           width: 'w-36' },
  { key: 'recommandation', label: 'Reco',        visibility: 'always',           width: 'w-36' },
  { key: 'completedAt',    label: 'Terminé le',  visibility: 'completed-context', sortable: true },
  { key: 'actions',        label: 'Actions',     visibility: 'always',           align: 'right' },

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

// ─── Statuts dérivés ───────────────────────────────────────────────

export type AdminStatus = 'IMPORTED' | 'REGISTERED';

export function getAdminStatus(u: UserRow): AdminStatus {
  return u.passwordCreated ? 'REGISTERED' : 'IMPORTED';
}
/**
 * Retourne le statut test effectif (dérivé).
 * Si la deadline est passée et le test n'est pas terminé, on force EXPIRED.
 */
export function getEffectiveTestStatus(u: UserRow): string {
  if (u.status === 'COMPLETED') return 'COMPLETED';
  if (u.deadline && new Date(u.deadline).getTime() < Date.now()) {
    return 'EXPIRED';
  }
  return u.status;
}

/**
 * Libellés du statut test (renommés côté UI).
 */
export const TEST_STATUS_LABELS: Record<string, string> = {
  PENDING:        'En attente',
  READY_TO_START: 'Démarré',
  IN_PROGRESS:    'En cours',
  COMPLETED:      'Terminé',
  EXPIRED:        'Hors délais',
  RESET:          'Réinitialisé',
};

/**
 * Rang du statut test pour tri logique.
 */
export function getTestStatusRank(status: string): number {
  switch (status) {
    case 'PENDING':        return 0;
    case 'READY_TO_START': return 1;
    case 'IN_PROGRESS':    return 2;
    case 'EXPIRED':        return 3;
    case 'COMPLETED':      return 4;
    default:               return 5;
  }
}


/**
 * Rang pour tri par défaut (le plus urgent = 0).
 * Importé → Inscrit+En attente → Démarré → En cours → Hors délais → Terminé
 */
export function getDefaultOrderRank(u: UserRow): number {
  if (!u.passwordCreated) return 0;
  const effectiveStatus = getEffectiveTestStatus(u);
  switch (effectiveStatus) {
    case 'PENDING':        return 1;
    case 'READY_TO_START': return 2;
    case 'IN_PROGRESS':    return 3;
    case 'EXPIRED':        return 4;
    case 'COMPLETED':      return 5;
    default:               return 6;
  }
}


// ─── Tri ───────────────────────────────────────────────────────────

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  key: ColumnKey;
  direction: SortDirection;
}

export function getSortValue(u: UserRow, key: ColumnKey): string | number | null {
  switch (key) {
    case 'participant': {
      const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
      return (name || u.email).toLowerCase();
    }
    case 'adminStatus':
      // Importé (0) avant Inscrit (1)
      return u.passwordCreated ? 1 : 0;
    case 'testStatus':
  return getTestStatusRank(getEffectiveTestStatus(u));

        case 'level':
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
  // Tri par défaut (ordre urgent) si pas de tri explicite
  if (!sort) {
    const arr = [...users];
    arr.sort((a, b) => {
      const ra = getDefaultOrderRank(a);
      const rb = getDefaultOrderRank(b);
      if (ra !== rb) return ra - rb;
      // Tie-break : nom alphabétique
      const na = [a.firstName, a.lastName].filter(Boolean).join(' ').toLowerCase() || a.email;
      const nb = [b.firstName, b.lastName].filter(Boolean).join(' ').toLowerCase() || b.email;
      return na.localeCompare(nb, 'fr');
    });
    return arr;
  }

  const arr = [...users];
  arr.sort((a, b) => {
    const va = getSortValue(a, sort.key);
    const vb = getSortValue(b, sort.key);
    if (va === null && vb === null) return 0;
    if (va === null) return 1;
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
