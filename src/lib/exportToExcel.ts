import * as XLSX from 'xlsx';

interface ExportUserRow {
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
  deadline: string | null;
  activatedAt: string | null;
  groupName: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  READY_TO_START: 'Prêt',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé',
  EXPIRED: 'Expiré',
  RESET: 'Réinitialisé',
};

function formatDateFR(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const date = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `${date} ${time}`;
}

function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function exportUsersToExcel(users: ExportUserRow[], orgName: string) {
  const participantsData = users.map((u) => ({
    'Email': u.email,
    'Prénom': u.firstName ?? '',
    'Nom': u.lastName ?? '',
    'Groupe': u.groupName ?? '',
    'Statut': STATUS_LABELS[u.status] ?? u.status,
    'Inscrit': u.passwordCreated ? 'Oui' : 'Non',
    'Deadline': formatDateFR(u.deadline),
    'Activé le': formatDateFR(u.activatedAt),
    'Terminé le': formatDateFR(u.completedAt),
    'Niveau': u.level ?? '',
    'Score /6': u.score !== null ? Number(u.score.toFixed(2)) : '',
    'Cadran': u.quadrant ?? '',
    'Temps moy./Q (s)': u.avgTimePerQuestion !== null && u.avgTimePerQuestion !== undefined
      ? Number(u.avgTimePerQuestion.toFixed(1))
      : '',
  }));

  const wsParticipants = XLSX.utils.json_to_sheet(participantsData);
  wsParticipants['!cols'] = [
    { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 14 },
    { wch: 8 },  { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 10 },
    { wch: 10 }, { wch: 8 },  { wch: 16 },
  ];

  // ─── Résumé ─────────────────────────────────────────────────
  const total = users.length;
  const completedUsers = users.filter((u) => u.status === 'COMPLETED');
  const completedCount = completedUsers.length;

  const statusCounts: Record<string, number> = {
    PENDING: 0, READY_TO_START: 0, IN_PROGRESS: 0, COMPLETED: 0, EXPIRED: 0,
  };
  users.forEach((u) => { if (statusCounts[u.status] !== undefined) statusCounts[u.status]++; });

  const levelCounts: Record<string, number> = { A: 0, B1: 0, B2: 0, C: 0 };
  completedUsers.forEach((u) => { if (u.level && levelCounts[u.level] !== undefined) levelCounts[u.level]++; });

  const quadrantCounts: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0 };
  completedUsers.forEach((u) => { if (u.quadrant) quadrantCounts[String(u.quadrant)]++; });

  const scoresValid = completedUsers.filter((u) => u.score !== null).map((u) => u.score as number);
  const avgScore = scoresValid.length > 0 ? scoresValid.reduce((a, b) => a + b, 0) / scoresValid.length : null;

  const timesValid = completedUsers
    .filter((u) => u.avgTimePerQuestion !== null && u.avgTimePerQuestion !== undefined)
    .map((u) => u.avgTimePerQuestion as number);
  const avgTime = timesValid.length > 0 ? timesValid.reduce((a, b) => a + b, 0) / timesValid.length : null;

  const summary: (string | number)[][] = [
    ['Résumé de l\'export', ''],
    ['Organisation', orgName],
    ['Date d\'export', formatDateFR(new Date().toISOString())],
    ['', ''],
    ['Total participants', total],
    ['Diagnostics terminés', completedCount],
    ['Score moyen /6', avgScore !== null ? Number(avgScore.toFixed(2)) : ''],
    ['Temps moyen par question (s)', avgTime !== null ? Number(avgTime.toFixed(1)) : ''],
    ['', ''],
    ['Répartition par statut', ''],
    ['En attente', statusCounts.PENDING],
    ['Prêt', statusCounts.READY_TO_START],
    ['En cours', statusCounts.IN_PROGRESS],
    ['Terminé', statusCounts.COMPLETED],
    ['Expiré', statusCounts.EXPIRED],
    ['', ''],
    ['Répartition par niveau CECRL (terminés)', ''],
    ['A', levelCounts.A],
    ['B1', levelCounts.B1],
    ['B2', levelCounts.B2],
    ['C', levelCounts.C],
    ['', ''],
    ['Répartition par cadran (terminés)', ''],
    ['Cadran 1', quadrantCounts['1']],
    ['Cadran 2', quadrantCounts['2']],
    ['Cadran 3', quadrantCounts['3']],
    ['Cadran 4', quadrantCounts['4']],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summary);
  wsSummary['!cols'] = [{ wch: 42 }, { wch: 24 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsParticipants, 'Participants');
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Résumé');

  const today = new Date().toISOString().slice(0, 10);
  const filename = `participants-${slugify(orgName)}-${today}.xlsx`;

  XLSX.writeFile(wb, filename);
}
