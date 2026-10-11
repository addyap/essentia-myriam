const pageMetadata = {
  title: 'Mentions légales — Essentia de Myriam Diougoan Blanch',
  description: 'Mentions légales du site Essentia de Myriam Diougoan Blanch : éditeur, hébergement et propriété intellectuelle.',
  alternates: { canonical: '/mentions-legales' },
};

export const metadata = {
  ...pageMetadata,
  openGraph: { title: pageMetadata.title, description: pageMetadata.description,
    url: pageMetadata.alternates.canonical, type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: pageMetadata.title,
    description: pageMetadata.description, images: ['/og-image.jpg'] },
};

export default function MentionsLegalesLayout({ children }) {
  return children;
}
