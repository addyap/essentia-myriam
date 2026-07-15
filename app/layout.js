import './globals.css';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Essentia — Myriam Diougoan Blanch',
  description:
    "Coaching, thérapie et conseil RH. Un accompagnement à la fois spirituel et pragmatique pour transformer vos défis en évolutions profondes et durables.",
  metadataBase: new URL('https://essentia.example.com'),
  openGraph: {
    title: 'Essentia — Myriam Diougoan Blanch',
    description: "Coaching, thérapie et conseil RH multilingue.",
    type: 'website',
  },
  icons: { icon: '/favicon.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Mulish:wght@300;400;500;600;700&family=Parisienne&display=swap"
        />
      </head>
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
