'use client';
import { useApp } from '@/components/Providers';
import { RevealContact } from '@/components/RevealContact';
import { CONTACT } from '@/lib/contact';

export default function ConfidentialitePage() {
  const { lang, t } = useApp();
  return (
    <section>
      <div className="wrap" style={{ maxWidth: 780 }}>
        <span className="eyebrow">Informations</span>
        <h1 className="big">Politique de confidentialité</h1>
        <div className="divider" />
        {lang !== 'fr' ? <p className="notice" role="status">{t.ui.legalFrenchOnly}</p> : null}
        <p className="lead" style={{ margin: '10px 0 0' }}>
          Comment vos données personnelles sont collectées et utilisées sur ce site.
        </p>

        <h3 className="legal-h3">Quelles données sont collectées</h3>
        <p className="prose">
          Lorsque vous utilisez le formulaire de contact, le formulaire de rendez-vous ou
          l&rsquo;inscription à la newsletter, nous collectons uniquement les informations que
          vous nous transmettez volontairement : nom, adresse email, et le contenu de votre
          message. Aucune autre donnée n&rsquo;est collectée automatiquement en dehors du choix
          de langue de navigation, mémorisé localement dans votre navigateur pour votre confort
          (ce réglage n&rsquo;est jamais transmis à un tiers).
        </p>

        <h3 className="legal-h3">Pourquoi ces données sont utilisées</h3>
        <p className="prose">
          Ces informations servent exclusivement à répondre à votre demande, organiser un
          rendez-vous, ou vous envoyer la newsletter si vous vous y êtes inscrit(e). Elles ne
          sont jamais vendues, louées ou partagées avec des tiers à des fins commerciales.
        </p>

        <h3 className="legal-h3">Durée de conservation</h3>
        <p className="prose">
          Les données issues d&rsquo;un échange ou d&rsquo;une demande de rendez-vous sont
          conservées le temps nécessaire à la relation professionnelle, puis archivées ou
          supprimées conformément aux obligations légales applicables. Les adresses email
          inscrites à la newsletter sont conservées jusqu&rsquo;à désinscription.
        </p>

        <h3 className="legal-h3">Vos droits</h3>
        <p className="prose">
          Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez
          d&rsquo;un droit d&rsquo;accès, de rectification, d&rsquo;effacement, d&rsquo;opposition
          et de portabilité sur vos données. Le détail de ces droits et la marche à suivre pour
          les exercer sont décrits sur notre page <a href="/rgpd">RGPD</a>.
        </p>

        <h3 className="legal-h3">Contact</h3>
        <p className="prose">
          Pour toute question relative à vos données personnelles, vous pouvez écrire à{' '}
          <RevealContact enc={CONTACT.email} kind="email" />.
        </p>
      </div>
    </section>
  );
}
