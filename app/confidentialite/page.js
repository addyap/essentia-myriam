'use client';
import { useApp } from '@/components/Providers';
import { RevealContact } from '@/components/RevealContact';
import { CONTACT } from '@/lib/contact';

export default function ConfidentialitePage() {
  const { lang, t } = useApp();
  return (
    <section lang="fr">
      <div className="wrap" style={{ maxWidth: 780 }}>
        <span className="eyebrow">Informations</span>
        <h1 className="big">Politique de confidentialité</h1>
        <div className="divider" />
        {lang !== 'fr' ? <p className="notice" role="status">{t.ui.legalFrenchOnly}</p> : null}
        <p className="lead" style={{ margin: '10px 0 0' }}>
          Comment vos données personnelles sont collectées et utilisées sur ce site.
        </p>

        <h2 className="legal-h3">Quelles données sont collectées</h2>
        <p className="prose">
          Ce site ne propose ni formulaire de collecte ni inscription à une newsletter.
          Lorsque vous contactez Myriam par email, téléphone ou WhatsApp, vous transmettez
          directement les informations nécessaires à votre demande. WhatsApp et votre
          fournisseur de messagerie appliquent leurs propres politiques de confidentialité.
          Évitez de transmettre des informations de santé sensibles lors du premier contact.
          Le choix de langue est mémorisé dans votre navigateur. L’hébergeur peut traiter
          des données techniques de connexion pour assurer le fonctionnement et la sécurité
          du site. Aucun outil de mesure d’audience n’est intégré à cette version du site.
        </p>

        <h2 className="legal-h3">Pourquoi ces données sont utilisées</h2>
        <p className="prose">
          Ces informations servent exclusivement à répondre à votre demande, organiser un
          rendez-vous. Elles ne
          sont jamais vendues, louées ou partagées avec des tiers à des fins commerciales.
        </p>

        <h2 className="legal-h3">Durée de conservation</h2>
        <p className="prose">
          Les données issues d&rsquo;un échange ou d&rsquo;une demande de rendez-vous sont
          conservées le temps nécessaire à la relation professionnelle, puis archivées ou
          supprimées conformément aux obligations légales applicables.
        </p>

        <h2 className="legal-h3">Vos droits</h2>
        <p className="prose">
          Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez
          d&rsquo;un droit d&rsquo;accès, de rectification, d&rsquo;effacement, d&rsquo;opposition
          et de portabilité sur vos données. Le détail de ces droits et la marche à suivre pour
          les exercer sont décrits sur notre page <a href="/rgpd">RGPD</a>.
        </p>

        <h2 className="legal-h3">Contact</h2>
        <p className="prose">
          Pour toute question relative à vos données personnelles, vous pouvez écrire à{' '}
          <RevealContact enc={CONTACT.email} kind="email" />.
        </p>
      </div>
    </section>
  );
}
