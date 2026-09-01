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
  /** Étiquette en majuscules affichée au-dessus du titre (optionnelle) */
  eyebrow?: string;
  /** Sous-titre affiché entre le titre et le corps, ex: "L'exercice change." */
  subtitle?: string;
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
  /** Note en très petit sous l'encadré d'exemple (optionnelle, précédée d'un *) */
  footnote?: string;
  /** Libellé du bouton (par défaut "Continuer") */
  ctaLabel?: string;
}

export const INTERSTITIALS: Record<number, InterstitialConfig | null> = {
  1: null,
  2: null,
  3: null,

  4: {
    eyebrow: 'NOUVELLE SECTION',
    title: 'Orthographe lexicale',
    subtitle: "L'exercice change.",
    body: [
      "Vous allez découvrir des mots qui n'existent pas. Vous devrez alors choisir celui qui ressemble le plus à un mot français. Suivez votre intuition.",
    ],
    example: {
      label: 'Exemple',
      items: [
        { text: 'Soppra', highlight: 'correct', caption: 'ressemble à un mot français' },
        { text: 'Ssopra', highlight: 'wrong', caption: 'peu probable en français (le double « s » en début de mot est inhabituel)' },
        { text: 'Sopraa', highlight: 'wrong', caption: 'peu probable en français (le double « a » en fin de mot est inhabituel)' },
      ],
    },
    footnote:
      "Les mots sont fictifs pour limiter le recours à la mémoire lexicale et évaluer la sensibilité aux régularités orthographiques du français. Le participant doit ainsi mobiliser ses connaissances orthographiques implicites pour juger de la plausibilité des formes proposées.",
    ctaLabel: 'Je suis prêt(e), continuer',
  },

  5: {
    eyebrow: 'NOUVELLE SECTION',
    title: 'Syntaxe',
    subtitle: "L'exercice change.",
    body: [
      "Vous allez découvrir plusieurs phrases. Vous devrez alors choisir celle qui est la mieux construite.",
    ],
       example: {
  label: 'Exemple',
  items: [
    { text: "Karim est la personne à qui je pense.", highlight: 'correct', caption: 'construction correcte' },
    { text: "Sophie est la personne que je pense.", highlight: 'wrong', caption: 'construction incorrecte' },
    { text: "Karim est la personne dont je pense.", highlight: 'wrong', caption: 'construction incorrecte' },
  ],
},


    ctaLabel: 'Je suis prêt(e), continuer',
  },

  6: {
    eyebrow: 'NOUVELLE SECTION',
    title: 'Compréhension',
    subtitle: "L'exercice change.",
    body: [
      "Vous allez lire un court texte. Vous devrez alors répondre à une question sur son contenu.",
    ],
    ctaLabel: 'Je suis prêt(e), continuer',
  },

  7: {
    eyebrow: 'DERNIÈRE SECTION',
    title: 'Quelques questions sur vous',
    body: [
      "Cette dernière section ne teste pas vos connaissances.",
      "Il n'y a ni bonne ni mauvaise réponse.",
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
