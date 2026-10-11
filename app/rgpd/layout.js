const pageMetadata = {
  title: 'RGPD — Essentia de Myriam Diougoan Blanch',
  description: 'Vos droits RGPD sur le site Essentia de Myriam Diougoan Blanch : accès, rectification, effacement et comment les exercer.',
  alternates: { canonical: '/rgpd' },
};

export const metadata = {
  ...pageMetadata,
  openGraph: { title: pageMetadata.title, description: pageMetadata.description,
    url: pageMetadata.alternates.canonical, type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: pageMetadata.title,
    description: pageMetadata.description, images: ['/og-image.jpg'] },
};

export default function RgpdLayout({ children }) {
  return children;
}
