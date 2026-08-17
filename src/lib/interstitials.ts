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

  // À valider OHé (wording provisoire)
  5: {
    eyebrow: '✱ Nouvelle section',
    title: 'Syntaxe',
    body: [
      "Vous allez travailler sur la structure des phrases : ordre des mots, ponctuation, construction grammaticale.",
      "Pour chaque question, choisissez la formulation qui respecte au mieux les règles de la syntaxe française.",
      "Certaines phrases peuvent sembler correctes à l'oreille sans l'être à l'écrit — lisez attentivement.",
    ],
    ctaLabel: 'Je suis prêt(e), continuer',
  },

  // À valider OHé (wording provisoire)
  6: {
    eyebrow: '✱ Nouvelle section',
    title: 'Compréhension écrite',
    body: [
      "Vous allez lire un court texte, puis répondre à plusieurs questions qui portent sur ce texte.",
      "Le texte reste affiché pendant que vous répondez — vous pouvez y revenir à tout moment.",
      "L'objectif : vérifier votre capacité à extraire l'information essentielle et à en saisir les nuances.",
    ],
    ctaLabel: 'Je suis prêt(e), continuer',
  },

  // À valider OHé (wording provisoire)
  7: {
    eyebrow: '✱ Dernière étape',
    title: "Votre rapport à l'écrit",
    body: [
      "Vous avez terminé les exercices d'orthographe. Bravo pour votre concentration.",
      "Les questions qui suivent sont différentes : il n'y a ni bonne ni mauvaise réponse. On vous demande simplement de vous positionner sur votre rapport à l'écrit et à la formation.",
      "Répondez spontanément — c'est votre ressenti qui compte.",
    ],
    ctaLabel: 'Continuer',
  },
};

/**
 * Retourne l'interstitiel à afficher pour un bloc donné, ou null.
 */
export function getInterstitialForBlock(blockNumber: number | null | undefined): InterstitialConfig | null {
  if (blockNumber == null) return null;
  return INTERSTITIALS[blockNumber] ?? null;
}
