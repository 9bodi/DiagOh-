export const metadata = { title: 'Conditions générales d\'utilisation — OHé Diagnostic' };

export default function CGUPage() {
  return (
    <main className="min-h-screen bg-ohe-bg text-ohe-ink py-16 px-6">
      <article className="max-w-3xl mx-auto prose prose-slate">
        <h1 className="font-serif text-4xl mb-6">Conditions générales d&apos;utilisation</h1>
        <p className="text-sm text-ohe-muted mb-8">Dernière mise à jour : 1er août 2026</p>

        <h2>1. Objet</h2>
        <p>
          Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;utilisation
          de la plateforme <strong>OHé Diagnostic</strong>, service en ligne d&apos;évaluation
          du niveau d&apos;orthographe professionnelle édité par la société OHE FORMATION
          (SAS, SIREN 984 923 102).
        </p>

        <h2>2. Acceptation</h2>
        <p>
          L&apos;utilisation de la plateforme implique l&apos;acceptation pleine et entière
          des présentes CGU. L&apos;acceptation est matérialisée par la case à cocher présentée
          lors de l&apos;activation du compte.
        </p>

        <h2>3. Accès au service</h2>
        <p>
          L&apos;accès à la plateforme est réservé aux personnes préalablement invitées
          par un administrateur d&apos;une organisation cliente d&apos;OHE FORMATION.
          Le compte est strictement nominatif et personnel : il ne peut être cédé,
          prêté ou partagé.
        </p>
        <p>
          Chaque utilisateur est responsable de la confidentialité de ses identifiants
          et de toutes les actions effectuées depuis son compte.
        </p>

        <h2>4. Fonctionnalités principales</h2>
        <ul>
          <li>Passage d&apos;un diagnostic d&apos;orthographe professionnelle chronométré ;</li>
          <li>Consultation des résultats individuels (niveau CECRL, scores par compétence, profil déclaratif) ;</li>
          <li>Téléchargement du bilan au format PDF ;</li>
          <li>Téléchargement d&apos;un badge de complétion partageable ;</li>
          <li>Pour les administrateurs : gestion des participants, consultation des résultats, extractions.</li>
        </ul>

        <h2>5. Engagements de l&apos;utilisateur</h2>
        <p>L&apos;utilisateur s&apos;engage à :</p>
        <ul>
          <li>Fournir des informations exactes lors de la création de son compte ;</li>
          <li>Passer le diagnostic <strong>seul</strong>, sans assistance extérieure ni outil d&apos;aide (correcteur, dictionnaire, IA, etc.), afin de garantir la fiabilité des résultats ;</li>
          <li>Ne pas tenter de contourner les mécanismes de sécurité ou d&apos;anti-triche ;</li>
          <li>Ne pas utiliser la plateforme à des fins illicites ;</li>
          <li>Respecter la propriété intellectuelle d&apos;OHE FORMATION.</li>
        </ul>

        <h2>6. Chronométrage et validation</h2>
        <p>
          Chaque question du diagnostic est chronométrée. À l&apos;expiration du temps
          imparti, la réponse en cours est automatiquement validée. Aucun retour en arrière
          n&apos;est possible.
        </p>
        <p>
          En cas de sortie prématurée de la plateforme, la question en cours est comptabilisée
          comme incorrecte. Le test peut être repris à la question suivante, dans la limite
          de la deadline fixée par l&apos;organisation cliente.
        </p>

        <h2>7. Résultats</h2>
        <p>
          Les résultats du diagnostic sont fournis à titre indicatif et pédagogique.
          Ils reflètent une évaluation à un instant donné et ne sauraient constituer une
          appréciation exhaustive des compétences linguistiques de l&apos;utilisateur.
          Ils ne peuvent en aucun cas fonder à eux seuls une décision professionnelle
          (embauche, licenciement, promotion) sans considération d&apos;éléments complémentaires.
        </p>

        <h2>8. Disponibilité du service</h2>
        <p>
          OHE FORMATION met en œuvre les moyens raisonnables pour assurer la disponibilité
          et la performance de la plateforme. Des interruptions temporaires peuvent survenir
          pour des opérations de maintenance ou pour des raisons indépendantes de la volonté
          d&apos;OHE FORMATION (panne d&apos;hébergement, incident réseau, etc.).
        </p>

        <h2>9. Propriété intellectuelle</h2>
        <p>
          L&apos;ensemble des éléments de la plateforme (méthodologie du diagnostic,
          questions, interprétations, textes, images, code source, identité visuelle,
          marque OHé Orthographe Héros) est la propriété exclusive d&apos;OHE FORMATION
          et est protégé par le droit d&apos;auteur et le droit des marques.
        </p>
        <p>
          Toute reproduction, extraction, diffusion ou exploitation non autorisée est
          strictement interdite et passible de poursuites.
        </p>

        <h2>10. Données personnelles</h2>
        <p>
          Le traitement des données personnelles est décrit dans la{' '}
          <a href="/politique-confidentialite">politique de confidentialité</a>,
          qui fait partie intégrante des présentes CGU.
        </p>

        <h2>11. Responsabilité</h2>
        <p>
          OHE FORMATION ne saurait être tenue responsable des dommages indirects
          liés à l&apos;utilisation ou à l&apos;impossibilité d&apos;utiliser la plateforme,
          notamment perte de données, perte d&apos;exploitation ou perte de chance.
        </p>

        <h2>12. Modifications</h2>
        <p>
          OHE FORMATION se réserve le droit de modifier les présentes CGU à tout moment.
          Les utilisateurs seront informés des modifications substantielles et pourront être
          invités à confirmer leur acceptation lors de leur prochaine connexion.
        </p>

        <h2>13. Droit applicable et juridiction</h2>
        <p>
          Les présentes CGU sont soumises au droit français. Tout litige relatif à leur
          interprétation ou leur exécution relève de la compétence exclusive des tribunaux
          d&apos;Evreux, siège d&apos;OHE FORMATION.
        </p>

        <h2>14. Contact</h2>
        <p>
          Pour toute question relative aux présentes CGU :{' '}
          <a href="mailto:rgpd@orthographe-heros.fr">rgpd@orthographe-heros.fr</a>.
        </p>
      </article>
    </main>
  );
}
