'use client';
import { useEffect, useState } from 'react';
import { Providers } from './Providers';
import { Header } from './Header';
import { Footer } from './Footer';
import { MotionSystem } from './MotionSystem';
import { SkipLink } from './SkipLink';
import { mergePreview } from '@/cms/preview';
export function CmsPreview({ content, nonce, children }) {
  const [draft, setDraft] = useState(content);
  useEffect(() => {
    const receive = event => {
      if (window.parent === window || event.origin !== window.location.origin || ![window.parent, window.top].includes(event.source)) return;
      const data = event.data;
      if (data?.type !== 'essentia-cms-preview' || data.nonce !== nonce || !Object.hasOwn(content, data.section)) return;
      setDraft(mergePreview(content, { ...content, [data.section]: data.content }));
    };
    window.addEventListener('message', receive);
    if (window.parent !== window) {
      const ready = { type: 'essentia-cms-preview-ready', nonce };
      window.parent.postMessage(ready, window.location.origin);
      if (window.top !== window.parent) window.top.postMessage(ready, window.location.origin);
    }
    return () => window.removeEventListener('message', receive);
  }, [content, nonce]);
  return <Providers previewContent={draft}>
    <aside className="cms-preview-notice" lang="fr"><span>Aperçu français · Les modifications affichées ne sont pas encore publiées.</span></aside>
    <SkipLink /><Header /><MotionSystem /><main id="main-content" tabIndex={-1}>{children}</main><Footer />
  </Providers>;
}
