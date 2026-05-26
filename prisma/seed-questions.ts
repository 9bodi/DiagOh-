import { PrismaClient, QuestionType, QuestionCategory, DeclarativeAxis } from '@prisma/client';

const prisma = new PrismaClient();

// ============ Métadonnées par bloc ============
// instruction = consigne par défaut affichée au-dessus de la question
// subCategory = étiquette orange affichée tout en haut
const META = {
  bloc1: { subCategory: 'Orthographe grammaticale', instruction: 'Choisissez la bonne orthographe.' },
  bloc2: { subCategory: 'Conjugaison',              instruction: 'Choisissez la forme verbale correcte.' },
  bloc3: { subCategory: 'Participe passé',          instruction: 'Choisissez le participe passé correctement accordé.' },
  bloc4: { subCategory: 'Orthographe lexicale',     instruction: 'Parmi ces mots inventés, quelle écriture vous semble correcte ?' },
  bloc5: { subCategory: 'Syntaxe',                  instruction: 'Quelle phrase est correctement construite ?' },
  bloc6: { subCategory: 'Compréhension',            instruction: 'Lisez le texte ci-dessus, puis répondez à la question.' },
  bloc7: { subCategory: 'Questionnaire',            instruction: 'Que pensez-vous de cette affirmation ?' },
};

// ============ BLOC 1 — Singulier/Pluriel (10s) ============
const bloc1 = [
  { q: 'Les charges ___ sont colossales.', opts: ['patronal', 'patronale', 'patronals', 'patronales', 'je ne sais pas trop'], correct: 3 },
  { q: 'Les élections ___ approchent.', opts: ['municipal', 'municipale', 'municipals', 'municipales', 'je ne sais pas trop'], correct: 3 },
  { q: 'Je respecte les décisions ___.', opts: ['présidentiel', 'présidentielle', 'présidentiels', 'présidentielles', 'je ne sais pas trop'], correct: 3 },
  { q: 'Tout le monde était ___.', opts: ['fier', 'fiers', 'fières', 'je ne sais pas trop'], correct: 0 },
  { q: 'Tout le monde ___ là.', opts: ['semble', 'semblent', 'sembles', 'je ne sais pas trop'], correct: 0 },
  { q: "L'équipe ___ après le match.", opts: ['crie', 'cris', 'crient', 'je ne sais pas trop'], correct: 0 },
  { q: 'Chacun des participants ___ son prénom.', opts: ['crie', 'cris', 'crient', 'je ne sais pas trop'], correct: 0 },
  { q: 'On ___.', opts: ['part', 'parts', 'parent', 'je ne sais pas trop'], correct: 0 },
];

// ============ BLOC 2 — Conjugaison (10s) ============
const bloc2 = [
  { q: 'Je ___ tous les dimanches à la messe.', opts: ['prie', 'prit', 'pris', 'je ne sais pas trop'], correct: 0 },
  { q: "Je ___ le dossier et m'en allai.", opts: ['prie', 'prit', 'pris', 'je ne sais pas trop'], correct: 2 },
  { q: 'Alec a ___ une bonne décision.', opts: ['prie', 'prit', 'pris', 'je ne sais pas trop'], correct: 2 },
  { q: "C'est toi qui ___ le dossier.", opts: ['fini', 'finit', 'finis', 'je ne sais pas trop'], correct: 2 },
  { q: 'Le stagiaire vous ___ le rapport avant ce soir.', opts: ['fini', 'finit', 'finis', 'je ne sais pas trop'], correct: 1 },
  { q: 'Il a hélas ___ en retard.', opts: ['fini', 'finit', 'finis', 'je ne sais pas trop'], correct: 0 },
  { q: "Je ___ le dossier d'abord.", opts: ['constitue', 'constitut', 'constitus', 'je ne sais pas trop'], correct: 0 },
  { q: "J'___ les courriels tout de suite.", opts: ['envoie', 'envoi', 'envois', 'je ne sais pas trop'], correct: 0 },
];

// ============ BLOC 3 — Participe passé (10s) ============
const bloc3 = [
  { q: 'Les responsables ont ___ la feuille sans mon accord.', opts: ['signé', 'signer', 'signée', 'signés', 'je ne sais pas trop'], correct: 0 },
  { q: 'Il est venu après avoir ___ la poubelle.', opts: ['vidé', 'vider', 'vidée', 'vidés', 'je ne sais pas trop'], correct: 0 },
  { q: 'Cet homme nous a ___ tous les papiers.', opts: ['volé', 'voler', 'volée', 'volés', 'je ne sais pas trop'], correct: 0 },
  { q: 'Elle a bien ___ la chemise.', opts: ['rangé', 'ranger', 'rangée', 'rangés', 'je ne sais pas trop'], correct: 0 },
  { q: "Voici le dossier qu'ils ont ___.", opts: ['dérobé', 'dérober', 'dérobée', 'dérobés', 'je ne sais pas trop'], correct: 0 },
  { q: "Les dossiers qu'il a ___ sont prêts.", opts: ['signé', 'signer', 'signée', 'signés', 'je ne sais pas trop'], correct: 3 },
  { q: "Je vérifie les lettres qu'ils ont ___.", opts: ['envoyé', 'envoyer', 'envoyées', 'envoyés', 'je ne sais pas trop'], correct: 2 },
  { q: "Donne-moi les rapports qu'ils ont ___.", opts: ['écris', 'écrit', 'écrits', 'écrient', 'je ne sais pas trop'], correct: 2 },
];

// ============ BLOC 4 — Orthographe mots inventés (15s) ============
// La consigne est portée par META.bloc4 ; pas de phrase à compléter ici, juste des options.
const bloc4 = [
  { q: '', opts: ['littri', 'llitri', 'litrii', 'je ne sais pas trop'], correct: 0 },
  { q: '', opts: ['trillsé', 'trrilé', 'trillé', 'je ne sais pas trop'], correct: 2 },
  { q: '', opts: ['beaurris', 'bôrris', 'borris', 'je ne sais pas trop'], correct: 2 },
  { q: '', opts: ['eaulage', 'foaulage', 'folageau', 'je ne sais pas trop'], correct: 2 },
  { q: '', opts: ['andamne', 'andemn', 'andàmne', 'je ne sais pas trop'], correct: 0 },
  { q: '', opts: ['lahhure', 'lavvure', 'larruve', 'je ne sais pas trop'], correct: 2 },
  { q: '', opts: ['deçinor', 'deçénor', 'deçanor', 'je ne sais pas trop'], correct: 2 },
  { q: '', opts: ['guaine', 'gaine', 'geaine', 'je ne sais pas trop'], correct: 1 },
];

// ============ BLOC 5 — Syntaxe (15s) ============
// La consigne est portée par META.bloc5 ; pas de phrase à compléter ici.
const bloc5 = [
  { q: '', opts: [
    'Le client nous a contactés et nous lui avons répondu.',
    "Le client nous a contactés et nous l'avons répondu.",
    'Le client nous a contactés et nous y avons répondu.',
    'Je ne sais pas trop'
  ], correct: 0 },
  { q: '', opts: [
    "C'est une décision que nous nous félicitons.",
    "C'est une décision dont nous nous félicitons.",
    "C'est une décision de laquelle nous nous félicitons.",
    'Je ne sais pas trop'
  ], correct: 1 },
  { q: '', opts: [
    "C'est un projet duquel je suis fier.",
    "C'est un projet que je suis fier.",
    "C'est un projet dont je suis fier.",
    'Je ne sais pas trop'
  ], correct: 2 },
  { q: '', opts: [
    "C'est un rapport que nous avons contribué.",
    "C'est un rapport à quoi nous avons contribué.",
    "C'est un rapport auquel nous avons contribué.",
    'Je ne sais pas trop'
  ], correct: 2 },
  { q: '', opts: [
    'Il a décidé à changer.',
    "Il s'est décidé à changer.",
    "Il s'est décidé de changer.",
    'Je ne sais pas trop'
  ], correct: 1 },
  { q: '', opts: [
    'Nous devons pallier à ce problème.',
    'Nous devons pallier ce problème.',
    'Nous devons pallier avec ce problème.',
    'Je ne sais pas trop'
  ], correct: 1 },
  { q: '', opts: [
    'Je me rappelle de cette réunion importante.',
    'Je me rappelle cette réunion importante.',
    'Je me rappelle à cette réunion importante.',
    'Je ne sais pas trop'
  ], correct: 1 },
  { q: '', opts: [
    'Malgré son retard, il a pris finalement le train.',
    'Malgré son retard, il a finalement pris le train.',
    'Malgré son retard, finalement il a pris le train.',
    'Je ne sais pas trop'
  ], correct: 1 },
];

// ============ BLOC 6 — Compréhension (25s) ============
// La consigne générique est dans META.bloc6 ; questionText reste la question spécifique.
const bloc6 = [
  {
    source: 'Les commandes passées avant 16 h sont expédiées le jour même. Après 16 h, elles sont traitées le lendemain ouvré.',
    q: 'Une commande passée à 17 h un jeudi sera donc expédiée :',
    opts: ['Le jeudi', 'Le vendredi', 'Le lundi', 'Je ne sais pas trop'],
    correct: 1
  },
  {
    source: 'Julie est arrivée à la gare à 8 h 05. Son train partait à 8 h 00.',
    q: 'On peut en déduire que Julie :',
    opts: ['A probablement raté son train', 'Est montée dans son train', 'Est arrivée en avance', 'Je ne sais pas trop'],
    correct: 0
  },
  {
    source: "Depuis plusieurs mois, l'entreprise investit dans de nouveaux outils numériques, afin de faciliter le travail à distance et d'améliorer la collaboration entre équipes.",
    q: "L'idée principale est :",
    opts: ["L'entreprise déménage", "L'entreprise modernise ses méthodes de travail", 'Les outils numériques coûtent cher', 'Je ne sais pas trop'],
    correct: 1
  },
  {
    source: "Le candidat n'a pas répondu à toutes les questions.",
    q: 'Quelle phrase exprime la même idée ?',
    opts: ['Le candidat a répondu à certaines questions seulement', "Le candidat n'a répondu à aucune question", 'Le candidat a répondu à toutes les questions', 'Je ne sais pas trop'],
    correct: 0
  },
  {
    source: 'Karim travaille à temps partiel depuis janvier, mais il est présent au bureau tous les matins.',
    q: 'Quelle affirmation est fausse ?',
    opts: ['Karim travaille depuis janvier', 'Karim est présent chaque matin', 'Karim travaille à temps plein', 'Je ne sais pas trop'],
    correct: 2
  },
  {
    source: 'Sophie a envoyé son dossier lundi. Elle a reçu une réponse mercredi puis signé son contrat vendredi.',
    q: "Que s'est-il passé en deuxième ?",
    opts: ["L'envoi du dossier", 'La signature du contrat', 'La réception de la réponse', 'Je ne sais pas trop'],
    correct: 2
  },
  {
    source: "L'accès à la plateforme est réservé aux utilisateurs ayant créé un compte avant le 1er mars.",
    q: 'Qui peut accéder à la plateforme ?',
    opts: ['Tous les utilisateurs', 'Uniquement les utilisateurs inscrits avant le 1er mars', 'Les utilisateurs inscrits après le 1er mars', 'Je ne sais pas trop'],
    correct: 1
  },
  {
    source: "En raison d'un incident technique, la visioconférence a commencé avec vingt minutes de retard.",
    q: 'Pourquoi la visioconférence a-t-elle commencé en retard ?',
    opts: ['Les participants sont arrivés trop tôt', 'Il y avait un problème technique', 'La réunion a été annulée', 'Je ne sais pas trop'],
    correct: 1
  },
];

// ============ BLOC 7 — Déclaratives (15s) ============
// Options : ['Plutôt oui', 'Plutôt non']
// positiveAnswer = index de la réponse considérée comme positive (adapté / intéressé)
const bloc7 = [
  { q: "Le français est-il votre première langue ou une langue que vous maitrisez bien à l'oral ?", axis: 'ADAPTATION' as const, positiveAnswer: 0 },
  { q: 'Avez-vous des problèmes de lecture ?', axis: 'ADAPTATION' as const, positiveAnswer: 1 },
  { q: 'Diriez-vous que vous avez des difficultés en orthographe ?', axis: 'ADAPTATION' as const, positiveAnswer: 0 },
  { q: 'Êtes-vous satisfait(e) de votre niveau en orthographe ?', axis: 'INTEREST' as const, positiveAnswer: 1 },
  { q: 'Vous a-t-on déjà fait des remarques négatives sur votre orthographe ?', axis: 'ADAPTATION' as const, positiveAnswer: 0 },
  { q: "Êtes-vous à l'aise avec l'accord des verbes ?", axis: 'ADAPTATION' as const, positiveAnswer: 1 },
  { q: "La maîtrise de l'orthographe vous est-elle utile ?", axis: 'INTEREST' as const, positiveAnswer: 0 },
  { q: 'Seriez-vous prêt(e) à consacrer quelques minutes par jour pour améliorer votre orthographe ?', axis: 'INTEREST' as const, positiveAnswer: 0 },
  { q: 'Si une formation vous aidait à progresser, souhaiteriez-vous commencer dans les prochains mois ?', axis: 'INTEREST' as const, positiveAnswer: 0 },
  { q: 'Si vous suiviez une formation, souhaiteriez-vous revoir les verbes ?', axis: 'INTEREST' as const, positiveAnswer: 0 },
];

async function main() {
  console.log('🗑️  Suppression des anciennes questions...');
  await prisma.answer.deleteMany();
  await prisma.question.deleteMany();

  console.log('📝 Insertion des 58 questions du CDC v3...');

  // Bloc 1
  for (const item of bloc1) {
    await prisma.question.create({
      data: {
        type: QuestionType.PROCEDURAL,
        category: QuestionCategory.SINGULAR_PLURAL,
        blockNumber: 1,
        subCategory: META.bloc1.subCategory,
        instruction: META.bloc1.instruction,
        questionText: item.q,
        options: item.opts,
        correctAnswerIndex: item.correct,
        timeLimit: 10,
      },
    });
  }

  // Bloc 2
  for (const item of bloc2) {
    await prisma.question.create({
      data: {
        type: QuestionType.PROCEDURAL,
        category: QuestionCategory.CONJUGATION,
        blockNumber: 2,
        subCategory: META.bloc2.subCategory,
        instruction: META.bloc2.instruction,
        questionText: item.q,
        options: item.opts,
        correctAnswerIndex: item.correct,
        timeLimit: 10,
      },
    });
  }

  // Bloc 3
  for (const item of bloc3) {
    await prisma.question.create({
      data: {
        type: QuestionType.PROCEDURAL,
        category: QuestionCategory.PAST_PARTICIPLE,
        blockNumber: 3,
        subCategory: META.bloc3.subCategory,
        instruction: META.bloc3.instruction,
        questionText: item.q,
        options: item.opts,
        correctAnswerIndex: item.correct,
        timeLimit: 10,
      },
    });
  }

  // Bloc 4
  for (const item of bloc4) {
    await prisma.question.create({
      data: {
        type: QuestionType.PROCEDURAL,
        category: QuestionCategory.SPELLING,
        blockNumber: 4,
        subCategory: META.bloc4.subCategory,
        instruction: META.bloc4.instruction,
        questionText: item.q,
        options: item.opts,
        correctAnswerIndex: item.correct,
        timeLimit: 15,
      },
    });
  }

  // Bloc 5
  for (const item of bloc5) {
    await prisma.question.create({
      data: {
        type: QuestionType.PROCEDURAL,
        category: QuestionCategory.SYNTAX,
        blockNumber: 5,
        subCategory: META.bloc5.subCategory,
        instruction: META.bloc5.instruction,
        questionText: item.q,
        options: item.opts,
        correctAnswerIndex: item.correct,
        timeLimit: 15,
      },
    });
  }

  // Bloc 6
  for (const item of bloc6) {
    await prisma.question.create({
      data: {
        type: QuestionType.PROCEDURAL,
        category: QuestionCategory.COMPREHENSION,
        blockNumber: 6,
        subCategory: META.bloc6.subCategory,
        instruction: META.bloc6.instruction,
        questionText: item.q,
        sourceText: item.source,
        options: item.opts,
        correctAnswerIndex: item.correct,
        timeLimit: 25,
      },
    });
  }

  // Bloc 7
  for (const item of bloc7) {
    await prisma.question.create({
      data: {
        type: QuestionType.DECLARATIF,
        category: QuestionCategory.DECLARATIVE,
        blockNumber: 7,
        subCategory: META.bloc7.subCategory,
        instruction: META.bloc7.instruction,
        questionText: item.q,
        options: ['Plutôt oui', 'Plutôt non'],
        declarativeAxis: item.axis === 'ADAPTATION' ? DeclarativeAxis.ADAPTATION : DeclarativeAxis.INTEREST,
        declarativeWeight: item.positiveAnswer,
        timeLimit: 15,
      },
    });
  }

  const total = await prisma.question.count();
  console.log(`✅ ${total} questions créées avec succès.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
