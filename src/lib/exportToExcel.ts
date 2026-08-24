import * as XLSX from 'xlsx';

interface ExportUserRow {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  passwordCreated: boolean;
  status: string;
  level: string | null;
  score: number | null;              // scoreProcedural /6
  scoreBloc1?: number | null;
  scoreBloc2?: number | null;
  scoreBloc3?: number | null;
  scoreBloc4?: number | null;
  scoreBloc5?: number | null;
  scoreBloc6?: number | null;
  quadrant?: number | null;
  recommandation?: string | null;
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

const PROFIL_LABELS: Record<number, string> = {
  1: 'Besoin perçu · Disposé',
  2: 'Besoin perçu · Réticent',
  3: 'Besoin non perçu · Disposé',
  4: 'Besoin non perçu · Réticent',
};

const RECOMMANDATION_LABELS: Record<string, string> = {
  A_FORMER: 'À former',
  A_FORMER_ET_ACCOMPAGNER: 'À former et accompagner',
  A_FORMER_SOUS_RESERVES: 'À former sous réserves',
  A_ORIENTER: 'À orienter',
};

const BLOCK_LABELS: Record<number, string> = {
  1: 'Singulier / Pluriel',
  2: 'Conjugaison',
  3: 'Participe passé',
  4: 'Orthographe lexicale',
  5: 'Syntaxe',
  6: 'Compréhension écrite',
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

function pctValue(v: number | null | undefined, completed: boolean): number | '' {
  if (!completed) return '';
  if (v === null || v === undefined) return '';
  return Number(v.toFixed(4));
}

function pctFromSix(v: number | null | undefined, completed: boolean): number | '' {
  if (!completed) return '';
  if (v === null || v === undefined) return '';
  return Number((v / 6).toFixed(4));
}

function numOrEmpty(v: number | null | undefined, completed: boolean, decimals = 1): number | '' {
  if (!completed) return '';
  if (v === null || v === undefined) return '';
  return Number(v.toFixed(decimals));
}

export function exportUsersToExcel(users: ExportUserRow[], orgName: string) {
  const now = new Date();
  const orgLabel = (orgName || '').toUpperCase();

  // ─────────────────────────────────────────────────────────────
  // ONGLET PARTICIPANTS
  // ─────────────────────────────────────────────────────────────

  const headers = [
    'Email',
    'Prénom',
    'Nom',
    'Groupe',
    'Statut',
    'Inscrit',
    'Activé le',
    'Deadline',
    'Terminé le',
    'Niveau CECRL',
    'Score global',
    `Bloc 1 — ${BLOCK_LABELS[1]}`,
    `Bloc 2 — ${BLOCK_LABELS[2]}`,
    `Bloc 3 — ${BLOCK_LABELS[3]}`,
    `Bloc 4 — ${BLOCK_LABELS[4]}`,
    `Bloc 5 — ${BLOCK_LABELS[5]}`,
    `Bloc 6 — ${BLOCK_LABELS[6]}`,
    'Profil',
    'Recommandation',
    'Temps moy./Q (s)',
  ];

  const nbCols = headers.length;

  const bodyRows: (string | number)[][] = users.map((u) => {
    const completed = u.status === 'COMPLETED';
    return [
      u.email,
      u.firstName ?? '',
      u.lastName ?? '',
      u.groupName ?? '',
      STATUS_LABELS[u.status] ?? u.status,
      u.passwordCreated ? 'Oui' : 'Non',
      formatDateFR(u.activatedAt),
      formatDateFR(u.deadline),
      formatDateFR(u.completedAt),
      completed ? (u.level ?? '') : '',
      pctFromSix(u.score, completed),
      pctValue(u.scoreBloc1, completed),
      pctValue(u.scoreBloc2, completed),
      pctValue(u.scoreBloc3, completed),
      pctValue(u.scoreBloc4, completed),
      pctValue(u.scoreBloc5, completed),
      pctValue(u.scoreBloc6, completed),
      completed && u.quadrant ? (PROFIL_LABELS[u.quadrant] ?? '') : '',
      completed && u.recommandation ? (RECOMMANDATION_LABELS[u.recommandation] ?? u.recommandation) : '',
      numOrEmpty(u.avgTimePerQuestion, completed),
    ];
  });

  // Structure de la feuille :
  //   Ligne 1 : bandeau titre "BILAN COLLECTIF <ORGA>"
  //   Ligne 2 : sous-titre (date export + nb participants)
  //   Ligne 3 : vide
  //   Ligne 4 : headers de colonnes
  //   Ligne 5+ : données
  const sheetData: (string | number)[][] = [
    [`BILAN COLLECTIF ${orgLabel}`, ...Array(nbCols - 1).fill('')],
    [`Généré le ${formatDateFR(now.toISOString())} · ${users.length} participant${users.length > 1 ? 's' : ''}`, ...Array(nbCols - 1).fill('')],
    Array(nbCols).fill(''),
    headers,
    ...bodyRows,
  ];

  const wsParticipants = XLSX.utils.aoa_to_sheet(sheetData);

  // Fusion du bandeau titre (ligne 1) et du sous-titre (ligne 2) sur toute la largeur
  wsParticipants['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: nbCols - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: nbCols - 1 } },
  ];

  // Hauteurs de lignes
  wsParticipants['!rows'] = [
    { hpt: 26 }, // Bandeau titre
    { hpt: 18 }, // Sous-titre
    { hpt: 8 },  // Ligne vide
    { hpt: 22 }, // Header
  ];

  // Largeurs de colonnes
  wsParticipants['!cols'] = [
    { wch: 30 }, // Email
    { wch: 14 }, // Prénom
    { wch: 14 }, // Nom
    { wch: 20 }, // Groupe
    { wch: 14 }, // Statut
    { wch: 8 },  // Inscrit
    { wch: 18 }, // Activé le
    { wch: 18 }, // Deadline
    { wch: 18 }, // Terminé le
    { wch: 12 }, // Niveau
    { wch: 12 }, // Score global
    { wch: 24 }, { wch: 24 }, { wch: 24 }, { wch: 24 }, { wch: 24 }, { wch: 24 }, // Blocs 1-6
    { wch: 28 }, // Profil
    { wch: 26 }, // Recommandation
    { wch: 16 }, // Temps moy/Q
  ];

  // Freeze pane : bloque la ligne header (index 3 = ligne 4) et les 3 premières colonnes
  wsParticipants['!freeze'] = { xSplit: 3, ySplit: 4 };
  // Pour compat max, on met aussi la propriété directement
  (wsParticipants as unknown as { '!views'?: unknown[] })['!views'] = [
    { state: 'frozen', xSplit: 3, ySplit: 4, topLeftCell: 'D5', activePane: 'bottomRight' },
  ];

  // Autofilter sur la ligne header + les données
  const lastDataRow = 4 + bodyRows.length; // ligne 4 = headers, données de 5 à lastDataRow
  const lastColLetter = XLSX.utils.encode_col(nbCols - 1);
  wsParticipants['!autofilter'] = { ref: `A4:${lastColLetter}${lastDataRow}` };

  // Format % sur les colonnes Score global + 6 blocs (index 10 à 16)
  // Les données commencent ligne index 4 (= ligne 5 dans Excel)
  for (let R = 4; R < 4 + bodyRows.length; ++R) {
    for (let C = 10; C <= 16; ++C) {
      const cellAddr = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = wsParticipants[cellAddr];
      if (cell && typeof cell.v === 'number') {
        cell.z = '0%';
        cell.t = 'n';
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // ONGLET SYNTHÈSE
  // ─────────────────────────────────────────────────────────────

  const total = users.length;
  const completedUsers = users.filter((u) => u.status === 'COMPLETED');
  const completedCount = completedUsers.length;

  const statusCounts: Record<string, number> = {
    PENDING: 0, READY_TO_START: 0, IN_PROGRESS: 0, COMPLETED: 0, EXPIRED: 0,
  };
  users.forEach((u) => { if (statusCounts[u.status] !== undefined) statusCounts[u.status]++; });

  const levelCounts: Record<string, number> = { A: 0, B1: 0, B2: 0, C: 0 };
  completedUsers.forEach((u) => { if (u.level && levelCounts[u.level] !== undefined) levelCounts[u.level]++; });

  const profilCounts: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0 };
  completedUsers.forEach((u) => { if (u.quadrant) profilCounts[String(u.quadrant)]++; });

  const recoCounts: Record<string, number> = {};
  completedUsers.forEach((u) => {
    if (u.recommandation) {
      recoCounts[u.recommandation] = (recoCounts[u.recommandation] ?? 0) + 1;
    }
  });

  const scoresValid = completedUsers.filter((u) => u.score !== null).map((u) => u.score as number);
  const avgScoreRatio = scoresValid.length > 0
    ? (scoresValid.reduce((a, b) => a + b, 0) / scoresValid.length) / 6
    : null;

  const avgBlock = (key: keyof ExportUserRow): number | null => {
    const vals = completedUsers
      .map((u) => u[key] as number | null | undefined)
      .filter((v): v is number => v !== null && v !== undefined);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  };

  const avgBlocs = [
    avgBlock('scoreBloc1'),
    avgBlock('scoreBloc2'),
    avgBlock('scoreBloc3'),
    avgBlock('scoreBloc4'),
    avgBlock('scoreBloc5'),
    avgBlock('scoreBloc6'),
  ];

  const timesValid = completedUsers
    .filter((u) => u.avgTimePerQuestion !== null && u.avgTimePerQuestion !== undefined)
    .map((u) => u.avgTimePerQuestion as number);
  const avgTime = timesValid.length > 0 ? timesValid.reduce((a, b) => a + b, 0) / timesValid.length : null;

  type Row = (string | number)[];

  // Structure de la synthèse : même en-tête stylé
  //   Ligne 1 : bandeau titre
  //   Ligne 2 : sous-titre
  //   Ligne 3 : vide
  //   Ligne 4+ : contenu (2 colonnes)
  const summaryRows: Row[] = [
    [`BILAN COLLECTIF ${orgLabel}`, ''],
    [`Généré le ${formatDateFR(now.toISOString())} · Synthèse pédagogique`, ''],
    ['', ''],

    ['CHIFFRES CLÉS', ''],
    ['Organisation', orgName],
    ['Total participants', total],
    ['Diagnostics terminés', completedCount],
    ['Score global moyen', avgScoreRatio !== null ? Number(avgScoreRatio.toFixed(4)) : ''],
    ['Temps moyen par question (s)', avgTime !== null ? Number(avgTime.toFixed(1)) : ''],
    ['', ''],

    ['MOYENNE PAR BLOC', ''],
    [`Bloc 1 — ${BLOCK_LABELS[1]}`, avgBlocs[0] !== null ? Number(avgBlocs[0].toFixed(4)) : ''],
    [`Bloc 2 — ${BLOCK_LABELS[2]}`, avgBlocs[1] !== null ? Number(avgBlocs[1].toFixed(4)) : ''],
    [`Bloc 3 — ${BLOCK_LABELS[3]}`, avgBlocs[2] !== null ? Number(avgBlocs[2].toFixed(4)) : ''],
    [`Bloc 4 — ${BLOCK_LABELS[4]}`, avgBlocs[3] !== null ? Number(avgBlocs[3].toFixed(4)) : ''],
    [`Bloc 5 — ${BLOCK_LABELS[5]}`, avgBlocs[4] !== null ? Number(avgBlocs[4].toFixed(4)) : ''],
    [`Bloc 6 — ${BLOCK_LABELS[6]}`, avgBlocs[5] !== null ? Number(avgBlocs[5].toFixed(4)) : ''],
    ['', ''],

    ['RÉPARTITION PAR STATUT', ''],
    ['En attente', statusCounts.PENDING],
    ['Prêt', statusCounts.READY_TO_START],
    ['En cours', statusCounts.IN_PROGRESS],
    ['Terminé', statusCounts.COMPLETED],
    ['Expiré', statusCounts.EXPIRED],
    ['', ''],

    ['RÉPARTITION PAR NIVEAU CECRL (terminés)', ''],
    ['A', levelCounts.A],
    ['B1', levelCounts.B1],
    ['B2', levelCounts.B2],
    ['C', levelCounts.C],
    ['', ''],

    ['RÉPARTITION PAR PROFIL (terminés)', ''],
    [PROFIL_LABELS[1], profilCounts['1']],
    [PROFIL_LABELS[2], profilCounts['2']],
    [PROFIL_LABELS[3], profilCounts['3']],
    [PROFIL_LABELS[4], profilCounts['4']],
    ['', ''],

    ['RÉPARTITION PAR RECOMMANDATION (terminés)', ''],
    ...Object.entries(RECOMMANDATION_LABELS).map(
      ([key, label]) => [label, recoCounts[key] ?? 0] as Row
    ),
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);

  wsSummary['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
  ];

  wsSummary['!rows'] = [
    { hpt: 26 }, // Bandeau
    { hpt: 18 }, // Sous-titre
    { hpt: 8 },  // Ligne vide
  ];

  wsSummary['!cols'] = [{ wch: 48 }, { wch: 26 }];

  // Freeze de la première colonne (libellés)
  wsSummary['!freeze'] = { xSplit: 1, ySplit: 0 };
  (wsSummary as unknown as { '!views'?: unknown[] })['!views'] = [
    { state: 'frozen', xSplit: 1, ySplit: 0, topLeftCell: 'B1', activePane: 'topRight' },
  ];

  // Format % : score global moyen (ligne 8, index 7) + 6 moyennes blocs (index 11-16)
  const pctCellsSummary = [7, 11, 12, 13, 14, 15, 16];
  pctCellsSummary.forEach((r) => {
    const cellAddr = XLSX.utils.encode_cell({ r, c: 1 });
    const cell = wsSummary[cellAddr];
    if (cell && typeof cell.v === 'number') {
      cell.z = '0%';
      cell.t = 'n';
    }
  });

  // ─────────────────────────────────────────────────────────────
  // ASSEMBLAGE
  // ─────────────────────────────────────────────────────────────

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsParticipants, 'Participants');
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Synthèse');

  const today = now.toISOString().slice(0, 10);
  const filename = `bilan-collectif-${slugify(orgName)}-${today}.xlsx`;

  XLSX.writeFile(wb, filename);
}
