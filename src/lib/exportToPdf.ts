import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportUserRow {
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: string;
  level: string | null;
  score: number | null;
  quadrant?: number | null;
  avgTimePerQuestion?: number | null;
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

function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatDateFR(d: Date): string {
  const date = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `${date} ${time}`;
}

export interface ExportFilters {
  status?: string;
  group?: string;
  search?: string;
}

export function exportUsersToPdf(
  users: ExportUserRow[],
  orgName: string,
  filters: ExportFilters = {},
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const now = new Date();

  // ─── En-tête ────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // ohe-slate-900
  doc.text('OHé Diag', 40, 40);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // ohe-slate-500
  doc.text(`Export généré le ${formatDateFR(now)}`, pageWidth - 40, 40, { align: 'right' });

  // ─── Titre ──────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text('Rapport participants', 40, 75);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105); // ohe-slate-600
  doc.text(orgName, 40, 93);

  // Filtres actifs
  const filterParts: string[] = [];
  if (filters.status && filters.status !== 'all') filterParts.push(`Statut : ${filters.status}`);
  if (filters.group && filters.group !== 'all') filterParts.push(`Groupe : ${filters.group}`);
  if (filters.search) filterParts.push(`Recherche : « ${filters.search} »`);
  if (filterParts.length > 0) {
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(filterParts.join('  ·  '), 40, 110);
  }

  // ─── Résumé ─────────────────────────────────────────────────
  const total = users.length;
  const completed = users.filter((u) => u.status === 'COMPLETED');
  const scoresValid = completed.filter((u) => u.score !== null).map((u) => u.score as number);
  const avgScore = scoresValid.length > 0 ? scoresValid.reduce((a, b) => a + b, 0) / scoresValid.length : null;
  const timesValid = completed
    .filter((u) => u.avgTimePerQuestion !== null && u.avgTimePerQuestion !== undefined)
    .map((u) => u.avgTimePerQuestion as number);
  const avgTime = timesValid.length > 0 ? timesValid.reduce((a, b) => a + b, 0) / timesValid.length : null;

  const summaryY = filterParts.length > 0 ? 130 : 120;
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Synthèse', 40, summaryY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const summaryLines = [
    `Total participants : ${total}`,
    `Diagnostics terminés : ${completed.length}`,
    `Score moyen : ${avgScore !== null ? avgScore.toFixed(2).replace('.', ',') + ' / 6' : '—'}`,
    `Temps moyen / question : ${avgTime !== null ? avgTime.toFixed(1).replace('.', ',') + ' s' : '—'}`,
  ];
  doc.text(summaryLines.join('   ·   '), 40, summaryY + 15);

  // ─── Tableau ────────────────────────────────────────────────
  const tableStartY = summaryY + 35;

  const head = [[
    'Email', 'Nom', 'Groupe', 'Statut', 'Niveau', 'Score', 'Cadran', 'Tps moy./Q',
  ]];

  const body = users.map((u) => {
    const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ') || '—';
    return [
      u.email,
      fullName,
      u.groupName ?? '—',
      STATUS_LABELS[u.status] ?? u.status,
      u.level ?? '—',
      u.score !== null ? u.score.toFixed(2).replace('.', ',') : '—',
      u.quadrant ?? '—',
      u.avgTimePerQuestion !== null && u.avgTimePerQuestion !== undefined
        ? u.avgTimePerQuestion.toFixed(1).replace('.', ',') + ' s'
        : '—',
    ];
  });

  autoTable(doc, {
    head,
    body,
    startY: tableStartY,
    styles: { fontSize: 9, cellPadding: 5, textColor: [15, 23, 42] },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: { fillColor: [248, 250, 252] }, // ohe-slate-50
    columnStyles: {
      0: { cellWidth: 160 },  // Email
      1: { cellWidth: 110 },  // Nom
      2: { cellWidth: 90 },   // Groupe
      3: { cellWidth: 65 },   // Statut
      4: { cellWidth: 45, halign: 'center' }, // Niveau
      5: { cellWidth: 50, halign: 'right' },  // Score
      6: { cellWidth: 45, halign: 'center' }, // Cadran
      7: { cellWidth: 65, halign: 'right' },  // Tps moy./Q
    },
    margin: { left: 40, right: 40 },
    didDrawPage: (data) => {
      // Pied de page
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageNumber = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // ohe-slate-400
      doc.setFont('helvetica', 'normal');
      doc.text(
        `OHé Diag  ·  Rapport ${orgName}  ·  ${formatDateFR(now)}`,
        40,
        pageHeight - 20,
      );
      doc.text(
        `Page ${data.pageNumber} / ${pageNumber}`,
        pageWidth - 40,
        pageHeight - 20,
        { align: 'right' },
      );
    },
  });

  const today = now.toISOString().slice(0, 10);
  const filename = `participants-${slugify(orgName)}-${today}.pdf`;
  doc.save(filename);
}
