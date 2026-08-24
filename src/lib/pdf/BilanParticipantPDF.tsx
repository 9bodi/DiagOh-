import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Polygon,
  Line,
  Circle,
  Image,
} from '@react-pdf/renderer';

// ============ Types exportés ============
export interface BilanBlock {
  label: string;
  score: number;         // 0 → 1
  correctCount: number;
}

export interface BilanData {
  firstName: string;
  lastName: string;
  email: string;
  organizationName: string;
  completedAt: Date;
  level: 'A' | 'B1' | 'B2' | 'C';
  scoreProcedural: number;   // /6
  correctTotal: number;
  blocks: BilanBlock[];
  errors: unknown[];
  reference: string;
}

// ============ Palette OHé ============
const COLORS = {
  bg: '#F4F6FB',
  panel: '#FFFFFF',
  panelTint: '#EEF2FA',
  ink: '#15171C',
  muted: '#6A6E78',
  accent: '#1E3A8A',
  accentSoft: '#DDE3F2',      // teinte claire du bleu accent (au lieu de '#1E3A8A14')
  line: '#D4D9E2',            // gris moyen (au lieu de 'rgba(21,23,28,0.13)')
  lineSoft: '#E6EAF2',        // gris très clair (au lieu de 'rgba(21,23,28,0.06)')
  emerald: '#10B981',
  amber: '#F59E0B',
  red: '#DC2626',
};


// ============ Niveaux CECRL ============
const LEVEL_META: Record<
  BilanData['level'],
  { label: string; tagline: string; index: number; interpretation: string }
> = {
  A: {
    label: 'Élémentaire',
    tagline: 'Des bases à consolider.',
    index: 0,
    interpretation:
      'Vous maîtrisez certaines bases mais plusieurs points fondamentaux restent à consolider. Un accompagnement ciblé peut vous permettre de progresser rapidement sur les compétences essentielles.',
  },
  B1: {
    label: 'Intermédiaire',
    tagline: 'Une base en construction.',
    index: 1,
    interpretation:
      'Vous avez une base solide sur plusieurs compétences, avec quelques axes de progression identifiés. Un travail ciblé sur les points faibles vous permettra de consolider votre maîtrise.',
  },
  B2: {
    label: 'Avancé',
    tagline: 'Une maîtrise solide.',
    index: 2,
    interpretation:
      'Vous démontrez une maîtrise solide de l\'orthographe française. Quelques points fins peuvent encore être affinés pour atteindre un niveau expert.',
  },
  C: {
    label: 'Expert',
    tagline: 'Une excellente maîtrise.',
    index: 3,
    interpretation:
      'Vous démontrez une excellente maîtrise de l\'orthographe française. Vos compétences sont solides sur l\'ensemble des domaines évalués.',
  },
};

const LEVEL_ORDER: BilanData['level'][] = ['A', 'B1', 'B2', 'C'];

// ============ Mentions par bloc ============
function scoreToMention(score: number): { label: string; color: string } {
  if (score >= 0.75) return { label: 'Maîtrisé', color: COLORS.emerald };
  if (score >= 0.5) return { label: 'Axe de progression', color: COLORS.amber };
  return { label: 'À renforcer', color: COLORS.red };
}

// ============ Styles ============
const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.bg,
    padding: 44,
    paddingTop: 32,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: COLORS.ink,
  },

  // ─── Header uniforme (identique aux autres PDFs) ───
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 0.6,
    borderBottomColor: COLORS.line,
    marginBottom: 22,
  },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoImg: { width: 34, height: 34, objectFit: 'contain' },
  logoKicker: {
    fontSize: 8,
    color: COLORS.accent,
    letterSpacing: 1.2,
    fontFamily: 'Helvetica-Bold',
  },
  topMeta: {
    fontSize: 8,
    color: COLORS.muted,
    letterSpacing: 1.2,
  },

  // ─── Titre ───
  titleBlock: { marginBottom: 20 },
  title: {
    fontSize: 26,
    fontFamily: 'Times-Italic',
    color: COLORS.accent,
    marginBottom: 8,
  },
  identity: { fontSize: 10, color: COLORS.muted },
  identityBold: { fontFamily: 'Helvetica-Bold', color: COLORS.ink },

  // ─── Bloc principal Score + Niveau ───
  mainRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 22,
  },

  // Score card (gauche)
  scoreCard: {
    width: 220,
    backgroundColor: COLORS.panel,
    borderWidth: 0.6,
    borderColor: COLORS.line,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreLabel: {
    fontSize: 8,
    color: COLORS.muted,
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  scoreValue: {
    fontSize: 48,
    fontFamily: 'Times-Italic',
    color: COLORS.accent,
    marginBottom: 4,
  },
  scoreSub: { fontSize: 9, color: COLORS.muted },

  // Niveau card (droite)
  levelCard: {
    flex: 1,
    backgroundColor: COLORS.panelTint,
    borderRadius: 12,
    padding: 20,
    justifyContent: 'center',
  },
  levelLabel: {
    fontSize: 8,
    color: COLORS.muted,
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  levelBadge: {
    fontSize: 44,
    fontFamily: 'Times-Italic',
    color: COLORS.accent,
    marginBottom: 2,
  },
  levelName: {
    fontSize: 16,
    fontFamily: 'Times-Italic',
    color: COLORS.ink,
    marginBottom: 4,
  },
  levelTag: {
    fontSize: 10,
    color: COLORS.muted,
    marginBottom: 12,
  },

  // CECRL bar
  cecrlBar: { flexDirection: 'row', height: 6, marginBottom: 4 },
  cecrlSeg: { flex: 1, backgroundColor: COLORS.lineSoft, marginRight: 2 },
  cecrlSegLast: { marginRight: 0 },
  cecrlSegActive: { backgroundColor: COLORS.accent },
  cecrlLabelsRow: { flexDirection: 'row' },
  cecrlLabelCell: {
    flex: 1,
    fontSize: 7,
    color: COLORS.muted,
    letterSpacing: 1,
    textAlign: 'center',
    marginRight: 2,
  },
  cecrlLabelActive: {
    color: COLORS.accent,
    fontFamily: 'Helvetica-Bold',
  },

  // ─── Interprétation ───
  interpretation: {
    fontSize: 10,
    color: COLORS.muted,
    lineHeight: 1.6,
    marginBottom: 18,
  },
  interpretationLead: {
    fontFamily: 'Helvetica-Bold',
    color: COLORS.accent,
  },

  // ─── Radar ───
  radarCard: {
    backgroundColor: COLORS.panel,
    borderWidth: 0.6,
    borderColor: COLORS.line,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  radarTitle: {
    fontSize: 14,
    fontFamily: 'Times-Italic',
    color: COLORS.accent,
    marginBottom: 8,
  },
  radarSub: {
    fontSize: 9,
    color: COLORS.muted,
    marginBottom: 12,
    textAlign: 'center',
  },

  // ─── Section titre (page 2) ───
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Times-Italic',
    color: COLORS.accent,
    marginBottom: 18,
  },

  // ─── Blocs ───
  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lineSoft,
  },
  blockNum: {
    width: 26,
    fontSize: 8,
    color: COLORS.muted,
    letterSpacing: 1,
  },
  blockLabel: {
    flex: 1,
    fontSize: 11,
    color: COLORS.ink,
  },
  blockPct: {
    width: 42,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.ink,
    textAlign: 'right',
    marginRight: 12,
  },
  mentionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 130,
    justifyContent: 'flex-end',
  },
  mentionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mentionText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },

  // ─── Closing ───
  closingBox: {
    marginTop: 24,
    padding: 18,
    backgroundColor: COLORS.panelTint,
    borderRadius: 10,
  },
  closingText: {
    fontSize: 10,
    color: COLORS.ink,
    lineHeight: 1.6,
    fontStyle: 'italic',
  },

  // ─── Signature ───
  signature: {
    marginTop: 20,
    alignItems: 'center',
  },
  signatureName: {
    fontSize: 11,
    fontFamily: 'Times-Italic',
    color: COLORS.muted,
  },
  signatureTitle: {
    fontSize: 8,
    color: COLORS.muted,
    letterSpacing: 1.2,
    marginTop: 2,
  },

  // ─── Footer ───
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 44,
    right: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: COLORS.muted,
    letterSpacing: 1,
  },
});

// ============ Composant Radar ============
function Radar({ blocks }: { blocks: BilanBlock[] }) {
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 110;

  // 6 axes régulièrement espacés, sommet en haut
  const angles = blocks.map((_, i) => (Math.PI * 2 * i) / blocks.length - Math.PI / 2);

  const point = (r: number, angle: number) => ({
    x: cx + Math.cos(angle) * r,
    y: cy + Math.sin(angle) * r,
  });

  // Grille de fond : 4 polygones concentriques (0.25, 0.5, 0.75, 1)
  const gridLevels = [0.25, 0.5, 0.75, 1];
  const gridPolygons = gridLevels.map((level) => {
    const pts = angles.map((a) => point(radius * level, a));
    return pts.map((p) => `${p.x},${p.y}`).join(' ');
  });

  // Axes
  const axes = angles.map((a) => point(radius, a));

  // Zone de données
  const dataPoints = blocks.map((b, i) => point(radius * Math.max(0.02, b.score), angles[i]));
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // Labels
  const labels = blocks.map((b, i) => {
    const p = point(radius + 22, angles[i]);
    return { text: b.label, x: p.x, y: p.y };
  });

  return (
    <Svg width={size} height={size}>
      {/* Grille */}
      {gridPolygons.map((pts, idx) => (
        <Polygon
  key={`grid-${idx}`}
  points={pts}
  fill="none"
  stroke={COLORS.lineSoft}
  strokeWidth={0.6}
/>

      ))}
      {/* Axes */}
      {axes.map((p, idx) => (
        <Line
          key={`axis-${idx}`}
          x1={cx}
          y1={cy}
          x2={p.x}
          y2={p.y}
          stroke={COLORS.lineSoft}
          strokeWidth={0.6}
        />
      ))}
      {/* Zone données */}
      <Polygon
        points={dataPolygon}
        fill={COLORS.accentSoft}
        stroke={COLORS.accent}
        strokeWidth={1.5}
      />
      {/* Points de données */}
      {dataPoints.map((p, idx) => (
        <Circle key={`pt-${idx}`} cx={p.x} cy={p.y} r={2.4} fill={COLORS.accent} />
      ))}
      {/* Labels */}
      {labels.map((l, idx) => (
        <Text
          key={`lbl-${idx}`}
          x={l.x}
          y={l.y}
          style={{
            fontSize: 7.5,
            fill: COLORS.muted,
            textAnchor: 'middle',
          }}
        >
          {l.text}
        </Text>
      ))}
    </Svg>
  );
}

// ============ Composant Header ============
function Header({ data }: { data: BilanData; logo?: Uint8Array | Buffer }) {
  const fullName = `${data.firstName} ${data.lastName}`.trim() || 'Participant';
  return (
    <View style={styles.topBar}>
      <View style={styles.logoWrap}>
        <Text style={styles.logoKicker}>
          BILAN — {fullName.toUpperCase()} — {(data.organizationName || 'ORGANISATION').toUpperCase()}
        </Text>
      </View>
      <Text style={styles.topMeta}>
        {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(data.completedAt)}
      </Text>
    </View>
  );
}

// ============ Composant principal ============
export default function BilanParticipantPDF({
  data,
  logo,
}: {
  data: BilanData;
  logo?: Uint8Array | Buffer;
}) {
  const levelMeta = LEVEL_META[data.level] ?? LEVEL_META.A;
  const scorePct = Math.round((data.scoreProcedural / 6) * 100);
  const fullName = `${data.firstName} ${data.lastName}`.trim() || 'Participant';

  return (
    <Document
      title={`Bilan ${fullName}`}
      author="OHé Diag"
      subject="Bilan de diagnostic orthographique"
    >
      {/* ═══════════════ PAGE 1 ═══════════════ */}
      <Page size="A4" style={styles.page}>
        <Header data={data} logo={logo} />

        {/* Titre + identité */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Bilan de diagnostic</Text>
          <Text style={styles.identity}>
            <Text style={styles.identityBold}>{fullName}</Text>
            {' · '}
            {data.email}
            {data.organizationName ? ` · ${data.organizationName}` : ''}
          </Text>
        </View>

        {/* Bloc Score + Niveau */}
        <View style={styles.mainRow}>
          {/* Score global */}
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>SCORE GLOBAL</Text>
            <Text style={styles.scoreValue}>{scorePct} %</Text>
            <Text style={styles.scoreSub}>
              {data.correctTotal} bonnes réponses
            </Text>
          </View>

          {/* Niveau CECRL */}
          <View style={styles.levelCard}>
            <Text style={styles.levelLabel}>NIVEAU CECRL</Text>
            <Text style={styles.levelBadge}>{data.level}</Text>
            <Text style={styles.levelName}>{levelMeta.label}</Text>
            <Text style={styles.levelTag}>{levelMeta.tagline}</Text>

            {/* Barre CECRL 4 segments */}
            <View style={styles.cecrlBar}>
  {LEVEL_ORDER.map((lvl, i) => (
    <View
      key={lvl}
      style={[
        styles.cecrlSeg,
        i === LEVEL_ORDER.length - 1 ? styles.cecrlSegLast : {},
        i <= levelMeta.index ? styles.cecrlSegActive : {},
      ]}
    />
  ))}
</View>

            <View style={styles.cecrlLabelsRow}>
  {LEVEL_ORDER.map((lvl, i) => (
    <Text
      key={lvl}
      style={[
        styles.cecrlLabelCell,
        i === LEVEL_ORDER.length - 1 ? { marginRight: 0 } : {},
        i === levelMeta.index ? styles.cecrlLabelActive : {},
      ]}
    >
      {lvl}
    </Text>
  ))}
</View>

          </View>
        </View>

        {/* Interprétation */}
        <Text style={styles.interpretation}>
          <Text style={styles.interpretationLead}>Ce que cela signifie. </Text>
          {levelMeta.interpretation}
        </Text>

        {/* Radar */}
        <View style={styles.radarCard}>
          <Text style={styles.radarTitle}>Profil de compétences</Text>
          <Text style={styles.radarSub}>
            Vos performances sur les six domaines évalués
          </Text>
          <Radar blocks={data.blocks} />
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>OHÉ · DOCUMENT CONFIDENTIEL · RÉF {data.reference}</Text>
          <Text
            render={({ pageNumber, totalPages }) => `P. ${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>

      {/* ═══════════════ PAGE 2 ═══════════════ */}
      <Page size="A4" style={styles.page}>
        <Header data={data} logo={logo} />

        <Text style={styles.sectionTitle}>Vos six domaines évalués</Text>

        {data.blocks.map((b, i) => {
          const pct = Math.round(b.score * 100);
          const mention = scoreToMention(b.score);
          return (
            <View key={i} style={styles.blockRow}>
              <Text style={styles.blockNum}>{String(i + 1).padStart(2, '0')}</Text>
              <Text style={styles.blockLabel}>{b.label}</Text>
              <Text style={styles.blockPct}>{pct} %</Text>
              <View style={styles.mentionWrap}>
                <View style={[styles.mentionDot, { backgroundColor: mention.color }]} />
                <Text style={[styles.mentionText, { color: mention.color }]}>
                  {mention.label}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Closing */}
        <View style={styles.closingBox}>
          <Text style={styles.closingText}>
            Ce bilan est une photographie de votre orthographe à l&apos;instant T.
            L&apos;orthographe se travaille et se consolide : chaque effort compte,
            et la progression est toujours possible, à tout âge et à tout niveau.
          </Text>
        </View>

        {/* Signature */}
        <View style={styles.signature}>
          <Text style={styles.signatureName}>Diagnostic conçu par Roxane Joannidès</Text>
          <Text style={styles.signatureTitle}>DOCTEURE EN SCIENCES DU LANGAGE</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>OHÉ · DOCUMENT CONFIDENTIEL · RÉF {data.reference}</Text>
          <Text
            render={({ pageNumber, totalPages }) => `P. ${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
