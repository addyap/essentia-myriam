const pageMetadata = {
  title: 'Accompagnement — Coaching & psychothérapie | Essentia de Myriam Diougoan Blanch',
  description: "Coaching individuel et d'équipe, psychothérapie, gestion du stress : découvrez les accompagnements proposés par Myriam Diougoan Blanch, en cabinet ou en visioconférence.",
  alternates: { canonical: '/accompagnement' },
};

export const metadata = {
  ...pageMetadata,
  openGraph: { title: pageMetadata.title, description: pageMetadata.description,
    url: pageMetadata.alternates.canonical, type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: pageMetadata.title,
    description: pageMetadata.description, images: ['/og-image.jpg'] },
};

export default function CoachingLayout({ children }) {
  return children;
}
