import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import { SharedRadar } from './SharedRadar';

// ============ Types ============
export interface AdminIndivBlock {
  label: string;
  score: number;      // 0..1
  correctCount: number;
}

export interface AdminIndivData {
  // Identité
  firstName: string;
  lastName: string;
  email: string;
  organizationName: string;
  groupName?: string | null;
  completedAt: Date;
  reference: string;

  // KPIs
  scoreProcedural: number;        // /6
  correctTotal: number;           // /48
  level: 'A' | 'B1' | 'B2' | 'C';
  totalTimeSeconds: number;

  // Radar
  blocks: AdminIndivBlock[];      // 6 blocs

  // Déclarations
  quadrant: 1 | 2 | 3 | 4;

  // Recommandation
  recommandation: 'A_FORMER' | 'A_FORMER_ET_ACCOMPAGNER' | 'A_FORMER_SOUS_RESERVES' | 'A_ORIENTER' | null;
}

// ============ Palette (identique au collectif) ============
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

// ============ Niveaux (identique au collectif) ============
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
  1: { label: 'Besoin perçu · Disposé',              muted: false },
  2: { label: 'Besoin perçu · Moins disposé',        muted: false },
  3: { label: 'Pas de besoin perçu · Disposé',       muted: false },
  4: { label: 'Pas de besoin perçu · Moins disposé', muted: true  },
};

const RECO_META: Record<string, { label: string; desc: string; muted: boolean }> = {
  A_FORMER:                { label: 'À former',                            desc: 'Le niveau correspond, le besoin est identifié et la disposition à se former est forte.', muted: false },
  A_FORMER_ET_ACCOMPAGNER: { label: 'À former et accompagner',             desc: "Le niveau correspond, mais il faut travailler l'adhésion.",                                                                                        muted: false },
  A_FORMER_SOUS_RESERVES:  { label: 'À former sous réserves',              desc: 'La personne exprime une demande ou un besoin, mais son niveau invite à vérifier la pertinence de la formation.',                                    muted: false },
  A_ORIENTER:              { label: "À orienter vers d'autres solutions",  desc: 'Niveau hors cible, trop élevé ou insuffisant.',                                                                                                     muted: true  },
};


// ============ 4 niveaux de maîtrise ============
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

// ============ Styles (copie exacte du collectif) ============
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

  identityBand: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    backgroundColor: COLORS.panelTint,
    borderWidth: 0.6,
    borderColor: COLORS.line,
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  idCell: { minWidth: 100 },
  idLabel: {
    fontSize: 7,
    color: COLORS.muted,
    letterSpacing: 1,
    marginBottom: 2,
    fontFamily: 'Helvetica-Bold',
  },
  idValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.ink,
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

  radarWrap: {
    alignItems: 'center',
    marginTop: 4,
  },
  radarLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginTop: 6,
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
    borderColor: COLORS.accent,
    borderWidth: 1.2,
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
  quadrantTag: {
    fontSize: 8,
    color: COLORS.accent,
    fontFamily: 'Helvetica-Bold',
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
    backgroundColor: COLORS.lineSoft,
  },
  recoCellActive: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.accent,
    borderWidth: 1.2,
  },
  recoLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.ink,
    marginBottom: 4,
  },
  recoTag: {
    fontSize: 8,
    color: COLORS.accent,
    fontFamily: 'Helvetica-Bold',
    marginTop: 2,
  },
  recoDesc: {
    fontSize: 7.5,
    color: COLORS.muted,
    marginTop: 4,
    fontStyle: 'italic',
    lineHeight: 1.35,
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
  fullName,
  logo,
  completedAt,
}: {
  orgName: string;
  fullName: string;
  logo?: Buffer | string | null;
  completedAt: Date;
}) {
  return (
    <View style={styles.topBar} fixed>
      <View style={styles.logoWrap}>
        {logo && <Image src={logo as any} style={styles.logoImg} />}
        <Text style={styles.logoKicker}>
          BILAN INDIVIDUEL — {fullName.toUpperCase()} — {orgName.toUpperCase()}
        </Text>
      </View>
      <View>
        <Text style={styles.topMeta}>
          Complété le {formatDateFR(completedAt)}
        </Text>
      </View>
    </View>
  );
}

// ============ Composant principal ============
export default function BilanAdminIndividuelPDF({
  data,
  logo,
}: {
  data: AdminIndivData;
  logo?: Buffer | string | null;
}) {
  const fullName = `${data.firstName} ${data.lastName}`.trim() || 'Participant';
  const globalPct = Math.round((data.scoreProcedural / 6) * 100);
  const levelInfo = LEVEL_META[data.level];

  return (
    <Document>
      {/* ============ PAGE 1 ============ */}
      <Page size="A4" style={styles.page}>
        <Header
          orgName={data.organizationName}
          fullName={fullName}
          logo={logo}
          completedAt={data.completedAt}
        />

        <View style={styles.titleBlock}>
          <Text style={styles.title}>Bilan individuel</Text>
          <Text style={styles.subtitle}>
            Bilan du diagnostic passé par {fullName}.
          </Text>
        </View>

        {/* Bandeau identité */}
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
          {data.groupName && (
            <View style={styles.idCell}>
              <Text style={styles.idLabel}>GROUPE</Text>
              <Text style={styles.idValue}>{data.groupName}</Text>
            </View>
          )}
          <View style={styles.idCell}>
            <Text style={styles.idLabel}>RÉFÉRENCE</Text>
            <Text style={styles.idValue}>{data.reference}</Text>
          </View>
        </View>

        {/* 4 KPIs */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>SCORE</Text>
            <Text style={styles.kpiValue}>{globalPct} %</Text>
            <Text style={styles.kpiHint}>{data.correctTotal} / 48 bonnes réponses</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>NIVEAU GLOBAL</Text>
            <Text style={styles.kpiValue}>{data.level}</Text>
            <Text style={styles.kpiHint}>{levelInfo.desc}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>TEMPS TOTAL</Text>
            <Text style={styles.kpiValue}>{formatDuration(data.totalTimeSeconds)}</Text>
            <Text style={styles.kpiHint}>de passation</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>DATE</Text>
            <Text style={[styles.kpiValue, { fontSize: 14 }]}>
              {formatDateFR(data.completedAt)}
            </Text>
            <Text style={styles.kpiHint}>diagnostic complété</Text>
          </View>
        </View>

        {/* Section I.1 — Profil de compétences (RADAR) */}
        <View style={styles.sectionCard} wrap={false}>
          <Text style={styles.sectionKicker}>I · PROFIL DE COMPÉTENCES</Text>
          <Text style={styles.sectionTitle}>Maîtrise par bloc</Text>
          <Text style={styles.sectionSub}>
            Score du participant sur chacun des 6 domaines évalués.
          </Text>

          <View style={styles.radarWrap}>
            <SharedRadar
              blocks={data.blocks.map((b) => ({ label: b.label, score: b.score }))}
              colors={{
                accent: COLORS.accent,
                panel: COLORS.panel,
                lineSoft: COLORS.lineSoft,
                ink: COLORS.ink,
                muted: COLORS.muted,
              }}
              masteryColor={(score) => scoreToMastery(score).color}
              showPercent
            />
            <View style={styles.radarLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.emerald }]} />
                <Text style={styles.legendText}>Maîtrisé</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.accent }]} />
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
        </View>


        <View style={styles.footer} fixed>
          <Text>OHÉ · DOCUMENT CONFIDENTIEL · RÉF {data.reference}</Text>
          <Text
            render={({ pageNumber, totalPages }) => `P. ${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>

      {/* ============ PAGE 2 ============ */}
      <Page size="A4" style={styles.page}>
        <Header
          orgName={data.organizationName}
          fullName={fullName}
          logo={logo}
          completedAt={data.completedAt}
        />

        {/* Section II — Déclarations */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionKicker}>II · DÉCLARATIONS DU PARTICIPANT</Text>
          <Text style={styles.sectionTitle}>Besoin perçu × Disposition à se former</Text>
          <Text style={styles.sectionSub}>
            Positionnement du participant selon le besoin qu&apos;il perçoit et sa disposition à suivre une formation.
          </Text>

          <View style={styles.quadrantGrid}>
            <View style={styles.quadrantHeaderRow}>
              <View style={{ width: 90 }} />
              <Text style={styles.quadrantHeaderCell}>BESOIN PERÇU</Text>
              <Text style={styles.quadrantHeaderCell}>PAS DE BESOIN PERÇU</Text>
            </View>

            <View style={styles.quadrantRow}>
              <Text style={styles.quadrantRowLabel}>DISPOSÉ</Text>
              {[1, 3].map((qNum) => {
                const meta = QUADRANT_META[qNum];
                const isActive = data.quadrant === qNum;
                return (
                  <View
                    key={qNum}
                    style={[
                      styles.quadrantCell,
                      isActive ? styles.quadrantCellActive : styles.quadrantCellMuted,
                    ]}
                  >
                    <Text style={styles.quadrantLabel}>{meta.label}</Text>
                    {isActive && (
                      <Text style={styles.quadrantTag}>✓ Profil du participant</Text>
                    )}
                  </View>
                );
              })}
            </View>

            <View style={styles.quadrantRow}>
              <Text style={styles.quadrantRowLabel}>MOINS DISPOSÉ</Text>
              {[2, 4].map((qNum) => {
                const meta = QUADRANT_META[qNum];
                const isActive = data.quadrant === qNum;
                return (
                  <View
                    key={qNum}
                    style={[
                      styles.quadrantCell,
                      isActive ? styles.quadrantCellActive : styles.quadrantCellMuted,
                    ]}
                  >
                    <Text style={styles.quadrantLabel}>{meta.label}</Text>
                    {isActive && (
                      <Text style={styles.quadrantTag}>✓ Profil du participant</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Section III — Préconisation */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionKicker}>III · PRÉCONISATION</Text>
          <Text style={styles.sectionTitle}>Action recommandée</Text>
          <Text style={styles.sectionSub}>
            Croisement des résultats du test et des déclarations pour déterminer la suite la plus adaptée.
          </Text>

          <View style={styles.recoGrid}>
            {(['A_FORMER', 'A_FORMER_ET_ACCOMPAGNER', 'A_FORMER_SOUS_RESERVES', 'A_ORIENTER'] as const).map(
              (key) => {
                const meta = RECO_META[key];
                const isActive = data.recommandation === key;
                return (
                  <View
                    key={key}
                    style={[
                      styles.recoCell,
                      isActive ? styles.recoCellActive : {},
                    ]}
                  >
                    <Text style={styles.recoLabel}>{meta.label}</Text>
                    {isActive && (
                      <Text style={styles.recoTag}>✓ Préconisation</Text>
                    )}
                    <Text style={styles.recoDesc}>{meta.desc}</Text>
                  </View>
                );
              },
            )}
          </View>
        </View>

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