'use client';

import UserActions from './UserActions';

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

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  NOT_STARTED: { label: 'Pas commencé', className: 'bg-ohe-slate-100 text-ohe-slate-600' },
  IN_PROGRESS: { label: 'En cours',     className: 'bg-ohe-orange/10 text-ohe-orange' },
  COMPLETED:   { label: 'Terminé',      className: 'bg-emerald-50 text-emerald-700' },
  RESET:       { label: 'Réinitialisé', className: 'bg-ohe-slate-100 text-ohe-slate-600' },
};

const LEVEL_BADGE: Record<string, string> = {
  A:  'bg-red-50 text-red-700',
  B1: 'bg-ohe-orange/10 text-ohe-orange',
  B2: 'bg-ohe-blue/10 text-ohe-blue',
  C:  'bg-emerald-50 text-emerald-700',
};

export default function UsersTable({
  users,
  credits,
}: {
  users: UserRow[];
  credits: number;
}) {
  if (users.length === 0) {
    return (
      <div className="p-16 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-ohe-slate-50 border border-ohe-slate-200 flex items-center justify-center">
          <svg className="w-6 h-6 text-ohe-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-base font-semibold text-ohe-slate-900 mb-2">
  Aucun collaborateur dans cette catégorie.
</p>

        <p className="text-sm text-ohe-slate-600">
          Cliquez sur « Inviter un collaborateur » pour démarrer.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-ohe-slate-200 bg-ohe-slate-50/60">
            <Th>Collaborateur</Th>
            <Th>Statut</Th>
            <Th>Niveau</Th>
            <Th>Score</Th>
            <Th>Terminé le</Th>
            <Th align="right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const statusInfo = STATUS_BADGE[u.status] ?? STATUS_BADGE.NOT_STARTED;
            const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ') || '—';
            const initials =
              ((u.firstName?.[0] ?? '') + (u.lastName?.[0] ?? '')).toUpperCase() ||
              u.email[0].toUpperCase();
            const userNameForActions =
              [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;

            return (
              <tr
                key={u.id}
                className="border-b border-ohe-slate-100 last:border-b-0 hover:bg-ohe-slate-50/40 transition-colors"
              >
                {/* Collaborateur */}
<td className="px-6 py-4">
  <div className="min-w-0">
    <p className="text-sm font-medium text-ohe-slate-900 truncate">{fullName}</p>
    <p className="text-xs text-ohe-slate-600 truncate">{u.email}</p>
  </div>
</td>


                {/* Statut */}
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium ${statusInfo.className}`}
                    >
                      {statusInfo.label}
                    </span>
                    {!u.passwordCreated && (
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700">
                        En attente
                      </span>
                    )}
                  </div>
                </td>

                {/* Niveau */}
                <td className="px-6 py-4">
                  {u.level ? (
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${LEVEL_BADGE[u.level] ?? ''}`}
                    >
                      {u.level}
                    </span>
                  ) : (
                    <span className="text-sm text-ohe-slate-300">—</span>
                  )}
                </td>

                {/* Score */}
                <td className="px-6 py-4">
                  {u.score !== null ? (
                    <span className="font-mono text-sm font-semibold text-ohe-slate-900">
                      {u.score.toFixed(2).replace('.', ',')}
                      <span className="text-ohe-slate-400 font-normal"> / 6</span>
                    </span>
                  ) : (
                    <span className="text-sm text-ohe-slate-300">—</span>
                  )}
                </td>

                {/* Terminé le */}
                <td className="px-6 py-4">
                  {u.completedAt ? (
                    <span className="text-sm text-ohe-slate-600">
                      {new Date(u.completedAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  ) : (
                    <span className="text-sm text-ohe-slate-300">—</span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <UserActions
                    userId={u.id}
                    userName={userNameForActions}
                    status={u.status}
                    sessionId={u.sessionId}
                    organizationCredits={credits}
                    passwordCreated={u.passwordCreated}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ============ Th cell ============
function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      className={`
        px-6 py-3 font-mono text-[10px] font-semibold text-ohe-slate-500
        tracking-[0.14em] uppercase
        ${align === 'right' ? 'text-right' : 'text-left'}
      `}
    >
      {children}
    </th>
  );
}
