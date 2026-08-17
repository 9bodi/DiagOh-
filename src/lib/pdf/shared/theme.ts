import { StyleSheet } from '@react-pdf/renderer';

export const COLORS = {
  bg: '#F4F6FB',
  panelTint: '#EEF2FA',
  ink: '#15171C',
  muted: '#6A6E78',
  accent: '#1E3A8A',
  accentSoft: '#DBE3F5',
  line: '#DFE3EC',
  lineSoft: '#EDEFF4',
  white: '#FFFFFF',
  red: '#DC2626',
  redSoft: '#FEE2E2',
} as const;

export const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.white,
    padding: 48,
    paddingBottom: 64,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: COLORS.ink,
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.line,
    marginBottom: 28,
  },
  logoText: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: COLORS.ink, letterSpacing: 0.3 },
  topMeta: { fontSize: 8, color: COLORS.muted, letterSpacing: 1.2 },

  eyebrow: {
    fontSize: 8,
    color: COLORS.accent,
    letterSpacing: 1.8,
    marginBottom: 10,
    fontFamily: 'Helvetica-Bold',
  },
  eyebrowMuted: {
    fontSize: 8,
    color: COLORS.muted,
    letterSpacing: 1.8,
    marginBottom: 10,
    fontFamily: 'Helvetica-Bold',
  },

  heroTitle: {
    fontSize: 26,
    fontFamily: 'Times-Italic',
    color: COLORS.ink,
    marginBottom: 6,
    lineHeight: 1.15,
  },
  heroSubtitle: { fontSize: 10, color: COLORS.muted, marginBottom: 24, letterSpacing: 0.4 },

  card: {
    borderWidth: 0.5,
    borderColor: COLORS.line,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  cardTinted: {
    backgroundColor: COLORS.panelTint,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Times-Italic',
    color: COLORS.ink,
    marginBottom: 14,
    marginTop: 8,
  },

  footer: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: COLORS.muted,
    letterSpacing: 0.8,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.line,
  },
});

export const LEVEL_META: Record<'A' | 'B1' | 'B2' | 'C', { name: string; tagline: string }> = {
  A:  { name: 'Élémentaire',   tagline: 'Des bases à consolider.' },
  B1: { name: 'Intermédiaire', tagline: 'Une base en construction.' },
  B2: { name: 'Avancé',        tagline: 'Une maîtrise solide.' },
  C:  { name: 'Expert',        tagline: 'Une excellente maîtrise.' },
};

export const CEFR_SCALE = [
  { letter: 'A',  range: '0 – 37 %' },
  { letter: 'B1', range: '37 – 60 %' },
  { letter: 'B2', range: '60 – 80 %' },
  { letter: 'C',  range: '80 – 100 %' },
];

export function scoreToLabel(score: number): string {
  if (score >= 1) return 'Maîtrisé';
  if (score >= 0.75) return 'Fonctionnel';
  if (score >= 0.5) return 'Fragile';
  return 'Non maîtrisé';
}

export function scoreToColor(score: number): string {
  if (score >= 0.75) return COLORS.accent;
  if (score >= 0.5) return COLORS.muted;
  return COLORS.red;
}
