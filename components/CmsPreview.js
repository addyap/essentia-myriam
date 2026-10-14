'use client';
import { useEffect, useState } from 'react';
import { Providers } from './Providers';
import { Header } from './Header';
import { Footer } from './Footer';
import { MotionSystem } from './MotionSystem';
import { SkipLink } from './SkipLink';
import { mergePreview } from '@/cms/preview';
import { ArticleView } from './Blog';
import { normalizePost } from '@/lib/post';

// Shown when the article labels are edited, before any real article is open.
const SAMPLE_ARTICLE = { slug: 'apercu', title: 'Titre de l’article', date: new Date().toISOString().slice(0, 10), summary: 'Le résumé de l’article apparaît ici.', image: '', imageAlt: '', body: 'Le texte de l’article apparaît ici.\n\n## Un intertitre\n\nUn paragraphe avec un mot en **gras**.' };

export function CmsPreview({ content, nonce, article = false, children }) {
  const [draft, setDraft] = useState(content);
  const [post, setPost] = useState(SAMPLE_ARTICLE);
  useEffect(() => {
    const receive = event => {
      if (window.parent === window || event.origin !== window.location.origin || ![window.parent, window.top].includes(event.source)) return;
      const data = event.data;
      if (data?.type !== 'essentia-cms-preview' || data.nonce !== nonce) return;
      if (article && data.section === 'posts') { setPost(normalizePost({ ...data.content, title: String(data.content?.title || '').trim() || SAMPLE_ARTICLE.title }, 'apercu')); return; }
      if (!Object.hasOwn(content, data.section)) return;
      setDraft(mergePreview(content, { ...content, [data.section]: data.content }));
    };
    window.addEventListener('message', receive);
    if (window.parent !== window) {
      const ready = { type: 'essentia-cms-preview-ready', nonce };
      window.parent.postMessage(ready, window.location.origin);
      if (window.top !== window.parent) window.top.postMessage(ready, window.location.origin);
    }
    return () => window.removeEventListener('message', receive);
  }, [content, nonce, article]);
  return <Providers previewContent={draft}>
    <aside className="cms-preview-notice" lang="fr"><span>Aperçu français · Les modifications affichées ne sont pas encore publiées.</span></aside>
    <SkipLink /><Header /><MotionSystem /><main id="main-content" tabIndex={-1}>{article ? <ArticleView post={post} /> : children}</main><Footer />
  </Providers>;
}
