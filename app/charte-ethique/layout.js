const pageMetadata = {
  title: 'Charte éthique — Essentia de Myriam Diougoan Blanch',
  description: "La charte éthique qui encadre chaque accompagnement proposé par Essentia de Myriam Diougoan Blanch : confidentialité, bienveillance et consentement.",
  alternates: { canonical: '/charte-ethique' },
};

export const metadata = {
  ...pageMetadata,
  openGraph: { title: pageMetadata.title, description: pageMetadata.description,
    url: pageMetadata.alternates.canonical, type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: pageMetadata.title,
    description: pageMetadata.description, images: ['/og-image.jpg'] },
};

export default function CharteEthiqueLayout({ children }) {
  return children;
}
