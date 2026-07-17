'use client';
import { useApp } from '@/components/Providers';

export default function MentionsLegalesPage() {
  const { lang, t } = useApp();
  return (
    <section>
      <div className="wrap" style={{ maxWidth: 780 }}>
        <span className="eyebrow">Informations</span>
        <h1 className="big">Mentions légales</h1>
        <div className="divider" />
        {lang !== 'fr' ? <p className="notice" role="status">{t.ui.legalFrenchOnly}</p> : null}

        <h3 className="legal-h3">Éditeur du site</h3>
        <p className="prose">
          Le site Essentia de Myriam Diougoan Blanch est édité par sa fondatrice, coach, consultante
          RH et formatrice indépendante.
        </p>
        <p className="prose" style={{ marginTop: 10 }}>
          Statut juridique : <em>à compléter</em><br />
          Siège / adresse professionnelle : <em>à compléter</em><br />
          Numéro SIRET : <em>à compléter</em><br />
          Email : <a href="mailto:mdbchandale@gmail.com">mdbchandale@gmail.com</a><br />
          Téléphone : <a href="tel:+33601300642">+33 (0)6 01 30 06 42</a>
        </p>
        <p className="prose" style={{ marginTop: 10 }}>
          Directeur de la publication : Myriam Diougoan Blanch.
        </p>

        <h3 className="legal-h3">Hébergement</h3>
        <p className="prose">
          Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789,
          États-Unis — <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a>.
        </p>

        <h3 className="legal-h3">Propriété intellectuelle</h3>
        <p className="prose">
          L&rsquo;ensemble des contenus présents sur ce site (textes, logo, mise en page) est la
          propriété de Myriam Diougoan Blanch, sauf mention contraire. Toute reproduction, même
          partielle, est soumise à autorisation préalable.
        </p>

        <h3 className="legal-h3">Données personnelles</h3>
        <p className="prose">
          Le traitement des données personnelles collectées via ce site est détaillé dans notre
          page dédiée à la <a href="/confidentialite">confidentialité</a> et à la{' '}
          <a href="/rgpd">protection des données (RGPD)</a>.
        </p>
      </div>
    </section>
  );
}
