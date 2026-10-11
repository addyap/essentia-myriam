const pageMetadata = {
  title: 'Ressources — Blog, vidéos & podcasts | Essentia de Myriam Diougoan Blanch',
  description: "Articles, vidéos et podcasts pour nourrir votre cheminement personnel et professionnel, entre profondeur psychique et développement humain.",
  alternates: { canonical: '/ressources' },
};

export const metadata = {
  ...pageMetadata,
  openGraph: { title: pageMetadata.title, description: pageMetadata.description,
    url: pageMetadata.alternates.canonical, type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: pageMetadata.title,
    description: pageMetadata.description, images: ['/og-image.jpg'] },
};

export default function ResourcesLayout({ children }) {
  return children;
}
