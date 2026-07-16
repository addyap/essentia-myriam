'use client';
import { useApp } from '@/components/Providers';

export default function CharteEthiquePage() {
  const { lang, t } = useApp();
  return (
    <section>
      <div className="wrap" style={{ maxWidth: 780 }}>
        <span className="eyebrow">Informations</span>
        <h1 className="big">Charte éthique</h1>
        <div className="divider" />
        {lang !== 'fr' ? <p className="notice" role="status">{t.ui.legalFrenchOnly}</p> : null}
        <p className="lead" style={{ margin: '10px 0 0' }}>
          Les principes qui encadrent chaque accompagnement, inspirés des standards
          professionnels du coaching et de la relation d&rsquo;aide.
        </p>

        <h3 className="legal-h3">Confidentialité</h3>
        <p className="prose">
          Tout ce qui est partagé en séance reste strictement confidentiel, sauf accord explicite
          de la personne accompagnée ou obligation légale.
        </p>

        <h3 className="legal-h3">Non-jugement et bienveillance</h3>
        <p className="prose">
          Chaque personne est accueillie sans jugement, dans le respect de son rythme, de sa
          singularité et de son histoire.
        </p>

        <h3 className="legal-h3">Autonomie et consentement</h3>
        <p className="prose">
          L&rsquo;accompagnement respecte le libre arbitre de la personne : elle reste seule
          décisionnaire de ses choix. Aucune séance n&rsquo;a lieu sans son consentement éclairé,
          et elle peut interrompre l&rsquo;accompagnement à tout moment.
        </p>

        <h3 className="legal-h3">Limites de compétence</h3>
        <p className="prose">
          Le coaching et le conseil RH ne se substituent pas à un suivi médical ou psychiatrique.
          Lorsqu&rsquo;une situation dépasse le cadre de l&rsquo;accompagnement proposé, la
          personne est orientée vers un professionnel de santé compétent.
        </p>

        <h3 className="legal-h3">Autonomisation, non dépendance</h3>
        <p className="prose">
          L&rsquo;objectif de chaque accompagnement est de renforcer l&rsquo;autonomie de la
          personne, jamais de créer une dépendance à l&rsquo;accompagnement lui-même.
        </p>

        <h3 className="legal-h3">Respect de la diversité</h3>
        <p className="prose">
          Chaque personne est accompagnée dans le respect de sa culture, de ses convictions et de
          son identité, sans discrimination d&rsquo;aucune sorte.
        </p>
      </div>
    </section>
  );
}
