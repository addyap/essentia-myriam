import french from '@/lib/french-content';
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
function Unavailable({ children }) { return <main className="cms-welcome"><div className="cms-welcome-card"><h1>Aperçu indisponible</h1><p>{children}</p><a href="/admin">Retour à l’éditeur</a></div></main>; }
export default async function Preview({ searchParams }) {
  const params = await searchParams;
  const page = params.page || 'home';
  if (!Object.hasOwn(pages, page) || typeof params.nonce !== 'string' || params.nonce.length > 80) return <Unavailable>Ouvrez cet aperçu depuis l’éditeur.</Unavailable>;
  const Page = pages[page];
  return <CmsPreview content={french} nonce={params.nonce}><Page /></CmsPreview>;
}
