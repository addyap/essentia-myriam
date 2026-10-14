const pageMetadata = {
  title: 'Blog & podcast | Essentia de Myriam Diougoan Blanch',
  description: 'Les articles de Myriam Diougoan Blanch sur l’accompagnement, la psychothérapie et le monde du travail, et bientôt le podcast d’Essentia.',
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
