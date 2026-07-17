import { Cormorant_Garamond, Mulish, Parisienne } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { SITE_URL } from '@/lib/config';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});
const mulish = Mulish({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});
const parisienne = Parisienne({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-script',
  display: 'swap',
});

const title = 'Essentia by MDB — Myriam Diougoan Blanch';
const description =
  "Coaching, psychothérapie et conseil RH. Un accompagnement à la fois spirituel et pragmatique pour transformer vos défis en évolutions profondes et durables.";

export const metadata = {
  title,
  description,
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/' },
  openGraph: {
    title,
    description: 'Coaching, psychothérapie et conseil RH multilingue.',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description: 'Coaching, psychothérapie et conseil RH multilingue.',
    images: ['/og-image.jpg'],
  },
  icons: { icon: '/favicon.png' },
};

// JSON-LD: real, verifiable facts only — no invented address/SIRET (still
// "à compléter" in the legal notice), so those fields are intentionally
// omitted rather than guessed.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Essentia by MDB',
  description,
  url: SITE_URL,
  image: `${SITE_URL}/og-image.jpg`,
  email: 'mdbchandale@gmail.com',
  telephone: '+33601300642',
  founder: { '@type': 'Person', name: 'Myriam Diougoan Blanch' },
  areaServed: 'FR',
  availableLanguage: ['fr', 'en', 'it', 'es'],
};

export default function RootLayout({ children }) {
  return (
    // lang starts "fr" for the server-rendered pass (matching Providers.js's
    // French-first default) and is swapped client-side once the visitor's
    // saved locale loads. Known limitation, deliberately out of scope for now:
    // fr/en/it/es all render at this same URL with no locale-specific routes
    // or hreflang, so crawlers only ever index the French version — see the
    // full-site audit report for the URL-based-routing fix if this changes.
    <html lang="fr" className={`${cormorant.variable} ${mulish.variable} ${parisienne.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">Aller au contenu</a>
        <Providers>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
