import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#0f172a',
  },
  // Header
  header: {
    backgroundColor: '#2D3DB5',
    padding: 20,
    marginBottom: 30,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: '#FF6B35',
    color: '#ffffff',
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    borderRadius: 3,
  },
  headerRight: {
    color: '#ffffff',
    fontSize: 10,
    textAlign: 'right',
  },
  // Title
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 24,
  },
  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3DB5',
    marginBottom: 12,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B35',
  },
  // Level card
  levelCard: {
    backgroundColor: '#f1f5f9',
    padding: 20,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelBadge: {
    backgroundColor: '#2D3DB5',
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  levelDescription: {
    flex: 1,
    marginLeft: 20,
  },
  levelLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 4,
  },
  levelValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 12,
    color: '#475569',
  },
  // Info rows
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    width: 100,
    color: '#64748b',
    fontSize: 11,
  },
  infoValue: {
    flex: 1,
    color: '#0f172a',
    fontSize: 11,
    fontWeight: 'bold',
  },
  // Quadrant
  quadrantContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  quadrantGrid: {
    width: 200,
    height: 200,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quadrantCell: {
    width: '50%',
    height: '50%',
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quadrantCellActive: {
    backgroundColor: '#FF6B35',
  },
  quadrantText: {
    fontSize: 9,
    textAlign: 'center',
    color: '#475569',
  },
  quadrantTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  quadrantLegend: {
    flex: 1,
    marginLeft: 20,
    justifyContent: 'center',
  },
  // Recommendation
  recommendationBox: {
    backgroundColor: '#fff7ed',
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B35',
    padding: 14,
    borderRadius: 4,
  },
  recommendationText: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 1.5,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#94a3b8',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
});

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  A: 'Niveau débutant - Bases à consolider',
  B1: 'Niveau intermédiaire - Maîtrise partielle',
  B2: 'Niveau avancé - Bonne maîtrise',
  C: 'Niveau expert - Excellente maîtrise',
};

const RECOMMENDATIONS: Record<string, string> = {
  A: "Votre diagnostic révèle un besoin important de consolidation des fondamentaux. Une formation OHé adaptée vous permettra de gagner en aisance et confiance dans votre communication écrite professionnelle.",
  B1: "Vous disposez de bases solides mais certaines notions méritent d'être renforcées. Une formation OHé ciblée vous aidera à progresser efficacement vers une maîtrise complète.",
  B2: "Bonne maîtrise globale ! Quelques points spécifiques peuvent encore être améliorés. Une formation OHé vous permettra d'atteindre l'excellence et de viser le niveau C.",
  C: "Excellent niveau ! Vous maîtrisez très bien l'orthographe et la grammaire. Une formation OHé peut vous aider à perfectionner les derniers points subtils.",
};

const QUADRANT_LABELS: Record<number, { title: string; desc: string }> = {
  1: { title: 'Intérêt fort + Pertinence forte', desc: 'Profil très favorable à la formation' },
  2: { title: 'Intérêt fort + Pertinence faible', desc: 'Motivé mais peu de besoin identifié' },
  3: { title: 'Intérêt faible + Pertinence forte', desc: 'Besoin identifié mais à motiver' },
  4: { title: 'Intérêt faible + Pertinence faible', desc: 'Profil peu favorable à la formation' },
};

export interface BilanData {
  firstName: string;
  lastName: string;
  email: string;
  organizationName: string;
  completedAt: Date;
  level: 'A' | 'B1' | 'B2' | 'C';
  scoreProcedural: number;
  totalQuestions: number;
  quadrant: 1 | 2 | 3 | 4;
}

export default function BilanPDF({ data }: { data: BilanData }) {
  const dateStr = new Date(data.completedAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>OHé</Text>
            <Text style={styles.badge}>DIAG</Text>
          </View>
          <View>
            <Text style={styles.headerRight}>{data.organizationName}</Text>
            <Text style={styles.headerRight}>{dateStr}</Text>
          </View>
        </View>

        <Text style={styles.title}>Bilan de diagnostic</Text>
        <Text style={styles.subtitle}>
          Évaluation des compétences en orthographe et français
        </Text>

        {/* Identité */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identité</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nom :</Text>
            <Text style={styles.infoValue}>{data.firstName} {data.lastName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email :</Text>
            <Text style={styles.infoValue}>{data.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Organisation :</Text>
            <Text style={styles.infoValue}>{data.organizationName}</Text>
          </View>
        </View>

        {/* Niveau global */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Niveau global</Text>
          <View style={styles.levelCard}>
            <Text style={styles.levelBadge}>{data.level}</Text>
            <View style={styles.levelDescription}>
              <Text style={styles.levelLabel}>Niveau CEFR</Text>
              <Text style={styles.levelValue}>{LEVEL_DESCRIPTIONS[data.level]}</Text>
              <Text style={styles.scoreText}>
                Score : {data.scoreProcedural} / {data.totalQuestions} bonnes réponses
              </Text>
            </View>
          </View>
        </View>

        {/* Profil déclaratif */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profil déclaratif</Text>
          <View style={styles.quadrantContainer}>
            <View style={styles.quadrantGrid}>
              {[1, 2, 3, 4].map((q) => (
                <View
                  key={q}
                  style={[
                    styles.quadrantCell,
                    data.quadrant === q ? styles.quadrantCellActive : {},
                  ]}
                >
                  <Text
                    style={[
                      styles.quadrantText,
                      data.quadrant === q ? styles.quadrantTextActive : {},
                    ]}
                  >
                    Q{q}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.quadrantLegend}>
              <Text style={[styles.levelLabel, { marginBottom: 8 }]}>
                Position dans la matrice
              </Text>
              <Text style={[styles.levelValue, { fontSize: 12 }]}>
                {QUADRANT_LABELS[data.quadrant].title}
              </Text>
              <Text style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>
                {QUADRANT_LABELS[data.quadrant].desc}
              </Text>
            </View>
          </View>
        </View>

        {/* Recommandation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommandation</Text>
          <View style={styles.recommendationBox}>
            <Text style={styles.recommendationText}>
              {RECOMMENDATIONS[data.level]}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Diagnostic OHé Diag · réalisé le {dateStr} · Document confidentiel
        </Text>
      </Page>
    </Document>
  );
}
