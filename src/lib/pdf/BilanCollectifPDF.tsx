import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

// ============ Types ============
export interface CollectifBlockAvg {
  label: string;
  avgScore: number; // 0 → 1
}

export interface CollectifLevelCount {
  level: 'A' | 'B1' | 'B2' | 'C';
  count: number;
  pct: number; // 0 → 100
}

export interface CollectifQuadrantCount {
  quadrant: 1 | 2 | 3 | 4;
  count: number;
  pct: number;
}

export interface CollectifRecoCount {
  key: 'A_FORMER' | 'A_FORMER_ET_ACCOMPAGNER' | 'A_FORMER_SOUS_RESERVES' | 'A_ORIENTER';
  count: number;
  pct: number;
}

export interface CollectifData {
  organizationName: string;
  generatedAt: Date;
  totalParticipants: number;         // filtrés
  completedCount: number;            // COMPLETED parmi les filtrés
  avgGlobalScore: number;            // 0 → 1
  dominantLevel: 'A' | 'B1' | 'B2' | 'C' | null;
  avgTimeSeconds: number;
  blocks: CollectifBlockAvg[];       // 6 blocs
  levels: CollectifLevelCount[];     // A, B1, B2, C
  quadrants: CollectifQuadrantCount[]; // 1..4
  recos: CollectifRecoCount[];       // 4 catégories
  filters: {
    status?: string;
    group?: string;
    search?: string;
  };
}

// ============ Palette ============
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
  emerald: '#10B981',
  amber: '#F59E0B',
  red: '#DC2626',
  neutral: '#94A3B8',
};

// ============ Niveaux ============
const LEVEL_META: Record<
  'A' | 'B1' | 'B2' | 'C',
  { name: string; color: string; desc: string }
> = {
  A:  { name: 'Niveau A · Élémentaire',   color: COLORS.red,     desc: 'besoins de base' },
  B1: { name: 'Niveau B1 · Intermédiaire', color: COLORS.amber,   desc: 'besoins techniques' },
  B2: { name: 'Niveau B2 · Avancé',        color: COLORS.accent,  desc: 'besoins professionnels' },
  C:  { name: 'Niveau C · Expert',         color: COLORS.emerald, desc: 'besoins experts' },
};

const QUADRANT_META: Record<number, { label: string; muted: boolean }> = {
  1: { label: 'Besoin perçu · Disposé',            muted: false },
  2: { label: 'Besoin perçu · Moins disposé',      muted: false },
  3: { label: 'Pas de besoin perçu · Disposé',     muted: false },
  4: { label: 'Pas de besoin perçu · Moins disposé', muted: true  },
};

const RECO_META: Record<
  CollectifRecoCount['key'],
  { label: string; desc: string; muted: boolean }
> = {
  A_FORMER:                { label: 'À former',                   desc: 'Public prioritaire',        muted: false },
  A_FORMER_ET_ACCOMPAGNER: { label: 'À former et accompagner',    desc: 'Nécessite un accompagnement', muted: false },
  A_FORMER_SOUS_RESERVES:  { label: 'À former sous réserves',     desc: 'À évaluer au cas par cas',  muted: false },
  A_ORIENTER:              { label: 'À orienter',                 desc: 'Vers une autre solution',   muted: true  },
};

// ============ 4 niveaux Roxane ============
function scoreToMastery(score: number): { label: string; color: string } {
  if (score >= 0.875) return { label: 'Maîtrisé', color: COLORS.emerald };
  if (score >= 0.625) return { label: 'En cours de maîtrise', color: COLORS.accent };
  if (score >= 0.375) return { label: 'Fragile', color: COLORS.amber };
  return { label: 'Non maîtrisé', color: COLORS.red };
}

// ============ Helpers ============
function formatDateFR(d: Date): string {
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m === 0) return `${s} s`;
  return `${m} min ${String(s).padStart(2, '0')} s`;
}

// ============ Styles ============
const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.bg,
    padding: 36,
    paddingTop: 24,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: COLORS.ink,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 0.6,
    borderBottomColor: COLORS.line,
    marginBottom: 14,
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

  titleBlock: { marginBottom: 10 },
  title: {
    fontSize: 22,
    fontFamily: 'Times-Italic',
    color: COLORS.accent,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9.5,
    color: COLORS.muted,
    lineHeight: 1.4,
  },

  filterBar: {
    backgroundColor: COLORS.panelTint,
    borderWidth: 0.6,
    borderColor: COLORS.line,
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: 8,
    color: COLORS.muted,
    letterSpacing: 0.8,
    fontFamily: 'Helvetica-Bold',
  },
  filterValue: {
    fontSize: 8.5,
    color: COLORS.ink,
    marginRight: 12,
  },

  kpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: COLORS.panel,
    borderWidth: 0.6,
    borderColor: COLORS.line,
    borderRadius: 8,
    padding: 10,
  },
  kpiLabel: {
    fontSize: 7,
    letterSpacing: 1.2,
    color: COLORS.muted,
    marginBottom: 4,
    fontFamily: 'Helvetica-Bold',
  },
  kpiValue: {
    fontSize: 22,
    fontFamily: 'Times-Italic',
    color: COLORS.accent,
    lineHeight: 1,
  },
  kpiHint: {
    fontSize: 7.5,
    color: COLORS.muted,
    marginTop: 4,
  },

  sectionCard: {
    backgroundColor: COLORS.panel,
    borderWidth: 0.6,
    borderColor: COLORS.line,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  sectionKicker: {
    fontSize: 7.5,
    letterSpacing: 1.4,
    color: COLORS.accent,
    marginBottom: 4,
    fontFamily: 'Helvetica-Bold',
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Times-Italic',
    color: COLORS.ink,
    marginBottom: 3,
  },
  sectionSub: {
    fontSize: 9,
    color: COLORS.muted,
    marginBottom: 8,
    lineHeight: 1.4,
  },

  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  blockLabel: {
    width: 130,
    fontSize: 9,
    color: COLORS.ink,
  },
  blockBarWrap: {
    flex: 1,
    height: 10,
    backgroundColor: COLORS.lineSoft,
    borderRadius: 4,
    overflow: 'hidden',
  },
  blockBar: {
    height: 10,
    borderRadius: 4,
  },
  blockPct: {
    width: 48,
    fontSize: 9,
    color: COLORS.ink,
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
  },
  blockMastery: {
    width: 90,
    fontSize: 8,
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
  },

  levelLegendRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  levelLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  levelDot: { width: 8, height: 8, borderRadius: 4 },
  levelLegendText: { fontSize: 8.5, color: COLORS.ink },

  histogramRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginTop: 6,
    height: 90,
    paddingHorizontal: 20,
  },
  histoCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  histoBar: {
    width: '70%',
    borderRadius: 4,
  },
  histoTopLabel: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.ink,
    marginBottom: 3,
  },
  histoBottomLabel: {
    fontSize: 8.5,
    color: COLORS.ink,
    marginTop: 4,
    fontFamily: 'Helvetica-Bold',
  },
  histoCount: {
    fontSize: 7.5,
    color: COLORS.muted,
    marginTop: 1,
  },

  quadrantGrid: {
    marginTop: 6,
  },
  quadrantHeaderRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  quadrantHeaderCell: {
    flex: 1,
    fontSize: 7.5,
    color: COLORS.muted,
    letterSpacing: 0.6,
    fontFamily: 'Helvetica-Bold',
    padding: 4,
    textAlign: 'center',
  },
  quadrantRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  quadrantRowLabel: {
    width: 90,
    fontSize: 7.5,
    color: COLORS.muted,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
    alignSelf: 'center',
  },
  quadrantCell: {
    flex: 1,
    padding: 10,
    borderWidth: 0.6,
    borderColor: COLORS.line,
    borderRadius: 6,
    minHeight: 60,
  },
  quadrantCellActive: {
    backgroundColor: COLORS.accentSoft,
  },
  quadrantCellMuted: {
    backgroundColor: COLORS.lineSoft,
  },
  quadrantLabel: {
    fontSize: 8.5,
    color: COLORS.ink,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  quadrantPct: {
    fontSize: 16,
    fontFamily: 'Times-Italic',
    color: COLORS.accent,
    lineHeight: 1,
  },
  quadrantCount: {
    fontSize: 8,
    color: COLORS.muted,
    marginTop: 2,
  },

  recoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  recoCell: {
    width: '48%',
    padding: 10,
    borderWidth: 0.6,
    borderColor: COLORS.line,
    borderRadius: 6,
    backgroundColor: COLORS.accentSoft,
  },
  recoCellMuted: {
    backgroundColor: COLORS.lineSoft,
  },
  recoLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.ink,
    marginBottom: 4,
  },
  recoPct: {
    fontSize: 20,
    fontFamily: 'Times-Italic',
    color: COLORS.accent,
    lineHeight: 1,
  },
  recoCount: {
    fontSize: 8,
    color: COLORS.muted,
    marginTop: 2,
  },
  recoDesc: {
    fontSize: 8,
    color: COLORS.muted,
    marginTop: 4,
    fontStyle: 'italic',
  },

  footer: {
    position: 'absolute',
    bottom: 20,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: COLORS.muted,
    letterSpacing: 0.8,
  },
});


// ============ Header réutilisable ============
function Header({
  orgName,
  logo,
  generatedAt,
  totalParticipants,
}: {
  orgName: string;
  logo?: Buffer | string | null;
  generatedAt: Date;
  totalParticipants: number;
}) {
  return (
    <View style={styles.topBar} fixed>
      <View style={styles.logoWrap}>
        {logo && <Image src={logo as any} style={styles.logoImg} />}
        <Text style={styles.logoKicker}>
          BILAN COLLECTIF — {orgName.toUpperCase()}
        </Text>
      </View>
      <View>
        <Text style={styles.topMeta}>
          Généré le {formatDateFR(generatedAt)}
        </Text>
        <Text style={styles.topMeta}>
          {totalParticipants} participant{totalParticipants > 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );
}

// ============ Composant principal ============
export default function BilanCollectifPDF({
  data,
  logo,
}: {
  data: CollectifData;
  logo?: Buffer | string | null;
}) {
  const globalPct = Math.round(data.avgGlobalScore * 100);
  const dominantLevelLabel = data.dominantLevel
    ? `${data.dominantLevel} · ${LEVEL_META[data.dominantLevel].desc}`
    : '—';

  const hasFilters = !!(data.filters.status || data.filters.group || data.filters.search);

  return (
    <Document>
      {/* ============ PAGE 1 ============ */}
<Page size="A4" style={styles.page}>
  <Header
    orgName={data.organizationName}
    logo={logo}
    generatedAt={data.generatedAt}
    totalParticipants={data.totalParticipants}
  />

  <View style={styles.titleBlock}>
    <Text style={styles.title}>Restitution collective</Text>
    <Text style={styles.subtitle}>
      {data.completedCount} diagnostic{data.completedCount > 1 ? 's' : ''} complété
      {data.completedCount > 1 ? 's' : ''} sur {data.totalParticipants} participant
      {data.totalParticipants > 1 ? 's' : ''}.
    </Text>
  </View>

  {hasFilters && (
    <View style={styles.filterBar}>
      <Text style={styles.filterLabel}>FILTRES ACTIFS</Text>
      {data.filters.status && (
        <Text style={styles.filterValue}>Statut : {data.filters.status}</Text>
      )}
      {data.filters.group && (
        <Text style={styles.filterValue}>Groupe : {data.filters.group}</Text>
      )}
      {data.filters.search && (
        <Text style={styles.filterValue}>Recherche : « {data.filters.search} »</Text>
      )}
    </View>
  )}

  {/* 4 KPIs */}
  <View style={styles.kpiRow}>
    <View style={styles.kpiCard}>
      <Text style={styles.kpiLabel}>SCORE MOYEN</Text>
      <Text style={styles.kpiValue}>{globalPct} %</Text>
      <Text style={styles.kpiHint}>bonnes réponses</Text>
    </View>
    <View style={styles.kpiCard}>
      <Text style={styles.kpiLabel}>COMPLÉTÉS</Text>
      <Text style={styles.kpiValue}>{data.completedCount}</Text>
      <Text style={styles.kpiHint}>diagnostics</Text>
    </View>
    <View style={styles.kpiCard}>
      <Text style={styles.kpiLabel}>NIVEAU DOMINANT</Text>
      <Text style={styles.kpiValue}>{data.dominantLevel ?? '—'}</Text>
      <Text style={styles.kpiHint}>{dominantLevelLabel.split(' · ')[1] ?? ''}</Text>
    </View>
    <View style={styles.kpiCard}>
      <Text style={styles.kpiLabel}>TEMPS MOYEN</Text>
      <Text style={styles.kpiValue}>{formatDuration(data.avgTimeSeconds)}</Text>
      <Text style={styles.kpiHint}>par participant</Text>
    </View>
  </View>

  {/* Section I.1 — Profil de compétences */}
  <View style={styles.sectionCard} wrap={false}>
    <Text style={styles.sectionKicker}>I.1 · PROFIL DE COMPÉTENCES</Text>
    <Text style={styles.sectionTitle}>Maîtrise moyenne par bloc</Text>
    <Text style={styles.sectionSub}>
      Score moyen de l&apos;équipe sur chacun des 6 domaines évalués.
    </Text>

    {data.blocks.map((b) => {
      const pct = Math.round(b.avgScore * 100);
      const mastery = scoreToMastery(b.avgScore);
      return (
        <View key={b.label} style={styles.blockRow}>
          <Text style={styles.blockLabel}>{b.label}</Text>
          <View style={styles.blockBarWrap}>
            <View
              style={[
                styles.blockBar,
                { width: `${pct}%`, backgroundColor: mastery.color },
              ]}
            />
          </View>
          <Text style={styles.blockPct}>{pct} %</Text>
          <Text style={[styles.blockMastery, { color: mastery.color }]}>
            {mastery.label}
          </Text>
        </View>
      );
    })}
  </View>

  {/* Section I.2 — Niveaux de maîtrise (fusionnée dans page 1) */}
  <View style={styles.sectionCard} wrap={false}>
    <Text style={styles.sectionKicker}>I.2 · NIVEAUX DE MAÎTRISE</Text>
    <Text style={styles.sectionTitle}>Répartition des niveaux</Text>

    <View style={styles.levelLegendRow}>
      {(['A', 'B1', 'B2', 'C'] as const).map((lvl) => (
        <View key={lvl} style={styles.levelLegendItem}>
          <View style={[styles.levelDot, { backgroundColor: LEVEL_META[lvl].color }]} />
          <Text style={styles.levelLegendText}>
            {LEVEL_META[lvl].name}
          </Text>
        </View>
      ))}
    </View>

    <View style={styles.histogramRow}>
      {data.levels.map((l) => {
        const barHeight = Math.max(4, (l.pct / 100) * 70);
        return (
          <View key={l.level} style={styles.histoCol}>
            <Text style={styles.histoTopLabel}>{l.pct} %</Text>
            <View
              style={[
                styles.histoBar,
                { height: barHeight, backgroundColor: LEVEL_META[l.level].color },
              ]}
            />
            <Text style={styles.histoBottomLabel}>{l.level}</Text>
            <Text style={styles.histoCount}>
              {l.count} personne{l.count > 1 ? 's' : ''}
            </Text>
          </View>
        );
      })}
    </View>
  </View>

  <View style={styles.footer} fixed>
    <Text>OHÉ · DOCUMENT CONFIDENTIEL</Text>
    <Text
      render={({ pageNumber, totalPages }) => `P. ${pageNumber} / ${totalPages}`}
    />
  </View>
</Page>


     
      {/* ============ PAGE 2 ============ */}
      <Page size="A4" style={styles.page}>
        <Header
          orgName={data.organizationName}
          logo={logo}
          generatedAt={data.generatedAt}
          totalParticipants={data.totalParticipants}
        />

        {/* Section II — Déclarations */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionKicker}>II · DÉCLARATIONS DES PARTICIPANTS</Text>
          <Text style={styles.sectionTitle}>Besoin perçu × Disposition à se former</Text>
          <Text style={styles.sectionSub}>
            Croisement entre ce que chaque participant pense de son niveau et sa disposition à suivre une formation.
          </Text>

          {/* Grille 2×2 */}
          <View style={styles.quadrantGrid}>
            {/* En-tête colonnes */}
            <View style={styles.quadrantHeaderRow}>
              <View style={{ width: 90 }} />
              <Text style={styles.quadrantHeaderCell}>BESOIN PERÇU</Text>
              <Text style={styles.quadrantHeaderCell}>PAS DE BESOIN PERÇU</Text>
            </View>

            {/* Ligne 1 : Disposé */}
            <View style={styles.quadrantRow}>
              <Text style={styles.quadrantRowLabel}>DISPOSÉ</Text>
              {[1, 3].map((qNum) => {
                const q = data.quadrants.find((x) => x.quadrant === qNum);
                const meta = QUADRANT_META[qNum];
                return (
                  <View
                    key={qNum}
                    style={[
                      styles.quadrantCell,
                      meta.muted ? styles.quadrantCellMuted : styles.quadrantCellActive,
                    ]}
                  >
                    <Text style={styles.quadrantLabel}>{meta.label}</Text>
                    <Text style={styles.quadrantPct}>{q?.pct ?? 0} %</Text>
                    <Text style={styles.quadrantCount}>
                      {q?.count ?? 0} personne{(q?.count ?? 0) > 1 ? 's' : ''}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Ligne 2 : Moins disposé */}
            <View style={styles.quadrantRow}>
              <Text style={styles.quadrantRowLabel}>MOINS DISPOSÉ</Text>
              {[2, 4].map((qNum) => {
                const q = data.quadrants.find((x) => x.quadrant === qNum);
                const meta = QUADRANT_META[qNum];
                return (
                  <View
                    key={qNum}
                    style={[
                      styles.quadrantCell,
                      meta.muted ? styles.quadrantCellMuted : styles.quadrantCellActive,
                    ]}
                  >
                    <Text style={styles.quadrantLabel}>{meta.label}</Text>
                    <Text style={styles.quadrantPct}>{q?.pct ?? 0} %</Text>
                    <Text style={styles.quadrantCount}>
                      {q?.count ?? 0} personne{(q?.count ?? 0) > 1 ? 's' : ''}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Section III — Préconisation */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionKicker}>III · PRÉCONISATION</Text>
          <Text style={styles.sectionTitle}>Actions recommandées</Text>
          <Text style={styles.sectionSub}>
            Croisement des résultats du test et des déclarations pour déterminer la suite la plus adaptée.
          </Text>

          <View style={styles.recoGrid}>
            {(['A_FORMER', 'A_FORMER_ET_ACCOMPAGNER', 'A_FORMER_SOUS_RESERVES', 'A_ORIENTER'] as const).map(
              (key) => {
                const meta = RECO_META[key];
                const reco = data.recos.find((r) => r.key === key);
                return (
                  <View
                    key={key}
style={[styles.recoCell, meta.muted ? styles.recoCellMuted : {}]}
                  >
                    <Text style={styles.recoLabel}>{meta.label}</Text>
                    <Text style={styles.recoPct}>{reco?.pct ?? 0} %</Text>
                    <Text style={styles.recoCount}>
                      {reco?.count ?? 0} personne{(reco?.count ?? 0) > 1 ? 's' : ''}
                    </Text>
                    <Text style={styles.recoDesc}>{meta.desc}</Text>
                  </View>
                );
              },
            )}
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>OHÉ · DOCUMENT CONFIDENTIEL</Text>
          <Text
            render={({ pageNumber, totalPages }) => `P. ${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}