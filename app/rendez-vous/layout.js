const pageMetadata = {
  title: 'Prendre rendez-vous — Essentia de Myriam Diougoan Blanch',
  description: 'Réservez une séance de coaching, de psychothérapie ou de conseil RH avec Myriam Diougoan Blanch, en présentiel ou en ligne.',
  alternates: { canonical: '/rendez-vous' },
};

export const metadata = {
  ...pageMetadata,
  openGraph: { title: pageMetadata.title, description: pageMetadata.description,
    url: pageMetadata.alternates.canonical, type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: pageMetadata.title,
    description: pageMetadata.description, images: ['/og-image.jpg'] },
};

export default function BookingLayout({ children }) {
  return children;
}
