import Link from 'next/link';
import { cmsEnvironment } from '../../cms/environment';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Votre espace d’édition · Essentia', robots: { index: false, follow: false }, alternates: { canonical: '/admin' } };
export default function Admin() {
  const { available } = cmsEnvironment();
  return <main className="cms-welcome" lang="fr"><div className="cms-welcome-card">
    <span className="eyebrow">Essentia de Myriam</span><h1>Votre espace d’édition</h1>
    <p>Retrouvez les textes français du site, organisés par page. Les photos, la mise en page et les animations restent protégées.</p>
    {available ? <><Link href="/cms/index.html" className="btn btn-gold">Ouvrir l’éditeur</Link><p>Connectez-vous avec votre adresse email et votre mot de passe personnel. Vérifiez l’aperçu, enregistrez votre brouillon, puis choisissez « Publier » lorsque le texte est prêt. La mise à jour apparaît après le déploiement.</p></> : <p role="status" className="notice">Votre accès sécurisé est en préparation. Antony doit terminer la connexion sécurisée et vous inviter à mdbchandale@gmail.com avant votre première utilisation.</p>}
    <Link href="/cms/index.html?demo=1" className="btn btn-gold">Essayer la démonstration</Link><p>Mode de démonstration : vous pouvez tester l’éditeur et les aperçus. Vos essais ne modifient jamais le site et disparaissent au rechargement.</p>
    <Link href="/">Retour au site</Link>
  </div></main>;
}
