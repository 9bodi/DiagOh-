import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

import { COLORS, styles, LEVEL_META, CEFR_SCALE, scoreToLabel, scoreToColor } from './shared/theme';
import RadarPDF from './shared/RadarPDF';
import { buildParticipantRecommendation } from './shared/templates';


export interface BilanBlock {
  key: 'bloc1' | 'bloc2' | 'bloc3' | 'bloc4' | 'bloc5' | 'bloc6';
  label: string;
  score: number;
  correctCount: number;
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
  quadrant: 1 | 2 | 3 | 4 | null;
  scoreAdaptation: number | null;
  scoreInteret: number | null;
  reference?: string;
  logoDataUri: string; 
}

const local = StyleSheet.create({
  levelRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  levelBox: {
    width: 90,
    paddingVertical: 22,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
  },
  levelLetter: { fontSize: 44, fontFamily: 'Times-Italic', color: COLORS.white },
  levelMeta: { flex: 1, justifyContent: 'center' },
  levelName: { fontSize: 16, fontFamily: 'Times-Italic', color: COLORS.ink, marginBottom: 4 },
  levelTag: { fontSize: 9, color: COLORS.muted, marginBottom: 8 },
  scoreLine: { fontSize: 9, color: COLORS.muted },
  scoreVal: { fontFamily: 'Helvetica-Bold', color: COLORS.ink },
  scale: { flexDirection: 'row', gap: 3, marginBottom: 20 },
  scaleCell: { flex: 1, padding: 8, borderRadius: 6, alignItems: 'center' },
  scaleActive: { backgroundColor: COLORS.accent },
  scaleInactive: { backgroundColor: COLORS.panelTint },
  scaleLetter: { fontSize: 11, fontFamily: 'Helvetica-Bold' },
  scaleRange: { fontSize: 7, letterSpacing: 0.5, marginTop: 2 },
  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lineSoft,
  },
  blockNum: { width: 22, fontSize: 8, color: COLORS.muted, fontFamily: 'Times-Italic' },
  blockLabel: { flex: 1, fontSize: 10, color: COLORS.ink },
  blockQual: { width: 110, fontSize: 9, textAlign: 'right', fontFamily: 'Helvetica-Bold' },
  recoBox: {
  backgroundColor: COLORS.panelTint,
  borderLeftWidth: 3,
  borderLeftColor: COLORS.accent,
  padding: 14,
  borderRadius: 8,
  marginTop: 12,
},

  recoText: { fontSize: 10, color: COLORS.ink, lineHeight: 1.5 },
  signature: {
    marginTop: 8,
    fontSize: 9,
    fontFamily: 'Times-Italic',
    color: COLORS.muted,
  },
  radarWrap: { alignItems: 'center', marginBottom: 12 },
});

export default function BilanParticipantPDF({ data }: { data: BilanData }) {
  const dateStr = new Date(data.completedAt).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const percent = Math.round((data.correctTotal / 48) * 100);
  const levelInfo = LEVEL_META[data.level];
  const weakBlocks = data.blocks.filter((b) => b.score < 0.5).map((b) => b.label);
  const recommendation = buildParticipantRecommendation(data.level, weakBlocks);
  const fullName = `${data.firstName} ${data.lastName}`.trim() || 'Participant·e';
  const d = new Date(data.completedAt);
  const ref = data.reference ?? `OHE-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  

  const radarScores = data.blocks.reduce(
    (acc, b) => ({ ...acc, [b.key]: b.score }),
    { bloc1: 0, bloc2: 0, bloc3: 0, bloc4: 0, bloc5: 0, bloc6: 0 },
  );

  return (
    <Document>
      {/* ================= PAGE 1 ================= */}
      <Page size="A4" style={styles.page}>
       <View style={styles.topBar}>
  <Image src={data.logoDataUri} style={{ height: 24 }} />
  <Text style={styles.topMeta}>
    {data.organizationName.toUpperCase()} · {dateStr.toUpperCase()}
  </Text>
</View>



        <Text style={styles.eyebrow}> BILAN DU DIAGNOSTIC</Text>
        <Text style={styles.heroTitle}>
          Bravo {data.firstName || fullName}, voici votre résultat.
        </Text>
        <Text style={styles.heroSubtitle}>Bilan édité le {dateStr}</Text>

        {/* Niveau */}
        <View style={local.levelRow}>
          <View style={local.levelBox}>
            <Text style={local.levelLetter}>{data.level}</Text>
          </View>
          <View style={local.levelMeta}>
            <Text style={styles.eyebrowMuted}>NIVEAU CECRL</Text>
            <Text style={local.levelName}>{levelInfo.name}</Text>
            <Text style={local.levelTag}>{levelInfo.tagline}</Text>
            <Text style={local.scoreLine}>
              Bonnes réponses :{' '}
              <Text style={local.scoreVal}>{data.correctTotal} / 48 ({percent} %)</Text>
            </Text>
            <Text style={[local.scoreLine, { marginTop: 2 }]}>
              Score procédural :{' '}
              <Text style={local.scoreVal}>
                {data.scoreProcedural.toFixed(2).replace('.', ',')} / 6
              </Text>
            </Text>
          </View>
        </View>

        {/* Échelle CECRL */}
        <View style={local.scale}>
          {CEFR_SCALE.map((s) => {
            const active = s.letter === data.level;
            return (
              <View key={s.letter} style={[local.scaleCell, active ? local.scaleActive : local.scaleInactive]}>
                <Text style={[local.scaleLetter, { color: active ? COLORS.white : COLORS.ink }]}>
                  {s.letter}
                </Text>
                <Text style={[local.scaleRange, { color: active ? COLORS.white : COLORS.muted }]}>
                  {s.range}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Détail par bloc */}
        <Text style={styles.eyebrow}> DÉTAIL PAR COMPÉTENCE</Text>
        {data.blocks.map((b, i) => (
          <View key={b.key} style={local.blockRow}>
            <Text style={local.blockNum}>{String(i + 1).padStart(2, '0')}</Text>
            <Text style={local.blockLabel}>{b.label}</Text>
            <Text style={[local.blockQual, { color: scoreToColor(b.score) }]}>
              {scoreToLabel(b.score)}
            </Text>
          </View>
        ))}

        <View style={styles.footer} fixed>
          <Text>OHÉ DIAG · DOCUMENT PERSONNEL · RÉF {ref}</Text>
          <Text render={({ pageNumber, totalPages }) => `P. ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>

      {/* ================= PAGE 2 ================= */}
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar}>
  <Image src={data.logoDataUri} style={{ height: 24 }} />
  <Text style={styles.topMeta}>
    {data.organizationName.toUpperCase()} · {dateStr.toUpperCase()}
  </Text>
</View>



        <Text style={styles.eyebrow}> VOS COMPÉTENCES</Text>
        <Text style={styles.sectionTitle}>Cartographie procédurale</Text>
        <View style={local.radarWrap}>
          <RadarPDF scores={radarScores} size={320} />
        </View>

        

        <View style={local.recoBox}>
          <Text style={styles.eyebrow}> RECOMMANDATION</Text>
          <Text style={local.recoText}>{recommendation}</Text>
          <Text style={local.signature}>— Roxane Joannidès, Docteure en sciences du langage</Text>
        </View>

        <View style={styles.footer} fixed>
          <Text>OHÉ DIAG · DOCUMENT PERSONNEL · RÉF {ref}</Text>
          <Text render={({ pageNumber, totalPages }) => `P. ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
