import Link from 'next/link';
import { cmsEnvironment } from '../../cms/environment';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Votre espace d’édition · Essentia', robots: { index: false, follow: false }, alternates: { canonical: '/admin' } };
export default function Admin() {
  const { available } = cmsEnvironment();
  return <main className="cms-welcome" lang="fr"><div className="cms-welcome-card">
    <span className="eyebrow">Essentia de Myriam</span><h1>Votre espace d’édition</h1>
    <p>Retrouvez les textes français du site, organisés par page. Les photos, la mise en page et les animations restent protégées.</p>
    {available ? <><Link href="/cms/index.html" className="btn btn-gold">Ouvrir l’éditeur</Link><p>Connectez-vous avec votre adresse email et votre mot de passe personnel. Vérifiez l’aperçu, enregistrez votre brouillon, puis choisissez « Publier » lorsque le texte est prêt. La mise à jour apparaît après le déploiement.</p>
      {/* The sign-in page is hosted by DecapBridge and only exists in English. */}
      <div className="cms-signin-help">
        <h2>La page de connexion est en anglais</h2>
        <p>Après « Se connecter », le service de connexion sécurisée s’ouvre en anglais. Voici ce que signifie chaque élément :</p>
        <dl>
          <dt lang="en">Google</dt><dd>se connecter avec votre compte Google (Gmail)</dd>
          <dt lang="en">Email</dt><dd>votre adresse e-mail</dd>
          <dt lang="en">Password</dt><dd>votre mot de passe</dd>
          <dt lang="en">Sign into CMS</dt><dd>se connecter à l’éditeur</dd>
          <dt lang="en">Forgot password?</dt><dd>mot de passe oublié : vous recevez un e-mail pour en choisir un nouveau</dd>
        </dl>
        <p>Utilisez toujours la même méthode : soit le bouton Google, soit votre adresse e-mail et votre mot de passe.</p>
      </div></> : <p role="status" className="notice">Votre accès sécurisé est en préparation. Antony doit terminer la connexion sécurisée et vous inviter à votre adresse Gmail avant votre première utilisation.</p>}
    <Link href="/cms/index.html?demo=1" className="btn btn-gold">Essayer la démonstration</Link><p>Mode de démonstration : vous pouvez tester l’éditeur et les aperçus. Vos essais ne modifient jamais le site et disparaissent au rechargement.</p>
    <Link href="/">Retour au site</Link>
  </div></main>;
}
