'use client';
import { usePathname } from 'next/navigation';
import { Providers } from './Providers';
import { Header } from './Header';
import { Footer } from './Footer';
import { SkipLink } from './SkipLink';
import { MotionSystem } from './MotionSystem';
import { Analytics } from '@vercel/analytics/next';
export function SiteShell({ children }) {
  const path = usePathname();
  // The private writing page has its own full-screen layout and no visit analytics.
  if (path === '/admin' || path === '/cms-preview' || path === '/ecrire') return children;
  return <><Providers><SkipLink /><Header /><MotionSystem /><main id="main-content" tabIndex={-1}>{children}</main><Footer /></Providers><Analytics /></>;
}
