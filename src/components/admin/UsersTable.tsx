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

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  NOT_STARTED: {
    label: 'Pas commencé',
    className: 'bg-ohe-slate-100 text-ohe-slate-600',
  },
  IN_PROGRESS: {
    label: 'En cours',
    className: 'bg-orange-100 text-orange-800',
  },
  COMPLETED: {
    label: 'Terminé',
    className: 'bg-green-100 text-green-800',
  },
  RESET: {
    label: 'Réinitialisé',
    className: 'bg-ohe-slate-100 text-ohe-slate-600',
  },
};

const LEVEL_COLORS: Record<string, string> = {
  A: 'bg-red-100 text-red-800',
  B1: 'bg-orange-100 text-orange-800',
  B2: 'bg-blue-100 text-blue-800',
  C: 'bg-green-100 text-green-800',
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
      <div className="p-12 text-center">
        <div className="text-4xl mb-3">👥</div>
        <p className="text-ohe-slate-600 mb-2">Aucun collaborateur invité pour le moment.</p>
        <p className="text-sm text-ohe-slate-500">
          Cliquez sur &quot;+ Inviter un collaborateur&quot; pour commencer.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-ohe-slate-200 bg-ohe-slate-50/50">
            <th className="text-left px-6 py-3 text-xs font-semibold text-ohe-slate-600 uppercase tracking-wider">
              Collaborateur
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-ohe-slate-600 uppercase tracking-wider">
              Statut
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-ohe-slate-600 uppercase tracking-wider">
              Niveau
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-ohe-slate-600 uppercase tracking-wider">
              Score
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-ohe-slate-600 uppercase tracking-wider">
              Terminé le
            </th>
            <th className="text-right px-6 py-3 text-xs font-semibold text-ohe-slate-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const statusInfo = STATUS_LABELS[u.status] ?? STATUS_LABELS.NOT_STARTED;
            const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ') || '—';
            const userNameForActions =
              [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;

            return (
              <tr
                key={u.id}
                className="border-b border-ohe-slate-100 hover:bg-ohe-slate-50/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-ohe-slate-900">{fullName}</p>
                    <p className="text-xs text-ohe-slate-600">{u.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusInfo.className}`}
                  >
                    {statusInfo.label}
                  </span>
                  {!u.passwordCreated && (
                    <span className="ml-2 inline-block px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      En attente d&apos;activation
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {u.level ? (
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-bold ${LEVEL_COLORS[u.level] ?? ''}`}
                    >
                      {u.level}
                    </span>
                  ) : (
                    <span className="text-sm text-ohe-slate-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {u.score !== null ? (
                    <span className="text-sm text-ohe-slate-900 font-medium">{u.score}</span>
                  ) : (
                    <span className="text-sm text-ohe-slate-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {u.completedAt ? (
                    <span className="text-sm text-ohe-slate-600">
                      {new Date(u.completedAt).toLocaleDateString('fr-FR')}
                    </span>
                  ) : (
                    <span className="text-sm text-ohe-slate-400">—</span>
                  )}
                </td>
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
