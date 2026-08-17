import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

// ============ Palette ============
const COLORS = {
  blue: '#2D3DB5',
  indigo: '#3730A3',
  orange: '#FF6B35',
  slate900: '#0F172A',
  slate600: '#475569',
  slate500: '#64748B',
  slate300: '#CBD5E1',
  slate200: '#E2E8F0',
  slate100: '#F1F5F9',
  slate50: '#F8FAFC',
  emerald: '#10B981',
  red: '#EF4444',
  white: '#FFFFFF',
};

// ============ Styles ============
const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.white,
    padding: 48,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: COLORS.slate900,
  },

  // Header
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate200,
    marginBottom: 32,
  },
  logoBox: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 14, fontWeight: 'bold', color: COLORS.slate900 },
  logoBadge: {
    backgroundColor: COLORS.orange,
    color: COLORS.white,
    fontSize: 7,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginLeft: 6,
    borderRadius: 2,
    letterSpacing: 0.5,
  },
  topMeta: {
    fontSize: 8,
    color: COLORS.slate500,
    letterSpacing: 1.4,
  },

  // Hero
  kicker: {
    fontSize: 8,
    color: COLORS.orange,
    letterSpacing: 1.8,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: 'Times-Roman',
    color: COLORS.slate900,
    marginBottom: 10,
  },
  heroName: {
    fontSize: 22,
    fontFamily: 'Times-Bold',
    color: COLORS.blue,
    marginBottom: 6,
  },
  heroEmail: {
    fontSize: 10,
    color: COLORS.slate500,
    marginBottom: 28,
  },

  // Level row
  levelRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 16,
    marginBottom: 28,
  },
  levelBox: {
    backgroundColor: COLORS.blue,
    color: COLORS.white,
    width: 90,
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelLetter: {
    fontSize: 38,
    fontFamily: 'Times-Bold',
    color: COLORS.white,
  },
  levelMeta: { flex: 1, justifyContent: 'center' },
  levelLabel: {
    fontSize: 7,
    color: COLORS.slate500,
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  levelName: {
    fontSize: 16,
    fontFamily: 'Times-Bold',
    color: COLORS.slate900,
    marginBottom: 4,
  },
  levelTagline: {
    fontSize: 10,
    color: COLORS.slate600,
    marginBottom: 8,
  },
  scoreLine: {
    fontSize: 10,
    color: COLORS.slate600,
  },
  scoreNumber: { fontWeight: 'bold', color: COLORS.slate900 },

  // CEFR scale
  scale: {
    flexDirection: 'row',
    marginBottom: 28,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scaleCell: {
    flex: 1,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: COLORS.white,
  },
  scaleCellActive: { backgroundColor: COLORS.blue },
  scaleCellInactive: { backgroundColor: COLORS.slate100 },
  scaleLetter: {
    fontSize: 11,
    fontFamily: 'Times-Bold',
    marginBottom: 2,
  },
  scaleRange: { fontSize: 7, letterSpacing: 0.8 },

  // Section
  sectionTitle: {
    fontSize: 9,
    color: COLORS.orange,
    letterSpacing: 1.8,
    marginBottom: 12,
  },

  // Blocks detail
  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.slate200,
  },
  blockNum: {
    width: 22,
    fontSize: 8,
    color: COLORS.slate500,
    letterSpacing: 1,
  },
  blockLabel: {
    flex: 1,
    fontSize: 11,
    color: COLORS.slate900,
  },
  blockScore: {
    width: 56,
    fontSize: 10,
    color: COLORS.slate900,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  blockQual: {
    width: 110,
    fontSize: 9,
    textAlign: 'right',
  },

  // Recommendation
  recoBox: {
    backgroundColor: COLORS.slate50,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.orange,
    padding: 16,
    borderRadius: 4,
    marginTop: 24,
  },
  recoText: {
    fontSize: 10,
    color: COLORS.slate600,
    lineHeight: 1.6,
  },

  // Page 2 — Detail
  page2Title: {
    fontSize: 22,
    fontFamily: 'Times-Bold',
    color: COLORS.slate900,
    marginBottom: 6,
  },
  page2Subtitle: {
    fontSize: 10,
    color: COLORS.slate500,
    marginBottom: 28,
  },
  errorCard: {
    backgroundColor: COLORS.slate50,
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.red,
  },
  errorMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  errorMetaLeft: {
    fontSize: 7,
    color: COLORS.slate500,
    letterSpacing: 1.2,
  },
  errorQuestion: {
    fontSize: 10,
    color: COLORS.slate900,
    marginBottom: 6,
    lineHeight: 1.4,
  },
  errorAnswers: {
    flexDirection: 'row',
    gap: 12,
  },
  errorAnswer: { flex: 1 },
  errorAnswerLabel: {
    fontSize: 7,
    color: COLORS.slate500,
    letterSpacing: 1,
    marginBottom: 2,
  },
  errorAnswerValueWrong: {
    fontSize: 9,
    color: COLORS.red,
    fontStyle: 'italic',
  },
  errorAnswerValueRight: {
    fontSize: 9,
    color: COLORS.emerald,
    fontWeight: 'bold',
  },
  noErrorBox: {
    backgroundColor: COLORS.slate50,
    padding: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  noErrorText: {
    fontSize: 11,
    color: COLORS.slate600,
    textAlign: 'center',
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

// ============ Métadonnées niveau ============
const LEVEL_META: Record<string, { name: string; tagline: string }> = {
  A:  { name: 'Élémentaire',   tagline: 'Bases à consolider.' },
  B1: { name: 'Intermédiaire', tagline: 'Une base en construction.' },
  B2: { name: 'Avancé',        tagline: 'Une maîtrise solide.' },
  C:  { name: 'Expert',        tagline: 'Une excellente maîtrise.' },
};

const SCALE = [
  { letter: 'A',  range: '0 – 37 %' },
  { letter: 'B1', range: '37 – 60 %' },
  { letter: 'B2', range: '60 – 80 %' },
  { letter: 'C',  range: '80 – 100 %' },
];

// ============ Score → qualificatif ============
function scoreToLabel(score: number): string {
  if (score >= 1) return 'Maîtrisé';
  if (score >= 0.75) return "En cours d'acquisition";
  if (score >= 0.5) return 'Fragile';
  return 'Non maîtrisé';
}
function scoreToColor(score: number): string {
  if (score >= 0.75) return COLORS.emerald;
  if (score >= 0.5) return COLORS.orange;
  return COLORS.red;
}

// ============ Recommandation dynamique ============
const RECO_BASE: Record<string, string> = {
  A: "Votre diagnostic révèle un besoin important de consolidation des fondamentaux orthographiques. Une formation OHé adaptée vous permettra de gagner en aisance et confiance dans votre communication écrite professionnelle.",
  B1: "Vous disposez de bases solides mais certaines notions méritent d'être renforcées. Une formation OHé ciblée vous aidera à progresser efficacement vers une maîtrise complète.",
  B2: "Bonne maîtrise globale ! Quelques points spécifiques peuvent encore être améliorés. Une formation OHé vous permettra d'atteindre l'excellence et de viser le niveau C.",
  C: "Excellent niveau ! Vous maîtrisez très bien l'orthographe et la grammaire. Une formation OHé peut vous aider à perfectionner les derniers points subtils.",
};

function buildRecommendation(level: string, weakBlocks: string[]): string {
  const base = RECO_BASE[level] ?? RECO_BASE.A;
  if (weakBlocks.length === 0) return base;
  const list =
    weakBlocks.length === 1
      ? weakBlocks[0]
      : `${weakBlocks.slice(0, -1).join(', ')} et ${weakBlocks[weakBlocks.length - 1]}`;
  return `${base} Nous recommandons en particulier de travailler sur : ${list}.`;
}

// ============ Types ============
export interface BilanBlock {
  label: string;
  score: number; // 0, 0.5, 0.75, 1
  correctCount: number; // sur 8
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
  completedAt: Date;
  level: 'A' | 'B1' | 'B2' | 'C';
  scoreProcedural: number;
  correctTotal: number;
  blocks: BilanBlock[];
  errors: BilanError[];
  reference?: string;
}

// ============ Composant ============
export default function BilanPDF({ data }: { data: BilanData }) {
  const dateStr = new Date(data.completedAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const percent = Math.round((data.correctTotal / 48) * 100);
  const levelInfo = LEVEL_META[data.level] ?? LEVEL_META.A;
  const weakBlocks = data.blocks.filter(b => b.score < 0.5).map(b => b.label);
  const recommendation = buildRecommendation(data.level, weakBlocks);
  const fullName = `${data.firstName} ${data.lastName}`.trim() || 'Participant·e';
  const d = new Date(data.completedAt);
  const ref =
    data.reference ??
    `OHE-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;

  return (
    <Document>
      {/* ============ PAGE 1 — Synthèse ============ */}
      <Page size="A4" style={styles.page}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>OHé</Text>
            <Text style={styles.logoBadge}>DIAG</Text>
          </View>
          <Text style={styles.topMeta}>
            {data.organizationName.toUpperCase()} · {dateStr.toUpperCase()}
          </Text>
        </View>

        {/* Hero */}
        <Text style={styles.kicker}>BILAN DE DIAGNOSTIC INDIVIDUEL</Text>
        <Text style={styles.heroTitle}>Bilan de diagnostic</Text>
        <Text style={styles.heroName}>{fullName}</Text>
        <Text style={styles.heroEmail}>{data.email}</Text>

        {/* Niveau */}
        <View style={styles.levelRow}>
          <View style={styles.levelBox}>
            <Text style={styles.levelLetter}>{data.level}</Text>
          </View>
          <View style={styles.levelMeta}>
            <Text style={styles.levelLabel}>NIVEAU ATTRIBUÉ</Text>
            <Text style={styles.levelName}>{levelInfo.name}</Text>
            <Text style={styles.levelTagline}>{levelInfo.tagline}</Text>
            <Text style={styles.scoreLine}>
              {' '}
              <Text style={styles.scoreNumber}>
                {data.correctTotal} / 48 bonnes réponses ({percent} %)
              </Text>
            </Text>
            <Text style={[styles.scoreLine, { marginTop: 2 }]}>
              Score :{' '}
              <Text style={styles.scoreNumber}>
                {data.scoreProcedural.toFixed(2).replace('.', ',')} / 6
              </Text>
            </Text>
          </View>
        </View>

        {/* CEFR scale */}
        <View style={styles.scale}>
          {SCALE.map(s => {
            const isActive = s.letter === data.level;
            return (
              <View
                key={s.letter}
                style={[
                  styles.scaleCell,
                  isActive ? styles.scaleCellActive : styles.scaleCellInactive,
                ]}
              >
                <Text
                  style={[
                    styles.scaleLetter,
                    { color: isActive ? COLORS.white : COLORS.slate900 },
                  ]}
                >
                  {s.letter}
                </Text>
                <Text
                  style={[
                    styles.scaleRange,
                    { color: isActive ? COLORS.white : COLORS.slate500 },
                  ]}
                >
                  {s.range}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Détail par compétence */}
        <Text style={styles.sectionTitle}>DÉTAIL PAR COMPÉTENCE</Text>
        {data.blocks.map((b, i) => (
          <View key={b.label} style={styles.blockRow}>
            <Text style={styles.blockNum}>{String(i + 1).padStart(2, '0')}</Text>
            <Text style={styles.blockLabel}>{b.label}</Text>
            <Text style={styles.blockScore}>{b.correctCount} / 8</Text>
            <Text style={[styles.blockQual, { color: scoreToColor(b.score) }]}>
              {scoreToLabel(b.score)}
            </Text>
          </View>
        ))}

        {/* Recommandation */}
        <View style={styles.recoBox}>
          <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>
            RECOMMANDATION
          </Text>
          <Text style={styles.recoText}>{recommendation}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>OHÉ DIAG · DOCUMENT CONFIDENTIEL · RÉF {ref}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `P. ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>

      {/* ============ PAGE 2 — Détail des erreurs ============ */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>OHé</Text>
            <Text style={styles.logoBadge}>DIAG</Text>
          </View>
          <Text style={styles.topMeta}>
            {data.organizationName.toUpperCase()} · {dateStr.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.kicker}>POUR ALLER PLUS LOIN</Text>
        <Text style={styles.page2Title}>Vos points à travailler</Text>
        <Text style={styles.page2Subtitle}>
          Retrouvez ci-dessous les questions auxquelles vous n&apos;avez pas correctement répondu, avec la réponse attendue.
        </Text>

        {data.errors.length === 0 ? (
          <View style={styles.noErrorBox}>
            <Text style={styles.noErrorText}>
              Bravo, vous avez répondu correctement à toutes les questions procédurales.
            </Text>
          </View>
        ) : (
          data.errors.map((err, idx) => (
            <View key={idx} style={styles.errorCard} wrap={false}>
              <View style={styles.errorMeta}>
  <Text style={styles.errorMetaLeft}>
    {err.blockLabel.toUpperCase()}
  </Text>
</View>

              <Text style={styles.errorQuestion}>{err.questionText}</Text>
              <View style={styles.errorAnswers}>
                <View style={styles.errorAnswer}>
                  <Text style={styles.errorAnswerLabel}>VOTRE RÉPONSE</Text>
                  <Text style={styles.errorAnswerValueWrong}>
                    {err.userAnswer ?? '— Pas de réponse —'}
                  </Text>
                </View>
                <View style={styles.errorAnswer}>
                  <Text style={styles.errorAnswerLabel}>RÉPONSE ATTENDUE</Text>
                  <Text style={styles.errorAnswerValueRight}>{err.correctAnswer}</Text>
                </View>
              </View>
            </View>
          ))
        )}

        <View style={styles.footer} fixed>
          <Text>OHÉ DIAG · DOCUMENT CONFIDENTIEL · RÉF {ref}</Text>
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
