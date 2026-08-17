import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { COLORS, styles as shared, LEVEL_META, CEFR_SCALE, scoreToLabel } from './shared/theme';
import RadarPDF from './shared/RadarPDF';
import QuadrantPDF from './shared/QuadrantPDF';
import {
  buildExecutiveSummary,
  buildClientRecommendations,
  buildProfileInterpretation,
} from './shared/templates';

export interface BilanClientBlock {
  name: string;
  score: number;
  correctCount: number;
  totalCount: number;
  dontKnowCount: number;
  avgTimeSec: number | null;
}

export interface BilanClientData {
  logoDataUri: string;
  firstName: string;
  lastName: string;
  email: string;
  organizationName: string;
  groupName: string | null;
  completedAt: Date;
  durationMin: number;
  level: 'A' | 'B1' | 'B2' | 'C';
  scoreProcedural: number;
  blocks: BilanClientBlock[];
  quadrant: 1 | 2 | 3 | 4 | null;
  scoreAdaptation: number | null;
  scoreInteret: number | null;
  reference: string;
}

const local = StyleSheet.create({
  heroItalic: { fontFamily: 'Times-Italic', color: COLORS.accent },

  identityBox: {
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 4,
    padding: 12,
    marginBottom: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  identityCell: { width: '50%', marginBottom: 6 },
  identityLabel: {
    fontSize: 8,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  identityValue: { fontSize: 10, color: COLORS.ink },

  summaryBox: {
    backgroundColor: COLORS.panelTint,
    padding: 12,
    borderRadius: 4,
    marginBottom: 10,
  },
  summaryText: { fontSize: 10, color: COLORS.ink, lineHeight: 1.5 },

  scaleRow: { flexDirection: 'row', marginBottom: 14, gap: 6 },
  scaleCell: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: COLORS.line,
    borderRadius: 4,
    padding: 6,
    alignItems: 'center',
  },
  scaleCellActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  scaleKey: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: COLORS.ink, marginBottom: 2 },
  scaleKeyActive: { color: COLORS.white },
  scaleLabel: { fontSize: 8, color: COLORS.muted },
  scaleLabelActive: { color: COLORS.white, opacity: 0.9 },

  table: { borderWidth: 1, borderColor: COLORS.line, borderRadius: 4 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.panelTint,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.line,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  th: { fontSize: 8, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.4 },
  td: { fontSize: 9, color: COLORS.ink },
  colName: { width: '32%' },
  colScore: { width: '14%' },
  colCorrect: { width: '14%' },
  colDontKnow: { width: '14%' },
  colTime: { width: '13%' },
  colLevel: { width: '13%' },

  interpBox: {
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 4,
    padding: 12,
    marginTop: 10,
  },
  recoItem: { flexDirection: 'row', marginBottom: 6 },
  recoBullet: { fontSize: 10, color: COLORS.accent, marginRight: 6 },
  recoText: { fontSize: 10, color: COLORS.ink, flex: 1, lineHeight: 1.4 },
  confidential: {
    fontSize: 8,
    color: COLORS.muted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 14,
  },

  pageNum: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    fontSize: 7,
    color: COLORS.muted,
    letterSpacing: 0.8,
    textAlign: 'center',
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.line,
  },
});

export function BilanClientPDF({ data }: { data: BilanClientData }) {
  const dateStr = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(data.completedAt);
  const levelInfo = LEVEL_META[data.level];

  const weakBlocks = data.blocks.filter((b) => b.score < 0.5);
  const strongBlocks = data.blocks.filter((b) => b.score >= 0.75);

  const summary = buildExecutiveSummary({
    firstName: data.firstName,
    level: data.level,
    scoreProcedural: data.scoreProcedural,
    weakBlockNames: weakBlocks.map((b) => b.name),
    strongBlockNames: strongBlocks.map((b) => b.name),
  });

  const recommendations = buildClientRecommendations({
    level: data.level,
    weakBlocks: weakBlocks.map((b) => ({ name: b.name, score: b.score })),
  });

  const hasDeclarative =
    data.quadrant !== null && data.scoreAdaptation !== null && data.scoreInteret !== null;

  return (
    <Document>
      {/* PAGE 1 — SYNTHÈSE */}
      <Page size="A4" style={shared.page}>
        <View style={shared.topBar}>
          <Image src={data.logoDataUri} style={{ height: 24 }} />
          <Text style={shared.topMeta}>
            RAPPORT CLIENT · {data.organizationName.toUpperCase()} · {dateStr.toUpperCase()}
          </Text>
        </View>

        <Text style={shared.eyebrow}>- BILAN DÉTAILLÉ · RÉSERVÉ CLIENT</Text>
        <Text style={shared.heroTitle}>
          Rapport de <Text style={local.heroItalic}>diagnostic</Text>
        </Text>

        <View style={local.identityBox}>
          <View style={local.identityCell}>
            <Text style={local.identityLabel}>Participant</Text>
            <Text style={local.identityValue}>{data.firstName} {data.lastName}</Text>
          </View>
          <View style={local.identityCell}>
            <Text style={local.identityLabel}>Email</Text>
            <Text style={local.identityValue}>{data.email}</Text>
          </View>
          <View style={local.identityCell}>
            <Text style={local.identityLabel}>Organisation</Text>
            <Text style={local.identityValue}>{data.organizationName}</Text>
          </View>
          <View style={local.identityCell}>
            <Text style={local.identityLabel}>Groupe</Text>
            <Text style={local.identityValue}>{data.groupName ?? '—'}</Text>
          </View>
          <View style={local.identityCell}>
            <Text style={local.identityLabel}>Date de passation</Text>
            <Text style={local.identityValue}>{dateStr}</Text>
          </View>
          <View style={local.identityCell}>
            <Text style={local.identityLabel}>Durée</Text>
            <Text style={local.identityValue}>{data.durationMin} min</Text>
          </View>
          <View style={local.identityCell}>
            <Text style={local.identityLabel}>Niveau CECRL</Text>
            <Text style={local.identityValue}>{data.level} — {levelInfo.name}</Text>
          </View>
          <View style={local.identityCell}>
            <Text style={local.identityLabel}>Score procédural</Text>
            <Text style={local.identityValue}>{data.scoreProcedural.toFixed(1)} / 6</Text>
          </View>
        </View>

        <Text style={shared.sectionTitle}>Échelle CECRL</Text>
        <View style={local.scaleRow}>
          {CEFR_SCALE.map((s) => {
            const active = s.letter === data.level;
            return (
              <View
                key={s.letter}
                style={[local.scaleCell, active ? local.scaleCellActive : {}]}
              >
                <Text style={[local.scaleKey, active ? local.scaleKeyActive : {}]}>
                  {s.letter}
                </Text>
                <Text style={[local.scaleLabel, active ? local.scaleLabelActive : {}]}>
                  {s.range}
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={shared.sectionTitle}>Synthèse exécutive</Text>
        <View style={local.summaryBox}>
          <Text style={local.summaryText}>{summary}</Text>
        </View>

        <Text style={local.pageNum}>{data.reference} · Page 1/3 · Document confidentiel</Text>
      </Page>

      {/* PAGE 2 — RADAR + TABLEAU */}
      <Page size="A4" style={shared.page}>
        <View style={shared.topBar}>
          <Image src={data.logoDataUri} style={{ height: 24 }} />
          <Text style={shared.topMeta}>
            {data.organizationName.toUpperCase()} · {dateStr.toUpperCase()}
          </Text>
        </View>

        <Text style={shared.sectionTitle}>Profil procédural</Text>
        <View style={{ alignItems: 'center', marginVertical: 10 }}>
          <RadarPDF
  scores={{
    bloc1: data.blocks[0]?.score ?? 0,
    bloc2: data.blocks[1]?.score ?? 0,
    bloc3: data.blocks[2]?.score ?? 0,
    bloc4: data.blocks[3]?.score ?? 0,
    bloc5: data.blocks[4]?.score ?? 0,
    bloc6: data.blocks[5]?.score ?? 0,
  }}
/>

        </View>

        <Text style={shared.sectionTitle}>Détail par compétence</Text>
        <View style={local.table}>
          <View style={local.tableHeader}>
            <Text style={[local.th, local.colName]}>Compétence</Text>
            <Text style={[local.th, local.colScore]}>Score /8</Text>
            <Text style={[local.th, local.colCorrect]}>Réussite</Text>
            <Text style={[local.th, local.colDontKnow]}>Ne sait pas</Text>
            <Text style={[local.th, local.colTime]}>Temps moy.</Text>
            <Text style={[local.th, local.colLevel]}>Niveau</Text>
          </View>
          {data.blocks.map((b, i) => (
            <View key={i} style={local.tableRow}>
              <Text style={[local.td, local.colName]}>{b.name}</Text>
              <Text style={[local.td, local.colScore]}>{(b.score * 8).toFixed(1)}</Text>
              <Text style={[local.td, local.colCorrect]}>{b.correctCount}/{b.totalCount}</Text>
              <Text style={[local.td, local.colDontKnow]}>{b.dontKnowCount}</Text>
              <Text style={[local.td, local.colTime]}>
                {b.avgTimeSec !== null ? `${b.avgTimeSec.toFixed(0)}s` : '—'}
              </Text>
              <Text style={[local.td, local.colLevel]}>{scoreToLabel(b.score)}</Text>
            </View>
          ))}
        </View>

        <Text style={local.pageNum}>{data.reference} · Page 2/3 · Document confidentiel</Text>
      </Page>

      {/* PAGE 3 — QUADRANT + RECOS */}
      <Page size="A4" style={shared.page}>
        <View style={shared.topBar}>
          <Image src={data.logoDataUri} style={{ height: 24 }} />
          <Text style={shared.topMeta}>
            {data.organizationName.toUpperCase()} · {dateStr.toUpperCase()}
          </Text>
        </View>

        <Text style={shared.sectionTitle}>Profil déclaratif</Text>
        {hasDeclarative ? (
          <>
            <View style={{ alignItems: 'center', marginVertical: 8 }}>
              <QuadrantPDF
                quadrant={data.quadrant as 1 | 2 | 3 | 4}
                scoreAdaptation={data.scoreAdaptation as number}
                scoreInteret={data.scoreInteret as number}
              />
            </View>
            <View style={local.interpBox}>
              <Text style={local.summaryText}>
                {buildProfileInterpretation({
                  quadrant: data.quadrant as 1 | 2 | 3 | 4,
                  scoreAdaptation: data.scoreAdaptation as number,
                  scoreInteret: data.scoreInteret as number,
                })}
              </Text>
            </View>
          </>
        ) : (
          <Text style={{ fontSize: 10, color: COLORS.muted, marginBottom: 12 }}>
            Profil déclaratif non renseigné pour ce participant.
          </Text>
        )}

        <Text style={shared.sectionTitle}>Recommandations pédagogiques</Text>
        <View style={{ marginTop: 6 }}>
          {recommendations.map((r, i) => (
            <View key={i} style={local.recoItem}>
              <Text style={local.recoBullet}>-</Text>
              <Text style={local.recoText}>{r}</Text>
            </View>
          ))}
        </View>

        <Text style={local.confidential}>
          Ce document est strictement confidentiel. Il est destiné au commanditaire du diagnostic
          et ne doit pas être diffusé sans l'accord du participant.
        </Text>

        <Text style={local.pageNum}>{data.reference} · Page 3/3 · Document confidentiel</Text>
      </Page>
    </Document>
  );
}

export default BilanClientPDF;
