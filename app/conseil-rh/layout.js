const pageMetadata = {
  title: 'Conseil RH — Essentia de Myriam Diougoan Blanch',
  description: "Conseil RH et formation pour accompagner les organisations : leadership, cohésion d'équipe et transformation managériale.",
  alternates: { canonical: '/conseil-rh' },
};

export const metadata = {
  ...pageMetadata,
  openGraph: { title: pageMetadata.title, description: pageMetadata.description,
    url: pageMetadata.alternates.canonical, type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: pageMetadata.title,
    description: pageMetadata.description, images: ['/og-image.jpg'] },
};

export default function RhLayout({ children }) {
  return children;
}
