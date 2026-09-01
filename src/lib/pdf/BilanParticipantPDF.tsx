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
  totalTimeSeconds: number;  // temps total passé à répondre (somme Answer.timeSpent)
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
  accentSoft: '#DDE3F2',
  line: '#D4D9E2',
  lineSoft: '#E6EAF2',
  emerald: '#10B981',   // Maîtrisé
  accentBlue: '#1E3A8A', // En cours de maîtrise
  amber: '#F59E0B',      // Fragile
  red: '#DC2626',        // Non maîtrisé
};

// ============ Niveaux (sans mention CECRL) ============
const LEVEL_META: Record<
  BilanData['level'],
  { label: string; tagline: string; index: number; interpretation: string; preconisation: string }
> = {
  A: {
    label: 'Élémentaire',
    tagline: 'Besoins de base.',
    index: 0,
    interpretation:
      "Les fondamentaux de l'orthographe restent insuffisamment maîtrisés pour être mobilisés de façon régulière.",
    preconisation:
      "Il se peut que votre niveau soit en dessous du niveau travaillé dans la formation OHé. OHé propose une remise à niveau en orthographe grammaticale, avec un travail progressif sur les accords, notamment sur celui des verbes à tous les temps et au participe passé. Une formation adaptée à votre niveau peut constituer une première étape.",
  },
  B1: {
    label: 'Intermédiaire',
    tagline: 'Besoins techniques.',
    index: 1,
    interpretation:
      "Les bases de l'orthographe sont acquises, mais certaines règles restent fragiles.",
    preconisation:
      "Votre niveau correspond à celui auquel s'adresse en priorité la formation OHé. Une méthode ludique, sans règles à mémoriser, pour reprendre confiance en son orthographe en 10 minutes par jour. Fondée sur la logique et les sciences cognitives, elle est adaptée aux troubles DYS. Elle permet de maîtriser les accords, notamment celui des verbes à tous les temps et au participe passé. Les fautes ne sont pas une fatalité, mais un problème de méthode.",
  },
  B2: {
    label: 'Avancé',
    tagline: 'Besoins professionnels.',
    index: 2,
    interpretation:
      "Les principales règles sont maîtrisées, mais certaines difficultés persistent dans des situations plus complexes.",
    preconisation:
      "Votre niveau correspond à celui auquel s'adresse en priorité la formation OHé. Une méthode ludique, sans règles à mémoriser, pour reprendre confiance en son orthographe en 10 minutes par jour. Fondée sur la logique et les sciences cognitives, elle est adaptée aux troubles DYS. Elle permet de maîtriser les accords, notamment celui des verbes à tous les temps et au participe passé. Les fautes ne sont pas une fatalité, mais un problème de méthode.",
  },
  C: {
    label: 'Expert',
    tagline: 'Besoins experts.',
    index: 3,
    interpretation:
      "Les principales règles d'orthographe sont maîtrisées, y compris dans des situations complexes.",
    preconisation:
      "Il se peut que votre niveau soit supérieur à celui travaillé dans la formation OHé. OHé propose surtout une remise à niveau en orthographe grammaticale, avec un travail progressif sur les accords, notamment sur celui des verbes à tous les temps et au participe passé.",
  },
};

const LEVEL_ORDER: BilanData['level'][] = ['A', 'B1', 'B2', 'C'];

// ============ Niveau de maîtrise par bloc (4 seuils Roxane) ============
function scoreToMastery(score: number): { label: string; color: string } {
  if (score >= 0.875) return { label: 'Maîtrisé', color: COLORS.emerald };           // 7-8/8
  if (score >= 0.625) return { label: 'En cours de maîtrise', color: COLORS.accentBlue }; // 5-6/8
  if (score >= 0.375) return { label: 'Fragile', color: COLORS.amber };              // 3-4/8
  return { label: 'Non maîtrisé', color: COLORS.red };                                // 0-2/8
}

// ============ Format temps ============
function formatDuration(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds < 0) return '—';
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m === 0) return `${s} s`;
  return `${m} min ${String(s).padStart(2, '0')} s`;
}

function formatDateFR(d: Date): string {
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ============ Styles ============
const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.bg,
    padding: 40,
    paddingTop: 28,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: COLORS.ink,
  },

  // ─── Header uniforme ───
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 0.6,
    borderBottomColor: COLORS.line,
    marginBottom: 18,
  },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoImg: { width: 30, height: 30, objectFit: 'contain' },
  logoKicker: {
    fontSize: 8,
    color: COLORS.accent,
    letterSpacing: 1.2,
    fontFamily: 'Helvetica-Bold',
  },
  topMeta: {
    fontSize: 8,
    color: COLORS.muted,
    letterSpacing: 0.8,
    textAlign: 'right',
  },

  // ─── Titre ───
  titleBlock: { marginBottom: 14 },
  title: {
    fontSize: 24,
    fontFamily: 'Times-Italic',
    color: COLORS.accent,
    marginBottom: 6,
  },
  identity: { fontSize: 10, color: COLORS.muted },
  identityBold: { fontFamily: 'Helvetica-Bold', color: COLORS.ink },

  // ─── Bloc Score + Niveau ───
  mainRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: COLORS.panel,
    borderWidth: 0.6,
    borderColor: COLORS.line,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreLabel: {
    fontSize: 8,
    letterSpacing: 1.2,
    color: COLORS.muted,
    marginBottom: 4,
    fontFamily: 'Helvetica-Bold',
  },
  scorePct: {
    fontSize: 36,
    fontFamily: 'Times-Italic',
    color: COLORS.accent,
    lineHeight: 1,
  },
  scoreHint: {
    fontSize: 8,
    color: COLORS.muted,
    marginTop: 4,
  },

  levelCard: {
    flex: 1.6,
    backgroundColor: COLORS.panel,
    borderWidth: 0.6,
    borderColor: COLORS.line,
    borderRadius: 8,
    padding: 14,
  },
  levelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 6,
  },
  levelBig: {
    fontSize: 28,
    fontFamily: 'Times-Italic',
    color: COLORS.accent,
    lineHeight: 1,
  },
  levelLabel: {
    fontSize: 11,
    color: COLORS.ink,
    fontFamily: 'Helvetica-Bold',
  },
  levelTag: {
    fontSize: 9,
    color: COLORS.muted,
    marginBottom: 8,
  },
  cecrlBar: {
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 6,
  },
  cecrlSeg: {
    flex: 1,
    height: 5,
    backgroundColor: COLORS.lineSoft,
    marginRight: 3,
    borderRadius: 2,
  },
  cecrlSegLast: {
    marginRight: 0,
  },
  cecrlSegActive: {
    backgroundColor: COLORS.accent,
  },
  cecrlLabelsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  cecrlLabelCell: {
    flex: 1,
    fontSize: 7,
    color: COLORS.muted,
    textAlign: 'center',
    marginRight: 3,
    letterSpacing: 0.4,
  },
  cecrlLabelActive: {
    color: COLORS.accent,
    fontFamily: 'Helvetica-Bold',
  },
  interpretation: {
    fontSize: 9,
    color: COLORS.ink,
    lineHeight: 1.4,
  },

  // ─── Radar section ───
  radarSection: {
    backgroundColor: COLORS.panel,
    borderWidth: 0.6,
    borderColor: COLORS.line,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  radarTitle: {
    fontSize: 8,
    letterSpacing: 1.2,
    color: COLORS.muted,
    marginBottom: 6,
    fontFamily: 'Helvetica-Bold',
    alignSelf: 'flex-start',
  },
  radarLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 8,
    color: COLORS.ink,
  },

  // ─── Préconisation ───
  precoBox: {
    backgroundColor: COLORS.panelTint,
    borderWidth: 0.6,
    borderColor: COLORS.line,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  precoLabel: {
    fontSize: 8,
    letterSpacing: 1.2,
    color: COLORS.accent,
    marginBottom: 4,
    fontFamily: 'Helvetica-Bold',
  },
  precoText: {
    fontSize: 9,
    color: COLORS.ink,
    lineHeight: 1.4,
  },

  // ─── Closing + Signature ───
  closingText: {
    fontSize: 8.5,
    color: COLORS.muted,
    lineHeight: 1.4,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
  },
  signature: {
    borderTopWidth: 0.6,
    borderTopColor: COLORS.line,
    paddingTop: 8,
    alignItems: 'center',
  },
  signatureName: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.ink,
  },
  signatureTitle: {
    fontSize: 7,
    color: COLORS.muted,
    letterSpacing: 1,
    marginTop: 2,
  },

  // ─── Footer ───
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: COLORS.muted,
    letterSpacing: 0.8,
  },
});

// ============ Composant Radar ============
function Radar({ blocks }: { blocks: BilanBlock[] }) {
  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 80;
  const levels = [0.25, 0.5, 0.75, 1];

  // Calcul des points pour chaque axe
  const angleStep = (Math.PI * 2) / blocks.length;
  const points = blocks.map((b, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const x = cx + Math.cos(angle) * radius * b.score;
    const y = cy + Math.sin(angle) * radius * b.score;
    return { x, y, angle, block: b };
  });

  // Points extérieurs (pour les labels)
  const labelPoints = blocks.map((_, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const labelR = radius + 18;
    return {
      x: cx + Math.cos(angle) * labelR,
      y: cy + Math.sin(angle) * labelR,
      angle,
    };
  });

  // Grille (polygones concentriques)
  const gridPolygons = levels.map((lvl) => {
    return blocks
      .map((_, i) => {
        const angle = -Math.PI / 2 + i * angleStep;
        return `${cx + Math.cos(angle) * radius * lvl},${cy + Math.sin(angle) * radius * lvl}`;
      })
      .join(' ');
  });

  const dataPolygon = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <Svg width={size} height={size + 30}>
      {/* Grille */}
      {gridPolygons.map((poly, i) => (
        <Polygon
          key={i}
          points={poly}
          fill="none"
          stroke={COLORS.lineSoft}
          strokeWidth={0.5}
        />
      ))}

      {/* Axes */}
      {blocks.map((_, i) => {
        const angle = -Math.PI / 2 + i * angleStep;
        return (
          <Line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(angle) * radius}
            y2={cy + Math.sin(angle) * radius}
            stroke={COLORS.lineSoft}
            strokeWidth={0.5}
          />
        );
      })}

      {/* Polygone données */}
      <Polygon
        points={dataPolygon}
        fill={COLORS.accent}
        fillOpacity={0.12}
        stroke={COLORS.accent}
        strokeWidth={1.2}
      />

      {/* Points colorés selon niveau */}
      {points.map((p, i) => {
        const mastery = scoreToMastery(p.block.score);
        return (
          <Circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            fill={mastery.color}
            stroke={COLORS.panel}
            strokeWidth={1.2}
          />
        );
      })}

      {/* Labels blocs */}
      {labelPoints.map((lp, i) => (
        <Text
          key={i}
          x={lp.x}
          y={lp.y}
          style={{ fontSize: 7.5, fill: COLORS.muted, textAnchor: 'middle' }}
        >
          {blocks[i].label}
        </Text>
      ))}
    </Svg>
  );
}

// ============ Composant principal ============
export default function BilanParticipantPDF({
  data,
  logo,
}: {
  data: BilanData;
  logo?: Buffer | string | null;
}) {

  const levelMeta = LEVEL_META[data.level];
  const globalPct = Math.round((data.scoreProcedural / 6) * 100);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.topBar}>
          <View style={styles.logoWrap}>
            {logo && <Image src={logo} style={styles.logoImg} />}
            <Text style={styles.logoKicker}>
              BILAN — {data.firstName.toUpperCase()} {data.lastName.toUpperCase()} — {data.organizationName.toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.topMeta}>
              Complété le {formatDateFR(data.completedAt)}
            </Text>
            <Text style={styles.topMeta}>
              Durée · {formatDuration(data.totalTimeSeconds)}
            </Text>
          </View>
        </View>

        {/* Titre */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Bilan de diagnostic</Text>
          <Text style={styles.identity}>
            <Text style={styles.identityBold}>
              {data.firstName} {data.lastName}
            </Text>{' '}
            · {data.email}
          </Text>
        </View>

        {/* Score + Niveau */}
        <View style={styles.mainRow}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>SCORE GLOBAL</Text>
            <Text style={styles.scorePct}>{globalPct} %</Text>
            <Text style={styles.scoreHint}>bonnes réponses</Text>
          </View>

          <View style={styles.levelCard}>
            <View style={styles.levelHeaderRow}>
              <Text style={styles.levelBig}>{data.level}</Text>
              <Text style={styles.levelLabel}>{levelMeta.label}</Text>
            </View>
            <Text style={styles.levelTag}>{levelMeta.tagline}</Text>

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

            <Text style={styles.interpretation}>{levelMeta.interpretation}</Text>
          </View>
        </View>

        {/* Radar + Légende */}
        <View style={styles.radarSection}>
          <Text style={styles.radarTitle}>PROFIL DE COMPÉTENCES</Text>
          <Radar blocks={data.blocks} />
          <View style={styles.radarLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.emerald }]} />
              <Text style={styles.legendText}>Maîtrisé</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.accentBlue }]} />
              <Text style={styles.legendText}>En cours de maîtrise</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.amber }]} />
              <Text style={styles.legendText}>Fragile</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.red }]} />
              <Text style={styles.legendText}>Non maîtrisé</Text>
            </View>
          </View>
        </View>

        {/* Préconisation OHé */}
        <View style={styles.precoBox}>
          <Text style={styles.precoLabel}>PRÉCONISATION OHÉ</Text>
          <Text style={styles.precoText}>{levelMeta.preconisation}</Text>
        </View>

        {/* Closing */}
        <Text style={styles.closingText}>
          Ce bilan est une photographie de votre orthographe à l&apos;instant T.
          L&apos;orthographe se travaille et se consolide : chaque effort compte,
          et la progression est toujours possible, à tout âge et à tout niveau.
        </Text>

        {/* Signature */}
        <View style={styles.signature}>
          <Text style={styles.signatureName}>Diagnostic conçu par Roxane Joannidès</Text>
          <Text style={styles.signatureTitle}>DOCTEURE EN SCIENCES DU LANGAGE</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>OHÉ · DOCUMENT CONFIDENTIEL · RÉF {data.reference}</Text>
          <Text render={({ pageNumber, totalPages }) => `P. ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
