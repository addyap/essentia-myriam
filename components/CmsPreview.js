'use client';
import { Providers } from './Providers';
import { Header } from './Header';
import { Footer } from './Footer';
import { MotionSystem } from './MotionSystem';
import { SkipLink } from './SkipLink';
export function CmsPreview({ content, branch, children }) {
  return <Providers previewContent={content}>
    <aside className="cms-preview-notice" lang="fr"><span>Aperçu français · {branch} · Ces modifications ne sont pas encore publiées.</span><a href="/keystatic">Retour à l’éditeur</a></aside>
    <SkipLink /><Header /><MotionSystem /><main id="main-content" tabIndex={-1}>{children}</main><Footer />
  </Providers>;
}
