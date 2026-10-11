const pageMetadata = {
  title: 'Confidentialité — Essentia de Myriam Diougoan Blanch',
  description: "Politique de confidentialité d'Essentia de Myriam Diougoan Blanch : quelles données sont collectées, pourquoi, et pendant combien de temps.",
  alternates: { canonical: '/confidentialite' },
};

export const metadata = {
  ...pageMetadata,
  openGraph: { title: pageMetadata.title, description: pageMetadata.description,
    url: pageMetadata.alternates.canonical, type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: pageMetadata.title,
    description: pageMetadata.description, images: ['/og-image.jpg'] },
};

export default function ConfidentialiteLayout({ children }) {
  return children;
}
