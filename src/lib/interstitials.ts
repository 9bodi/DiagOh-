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

  5: {
    eyebrow: '✱ Nouvelle section',
    title: 'Syntaxe',
    body: [
      "Les phrases que vous allez voir portent sur l'ordre des mots et la construction grammaticale.",
      "Votre tâche : identifier, parmi les propositions, celle dont la construction respecte les règles de la syntaxe française (accords, ponctuation, structure).",
      "Prenez votre temps pour lire — chaque question est chronométrée séparément.",
    ],
    example: {
      label: 'Exemple',
      items: [
        { text: "L'homme à qui je pense est parti.", highlight: 'correct', caption: 'construction correcte' },
        { text: "L'homme que je pense est parti.", highlight: 'wrong', caption: 'pronom relatif incorrect' },
        { text: "L'homme dont je pense est parti.", highlight: 'wrong', caption: 'pronom relatif inadapté' },
      ],
    },
    ctaLabel: 'Je suis prêt(e), continuer',
  },

  6: {
    eyebrow: '✱ Nouvelle section',
    title: 'Compréhension écrite',
    body: [
      "Les textes que vous allez lire sont extraits de situations professionnelles courantes.",
      "Votre tâche : identifier, parmi les propositions, celle qui correspond au sens du texte (information explicite, sens implicite ou reformulation).",
      "Prenez votre temps pour lire le texte et la question — chaque question est chronométrée séparément.",
    ],
    example: {
      label: 'Exemple',
      items: [
        { text: 'Le rendez-vous est reporté à demain.', highlight: 'correct', caption: 'reformulation fidèle' },
        { text: 'Le rendez-vous est annulé.', highlight: 'wrong', caption: 'sens différent' },
        { text: 'Le rendez-vous a eu lieu hier.', highlight: 'wrong', caption: 'temporalité incorrecte' },
      ],
    },
    ctaLabel: 'Je suis prêt(e), continuer',
  },

  7: {
    eyebrow: '✱ Dernière section',
    title: 'Questionnaire personnel',
    body: [
      "Cette dernière section n'évalue plus vos connaissances mais votre rapport à l'écrit.",
      "Votre tâche : répondre spontanément, selon ce qui vous correspond le mieux. Il n'y a ni bonne ni mauvaise réponse.",
      "Prenez votre temps pour lire — chaque question est chronométrée séparément.",
    ],
    ctaLabel: 'Je suis prêt(e), continuer',
  },
};

/**
 * Retourne l'interstitiel à afficher pour un bloc donné, ou null.
 */
export function getInterstitialForBlock(blockNumber: number | null | undefined): InterstitialConfig | null {
  if (blockNumber == null) return null;
  return INTERSTITIALS[blockNumber] ?? null;
}
