const pageMetadata = {
  title: 'Le podcast d’Essentia, bientôt disponible | Essentia de Myriam Diougoan Blanch',
  description: 'Le podcast de Myriam Diougoan Blanch est en préparation : des échanges et des pistes concrètes autour de l’accompagnement, du bien-être et de la vie professionnelle.',
  alternates: { canonical: '/podcast' },
};

// Kept out of search results until the first episode is published.
export const metadata = {
  ...pageMetadata,
  robots: { index: false, follow: true },
  openGraph: { title: pageMetadata.title, description: pageMetadata.description,
    url: pageMetadata.alternates.canonical, type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: pageMetadata.title,
    description: pageMetadata.description, images: ['/og-image.jpg'] },
};

export default function PodcastLayout({ children }) {
  return children;
}
