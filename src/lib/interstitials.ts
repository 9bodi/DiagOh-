/**
 * Config des écrans d'explication qui s'affichent AVANT un bloc de questions.
 * Clé = blockNumber. Valeur = contenu à afficher, ou null si pas d'interstitiel.
 *
 * Pour ajouter un interstitiel avant un nouveau bloc, il suffit d'ajouter
 * une entrée ici — aucune autre modification de code n'est nécessaire.
 */

export interface InterstitialConfig {
  /** Titre principal, affiché en gros */
  title: string;
  /** Étiquette orange en haut (optionnelle) */
  eyebrow?: string;
  /** Paragraphes explicatifs (chaque string = un <p>) */
  body: string[];
  /** Exemple illustré (optionnel) */
  example?: {
    label: string;
    items: {
      text: string;
      highlight?: 'correct' | 'wrong' | 'neutral';
      caption?: string;
    }[];
  };
  /** Libellé du bouton (par défaut "Continuer") */
  ctaLabel?: string;
}

export const INTERSTITIALS: Record<number, InterstitialConfig | null> = {
  1: null,
  2: null,
  3: null,

  4: {
    eyebrow: '✱ Nouvelle section',
    title: 'Orthographe lexicale',
    body: [
      "Les mots que vous allez voir n'existent pas dans le dictionnaire français. Ils sont inventés pour ce diagnostic.",
      "Votre tâche : identifier, parmi les propositions, celle dont l'écriture respecte les règles de l'orthographe française (accents, doubles consonnes, terminaisons plausibles).",
      "Prenez votre temps pour lire — chaque question est chronométrée séparément.",
    ],
    example: {
      label: 'Exemple',
      items: [
        { text: 'lettri', highlight: 'correct', caption: 'écriture plausible en français' },
        { text: 'llitri', highlight: 'wrong', caption: 'double « ll » en début de mot : impossible' },
        { text: 'litrii', highlight: 'wrong', caption: 'double « i » final : impossible' },
      ],
    },
    ctaLabel: 'Je suis prêt(e), continuer',
  },

  5: null, // TODO OHé : texte pour bloc Syntaxe
  6: null, // TODO OHé : texte pour bloc Compréhension
  7: null, // TODO OHé : texte pour bloc Questionnaire déclaratif
};

/**
 * Retourne l'interstitiel à afficher pour un bloc donné, ou null.
 */
export function getInterstitialForBlock(blockNumber: number | null | undefined): InterstitialConfig | null {
  if (blockNumber == null) return null;
  return INTERSTITIALS[blockNumber] ?? null;
}
