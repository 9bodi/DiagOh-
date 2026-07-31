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
  slate600: '#475569',
  slate500: '#64748B',
  slate300: '#CBD5E1',
  slate200: '#E2E8F0',
  slate100: '#F1F5F9',
  emerald: '#10B981',
  amber: '#F59E0B',
  red: '#DC2626',
  white: '#FFFFFF',
};

// ============ Styles ============
const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.cream,
    padding: 48,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: COLORS.ink,
  },

  // Header
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.navy,
    marginBottom: 20,
  },
  logoBlock: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  logoText: { fontSize: 14, fontFamily: 'Times-Bold', color: COLORS.navy },
  logoImg: { width: 60, height: 24, objectFit: 'contain' },

  logoKicker: {
    fontSize: 8,
    color: COLORS.orange,
    letterSpacing: 1.4,
  },
  topMeta: {
    fontSize: 8,
    color: COLORS.slate500,
    letterSpacing: 0.8,
    textAlign: 'right',
  },

  // Identity band
  identityBand: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    backgroundColor: 'rgba(27, 58, 92, 0.05)',
    borderRadius: 6,
    padding: 12,
    marginBottom: 20,
  },
  idCell: { minWidth: 110 },
  idLabel: {
    fontSize: 7,
    color: COLORS.slate500,
    letterSpacing: 1,
    marginBottom: 2,
  },
  idValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.ink,
  },

  // Hero score + level
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 20,
    marginBottom: 18,
  },
  scoreBig: {
    fontSize: 60,
    fontFamily: 'Times-BoldItalic',
    color: COLORS.navy,
    lineHeight: 1,
  },
  scoreMax: {
    fontSize: 16,
    fontFamily: 'Times-Italic',
    color: COLORS.navy,
    opacity: 0.5,
  },
  scoreKicker: {
    fontSize: 8,
    color: COLORS.orange,
    letterSpacing: 1.4,
    marginTop: 6,
  },
  heroRight: { flex: 1, paddingBottom: 4 },
  heroLevelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 4,
  },
  heroLevel: {
    fontSize: 22,
    fontFamily: 'Times-BoldItalic',
    color: COLORS.navy,
  },
  heroLevelName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.ink,
  },
  heroCorrect: {
    fontSize: 10,
    color: COLORS.slate500,
    marginLeft: 'auto',
  },
  heroInterp: {
    fontSize: 10,
    color: COLORS.ink,
    lineHeight: 1.5,
  },

  // CECRL bar
  cecrlWrap: { marginBottom: 20 },
  cecrlBar: { flexDirection: 'row', height: 6, marginBottom: 4 },
  cecrlSeg: { flex: 1, backgroundColor: COLORS.slate200 },
  cecrlSegActive: { backgroundColor: COLORS.navy },
  cecrlSegDivider: { borderRightWidth: 1, borderRightColor: COLORS.cream },
  cecrlLabels: { flexDirection: 'row' },
  cecrlLabel: {
    flex: 1,
    fontSize: 7,
    color: COLORS.slate500,
    letterSpacing: 1,
    textAlign: 'center',
  },
  cecrlLabelActive: { color: COLORS.navy, fontFamily: 'Helvetica-Bold' },

  // Cards row (radar + cadran)
  cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 0.5,
    borderColor: 'rgba(27, 58, 92, 0.2)',
    borderRadius: 6,
    padding: 14,
  },
  cardKicker: {
    fontSize: 8,
    color: COLORS.orange,
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  radarWrap: { alignItems: 'center' },
  cadranWrap: { alignItems: 'center', marginTop: 4 },
  cadranLabel: {
    position: 'absolute',
    fontSize: 7,
    color: COLORS.slate500,
  },
  cadranText: {
    fontSize: 9,
    color: COLORS.ink,
    lineHeight: 1.5,
    marginTop: 10,
  },
  cadranBold: { fontFamily: 'Helvetica-Bold', color: COLORS.navy },

  // Page 2 — blocks
  pageKicker: {
    fontSize: 8,
    color: COLORS.orange,
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  pageTitle: {
    fontSize: 22,
    fontFamily: 'Times-Italic',
    color: COLORS.ink,
    marginBottom: 18,
  },
  blockRow: {
    paddingVertical: 12,
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
    gap: 12,
    marginBottom: 6,
  },
  blockName: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Times-Italic',
    color: COLORS.ink,
  },
  blockScore: {
    width: 50,
    fontSize: 15,
    fontFamily: 'Times-BoldItalic',
    color: COLORS.navy,
    textAlign: 'right',
  },
  blockBarWrap: {
    width: 100,
    height: 5,
    backgroundColor: 'rgba(27, 58, 92, 0.1)',
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  blockBar: { height: '100%' },
  blockMention: {
    width: 120,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
    textAlign: 'right',
  },
  blockAnalysis: {
    fontSize: 10,
    color: COLORS.slate600,
    lineHeight: 1.5,
    paddingLeft: 0,
  },

  // Page 3 — reco
  summaryText: {
    fontSize: 11,
    color: COLORS.ink,
    lineHeight: 1.7,
    marginBottom: 24,
  },
  summaryLead: {
    fontSize: 30,
    fontFamily: 'Times-BoldItalic',
    color: COLORS.navy,
  },
  prioTitle: {
    fontSize: 8,
    color: COLORS.orange,
    letterSpacing: 1.4,
    marginBottom: 10,
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
  recoBox: {
    backgroundColor: COLORS.navy,
    borderRadius: 6,
    padding: 20,
    marginTop: 24,
  },
  recoKicker: {
    fontSize: 8,
    color: COLORS.orange,
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  recoText: {
    fontSize: 12,
    fontFamily: 'Times-Italic',
    color: COLORS.cream,
    lineHeight: 1.6,
  },
  signature: {
    fontSize: 10,
    fontFamily: 'Times-Italic',
    color: COLORS.navy,
    marginTop: 24,
  },
  signatureSub: {
    fontSize: 9,
    color: COLORS.slate500,
    marginTop: 2,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
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

// ============ Métadonnées ============
const LEVELS = ['A', 'B1', 'B2', 'C'] as const;

const LEVEL_META: Record<string, { name: string; interp: string }> = {
  A: {
    name: 'Élémentaire',
    interp:
      "Niveau élémentaire : les fondamentaux orthographiques nécessitent une consolidation importante. Le participant peut communiquer par écrit sur des sujets simples, mais un accompagnement est recommandé pour sécuriser les écrits professionnels.",
  },
  B1: {
    name: 'Intermédiaire',
    interp:
      "Niveau intermédiaire : les bases sont acquises, mais plusieurs règles restent à automatiser. Le participant écrit de manière autonome sur des sujets familiers ; des zones ciblées peuvent freiner la fluidité dans des contextes professionnels exigeants.",
  },
  B2: {
    name: 'Avancé',
    interp:
      "Niveau avancé : autonomie professionnelle acquise sur la majorité des situations d'écriture, avec des automatismes solides. Quelques zones ciblées restent à consolider pour atteindre l'excellence.",
  },
  C: {
    name: 'Expert',
    interp:
      "Niveau expert : maîtrise très fine de l'orthographe et de la grammaire, y compris les subtilités. Le participant est un référent potentiel sur les enjeux d'écrit dans son organisation.",
  },
};

// Analyses par bloc, indexées par label et par mention
const BLOCK_ANALYSIS: Record<string, Record<string, string>> = {
  'Singulier / Pluriel': {
    maitrise: 'Accords en nombre solidement maîtrisés, y compris sur les cas irréguliers.',
    axe: "Accords en nombre globalement acquis, quelques cas particuliers restent à sécuriser.",
    renforcer: "Les accords en nombre nécessitent un travail de fond sur les règles de base et les cas irréguliers.",
  },
  'Conjugaison': {
    maitrise: "Conjugaisons maîtrisées sur l'ensemble des temps et modes testés.",
    axe: "Temps simples acquis, modes composés et concordances des temps à consolider.",
    renforcer: "La conjugaison est un point majeur de progression : temps, modes et personnes à retravailler.",
  },
  'Participe passé': {
    maitrise: "Règles d'accord du participe passé maîtrisées, y compris les cas complexes.",
    axe: "Accord avec « être » acquis ; les cas avec « avoir » et pronominaux restent instables.",
    renforcer: "Accords du participe passé à travailler en priorité, notamment avec l'auxiliaire « avoir ».",
  },
  'Orthographe lexicale': {
    maitrise: "Vocabulaire orthographié avec précision sur l'ensemble des items testés.",
    axe: "Orthographe lexicale correcte dans l'ensemble ; quelques mots courants restent à fiabiliser.",
    renforcer: "L'orthographe lexicale nécessite un enrichissement et une consolidation du stock de mots courants.",
  },
  'Syntaxe': {
    maitrise: "Constructions syntaxiques solides, y compris dans les phrases complexes.",
    axe: "Syntaxe globalement correcte ; les constructions complexes (subordination, ponctuation) à consolider.",
    renforcer: "La construction des phrases nécessite un travail sur la structure, la subordination et la ponctuation.",
  },
  'Compréhension écrite': {
    maitrise: "Compréhension fine des textes, y compris du sens implicite.",
    axe: "Bonne restitution du sens explicite ; le sens implicite peut être approfondi.",
    renforcer: "La compréhension écrite nécessite un travail sur la lecture active et l'inférence.",
  },
};

const MENTION_META = {
  maitrise: { label: 'MAÎTRISÉ', color: COLORS.emerald, key: 'maitrise' as const },
  axe: { label: 'AXE DE PROGRESSION', color: COLORS.amber, key: 'axe' as const },
  renforcer: { label: 'À RENFORCER', color: COLORS.red, key: 'renforcer' as const },
};

function scoreToMention(score: number) {
  if (score >= 0.75) return MENTION_META.maitrise;
  if (score >= 0.5) return MENTION_META.axe;
  return MENTION_META.renforcer;
}

// Analyse dynamique
function analysisFor(blockLabel: string, score: number): string {
  const key = scoreToMention(score).key;
  const pool = BLOCK_ANALYSIS[blockLabel];
  if (!pool) return '';
  return pool[key] ?? '';
}

// Executive summary dynamique
function buildSummary(
  firstName: string,
  lastName: string,
  level: string,
  correctTotal: number,
  blocks: { label: string; score: number }[],
  quadrant: number
): string {
  const fullName = `${firstName} ${lastName}`.trim() || 'Le participant';
  const strong = blocks.filter(b => b.score >= 0.75).map(b => b.label);
  const weak = blocks.filter(b => b.score < 0.5).map(b => b.label);
  const medium = blocks.filter(b => b.score >= 0.5 && b.score < 0.75).map(b => b.label);

  let s = `${fullName} atteint le niveau ${level} (${LEVEL_META[level]?.name.toLowerCase() ?? ''}), avec ${correctTotal} bonnes réponses sur 48. `;

  if (strong.length > 0) {
    s += `Points forts : ${strong.slice(0, 2).join(', ')}${strong.length > 2 ? ' et autres' : ''}. `;
  }
  if (weak.length > 0) {
    s += `Point${weak.length > 1 ? 's' : ''} de vigilance : ${weak.join(', ')}. `;
  } else if (medium.length > 0) {
    s += `Axe${medium.length > 1 ? 's' : ''} de progression : ${medium.slice(0, 2).join(', ')}. `;
  }

  // Profil déclaratif
  const quadInterp: Record<number, string> = {
    1: "Le profil déclaratif indique une bonne adaptation mais un intérêt à stimuler pour engager la progression.",
    2: "Le profil déclaratif est très favorable : bonne adaptation et intérêt élevé, propice à un accompagnement ciblé.",
    3: "Le profil déclaratif indique un besoin d'accompagnement global pour créer les conditions de la progression.",
    4: "Le profil déclaratif révèle un intérêt marqué, à canaliser par un cadre structurant.",
  };
  s += quadInterp[quadrant] ?? '';
  return s;
}

// Reco formation dynamique
function buildReco(level: string, weakBlocks: string[]): string {
  const base: Record<string, string> = {
    A: "Un parcours de remise à niveau OHé (niveau élémentaire), centré sur les fondamentaux orthographiques et grammaticaux, est recommandé — format progressif adapté à une reprise en douceur.",
    B1: "Un parcours de consolidation OHé (niveau intermédiaire), ciblé sur l'automatisation des règles clés, est recommandé — format modulaire pour un profil déjà autonome sur les bases.",
    B2: "Un parcours de perfectionnement ciblé OHé (niveau avancé) est recommandé — format court, adapté à un profil déjà autonome.",
    C: "Un parcours d'excellence OHé, centré sur les subtilités et l'aisance stylistique, est recommandé — format sur-mesure pour un profil expert.",
  };
  let r = base[level] ?? base.A;
  if (weakBlocks.length > 0) {
    r += ` Axes prioritaires : ${weakBlocks.join(', ')}.`;
  }
  return r;
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
  scoreAdaptation: number; // 0-1
  scoreInteret: number; // 0-1
  reference?: string;
}

// ============ Radar SVG ============
const RADAR_LABELS = ['Sing./Plur.', 'Conjug.', 'P. passé', 'Lexicale', 'Syntaxe', 'Compr.'];

function RadarChart({ scores }: { scores: number[] }) {
  const cx = 90;
  const cy = 90;
  const rMax = 60;
  const n = 6;

  // Points for the polygon
  const points = scores
    .map((s, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const r = Math.max(0, Math.min(1, s)) * rMax;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    })
    .join(' ');

  // Gridlines (3 levels)
  const gridPoints = [0.33, 0.66, 1].map(k =>
    Array.from({ length: n }, (_, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const r = k * rMax;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(' ')
  );

  // Axis lines and label positions
  const axes = Array.from({ length: n }, (_, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return {
      x2: cx + rMax * Math.cos(angle),
      y2: cy + rMax * Math.sin(angle),
      lx: cx + (rMax + 12) * Math.cos(angle),
      ly: cy + (rMax + 12) * Math.sin(angle),
    };
  });

  return (
    <Svg width={180} height={180} viewBox="0 0 180 180">
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
            r={2}
            fill={COLORS.navy}
          />
        );
      })}
    </Svg>
  );
}

// ============ Cadran ============
function Cadran({
  adaptation,
  interet,
  quadrant,
}: {
  adaptation: number;
  interet: number;
  quadrant: number;
}) {
  const size = 130;
  const px = Math.max(0.02, Math.min(0.98, adaptation)) * size;
  const py = (1 - Math.max(0.02, Math.min(0.98, interet))) * size;

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Rect
          x={0}
          y={0}
          width={size}
          height={size}
          fill="none"
          stroke="rgba(27, 58, 92, 0.2)"
          strokeWidth={0.5}
        />
        <Line
          x1={0}
          y1={size / 2}
          x2={size}
          y2={size / 2}
          stroke="rgba(27, 58, 92, 0.15)"
          strokeWidth={0.5}
        />
        <Line
          x1={size / 2}
          y1={0}
          x2={size / 2}
          y2={size}
          stroke="rgba(27, 58, 92, 0.15)"
          strokeWidth={0.5}
        />
        <Circle cx={px} cy={py} r={5} fill={COLORS.orange} />
      </Svg>
      <Text style={{ position: 'absolute', top: 3, left: 4, fontSize: 7, color: quadrant === 1 ? COLORS.navy : COLORS.slate500, fontFamily: quadrant === 1 ? 'Helvetica-Bold' : 'Helvetica' }}>Q1</Text>
      <Text style={{ position: 'absolute', top: 3, right: 4, fontSize: 7, color: quadrant === 2 ? COLORS.navy : COLORS.slate500, fontFamily: quadrant === 2 ? 'Helvetica-Bold' : 'Helvetica' }}>Q2</Text>
      <Text style={{ position: 'absolute', bottom: 3, left: 4, fontSize: 7, color: quadrant === 3 ? COLORS.navy : COLORS.slate500, fontFamily: quadrant === 3 ? 'Helvetica-Bold' : 'Helvetica' }}>Q3</Text>
      <Text style={{ position: 'absolute', bottom: 3, right: 4, fontSize: 7, color: quadrant === 4 ? COLORS.navy : COLORS.slate500, fontFamily: quadrant === 4 ? 'Helvetica-Bold' : 'Helvetica' }}>Q4</Text>
    </View>
  );
}

const LOGO_PATH = path.join(process.cwd(), 'public', 'img', 'logos', 'ohe-logo.png');

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

  const weakBlocks = data.blocks.filter(b => b.score < 0.5);
  const mediumBlocks = data.blocks.filter(b => b.score >= 0.5 && b.score < 0.75);
  const priorities = [...weakBlocks, ...mediumBlocks].slice(0, 2);

  const summary = buildSummary(
    data.firstName,
    data.lastName,
    data.level,
    data.correctTotal,
    data.blocks,
    data.quadrant
  );
  const reco = buildReco(data.level, weakBlocks.map(b => b.label));

  const quadrantInterp: Record<number, string> = {
    1: 'Adaptation élevée mais intérêt à stimuler.',
    2: 'Adaptation et intérêt élevés — profil favorable à un accompagnement ciblé.',
    3: "Adaptation et intérêt à développer — besoin d'un accompagnement structurant.",
    4: 'Intérêt marqué, adaptation à renforcer par un cadre progressif.',
  };

  return (
    <Document>
      {/* ============ PAGE 1 — Synthèse ============ */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar}>
          <View style={styles.logoBlock}>
            {logo ? <Image src={logo} style={styles.logoImg} /> : <Text style={styles.logoText}>OHé</Text>}



            <Text style={styles.logoKicker}>
               BILAN CLIENT — {data.organizationName.toUpperCase()}
            </Text>
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
        </View>

        {/* Score + Level */}
        <View style={styles.heroRow}>
          <View>
            <Text style={styles.scoreBig}>
              {data.scoreProcedural.toFixed(1).replace('.', ',')}
              <Text style={styles.scoreMax}>/6</Text>
            </Text>
            <Text style={styles.scoreKicker}>SCORE PROCÉDURAL GLOBAL</Text>
          </View>
          <View style={styles.heroRight}>
            <View style={styles.heroLevelRow}>
              <Text style={styles.heroLevel}>{data.level}</Text>
              <Text style={styles.heroLevelName}>Niveau {levelInfo.name}</Text>
              <Text style={styles.heroCorrect}>
                {data.correctTotal} / 48 bonnes réponses
              </Text>
            </View>
            <Text style={styles.heroInterp}>{levelInfo.interp}</Text>
          </View>
        </View>

        {/* CECRL bar */}
        <View style={styles.cecrlWrap}>
          <View style={styles.cecrlBar}>
            {LEVELS.map((lv, i) => {
              const isActive = i <= activeLevelIndex;
              const isNotLast = i < LEVELS.length - 1;
              return (
                <View
                  key={lv}
                  style={[
                    styles.cecrlSeg,
                    isActive ? styles.cecrlSegActive : styles.cecrlSeg,
                    isNotLast ? styles.cecrlSegDivider : styles.cecrlSeg,
                  ]}
                />
              );
            })}
          </View>
          <View style={styles.cecrlLabels}>
            {LEVELS.map(lv => (
              <Text
                key={lv}
                style={[
                  styles.cecrlLabel,
                  lv === data.level ? styles.cecrlLabelActive : styles.cecrlLabel,
                ]}
              >
                {lv === data.level ? `${lv} ▲` : lv}
              </Text>
            ))}
          </View>
        </View>

        {/* Cards row */}
        <View style={styles.cardsRow}>
          <View style={styles.card}>
            <Text style={styles.cardKicker}> RÉPARTITION PAR BLOC</Text>
            <View style={styles.radarWrap}>
              <RadarChart scores={radarScores} />
            </View>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardKicker}> CADRAN ADAPTATION × INTÉRÊT</Text>
            <View style={styles.cadranWrap}>
              <Cadran
                adaptation={data.scoreAdaptation}
                interet={data.scoreInteret}
                quadrant={data.quadrant}
              />
            </View>
            <Text style={styles.cadranText}>
              <Text style={styles.cadranBold}>Quadrant Q{data.quadrant}</Text>
              {' — '}
              adaptation {data.scoreAdaptation.toFixed(2).replace('.', ',')}, intérêt{' '}
              {data.scoreInteret.toFixed(2).replace('.', ',')}.{' '}
              {quadrantInterp[data.quadrant]}
            </Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>OHé — Bilan client · usage RH / formation</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber}/${totalPages}`} />
        </View>
      </Page>

      {/* ============ PAGE 2 — Détail par compétence ============ */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar}>
          <View style={styles.logoBlock}>
            {logo ? <Image src={logo} style={styles.logoImg} /> : <Text style={styles.logoText}>OHé</Text>}



            <Text style={styles.logoKicker}> BILAN CLIENT</Text>
          </View>
          <Text style={styles.topMeta}>{dateStr}</Text>
        </View>

        <Text style={styles.pageKicker}> DÉTAIL PAR COMPÉTENCE</Text>
        <Text style={styles.pageTitle}>Les six blocs procéduraux</Text>

        {data.blocks.map((b, i) => {
  const mention = scoreToMention(b.score);
  const isLast = i === data.blocks.length - 1;
  return (
    <View
      key={i}
      style={[
        styles.blockRow,
        isLast ? styles.blockRowLast : styles.blockRow,
      ]}
    >

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
              <Text style={styles.blockAnalysis}>{analysisFor(b.label, b.score)}</Text>
            </View>
          );
        })}

        <View style={styles.footer} fixed>
          <Text>OHé — Bilan client · usage RH / formation</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber}/${totalPages}`} />
        </View>
      </Page>

      {/* ============ PAGE 3 — Recommandation ============ */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar}>
          <View style={styles.logoBlock}>
            {logo ? <Image src={logo} style={styles.logoImg} /> : <Text style={styles.logoText}>OHé</Text>}



            <Text style={styles.logoKicker}> SYNTHÈSE & RECOMMANDATION</Text>
          </View>
          <Text style={styles.topMeta}>{dateStr}</Text>
        </View>

        <Text style={styles.pageKicker}> CE QU'IL FAUT RETENIR</Text>
        <Text style={styles.pageTitle}>Synthèse & recommandation</Text>

        <Text style={styles.summaryText}>{summary}</Text>

        {priorities.length > 0 && (
          <>
            <Text style={styles.prioTitle}> PRIORITÉS DE TRAVAIL</Text>
            {priorities.map((p, i) => {
              const mention = scoreToMention(p.score);
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

        <View style={styles.recoBox}>
          <Text style={styles.recoKicker}> RECOMMANDATION DE FORMATION OHé</Text>
          <Text style={styles.recoText}>{reco}</Text>
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
