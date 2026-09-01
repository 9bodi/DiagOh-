export const metadata = { title: 'Politique de confidentialité — OHé Diagnostic' };

export default function PolitiqueConfidentialitePage() {
  return (
    <main className="min-h-screen bg-ohe-bg text-ohe-ink py-16 px-6">
      <article className="max-w-3xl mx-auto prose prose-slate">
        <h1 className="font-serif text-4xl mb-6">Politique de confidentialité</h1>
        <p className="text-sm text-ohe-muted mb-8">Dernière mise à jour : 1er août 2026</p>

        <p>
          La présente politique décrit comment OHE FORMATION collecte, utilise et protège
          vos données personnelles dans le cadre de l&apos;utilisation de la plateforme
          OHé Diagnostic, conformément au Règlement Général sur la Protection des Données (RGPD)
          et à la loi Informatique et Libertés.
        </p>

        <h2>1. Responsable de traitement</h2>
        <p>
          <strong>OHE FORMATION</strong>, SAS au capital de 10 000 €<br />
          Siège social : 12 rue des Carrières, 27110 Le Neubourg, France<br />
          SIREN : 984 923 102<br />
          Contact : <a href="mailto:rgpd@orthographe-heros.fr">rgpd@orthographe-heros.fr</a>
        </p>

        <h2>2. Données collectées</h2>
        <p>
          Dans le cadre de votre utilisation de la plateforme, nous collectons les catégories
          de données suivantes :
        </p>
        <ul>
          <li><strong>Données d&apos;identification</strong> : prénom, nom, adresse email professionnelle ;</li>
          <li><strong>Données de connexion</strong> : mot de passe (stocké sous forme hashée avec bcrypt), dates de connexion ;</li>
          <li><strong>Données du diagnostic</strong> : réponses aux 48 questions, temps de réponse par question, scores calculés par bloc, niveau global évalué, positionnement sur les axes adaptation/intérêt ;</li>
          <li><strong>Rattachement organisationnel</strong> : entreprise cliente, groupe éventuel.</li>
        </ul>
        <p>
          Aucune donnée sensible au sens de l&apos;article 9 du RGPD (santé, opinions,
          origine, etc.) n&apos;est collectée.
        </p>

        <h2>3. Finalités et bases légales du traitement</h2>
        <table>
          <thead>
            <tr>
              <th>Finalité</th>
              <th>Base légale</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Fournir l&apos;accès à la plateforme et gérer votre compte</td>
              <td>Exécution du contrat entre OHE FORMATION et votre employeur</td>
            </tr>
            <tr>
              <td>Évaluer votre niveau d&apos;orthographe professionnelle</td>
              <td>Intérêt légitime de votre employeur, dont vous êtes préalablement informé</td>
            </tr>
            <tr>
              <td>Envoyer les emails d&apos;invitation, de rappel et de confirmation</td>
              <td>Exécution du contrat</td>
            </tr>
            <tr>
              <td>Assurer la sécurité et la traçabilité (logs d&apos;audit)</td>
              <td>Intérêt légitime</td>
            </tr>
          </tbody>
        </table>

        <h2>4. Destinataires des données</h2>
        <p>Vos données sont accessibles :</p>
        <ul>
          <li>À <strong>vous-même</strong>, via votre espace personnel ;</li>
          <li>À l&apos;<strong>administrateur</strong> de l&apos;organisation cliente qui vous a invité ;</li>
          <li>Au <strong>référent</strong> de votre groupe, le cas échéant ;</li>
          <li>À <strong>OHE FORMATION</strong>, en tant qu&apos;éditeur, à des fins de maintenance technique et de support.</li>
        </ul>

        <h2>5. Sous-traitants</h2>
        <p>
          OHE FORMATION fait appel aux sous-traitants suivants pour le fonctionnement
          technique de la plateforme :
        </p>
        <ul>
          <li><strong>Vercel Inc.</strong> — hébergement de l&apos;application. Traitement des fonctions dans la région Paris, France (cdg1) ;</li>
          <li><strong>Neon Inc.</strong> — hébergement de la base de données. Région AWS Europe Central 1 (Francfort, Allemagne) ;</li>
          <li><strong>Resend Inc.</strong> — envoi d&apos;emails transactionnels.</li>
        </ul>
        <p>
          Ces sous-traitants sont liés par des clauses contractuelles conformes au RGPD.
          Les données sont hébergées et traitées en Union européenne.
        </p>

        <h2>6. Durée de conservation</h2>
        <ul>
          <li><strong>Compte utilisateur</strong> : conservé tant que le compte est actif, puis 3 ans après la dernière connexion, avant suppression ;</li>
          <li><strong>Résultats du diagnostic</strong> : conservés 3 ans après leur date de complétion, conformément aux recommandations de la CNIL pour les bilans professionnels ;</li>
          <li><strong>Logs techniques et d&apos;audit</strong> : conservés 12 mois maximum ;</li>
          <li><strong>Emails transactionnels</strong> : traces conservées 12 mois.</li>
        </ul>

        <h2>7. Cookies</h2>
        <p>
          Nous utilisons uniquement des cookies strictement nécessaires au fonctionnement
          du service (authentification, sécurité). <strong>Aucun cookie de tracking,
          d&apos;analyse d&apos;audience ou publicitaire n&apos;est déposé</strong>.
          Aucune bannière de consentement cookies n&apos;est donc requise.
        </p>

        <h2>8. Vos droits</h2>
        <p>
          Conformément aux articles 15 à 22 du RGPD, vous disposez des droits suivants
          sur vos données personnelles :
        </p>
        <ul>
          <li><strong>Droit d&apos;accès</strong> à vos données et d&apos;obtenir une copie ;</li>
          <li><strong>Droit de rectification</strong> en cas de données inexactes ;</li>
          <li><strong>Droit à l&apos;effacement</strong> (droit à l&apos;oubli) ;</li>
          <li><strong>Droit à la limitation</strong> du traitement ;</li>
          <li><strong>Droit d&apos;opposition</strong> au traitement fondé sur l&apos;intérêt légitime ;</li>
          <li><strong>Droit à la portabilité</strong> de vos données ;</li>
          <li><strong>Droit de retirer votre consentement</strong> à tout moment ;</li>
          <li><strong>Droit d&apos;introduire une réclamation</strong> auprès de la CNIL.</li>
        </ul>
        <p>
          Pour exercer ces droits, contactez OHE FORMATION à l&apos;adresse suivante :{' '}
          <a href="mailto:rgpd@orthographe-heros.fr">rgpd@orthographe-heros.fr</a>.
        </p>
        <p>
          Nous nous engageons à répondre à toute demande dans un délai maximum d&apos;un mois,
          conformément à l&apos;article 12 du RGPD.
        </p>
        <p>
          Vous pouvez également introduire une réclamation auprès de la Commission Nationale
          de l&apos;Informatique et des Libertés (CNIL), 3 place de Fontenoy, TSA 80715,
          75334 Paris cedex 07 —{' '}
          <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>.
        </p>

        <h2>9. Sécurité</h2>
        <p>
          Les mesures techniques et organisationnelles suivantes sont mises en œuvre
          pour protéger vos données :
        </p>
        <ul>
          <li>Chiffrement en transit (HTTPS/TLS 1.3) ;</li>
          <li>Chiffrement au repos de la base de données ;</li>
          <li>Mots de passe stockés sous forme hashée (bcrypt) ;</li>
          <li>Contrôle d&apos;accès strict par rôle (participant, administrateur, référent) ;</li>
          <li>Sauvegardes chiffrées automatiques quotidiennes ;</li>
          <li>Journal d&apos;audit des accès sensibles.</li>
        </ul>

        <h2>10. Modifications</h2>
        <p>
          La présente politique peut être mise à jour pour refléter des évolutions légales
          ou fonctionnelles. En cas de modification substantielle, les utilisateurs seront
          informés et pourront être invités à confirmer leur consentement.
        </p>
      </article>
    </main>
  );
}
