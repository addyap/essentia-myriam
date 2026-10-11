const pageMetadata = {
  title: 'Contact — Essentia de Myriam Diougoan Blanch',
  description: 'Contactez Myriam Diougoan Blanch pour toute question sur le coaching, la psychothérapie ou le conseil RH.',
  alternates: { canonical: '/contact' },
};

export const metadata = {
  ...pageMetadata,
  openGraph: { title: pageMetadata.title, description: pageMetadata.description,
    url: pageMetadata.alternates.canonical, type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: pageMetadata.title,
    description: pageMetadata.description, images: ['/og-image.jpg'] },
};

export default function ContactLayout({ children }) {
  return children;
}
