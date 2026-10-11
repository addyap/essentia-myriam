const pageMetadata = {
  title: 'À propos — Essentia de Myriam Diougoan Blanch',
  description: "Découvrez le parcours de Myriam Diougoan Blanch, coach, psychothérapeute et consultante RH, et son approche holistique de l'accompagnement.",
  alternates: { canonical: '/a-propos' },
};

export const metadata = {
  ...pageMetadata,
  openGraph: { title: pageMetadata.title, description: pageMetadata.description,
    url: pageMetadata.alternates.canonical, type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: pageMetadata.title,
    description: pageMetadata.description, images: ['/og-image.jpg'] },
};

export default function AboutLayout({ children }) {
  return children;
}
