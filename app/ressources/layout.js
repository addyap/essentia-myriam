const pageMetadata = {
  title: 'Ressources en préparation | Essentia de Myriam Diougoan Blanch',
  description: "Les prochaines ressources Essentia seront publiées ici lorsqu’elles seront disponibles.",
  alternates: { canonical: '/ressources' },
};

export const metadata = {
  ...pageMetadata,
  robots: { index: false, follow: true },
  openGraph: { title: pageMetadata.title, description: pageMetadata.description,
    url: pageMetadata.alternates.canonical, type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: pageMetadata.title,
    description: pageMetadata.description, images: ['/og-image.jpg'] },
};

export default function ResourcesLayout({ children }) {
  return children;
}
