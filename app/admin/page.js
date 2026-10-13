import Link from 'next/link';
import { cmsEnvironment } from '../../cms/environment';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Votre espace d’édition · Essentia', robots: { index: false, follow: false }, alternates: { canonical: '/admin' } };
export default function Admin() {
  const { available } = cmsEnvironment();
  return <main className="cms-welcome" lang="fr"><div className="cms-welcome-card">
    <span className="eyebrow">Essentia de Myriam</span><h1>Votre espace d’édition</h1>
    <p>Retrouvez les textes français du site, organisés par page. Les photos, la mise en page et les animations restent protégées.</p>
    {available ? <><Link href="/keystatic" className="btn btn-gold">Ouvrir l’éditeur</Link><p>Pour vérifier avant de publier : enregistrez vos modifications sur une branche de brouillon, ouvrez l’aperçu, puis demandez leur fusion vers main. Enregistrer directement sur main publie les changements après le déploiement.</p></> : <p role="status" className="notice">Votre accès sécurisé est en préparation. Antony doit terminer la connexion à GitHub avant votre première utilisation.</p>}
    <Link href="/">Retour au site</Link>
  </div></main>;
}
