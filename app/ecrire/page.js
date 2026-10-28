import './ecrire.css';
import { Ecrire } from './Ecrire';

// Myriam's private writing page. It is reached only by its address: it is not
// in the menu or the sitemap, and every search engine is asked not to list it
// (here and in the response headers, see next.config.mjs). It is deliberately
// left out of robots.txt, which anyone can read and which would reveal it.
export const metadata = {
  title: 'Écrire · Essentia',
  description: 'Espace d’écriture personnel.',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
};

export const viewport = { themeColor: '#FAF6EF' };

export default function EcrirePage() {
  return <Ecrire />;
}
