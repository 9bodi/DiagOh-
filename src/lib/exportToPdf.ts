import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ============================================================
// Types & mappings
// ============================================================

interface ExportUserRow {
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: string;
  level: string | null;
  score: number | null;
  scoreBloc1?: number | null;
  scoreBloc2?: number | null;
  scoreBloc3?: number | null;
  scoreBloc4?: number | null;
  scoreBloc5?: number | null;
  scoreBloc6?: number | null;
  quadrant?: number | null;
  recommandation?: string | null;
  avgTimePerQuestion?: number | null;
  groupName: string | null;
}

export interface ExportFilters {
  status?: string;
  group?: string;
  search?: string;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  READY_TO_START: 'Prêt',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé',
  EXPIRED: 'Expiré',
  RESET: 'Réinit.',
};

const PROFIL_LABELS: Record<number, string> = {
  1: 'Besoin perçu · Disposé',
  2: 'Besoin perçu · Réticent',
  3: 'Besoin non perçu · Disposé',
  4: 'Besoin non perçu · Réticent',
};

const PROFIL_SHORT: Record<number, string> = {
  1: 'BP · D',
  2: 'BP · R',
  3: 'BNP · D',
  4: 'BNP · R',
};

const RECO_LABELS: Record<string, string> = {
  A_FORMER: 'À former',
  A_FORMER_ET_ACCOMPAGNER: 'À former + accomp.',
  A_FORMER_SOUS_RESERVES: 'À former sous rés.',
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

// Couleurs charte OHé (RGB pour jsPDF)
const COLOR = {
  ink: [21, 23, 28] as [number, number, number],
  muted: [106, 110, 120] as [number, number, number],
  accent: [30, 58, 138] as [number, number, number],
  accentSoft: [238, 242, 250] as [number, number, number],
  panel: [255, 255, 255] as [number, number, number],
  bg: [244, 246, 251] as [number, number, number],
  line: [200, 208, 220] as [number, number, number],
  lineSoft: [230, 234, 242] as [number, number, number],
};

// ============================================================
// Helpers
// ============================================================

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

function formatPct(v: number | null | undefined): string {
  if (v === null || v === undefined) return '—';
  return `${Math.round(v * 100)} %`;
}

function formatPctFromSix(v: number | null | undefined): string {
  if (v === null || v === undefined) return '—';
  return `${Math.round((v / 6) * 100)} %`;
}

async function loadLogo(): Promise<{ dataUrl: string; ratio: number } | null> {
  try {
    const res = await fetch('/img/logos/ohe-logo.png');
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const ratio = await new Promise<number>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.naturalWidth / img.naturalHeight);
      img.onerror = () => resolve(1);
      img.src = dataUrl;
    });
    return { dataUrl, ratio };
  } catch {
    return null;
  }
}


// ============================================================
// Composants de rendu (dessin)
// ============================================================

function drawHeader(
  doc: jsPDF,
  pageWidth: number,
  orgName: string,
  logo: { dataUrl: string; ratio: number } | null,
  subtitle: string,
) {
  const bandH = 44;

  doc.setFillColor(...COLOR.accent);
  doc.rect(0, 0, pageWidth, bandH, 'F');

  let textX = 40;
  if (logo) {
    try {
      const logoH = 24;
      const logoW = logoH * logo.ratio;
      doc.addImage(logo.dataUrl, 'PNG', 40, 10, logoW, logoH);
      textX = 40 + logoW + 12;
    } catch {
      // ignore
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(`BILAN COLLECTIF ${orgName.toUpperCase()}`, textX, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(220, 228, 245);
  doc.text(subtitle, textX, 34);
}


function drawFilterLine(
  doc: jsPDF,
  x: number,
  y: number,
  filters: ExportFilters,
): number {
  const parts: string[] = [];
  if (filters.status) parts.push(`Statut : ${filters.status}`);
  if (filters.group) parts.push(`Groupe : ${filters.group}`);
  if (filters.search) parts.push(`Recherche : « ${filters.search} »`);

  if (parts.length === 0) return y;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR.muted);
  doc.text(`Filtres actifs · ${parts.join(' · ')}`, x, y);
  return y + 14;
}

function drawKpiCards(
  doc: jsPDF,
  x: number,
  y: number,
  totalWidth: number,
  cards: { label: string; value: string }[],
): number {
  const gap = 10;
  const cardW = (totalWidth - gap * (cards.length - 1)) / cards.length;
  const cardH = 56;

  cards.forEach((c, i) => {
    const cx = x + i * (cardW + gap);
    // Fond
    doc.setFillColor(...COLOR.accentSoft);
    doc.roundedRect(cx, y, cardW, cardH, 4, 4, 'F');

    // Valeur en gros
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...COLOR.accent);
    doc.text(c.value, cx + 12, y + 26);

    // Label en petit
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...COLOR.muted);
    doc.text(c.label.toUpperCase(), cx + 12, y + 46);
  });

  return y + cardH + 18;
}

function drawSectionTitle(doc: jsPDF, x: number, y: number, label: string): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLOR.accent);
  doc.text(label.toUpperCase(), x, y);
  // Trait fin sous le titre
  doc.setDrawColor(...COLOR.line);
  doc.setLineWidth(0.5);
  doc.line(x, y + 4, x + 200, y + 4);
  return y + 18;
}

function drawBlockBars(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  averages: (number | null)[],
): number {
  const rowH = 16;
  const labelW = 150;
  const valueW = 44;
  const barX = x + labelW;
  const barW = width - labelW - valueW - 8;

  averages.forEach((avg, i) => {
    const rowY = y + i * rowH;

    // Libellé bloc
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLOR.ink);
    doc.text(`Bloc ${i + 1} — ${BLOCK_LABELS[i + 1]}`, x, rowY + 10);

    // Fond de la barre
    doc.setFillColor(...COLOR.lineSoft);
    doc.roundedRect(barX, rowY + 3, barW, 10, 2, 2, 'F');

    // Barre remplie
    if (avg !== null) {
      const filled = Math.max(2, Math.min(barW, barW * avg));
      doc.setFillColor(...COLOR.accent);
      doc.roundedRect(barX, rowY + 3, filled, 10, 2, 2, 'F');
    }

    // Valeur %
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLOR.ink);
    const pct = avg !== null ? `${Math.round(avg * 100)} %` : '—';
    doc.text(pct, barX + barW + 6, rowY + 10);
  });

  return y + averages.length * rowH + 8;
}

function drawDistBlock(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  title: string,
  entries: { label: string; count: number }[],
): number {
  // Titre
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLOR.accent);
  doc.text(title.toUpperCase(), x, y);

  const startY = y + 12;
  const lineH = 13;

  entries.forEach((e, i) => {
    const rowY = startY + i * lineH;
    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...COLOR.ink);
    doc.text(e.label, x, rowY);
    // Compteur à droite
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLOR.accent);
    doc.text(String(e.count), x + width - 4, rowY, { align: 'right' });
  });

  return startY + entries.length * lineH;
}

// ============================================================
// Export principal
// ============================================================

export async function exportUsersToPdf(
  users: ExportUserRow[],
  orgName: string,
  filters: ExportFilters = {},
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const now = new Date();
  const marginX = 40;
  const contentW = pageWidth - marginX * 2;

  // Charge le logo (optionnel)
  const logo = await loadLogo();


  // ─── Calculs pédagogiques ──────────────────────────────────
  const total = users.length;
  const completed = users.filter((u) => u.status === 'COMPLETED');
  const completedCount = completed.length;
  const completionRate = total > 0 ? completedCount / total : 0;

  const scoresValid = completed.filter((u) => u.score !== null).map((u) => u.score as number);
  const avgScoreRatio = scoresValid.length > 0
    ? (scoresValid.reduce((a, b) => a + b, 0) / scoresValid.length) / 6
    : null;

  const timesValid = completed
    .filter((u) => u.avgTimePerQuestion !== null && u.avgTimePerQuestion !== undefined)
    .map((u) => u.avgTimePerQuestion as number);
  const avgTime = timesValid.length > 0 ? timesValid.reduce((a, b) => a + b, 0) / timesValid.length : null;

  const avgBlockKey = (key: keyof ExportUserRow): number | null => {
    const vals = completed
      .map((u) => u[key] as number | null | undefined)
      .filter((v): v is number => v !== null && v !== undefined);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  };
  const blockAvgs = [
    avgBlockKey('scoreBloc1'),
    avgBlockKey('scoreBloc2'),
    avgBlockKey('scoreBloc3'),
    avgBlockKey('scoreBloc4'),
    avgBlockKey('scoreBloc5'),
    avgBlockKey('scoreBloc6'),
  ];

  const levelCounts: Record<string, number> = { A: 0, B1: 0, B2: 0, C: 0 };
  completed.forEach((u) => { if (u.level && levelCounts[u.level] !== undefined) levelCounts[u.level]++; });

  const profilCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  completed.forEach((u) => { if (u.quadrant) profilCounts[u.quadrant]++; });

  const recoCounts: Record<string, number> = {};
  completed.forEach((u) => {
    if (u.recommandation) recoCounts[u.recommandation] = (recoCounts[u.recommandation] ?? 0) + 1;
  });

  // ═══════════════════════════════════════════════════════════
  // PAGE 1 — Synthèse pédagogique
  // ═══════════════════════════════════════════════════════════

  const subtitle = `Généré le ${formatDateFR(now)} · ${total} participant${total > 1 ? 's' : ''} · ${completedCount} diagnostic${completedCount > 1 ? 's' : ''} terminé${completedCount > 1 ? 's' : ''}`;
  drawHeader(doc, pageWidth, orgName, logo, subtitle);


  let cursorY = 66;
  cursorY = drawFilterLine(doc, marginX, cursorY, filters);

  // KPI cards
  cursorY = drawKpiCards(doc, marginX, cursorY, contentW, [
    { label: 'Participants', value: String(total) },
    { label: 'Diagnostics terminés', value: `${completedCount} · ${Math.round(completionRate * 100)} %` },
    { label: 'Score global moyen', value: avgScoreRatio !== null ? `${Math.round(avgScoreRatio * 100)} %` : '—' },
    { label: 'Temps moy. / question', value: avgTime !== null ? `${avgTime.toFixed(1)} s` : '—' },
  ]);

  // Moyenne par bloc
  cursorY = drawSectionTitle(doc, marginX, cursorY, 'Moyenne par bloc de compétence');
  cursorY = drawBlockBars(doc, marginX, cursorY, contentW, blockAvgs);

  // Répartitions — 3 colonnes
  cursorY = drawSectionTitle(doc, marginX, cursorY + 4, 'Répartitions');

  const colGap = 20;
  const colW = (contentW - colGap * 2) / 3;

  const distCol1Y = drawDistBlock(doc, marginX, cursorY, colW, 'Niveau CECRL', [
    { label: 'A — élémentaire', count: levelCounts.A },
    { label: 'B1 — intermédiaire', count: levelCounts.B1 },
    { label: 'B2 — inter. avancé', count: levelCounts.B2 },
    { label: 'C — avancé', count: levelCounts.C },
  ]);

  const distCol2Y = drawDistBlock(doc, marginX + colW + colGap, cursorY, colW, 'Profil', [
    { label: PROFIL_LABELS[1], count: profilCounts[1] },
    { label: PROFIL_LABELS[2], count: profilCounts[2] },
    { label: PROFIL_LABELS[3], count: profilCounts[3] },
    { label: PROFIL_LABELS[4], count: profilCounts[4] },
  ]);

  const distCol3Y = drawDistBlock(
    doc,
    marginX + (colW + colGap) * 2,
    cursorY,
    colW,
    'Recommandation',
    Object.entries(RECO_LABELS).map(([k, label]) => ({
      label,
      count: recoCounts[k] ?? 0,
    })),
  );

  cursorY = Math.max(distCol1Y, distCol2Y, distCol3Y);

  // ═══════════════════════════════════════════════════════════
  // PAGE 2+ — Tableau détaillé
  // ═══════════════════════════════════════════════════════════

  doc.addPage();
drawHeader(doc, pageWidth, orgName, logo, `Détail des participants · ${total} ligne${total > 1 ? 's' : ''}`);

  const tableStartY = 60;

  // 15 colonnes serrées
  const head = [[
    'Participant',
    'Groupe',
    'Statut',
    'Niv.',
    'Score',
    'B1', 'B2', 'B3', 'B4', 'B5', 'B6',
    'Profil',
    'Recommandation',
    'Tps/Q',
  ]];

  const body = users.map((u) => {
    const isDone = u.status === 'COMPLETED';
    const fullName = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email;
    return [
      fullName,
      u.groupName ?? '—',
      STATUS_LABELS[u.status] ?? u.status,
      isDone ? (u.level ?? '—') : '—',
      isDone ? formatPctFromSix(u.score) : '—',
      isDone ? formatPct(u.scoreBloc1) : '—',
      isDone ? formatPct(u.scoreBloc2) : '—',
      isDone ? formatPct(u.scoreBloc3) : '—',
      isDone ? formatPct(u.scoreBloc4) : '—',
      isDone ? formatPct(u.scoreBloc5) : '—',
      isDone ? formatPct(u.scoreBloc6) : '—',
      isDone && u.quadrant ? PROFIL_SHORT[u.quadrant] : '—',
      isDone && u.recommandation ? (RECO_LABELS[u.recommandation] ?? u.recommandation) : '—',
      isDone && u.avgTimePerQuestion !== null && u.avgTimePerQuestion !== undefined
        ? `${u.avgTimePerQuestion.toFixed(1)}s`
        : '—',
    ];
  });

  autoTable(doc, {
    head,
    body,
    startY: tableStartY,
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
      textColor: COLOR.ink,
      lineColor: COLOR.lineSoft,
      lineWidth: 0.3,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: COLOR.accent,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'center',
      valign: 'middle',
      cellPadding: { top: 5, right: 3, bottom: 5, left: 3 },
    },
    alternateRowStyles: {
      fillColor: COLOR.bg,
    },
    columnStyles: {
      0: { cellWidth: 100 },              // Participant
      1: { cellWidth: 70 },               // Groupe
      2: { cellWidth: 52, halign: 'center' }, // Statut
      3: { cellWidth: 28, halign: 'center' }, // Niveau
      4: { cellWidth: 40, halign: 'center' }, // Score global
      5: { cellWidth: 32, halign: 'center' }, // B1
      6: { cellWidth: 32, halign: 'center' },
      7: { cellWidth: 32, halign: 'center' },
      8: { cellWidth: 32, halign: 'center' },
      9: { cellWidth: 32, halign: 'center' },
      10: { cellWidth: 32, halign: 'center' },
      11: { cellWidth: 48, halign: 'center' }, // Profil
      12: { cellWidth: 92 },              // Reco
      13: { cellWidth: 34, halign: 'center' }, // Tps
    },
    margin: { left: marginX, right: marginX, top: 60, bottom: 40 },
    didDrawPage: (data) => {
      // Pied de page sur toutes les pages du tableau
      const pageNumber = doc.getNumberOfPages();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLOR.muted);
      doc.text(
        `BILAN COLLECTIF · ${orgName} · ${formatDateFR(now)}`,
        marginX,
        pageHeight - 20,
      );
      doc.text(
        `Page ${data.pageNumber} / ${pageNumber}`,
        pageWidth - marginX,
        pageHeight - 20,
        { align: 'right' },
      );
    },
  });

  // ─── Sauvegarde ────────────────────────────────────────────
  const today = now.toISOString().slice(0, 10);
  const filename = `bilan-collectif-${slugify(orgName)}-${today}.pdf`;
  doc.save(filename);
}
