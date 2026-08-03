export const metadata = { title: 'Mentions légales — OHé Diagnostic' };

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-ohe-bg text-ohe-ink py-16 px-6">
      <article className="max-w-3xl mx-auto prose prose-slate">
        <h1 className="font-serif text-4xl mb-6">Mentions légales</h1>

        <h2>Éditeur du site</h2>
        <p>
          <strong>OHE FORMATION</strong>, SAS au capital de 10 000 €<br />
          Nom commercial : Orthographe Héros<br />
          Siège social : 12 rue des Carrières, 27110 Le Neubourg, France<br />
          SIREN : 984 923 102<br />
          SIRET : 984 923 102 00011<br />
          Numéro de TVA intracommunautaire : FR35984923102<br />
          RCS Evreux : 984 923 102<br />
          Code APE : 85.59A (Formation continue d&apos;adultes)<br />
          Organisme de formation certifié Qualiopi<br />
          Email : <a href="mailto:rgpd@orthographe-heros.fr">rgpd@orthographe-heros.fr</a>
        </p>

        <h2>Directrice de la publication</h2>
        <p>Roxane Joannidès</p>

        <h2>Hébergement de l&apos;application</h2>
        <p>
          <strong>Vercel Inc.</strong><br />
          440 N Barranca Ave #4133<br />
          Covina, CA 91723, États-Unis<br />
          <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a>
        </p>
        <p>
          Les fonctions et le traitement des données sont exécutés dans la région
          Paris, France (cdg1).
        </p>

        <h2>Base de données</h2>
        <p>
          <strong>Neon Inc.</strong> — hébergement PostgreSQL managé.<br />
          Région : AWS Europe Central 1 (Francfort, Allemagne).<br />
          <a href="https://neon.tech" target="_blank" rel="noopener noreferrer">neon.tech</a>
        </p>

        <h2>Emails transactionnels</h2>
        <p>
          <strong>Resend Inc.</strong> — envoi d&apos;emails transactionnels.<br />
          <a href="https://resend.com" target="_blank" rel="noopener noreferrer">resend.com</a>
        </p>

        <h2>Propriété intellectuelle</h2>
        <p>
          L&apos;ensemble des contenus présents sur la plateforme OHé Diagnostic
          (textes, images, code, méthodologie d&apos;évaluation, questions, interprétations,
          identité visuelle) est protégé par le droit d&apos;auteur et reste la propriété
          exclusive d&apos;OHE FORMATION et de ses ayants droit.
        </p>
        <p>
          La marque <strong>OHé Orthographe Héros</strong> est déposée à l&apos;INPI
          sous le numéro FR5046867.
        </p>
        <p>
          Toute reproduction, représentation, modification, publication, transmission,
          dénaturation, totale ou partielle du site ou de son contenu, par quelque procédé
          que ce soit, et sur quelque support que ce soit, est interdite sans autorisation
          écrite préalable d&apos;OHE FORMATION.
        </p>

        <h2>Contact</h2>
        <p>
          Pour toute question, réclamation ou demande relative à vos données personnelles :{' '}
          <a href="mailto:rgpd@orthographe-heros.fr">rgpd@orthographe-heros.fr</a>
        </p>
      </article>
    </main>
  );
}
