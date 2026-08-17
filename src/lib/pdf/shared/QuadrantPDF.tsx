import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { COLORS } from './theme';

interface QuadrantPDFProps {
  quadrant: 1 | 2 | 3 | 4;
  scoreAdaptation: number;
  scoreInteret: number;
}

const QUADRANTS = {
  1: { label: 'Engagé·e et adaptable', tagline: 'Fort intérêt, forte adaptation' },
  2: { label: 'Motivé·e à outiller', tagline: 'Fort intérêt, adaptation à renforcer' },
  3: { label: 'À sensibiliser', tagline: 'Intérêt à développer, adaptation à renforcer' },
  4: { label: 'Autonome à mobiliser', tagline: 'Intérêt à développer, forte adaptation' },
} as const;

const s = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: 20, alignItems: 'center' },
  matrix: { width: 220, height: 220, flexDirection: 'column' },
  row: { flexDirection: 'row', flex: 1, gap: 4, marginBottom: 4 },
  cell: {
    flex: 1,
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellActive: { backgroundColor: COLORS.accent },
  cellInactive: { backgroundColor: COLORS.panelTint, borderWidth: 0.5, borderColor: COLORS.line },
  cellId: { fontSize: 8, letterSpacing: 1, marginBottom: 4, fontFamily: 'Helvetica-Bold' },
  cellLabel: { fontSize: 8, textAlign: 'center', lineHeight: 1.3 },

  side: { flex: 1, justifyContent: 'center', paddingLeft: 4 },
  sideLabel: { fontSize: 7, color: COLORS.muted, letterSpacing: 1.2, marginBottom: 6 },
  sideName: { fontSize: 15, fontFamily: 'Times-Italic', color: COLORS.ink, marginBottom: 6, lineHeight: 1.2 },
  sideTag: { fontSize: 9, color: COLORS.muted, marginBottom: 14, lineHeight: 1.3 },

  scores: { flexDirection: 'row', gap: 24, marginTop: 4 },
  scoreBlock: { flexDirection: 'column' },
  scoreLabel: { fontSize: 7, color: COLORS.muted, letterSpacing: 1, marginBottom: 3 },
  scoreVal: { fontSize: 13, color: COLORS.ink, fontFamily: 'Helvetica-Bold' },
});


export default function QuadrantPDF({ quadrant, scoreAdaptation, scoreInteret }: QuadrantPDFProps) {
  const cells = [[2, 1], [3, 4]] as const;
  const current = QUADRANTS[quadrant];

  return (
    <View style={s.wrap}>
      <View style={s.matrix}>
        {cells.map((row, ri) => (
          <View key={ri} style={s.row}>
            {row.map((id) => {
              const isActive = id === quadrant;
              return (
                <View key={id} style={[s.cell, isActive ? s.cellActive : s.cellInactive]}>
                  <Text style={[s.cellId, { color: isActive ? COLORS.white : COLORS.muted }]}>
                    Q{id}
                  </Text>
                  <Text style={[s.cellLabel, { color: isActive ? COLORS.white : COLORS.ink }]}>
                    {QUADRANTS[id].label}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
      <View style={s.side}>
        <Text style={s.sideLabel}>VOTRE PROFIL</Text>
        <Text style={s.sideName}>{current.label}</Text>
        <Text style={s.sideTag}>{current.tagline}</Text>
        <View style={s.scores}>
          <View>
            <Text style={s.scoreLabel}>ADAPTATION</Text>
            <Text style={s.scoreVal}>{scoreAdaptation}/5</Text>
          </View>
          <View>
            <Text style={s.scoreLabel}>INTÉRÊT</Text>
            <Text style={s.scoreVal}>{scoreInteret}/5</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
