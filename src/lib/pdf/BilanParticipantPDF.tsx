import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Circle,
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
    marginBottom: 28,
  },
  logoText: { fontSize: 14, fontFamily: 'Times-Bold', color: COLORS.navy },
  logoImg: { width: 60, height: 24, objectFit: 'contain' },

  topMeta: { fontSize: 8, color: COLORS.slate500, letterSpacing: 1.2 },

  // Title block
  titleBlock: { marginBottom: 24 },
  kicker: {
    fontSize: 8,
    color: COLORS.orange,
    letterSpacing: 1.8,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Times-Italic',
    color: COLORS.navy,
    marginBottom: 6,
  },
  identity: { fontSize: 10, color: COLORS.slate600 },
  identityBold: { fontFamily: 'Times-Bold', color: COLORS.ink },

  // Score row
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 28,
    paddingVertical: 8,
  },
  ringWrap: { width: 140, height: 140, alignItems: 'center', justifyContent: 'center' },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    height: 140,
  },
  ringScore: {
    fontSize: 38,
    fontFamily: 'Times-Italic',
    color: COLORS.navy,
  },
  ringMax: { fontSize: 10, color: COLORS.slate500, marginTop: -4 },

  scoreMeta: { flex: 1 },
  scoreKicker: {
    fontSize: 8,
    color: COLORS.orange,
    letterSpacing: 1.6,
    marginBottom: 6,
  },
  scoreLevel: {
    fontSize: 20,
    fontFamily: 'Times-Bold',
    color: COLORS.navy,
    marginBottom: 4,
  },
  scoreLevelName: {
    fontSize: 12,
    fontFamily: 'Times-Italic',
    color: COLORS.slate600,
    marginBottom: 10,
  },

  // CECRL bar
  cecrlBar: { flexDirection: 'row', height: 6, marginBottom: 4 },
  cecrlSeg: { flex: 1, backgroundColor: COLORS.slate200 },
  cecrlSegActive: { backgroundColor: COLORS.navy },
  cecrlSegDivider: { borderRightWidth: 1, borderRightColor: COLORS.cream },
  cecrlLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  cecrlLabel: {
    flex: 1,
    fontSize: 7,
    color: COLORS.slate500,
    letterSpacing: 1,
    textAlign: 'center',
  },
  cecrlLabelActive: { color: COLORS.navy, fontFamily: 'Times-Bold' },

  // Interpretation
  interpretation: {
    fontSize: 10,
    color: COLORS.slate600,
    lineHeight: 1.7,
    marginBottom: 8,
  },
  interpretationLead: {
    fontFamily: 'Times-Bold',
    color: COLORS.navy,
  },

  // Section
  sectionKicker: {
    fontSize: 8,
    color: COLORS.orange,
    letterSpacing: 1.8,
    marginBottom: 14,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Times-Italic',
    color: COLORS.navy,
    marginBottom: 18,
  },

  // Blocks
  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.slate200,
  },
  blockNum: {
    width: 24,
    fontSize: 8,
    color: COLORS.slate500,
    letterSpacing: 1,
  },
  blockLabel: {
    flex: 1,
    fontSize: 11,
    color: COLORS.ink,
  },
  mentionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mentionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mentionText: {
    fontSize: 10,
    fontFamily: 'Times-Italic',
  },

  // Closing
  closingBox: {
    marginTop: 24,
    padding: 16,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.orange,
  },
  closingText: {
    fontSize: 10,
    color: COLORS.slate600,
    lineHeight: 1.7,
    fontFamily: 'Times-Italic',
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
    letterSpacing: 0.8,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.slate200,
  },
});

// ============ Métadonnées ============
const LEVELS = ['A', 'B1', 'B2', 'C'] as const;

const LEVEL_META: Record<string, { name: string; interpretation: string }> = {
  A: {
    name: 'Élémentaire',
    interpretation:
      "Vos résultats montrent que les bases orthographiques méritent d'être consolidées. C'est un point de départ, pas une conclusion : avec un accompagnement adapté, la progression est rapide et durable.",
  },
  B1: {
    name: 'Intermédiaire',
    interpretation:
      "Vous avez des bases solides sur lesquelles construire. Certaines règles restent à automatiser, mais votre socle est là. Un travail ciblé sur quelques points clés peut vous faire franchir un cap significatif.",
  },
  B2: {
    name: 'Avancé',
    interpretation:
      "Vous disposez d'une maîtrise solide de l'orthographe et de la grammaire. Quelques subtilités peuvent encore être travaillées pour viser l'excellence, mais votre niveau actuel vous permet déjà d'écrire avec assurance.",
  },
  C: {
    name: 'Expert',
    interpretation:
      "Vous maîtrisez très bien l'orthographe française, y compris ses règles les plus fines. Votre niveau est un véritable atout professionnel. Il ne reste qu'à peaufiner les nuances les plus subtiles.",
  },
};

// ============ Score → mention ============
type Mention = {
  label: string;
  color: string;
};

function scoreToMention(score: number): Mention {
  if (score >= 0.75) return { label: 'Maîtrisé', color: COLORS.emerald };
  if (score >= 0.5) return { label: 'Axe de progression', color: COLORS.amber };
  return { label: 'À renforcer', color: COLORS.red };
}

// ============ Types ============
export interface BilanBlock {
  label: string;
  score: number;
  correctCount: number;
}

export interface BilanError {
  blockLabel: string;
  questionText: string;
  userAnswer: string | null;
  correctAnswer: string;
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
  errors: BilanError[];
  reference?: string;
}
const LOGO_PATH = path.join(process.cwd(), 'public', 'img', 'logos', 'ohe-logo.png');

// ============ Composant ============
export default function BilanParticipantPDF({ data, logo }: { data: BilanData; logo?: Buffer }) {

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

  // Ring calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const scorePercent = data.scoreProcedural / 6;
  const dashOffset = circumference * (1 - scorePercent);
  const activeLevelIndex = LEVELS.indexOf(data.level);

  // Identity line
  const identityParts = [data.organizationName];
  if (data.groupName) identityParts.push(data.groupName);

  return (
    <Document>
      {/* ============ PAGE 1 — Synthèse ============ */}
      <Page size="A4" style={styles.page}>
        {/* Top bar */}
        <View style={styles.topBar}>
          {logo ? <Image src={logo} style={styles.logoImg} /> : <Text style={styles.logoText}>OHé</Text>}



          <Text style={styles.topMeta}>
            BILAN INDIVIDUEL · {dateStr.toUpperCase()}
          </Text>
        </View>

        {/* Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.kicker}> VOTRE BILAN D&apos;ORTHOGRAPHE</Text>
          <Text style={styles.title}>Bilan de diagnostic</Text>
          <Text style={styles.identity}>
            <Text style={styles.identityBold}>{fullName}</Text>
            {'  ·  '}
            {data.email}
            {'\n'}
            {identityParts.join(' · ')}
          </Text>
        </View>

        {/* Score + Level */}
        <View style={styles.scoreRow}>
          {/* Ring */}
          <View style={styles.ringWrap}>
            <Svg width={140} height={140} viewBox="0 0 140 140">
              <Circle
                cx={70}
                cy={70}
                r={radius}
                stroke={COLORS.slate200}
                strokeWidth={8}
                fill="none"
              />
              <Circle
                cx={70}
                cy={70}
                r={radius}
                stroke={COLORS.navy}
                strokeWidth={8}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${circumference} ${circumference}`}
                transform="rotate(-90 70 70)"
                {...({ 'stroke-dashoffset': dashOffset } as unknown as object)}
              />
            </Svg>
            <View style={styles.ringCenter}>
              <Text style={styles.ringScore}>
                {data.scoreProcedural.toFixed(1).replace('.', ',')}
              </Text>
              <Text style={styles.ringMax}>/ 6</Text>
            </View>
          </View>

          {/* Level meta */}
          <View style={styles.scoreMeta}>
            <Text style={styles.scoreKicker}>NIVEAU CECRL</Text>
            <Text style={styles.scoreLevel}>{data.level}</Text>
            <Text style={styles.scoreLevelName}>{levelInfo.name}</Text>

            {/* CECRL bar */}
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
  {LEVELS.map((lv) => (
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
        </View>

        {/* Interpretation */}
        <Text style={styles.sectionKicker}> CE QUE CELA SIGNIFIE</Text>
        <Text style={styles.interpretation}>
          <Text style={styles.interpretationLead}>
            Niveau {data.level} — {levelInfo.name}.{' '}
          </Text>
          {levelInfo.interpretation}
        </Text>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>OHÉ · DOCUMENT CONFIDENTIEL · RÉF {ref}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `P. ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>

      {/* ============ PAGE 2 — Détail par compétence ============ */}
      <Page size="A4" style={styles.page}>
        {/* Top bar */}
        <View style={styles.topBar}>
          {logo ? <Image src={logo} style={styles.logoImg} /> : <Text style={styles.logoText}>OHé</Text>}



          <Text style={styles.topMeta}>
            BILAN INDIVIDUEL · {dateStr.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.sectionKicker}> DÉTAIL PAR COMPÉTENCE</Text>
        <Text style={styles.sectionTitle}>Vos six domaines évalués</Text>

        {data.blocks.map((b, i) => {
          const mention = scoreToMention(b.score);
          return (
            <View key={i} style={styles.blockRow}>
              <Text style={styles.blockNum}>{String(i + 1).padStart(2, '0')}</Text>
              <Text style={styles.blockLabel}>{b.label}</Text>
              <View style={styles.mentionWrap}>
                <View
                  style={[styles.mentionDot, { backgroundColor: mention.color }]}
                />
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

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>OHÉ · DOCUMENT CONFIDENTIEL · RÉF {ref}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `P. ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
