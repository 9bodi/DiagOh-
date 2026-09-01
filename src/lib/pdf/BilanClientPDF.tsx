import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Circle,
  Polygon,
  Line,
  Rect,
  Image,
} from '@react-pdf/renderer';
import path from 'path';

// ============ Palette ============
const COLORS = {
  navy: '#1B3A5C',
  orange: '#E97B4E',
  cream: '#FDF8F0',
  ink: '#1A1A1A',
  slate700: '#334155',
  slate600: '#475569',
  slate500: '#64748B',
  slate300: '#CBD5E1',
  slate200: '#E2E8F0',
  slate100: '#F1F5F9',
  slate50: '#F8FAFC',
  sky50: '#F0F9FF',
  sky200: '#BAE6FD',
  sky900: '#0C4A6E',
  emerald: '#10B981',
  amber: '#F59E0B',
  red: '#DC2626',
  dotA: '#DC2626',
  dotB1: '#F59E0B',
  dotB2: '#0EA5E9',
  dotC: '#10B981',
  white: '#FFFFFF',
};

// ============ Styles ============
const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.cream,
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: COLORS.ink,
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.navy,
    marginBottom: 16,
  },
  logoBlock: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  logoText: { fontSize: 14, fontFamily: 'Times-Bold', color: COLORS.navy },
  logoImg: { width: 60, height: 24, objectFit: 'contain' },
  logoKicker: { fontSize: 8, color: COLORS.orange, letterSpacing: 1.4 },
  topMeta: { fontSize: 8, color: COLORS.slate500, letterSpacing: 0.8, textAlign: 'right' },

  identityBand: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    backgroundColor: 'rgba(27, 58, 92, 0.05)',
    borderRadius: 6,
    padding: 10,
    marginBottom: 14,
  },
  idCell: { minWidth: 100 },
  idLabel: { fontSize: 7, color: COLORS.slate500, letterSpacing: 1, marginBottom: 2 },
  idValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: COLORS.ink },

  pageKicker: {
    fontSize: 8,
    color: COLORS.orange,
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 22,
    fontFamily: 'Times-Italic',
    color: COLORS.ink,
    marginBottom: 14,
  },
  pageSubtitle: {
    fontSize: 10,
    color: COLORS.slate600,
    lineHeight: 1.5,
    marginBottom: 14,
  },

  // Score en %
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 20,
    marginBottom: 12,
  },
  scoreBig: {
    fontSize: 54,
    fontFamily: 'Times-BoldItalic',
    color: COLORS.navy,
    lineHeight: 1,
  },
  scoreLabel: { fontSize: 8, color: COLORS.orange, letterSpacing: 1.4, marginTop: 4 },
  scoreRight: { flex: 1, paddingBottom: 4 },
  levelTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.navy,
    marginBottom: 4,
  },
  levelInterp: {
    fontSize: 10,
    color: COLORS.slate700,
    lineHeight: 1.5,
  },

  // Histogramme bâton niveau
  histoWrap: { marginTop: 4, marginBottom: 14 },
  histoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 60,
    paddingHorizontal: 10,
  },
  histoBarWrap: { alignItems: 'center', width: 50 },
  histoBar: { width: 22, borderRadius: 2 },
  histoLabel: {
    marginTop: 4,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.slate500,
    textAlign: 'center',
  },
  histoLabelActive: { color: COLORS.navy },

  // Explanatory text
  explainWrap: {
    backgroundColor: COLORS.white,
    borderWidth: 0.5,
    borderColor: COLORS.slate200,
    borderRadius: 6,
    padding: 10,
    marginBottom: 14,
  },
  explainText: { fontSize: 9, color: COLORS.slate700, lineHeight: 1.5, marginBottom: 6 },
  levelBulletRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  levelDot: { width: 8, height: 8, borderRadius: 4 },
  levelBulletText: { fontSize: 9, color: COLORS.slate700, flex: 1 },

  // Radar card
  radarCard: {
    backgroundColor: COLORS.white,
    borderWidth: 0.5,
    borderColor: COLORS.slate200,
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  radarKicker: { fontSize: 8, color: COLORS.orange, letterSpacing: 1.4, marginBottom: 2 },
  radarTitle: {
    fontSize: 14,
    fontFamily: 'Times-Italic',
    color: COLORS.navy,
    marginBottom: 2,
  },
  radarSub: { fontSize: 9, color: COLORS.slate500, marginBottom: 8 },
  radarWrap: { alignItems: 'center' },

  // Page Déclarations
  quadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  quadCell: {
    width: '48%',
    borderWidth: 0.5,
    borderRadius: 6,
    padding: 12,
    minHeight: 70,
  },
  quadCellActive: {
    backgroundColor: COLORS.sky50,
    borderColor: COLORS.sky200,
  },
  quadCellGray: {
    backgroundColor: COLORS.slate100,
    borderColor: COLORS.slate200,
  },
  quadLabel: {
    fontSize: 11,
    fontFamily: 'Times-Italic',
    color: COLORS.sky900,
    marginBottom: 6,
  },
  quadLabelGray: { color: COLORS.slate600 },
  quadPct: {
    fontSize: 22,
    fontFamily: 'Times-BoldItalic',
    color: COLORS.sky900,
  },
  quadPctGray: { color: COLORS.slate600 },
  quadCount: { fontSize: 8, color: COLORS.slate500 },

  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.navy,
    marginBottom: 6,
    marginTop: 6,
  },
  sectionDesc: {
    fontSize: 9,
    color: COLORS.slate600,
    lineHeight: 1.5,
    marginBottom: 10,
  },

  // Page 2 blocks
  blockRow: {
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(27, 58, 92, 0.2)',
  },
  blockRowLast: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(27, 58, 92, 0.2)',
  },
  blockHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  blockName: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Times-Italic',
    color: COLORS.ink,
  },
  blockScore: {
    width: 45,
    fontSize: 13,
    fontFamily: 'Times-BoldItalic',
    color: COLORS.navy,
    textAlign: 'right',
  },
  blockBarWrap: {
    width: 90,
    height: 5,
    backgroundColor: 'rgba(27, 58, 92, 0.1)',
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  blockBar: { height: '100%' },
  blockMention: {
    width: 110,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.4,
    textAlign: 'right',
  },
  blockAnalysis: {
    fontSize: 10,
    color: COLORS.slate600,
    lineHeight: 1.5,
  },

  // Page Synthèse
  summaryText: {
    fontSize: 11,
    color: COLORS.ink,
    lineHeight: 1.7,
    marginBottom: 20,
  },
  prioKicker: {
    fontSize: 8,
    color: COLORS.orange,
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  prioRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  prioNum: {
    width: 22,
    fontSize: 18,
    fontFamily: 'Times-BoldItalic',
  },
  prioBlockName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.ink,
    marginBottom: 2,
  },
  prioText: {
    fontSize: 10,
    color: COLORS.slate600,
    lineHeight: 1.5,
  },

  recoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.navy,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  recoBadgeText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  recoBox: {
    backgroundColor: COLORS.navy,
    borderRadius: 6,
    padding: 18,
    marginTop: 20,
  },
  recoKicker: {
    fontSize: 8,
    color: COLORS.orange,
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  recoText: {
    fontSize: 11,
    fontFamily: 'Times-Italic',
    color: COLORS.cream,
    lineHeight: 1.6,
  },
  signature: {
    fontSize: 10,
    fontFamily: 'Times-Italic',
    color: COLORS.navy,
    marginTop: 20,
  },
  signatureSub: { fontSize: 9, color: COLORS.slate500, marginTop: 2 },

  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: COLORS.slate500,
    letterSpacing: 0.6,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(27, 58, 92, 0.2)',
  },
});

// ============ Métadonnées niveaux (textes Roxane) ============
const LEVELS = ['A', 'B1', 'B2', 'C'] as const;

const LEVEL_META: Record<string, { short: string; long: string; interp: string; dotColor: string }> = {
  A: {
    short: 'élémentaire',
    long: 'Niveau élémentaire',
    interp:
      "Les fondamentaux de l'orthographe restent insuffisamment maîtrisés pour être mobilisés de façon régulière. Une remise à niveau préalable peut être nécessaire avant un parcours OHé.",
    dotColor: COLORS.dotA,
  },
  B1: {
    short: 'intermédiaire',
    long: 'Niveau intermédiaire',
    interp:
      "Les bases de l'orthographe sont acquises, mais certaines règles restent fragiles. Le niveau correspond à la cible d'un parcours OHé.",
    dotColor: COLORS.dotB1,
  },
  B2: {
    short: 'intermédiaire avancé',
    long: 'Niveau intermédiaire avancé',
    interp:
      "Les principales règles sont maîtrisées, mais certaines difficultés persistent dans des situations plus complexes. Le niveau correspond à la cible d'un parcours OHé.",
    dotColor: COLORS.dotB2,
  },
  C: {
    short: 'avancé',
    long: 'Niveau avancé',
    interp:
      "Les principales règles d'orthographe sont maîtrisées, y compris dans des situations complexes. Le niveau est probablement supérieur à la cible d'un parcours OHé.",
    dotColor: COLORS.dotC,
  },
};

// Textes "Et maintenant ?" (Roxane)
const NEXT_STEP_TEXT: Record<string, string> = {
  A: "Il se peut que votre niveau soit en dessous du niveau travaillé dans la formation OHé. OHé propose une remise à niveau en orthographe grammaticale, avec un travail progressif sur les accords, notamment sur celui des verbes à tous les temps et au participe passé. Une formation adaptée à votre niveau peut constituer une première étape.",
  B1: "Votre niveau correspond à celui auquel s'adresse la formation OHé. Une méthode ludique, sans règles à mémoriser, pour reprendre confiance en orthographe en 10 minutes par jour. Fondée sur la logique et les sciences cognitives, elle est adaptée aux troubles dys. Elle permet de maîtriser les accords, notamment sur celui des verbes à tous les temps et au participe passé. Les fautes ne sont pas une fatalité, mais un problème de méthode.",
  B2: "Votre niveau correspond à celui auquel s'adresse la formation OHé. Une méthode ludique, sans règles à mémoriser, pour reprendre confiance en orthographe en 10 minutes par jour. Fondée sur la logique et les sciences cognitives, elle est adaptée aux troubles dys. Elle permet de maîtriser les accords, notamment sur celui des verbes à tous les temps et au participe passé. Les fautes ne sont pas une fatalité, mais un problème de méthode.",
  C: "Il se peut que votre niveau soit supérieur à celui travaillé dans la formation OHé. OHé propose surtout une remise à niveau en orthographe grammaticale, avec un travail progressif sur les accords, notamment sur celui des verbes à tous les temps et au participe passé.",
};

// ============ Métadonnées quadrants (Roxane) ============
const QUADRANT_META: Record<number, { label: string }> = {
  1: { label: 'Besoin perçu · Disposé' },
  2: { label: 'Besoin perçu · Moins disposé' },
  3: { label: 'Pas de besoin perçu · Disposé' },
  4: { label: 'Pas de besoin perçu · Moins disposé' },
};

// ============ Métadonnées recommandations ============
type Recommandation = 'A_FORMER' | 'A_FORMER_ET_ACCOMPAGNER' | 'A_FORMER_SOUS_RESERVES' | 'A_ORIENTER';

const RECO_META: Record<Recommandation, { label: string; isGray: boolean }> = {
  A_FORMER: { label: 'À former', isGray: false },
  A_FORMER_ET_ACCOMPAGNER: { label: 'À former et accompagner', isGray: false },
  A_FORMER_SOUS_RESERVES: { label: 'À former sous réserves', isGray: false },
  A_ORIENTER: { label: 'À orienter', isGray: true },
};

// ============ Mentions par bloc ============
const MENTION_META = {
  maitrise: { label: 'MAÎTRISÉ', color: COLORS.emerald, key: 'maitrise' as const },
  encours: { label: 'EN COURS DE MAÎTRISE', color: COLORS.dotB2, key: 'encours' as const },
  fragile: { label: 'FRAGILE', color: COLORS.amber, key: 'fragile' as const },
  nonmaitrise: { label: 'NON MAÎTRISÉ', color: COLORS.red, key: 'nonmaitrise' as const },
};

function correctToMention(correct: number) {
  if (correct >= 7) return MENTION_META.maitrise;
  if (correct >= 5) return MENTION_META.encours;
  if (correct >= 3) return MENTION_META.fragile;
  return MENTION_META.nonmaitrise;
}

// Analyses par bloc (Roxane)
const BLOCK_ANALYSIS: Record<string, Record<string, string>> = {
  'Singulier / Pluriel': {
    maitrise: 'Accords en nombre solidement maîtrisés, y compris sur les cas irréguliers.',
    encours: 'Accords en nombre en cours de maîtrise, quelques cas particuliers restent à sécuriser.',
    fragile: "Accords en nombre fragiles, plusieurs règles restent à consolider.",
    nonmaitrise: "Les accords en nombre nécessitent un travail de fond sur les règles de base et les cas irréguliers.",
  },
  'Conjugaison': {
    maitrise: "Conjugaisons maîtrisées sur l'ensemble des temps et modes testés.",
    encours: "Temps simples acquis, modes composés et concordances des temps à consolider.",
    fragile: "La conjugaison des verbes reste fragile sur plusieurs temps.",
    nonmaitrise: "La conjugaison des verbes (selon le temps et la personne) constitue un axe prioritaire de progression.",
  },
  'Participe passé': {
    maitrise: "Règles d'accord du participe passé maîtrisées, y compris les cas complexes.",
    encours: "Accord avec « être » acquis ; les cas avec « avoir » et pronominaux restent instables.",
    fragile: "Les accords du participe passé restent fragiles, en particulier avec l'auxiliaire « avoir ».",
    nonmaitrise: "L'accord des verbes au participe passé (surtout avec l'auxiliaire « avoir ») constitue un axe prioritaire de progression.",
  },
  'Orthographe lexicale': {
    maitrise: "Vocabulaire orthographié avec précision sur l'ensemble des items testés.",
    encours: "Orthographe lexicale en cours de maîtrise ; quelques mots courants restent à fiabiliser.",
    fragile: "L'orthographe des mots courants reste fragile.",
    nonmaitrise: "L'orthographe des mots (orthographe lexicale) constitue un axe prioritaire de progression.",
  },
  'Syntaxe': {
    maitrise: "Constructions syntaxiques solides, y compris dans les phrases complexes.",
    encours: "Syntaxe globalement correcte ; les constructions complexes (subordination, ponctuation) à consolider.",
    fragile: "La construction des phrases reste fragile sur les cas complexes.",
    nonmaitrise: "La construction des phrases nécessite un travail sur la structure, la subordination et la ponctuation.",
  },
  'Compréhension écrite': {
    maitrise: "Compréhension fine des textes, y compris du sens implicite.",
    encours: "Bonne restitution du sens explicite ; le sens implicite peut être approfondi.",
    fragile: "La compréhension écrite reste fragile sur les textes plus denses.",
    nonmaitrise: "La compréhension écrite nécessite un travail sur la lecture active et l'inférence.",
  },
};

function analysisFor(blockLabel: string, correct: number): string {
  const key = correctToMention(correct).key;
  const pool = BLOCK_ANALYSIS[blockLabel];
  if (!pool) return '';
  return pool[key] ?? '';
}

// Executive summary
function buildSummary(
  firstName: string,
  lastName: string,
  level: string,
  correctTotal: number,
  blocks: { label: string; correctCount: number }[],
  quadrant: number
): string {
  const fullName = `${firstName} ${lastName}`.trim() || 'Le participant';
  const strong = blocks.filter(b => b.correctCount >= 7).map(b => b.label);
  const weak = blocks.filter(b => b.correctCount <= 2).map(b => b.label);
  const medium = blocks.filter(b => b.correctCount >= 3 && b.correctCount <= 4).map(b => b.label);
  const levelShort = LEVEL_META[level]?.short ?? '';
  const pct = Math.round((correctTotal / 48) * 100);

  let s = `${fullName} atteint le niveau ${level} (${levelShort}), avec ${correctTotal} bonnes réponses sur 48 (${pct} %). `;

  if (strong.length > 0) {
    s += `Points forts : ${strong.slice(0, 2).join(', ')}${strong.length > 2 ? ', etc.' : ''}. `;
  }
  if (weak.length > 0) {
    s += `Point${weak.length > 1 ? 's' : ''} de vigilance : ${weak.join(', ')}. `;
  } else if (medium.length > 0) {
    s += `Axe${medium.length > 1 ? 's' : ''} de progression : ${medium.slice(0, 2).join(', ')}. `;
  }

  s += QUADRANT_META[quadrant]?.label
    ? `Déclarations du participant : ${QUADRANT_META[quadrant].label}.`
    : '';
  return s;
}

// ============ Types ============
export interface BilanBlock {
  label: string;
  score: number;
  correctCount: number;
}

export interface BilanData {
  firstName: string;
  lastName: string;
  email: string;
  organizationName: string;
  groupName?: string;
  completedAt: Date;
  level: 'A' | 'B1' | 'B2' | 'C';
  scoreProcedural: number;
  correctTotal: number;
  blocks: BilanBlock[];
  quadrant: 1 | 2 | 3 | 4;
  scoreAdaptation: number;
  scoreInteret: number;
  recommandation?: Recommandation | null;
  avgTimePerQuestion?: number | null;
  totalTimeSeconds?: number | null;
  reference?: string;
}

// ============ Radar SVG (avec labels complets) ============
const RADAR_LABELS = [
  'Singulier / Pluriel',
  'Conjugaison',
  'Participe passé',
  'Orthographe lexicale',
  'Syntaxe',
  'Compréhension écrite',
];

function RadarChart({ scores }: { scores: number[] }) {
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const rMax = 80;
  const n = 6;

  const points = scores
    .map((s, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const r = Math.max(0, Math.min(1, s)) * rMax;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    })
    .join(' ');

  const gridPoints = [0.33, 0.66, 1].map(k =>
    Array.from({ length: n }, (_, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const r = k * rMax;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(' ')
  );

  const axes = Array.from({ length: n }, (_, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return {
      x2: cx + rMax * Math.cos(angle),
      y2: cy + rMax * Math.sin(angle),
      lx: cx + (rMax + 18) * Math.cos(angle),
      ly: cy + (rMax + 18) * Math.sin(angle),
      angle,
    };
  });

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gridPoints.map((pts, i) => (
        <Polygon
          key={i}
          points={pts}
          fill="none"
          stroke="rgba(27, 58, 92, 0.15)"
          strokeWidth={0.5}
        />
      ))}
      {axes.map((a, i) => (
        <Line
          key={i}
          x1={cx}
          y1={cy}
          x2={a.x2}
          y2={a.y2}
          stroke="rgba(27, 58, 92, 0.15)"
          strokeWidth={0.5}
        />
      ))}
      <Polygon
        points={points}
        fill="rgba(27, 58, 92, 0.16)"
        stroke={COLORS.navy}
        strokeWidth={1.5}
      />
      {scores.map((s, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const r = Math.max(0, Math.min(1, s)) * rMax;
        return (
          <Circle
            key={i}
            cx={cx + r * Math.cos(angle)}
            cy={cy + r * Math.sin(angle)}
            r={2.5}
            fill={COLORS.navy}
          />
        );
      })}
    </Svg>
  );
}

// Labels autour du radar (positionnés en absolute côté React, pas SVG)
function RadarLabels() {
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const rLabel = 110;
  const n = 6;
  const positions = Array.from({ length: n }, (_, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return {
      x: cx + rLabel * Math.cos(angle),
      y: cy + rLabel * Math.sin(angle),
      text: RADAR_LABELS[i],
    };
  });

  return (
    <View style={{ position: 'absolute', width: size, height: size, top: 0, left: 0 }}>
      {positions.map((p, i) => {
        const halign = Math.abs(p.x - cx) < 15 ? 'center' : p.x > cx ? 'left' : 'right';
        const width = 90;
        const leftPos =
          halign === 'center' ? p.x - width / 2 : halign === 'left' ? p.x - 2 : p.x - width + 2;
        return (
          <Text
            key={i}
            style={{
              position: 'absolute',
              left: leftPos,
              top: p.y - 6,
              width,
              fontSize: 8,
              color: COLORS.slate600,
              textAlign: halign as 'left' | 'right' | 'center',
              fontFamily: 'Helvetica-Bold',
            }}
          >
            {p.text}
          </Text>
        );
      })}
    </View>
  );
}

const LOGO_PATH = path.join(process.cwd(), 'public', 'img', 'logos', 'ohe-logo.png');

// Format temps
function formatTime(seconds: number | null | undefined): string {
  if (seconds == null) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m === 0) return `${s} s`;
  return `${m} min ${String(s).padStart(2, '0')} s`;
}

// ============ Composant ============
export default function BilanClientPDF({ data, logo }: { data: BilanData; logo?: Buffer }) {
  const dateStr = new Date(data.completedAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const levelInfo = LEVEL_META[data.level] ?? LEVEL_META.A;
  const fullName = `${data.firstName} ${data.lastName}`.trim() || 'Participant·e';
  const d = new Date(data.completedAt);
  const ref =
    data.reference ??
    `OHE-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;

  const activeLevelIndex = LEVELS.indexOf(data.level);
  const radarScores = data.blocks.map(b => b.score);
  const scorePct = Math.round((data.correctTotal / 48) * 100);

  const weakBlocks = data.blocks.filter(b => b.correctCount <= 2);
  const mediumBlocks = data.blocks.filter(b => b.correctCount >= 3 && b.correctCount <= 4);
  const priorities = [...weakBlocks, ...mediumBlocks].slice(0, 3);

  const summary = buildSummary(
    data.firstName,
    data.lastName,
    data.level,
    data.correctTotal,
    data.blocks,
    data.quadrant
  );

  const recoKey = (data.recommandation ?? null) as Recommandation | null;
  const recoLabel = recoKey ? RECO_META[recoKey].label : '—';
  const nextStepText = NEXT_STEP_TEXT[data.level] ?? NEXT_STEP_TEXT.A;

  // Histogramme niveau — 4 barres verticales fixes, active en navy
  const histoData = LEVELS.map(lv => ({
    level: lv,
    active: lv === data.level,
    color: LEVEL_META[lv].dotColor,
  }));

  const avgTime = data.avgTimePerQuestion;
  const totalTime = data.totalTimeSeconds;

  return (
    <Document>
      {/* ============ PAGE 1 — Résultat du test ============ */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar}>
          <View style={styles.logoBlock}>
            {logo ? <Image src={logo} style={styles.logoImg} /> : <Text style={styles.logoText}>OHé</Text>}
<Text style={styles.logoKicker}>BILAN — {fullName.toUpperCase()} — {data.organizationName.toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.topMeta}>Réf. {ref}</Text>
            <Text style={styles.topMeta}>Test passé le {dateStr}</Text>
          </View>
        </View>

        {/* Identité */}
        <View style={styles.identityBand}>
          <View style={styles.idCell}>
            <Text style={styles.idLabel}>PARTICIPANT</Text>
            <Text style={styles.idValue}>{fullName}</Text>
          </View>
          <View style={styles.idCell}>
            <Text style={styles.idLabel}>EMAIL</Text>
            <Text style={styles.idValue}>{data.email}</Text>
          </View>
          <View style={styles.idCell}>
            <Text style={styles.idLabel}>ORGANISATION</Text>
            <Text style={styles.idValue}>{data.organizationName}</Text>
          </View>
          {data.groupName ? (
            <View style={styles.idCell}>
              <Text style={styles.idLabel}>GROUPE</Text>
              <Text style={styles.idValue}>{data.groupName}</Text>
            </View>
          ) : null}
          <View style={styles.idCell}>
            <Text style={styles.idLabel}>TEMPS MOYEN / QUESTION</Text>
            <Text style={styles.idValue}>{avgTime != null ? `${avgTime.toFixed(1).replace('.', ',')} s` : '—'}</Text>
          </View>
          <View style={styles.idCell}>
            <Text style={styles.idLabel}>TEMPS TOTAL</Text>
            <Text style={styles.idValue}>{formatTime(totalTime)}</Text>
          </View>
        </View>

        <Text style={styles.pageTitle}>Résultat du test</Text>

        {/* Score % + niveau global */}
        <View style={styles.scoreRow}>
          <View>
            <Text style={styles.scoreBig}>{scorePct} %</Text>
            <Text style={styles.scoreLabel}>{data.correctTotal} / 48 BONNES RÉPONSES</Text>
          </View>
          <View style={styles.scoreRight}>
            <Text style={styles.levelTitle}>
              Niveau global {data.level} · {levelInfo.long.replace('Niveau ', '').charAt(0).toLowerCase() + levelInfo.long.replace('Niveau ', '').slice(1)}
            </Text>
            <Text style={styles.levelInterp}>{levelInfo.interp}</Text>
          </View>
        </View>

        



        {/* Radar */}
        <View style={styles.radarCard}>
          <Text style={styles.radarTitle}>Profil de compétences</Text>
          <Text style={styles.radarSub}>Les résultats par compétences</Text>
          <View style={[styles.radarWrap, { position: 'relative', width: 300, height: 300, alignSelf: 'center' }]}>
            <RadarChart scores={radarScores} />
            <RadarLabels />
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>OHé — Bilan client · usage RH / formation</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber}/${totalPages}`} />
        </View>
      </Page>

      {/* ============ PAGE 2 — Déclarations du participant ============ */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar}>
          <View style={styles.logoBlock}>
            {logo ? <Image src={logo} style={styles.logoImg} /> : <Text style={styles.logoText}>OHé</Text>}
<Text style={styles.logoKicker}>BILAN — {fullName.toUpperCase()} — {data.organizationName.toUpperCase()}</Text>
          </View>
          <Text style={styles.topMeta}>{dateStr}</Text>
        </View>

        <Text style={styles.pageTitle}>Déclarations du participant</Text>
        <Text style={styles.pageSubtitle}>
          Cette partie présente les réponses du participant sur le besoin qu&apos;il perçoit et sa disposition à suivre une formation.
        </Text>

        {/* 4 cases quadrants (Q1 en haut à gauche, ordre 1-2-3-4) */}
        <View style={styles.quadGrid}>
          {[1, 2, 3, 4].map(q => {
            const info = QUADRANT_META[q];
            const isActive = data.quadrant === q;
            const isGray = q === 4;
            const cellStyle = isGray ? styles.quadCellGray : styles.quadCellActive;
            const labelStyle = isGray ? [styles.quadLabel, styles.quadLabelGray] : styles.quadLabel;
            const pctStyle = isGray ? [styles.quadPct, styles.quadPctGray] : styles.quadPct;
            return (
              <View key={q} style={[styles.quadCell, cellStyle, isActive ? { borderWidth: 1.5 } : {}]}>
                <Text style={labelStyle}>{info.label}</Text>
                <Text style={pctStyle}>{isActive ? '✓' : ''}</Text>
                <Text style={styles.quadCount}>
                  {isActive ? 'Profil du participant' : ''}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Préconisation — bloc 4 cases */}
        <Text style={[styles.pageTitle, { fontSize: 20 }]}>Préconisation</Text>
        <Text style={styles.pageSubtitle}>
          Cette préconisation croise les résultats du test et les déclarations du participant, afin de déterminer la suite la plus adaptée.
        </Text>

        <View style={styles.quadGrid}>
          {(['A_FORMER', 'A_FORMER_ET_ACCOMPAGNER', 'A_FORMER_SOUS_RESERVES', 'A_ORIENTER'] as Recommandation[]).map(k => {
            const info = RECO_META[k];
            const isActive = recoKey === k;
            const cellStyle = info.isGray ? styles.quadCellGray : styles.quadCellActive;
            const labelStyle = info.isGray ? [styles.quadLabel, styles.quadLabelGray] : styles.quadLabel;
            return (
              <View key={k} style={[styles.quadCell, cellStyle, isActive ? { borderWidth: 1.5 } : {}]}>
                <Text style={labelStyle}>{info.label}</Text>
                <Text style={styles.quadCount}>
                  {isActive ? 'Profil du participant' : ''}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.footer} fixed>
          <Text>OHé — Bilan client · usage RH / formation</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber}/${totalPages}`} />
        </View>
      </Page>

      {/* ============ PAGE 3 — Détail par compétence ============ */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar}>
          <View style={styles.logoBlock}>
            {logo ? <Image src={logo} style={styles.logoImg} /> : <Text style={styles.logoText}>OHé</Text>}
<Text style={styles.logoKicker}>BILAN — {fullName.toUpperCase()} — {data.organizationName.toUpperCase()}</Text>
          </View>
          <Text style={styles.topMeta}>{dateStr}</Text>
        </View>

        <Text style={styles.pageTitle}>Détail par compétence</Text>

        {data.blocks.map((b, i) => {
          const mention = correctToMention(b.correctCount);
          const isLast = i === data.blocks.length - 1;
          return (
            <View key={i} style={[styles.blockRow, isLast ? styles.blockRowLast : {}]}>
              <View style={styles.blockHeadRow}>
                <Text style={styles.blockName}>{b.label}</Text>
                <Text style={styles.blockScore}>
                  {b.correctCount}
                  <Text style={{ fontSize: 9, color: COLORS.slate500 }}>/8</Text>
                </Text>
                <View style={styles.blockBarWrap}>
                  <View
                    style={[
                      styles.blockBar,
                      { width: `${(b.correctCount / 8) * 100}%`, backgroundColor: mention.color },
                    ]}
                  />
                </View>
                <Text style={[styles.blockMention, { color: mention.color }]}>
                  {mention.label}
                </Text>
              </View>
              <Text style={styles.blockAnalysis}>{analysisFor(b.label, b.correctCount)}</Text>
            </View>
          );
        })}

        <View style={styles.footer} fixed>
          <Text>OHé — Bilan client · usage RH / formation</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber}/${totalPages}`} />
        </View>
      </Page>

      {/* ============ PAGE 4 — Synthèse ============ */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar}>
          <View style={styles.logoBlock}>
            {logo ? <Image src={logo} style={styles.logoImg} /> : <Text style={styles.logoText}>OHé</Text>}
<Text style={styles.logoKicker}>BILAN CLIENT — {data.organizationName.toUpperCase()}</Text>
          </View>
          <Text style={styles.topMeta}>{dateStr}</Text>
        </View>

        <Text style={styles.pageTitle}>Synthèse</Text>

        <Text style={styles.summaryText}>{summary}</Text>

        {priorities.length > 0 && (
          <>
            <Text style={styles.prioKicker}>PRIORITÉS DE PROGRESSION</Text>
            {priorities.map((p, i) => {
              const mention = correctToMention(p.correctCount);
              return (
                <View key={i} style={styles.prioRow}>
                  <Text style={[styles.prioNum, { color: mention.color }]}>
                    {i + 1}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.prioBlockName}>{p.label}</Text>
                    <Text style={styles.prioText}>
                      Score {p.correctCount}/8 · {mention.label.toLowerCase()}. À traiter{' '}
                      {i === 0 ? 'en priorité' : 'en parallèle'} pour sécuriser les écrits professionnels.
                    </Text>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* Badge catégorie recommandation */}
        {recoKey && (
          <View style={styles.recoBadge}>
            <Text style={styles.recoBadgeText}>PRÉCONISATION : {recoLabel.toUpperCase()}</Text>
          </View>
        )}

        <View style={styles.recoBox}>
          <Text style={styles.recoKicker}>ET MAINTENANT ?</Text>
          <Text style={styles.recoText}>{nextStepText}</Text>
        </View>

        <Text style={styles.signature}>
          Diagnostic conçu par Roxane Joannidès
        </Text>
        <Text style={styles.signatureSub}>Docteure en sciences du langage</Text>

        <View style={styles.footer} fixed>
          <Text>OHé — Bilan client · confidentiel, usage interne RH</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber}/${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
