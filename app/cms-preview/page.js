import { cookies } from 'next/headers';
import { createReader } from '@keystatic/core/reader';
import { createGitHubReader } from '@keystatic/core/reader/github';
import config from '../../keystatic.config';
import french from '@/lib/french-content';
import { cmsEnvironment } from '../../cms/environment';
import { mergePreview, validBranch } from '../../cms/preview';
import { CmsPreview } from '@/components/CmsPreview';
import Home from '../page';
import About from '../a-propos/page';
import Coaching from '../accompagnement/page';
import Rh from '../conseil-rh/page';
import Booking from '../rendez-vous/page';
import Contact from '../contact/page';
import Resources from '../ressources/page';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Aperçu privé · Essentia', robots: { index: false, follow: false }, alternates: { canonical: '/cms-preview' } };
const pages = { home: Home, about: About, coaching: Coaching, rh: Rh, booking: Booking, contact: Contact, resources: Resources };
function Unavailable({ children }) { return <main className="cms-welcome"><div className="cms-welcome-card"><h1>Aperçu indisponible</h1><p>{children}</p><a href="/keystatic">Retour à l’éditeur</a></div></main>; }
export default async function Preview({ searchParams }) {
  const params = await searchParams;
  const branch = params.branch || 'main';
  const page = params.page || 'home';
  if (!validBranch(branch) || !Object.hasOwn(pages, page)) return <Unavailable>Choisissez une page et une branche valides depuis l’éditeur.</Unavailable>;
  const { local, configured } = cmsEnvironment();
  const token = (await cookies()).get('keystatic-gh-access-token')?.value;
  if (!local && (!configured || !token)) return <Unavailable>Connectez-vous à votre espace d’édition pour consulter un brouillon.</Unavailable>;
  let content;
  try {
    if (!local) {
      // Verify repository write access before using the editor's session for preview reads.
      const permission = await fetch('https://api.github.com/repos/addyap/essentia-myriam', { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }, cache: 'no-store' });
      if (!permission.ok || !(await permission.json()).permissions?.push) return <Unavailable>Votre compte n’a pas accès à l’édition de ce site.</Unavailable>;
    }
    const reader = local ? createReader(process.cwd(), config) : createGitHubReader(config, { repo: 'addyap/essentia-myriam', ref: branch, token });
    const entries = await Promise.all(Object.keys(french).map(async key => [key, await reader.singletons[key].read()]));
    if (entries.some(([, value]) => !value)) return <Unavailable>Ce brouillon est incomplet. Enregistrez les pages depuis l’éditeur puis réessayez.</Unavailable>;
    content = mergePreview(french, Object.fromEntries(entries));
  } catch {
    return <Unavailable>Le brouillon n’a pas pu être chargé. Vérifiez votre connexion, reconnectez-vous si nécessaire, puis réessayez.</Unavailable>;
  }
  const Page = pages[page];
  return <CmsPreview content={content} branch={local ? 'Brouillon local' : branch}><Page /></CmsPreview>;
}
