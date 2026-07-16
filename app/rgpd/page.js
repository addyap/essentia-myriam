'use client';
import { useApp } from '@/components/Providers';

export default function RgpdPage() {
  const { lang, t } = useApp();
  return (
    <section>
      <div className="wrap" style={{ maxWidth: 780 }}>
        <span className="eyebrow">Informations</span>
        <h1 className="big">Protection des données (RGPD)</h1>
        <div className="divider" />
        {lang !== 'fr' ? <p className="notice" role="status">{t.ui.legalFrenchOnly}</p> : null}
        <p className="lead" style={{ margin: '10px 0 0' }}>
          Vos droits en tant que personne concernée, et comment les exercer.
        </p>

        <h3 className="legal-h3">Responsable du traitement</h3>
        <p className="prose">
          Myriam Diougoan Blanch est responsable du traitement des données personnelles
          collectées via ce site. Voir nos <a href="/mentions-legales">mentions légales</a> pour
          les coordonnées complètes.
        </p>

        <h3 className="legal-h3">Vos droits</h3>
        <p className="prose">Vous disposez des droits suivants sur vos données personnelles :</p>
        <ul style={{ marginTop: 12, paddingLeft: 20, color: 'var(--muted)', fontSize: '16.5px', lineHeight: 1.8 }}>
          <li><strong>Droit d&rsquo;accès</strong> — obtenir la confirmation que vos données sont traitées et en recevoir une copie.</li>
          <li><strong>Droit de rectification</strong> — corriger des données inexactes ou incomplètes.</li>
          <li><strong>Droit à l&rsquo;effacement</strong> — demander la suppression de vos données, sous réserve des obligations légales de conservation.</li>
          <li><strong>Droit d&rsquo;opposition</strong> — vous opposer à tout moment à l&rsquo;utilisation de vos données, notamment pour la newsletter.</li>
          <li><strong>Droit à la portabilité</strong> — recevoir vos données dans un format structuré et lisible.</li>
          <li><strong>Droit à la limitation</strong> — demander la suspension temporaire du traitement de vos données.</li>
        </ul>

        <h3 className="legal-h3">Comment exercer ces droits</h3>
        <p className="prose">
          Écrivez à <a href="mailto:mdbchandale@gmail.com">mdbchandale@gmail.com</a> en précisant
          votre demande. Une réponse vous sera apportée dans un délai maximum d&rsquo;un mois,
          conformément au RGPD.
        </p>

        <h3 className="legal-h3">Réclamation</h3>
        <p className="prose">
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une
          réclamation auprès de la CNIL (Commission Nationale de l&rsquo;Informatique et des
          Libertés) — <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>.
        </p>
      </div>
    </section>
  );
}
