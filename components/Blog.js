'use client';
import Link from 'next/link';
import { useApp } from './Providers';
import { PageHeader } from './PageHeader';
import { LogoMark } from './LogoMark';
import { Markdown } from './Markdown';
import { ROUTES, articlePath } from '@/lib/routes';
import { readingMinutes } from '@/lib/markdown';

const LOCALES = { fr: 'fr-FR', en: 'en-GB', it: 'it-IT', es: 'es-ES' };
function formatDate(date, lang) {
  if (!date) return '';
  const value = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(value.getTime()) ? '' : new Intl.DateTimeFormat(LOCALES[lang] || 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(value);
}

function PostMeta({ post }) {
  const { t, lang } = useApp();
  const date = formatDate(post.date, lang);
  return <p className="post-meta">
    {date ? <time dateTime={post.date}>{date}</time> : null}
    {date ? <span aria-hidden="true"> · </span> : null}
    <span>{t.blog.readingTime.replace('{n}', post.minutes ?? readingMinutes(post.body))}</span>
  </p>;
}

// Covers are uploaded through the CMS at unknown sizes, so they are cropped
// to a fixed frame by CSS rather than sized by next/image.
const Cover = ({ src, alt, eager = false }) => <div className="post-cover"><img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" /></div>;

function PostCard({ post }) {
  const { t } = useApp();
  const href = articlePath(post.slug);
  return <article className="post-card">
    {/* Articles without a photo get the gold monogram, so the cards stay aligned. */}
    <Link href={href} tabIndex={-1} aria-hidden="true">{post.image ? <Cover src={post.image} alt="" /> : <div className="post-cover post-cover--mark"><LogoMark /></div>}</Link>
    <div className="post-card-body" lang="fr">
      <PostMeta post={post} />
      <h3><Link href={href}>{post.title}</Link></h3>
      {post.summary ? <p>{post.summary}</p> : null}
    </div>
    <Link className="editorial-link" href={href}>{t.blog.readMore}<span aria-hidden="true">↗</span></Link>
  </article>;
}

export function ResourcesView({ posts }) {
  const { t } = useApp();
  const r = t.resources;
  return <>
    <section className="page-hero"><PageHeader eyebrow={r.eyebrow} title={r.title} lead={r.lead} scene="resources" /></section>
    <section className="section-soft" aria-labelledby="blog-title">
      <div className="wrap">
        <div className="section-intro">
          <h2 id="blog-title" className="big">{r.blogTitle}</h2>
          <p className="lead">{r.blogLead}</p>
        </div>
        {posts.length
          ? <div className="post-grid">{posts.map((post) => <PostCard key={post.slug} post={post} />)}</div>
          : <p className="notice" role="status">{r.empty}</p>}
      </div>
    </section>
    <section aria-labelledby="podcast-title">
      <div className="wrap">
        <div className="band podcast-band">
          <div className="mark-lg"><LogoMark /></div>
          <span className="soon-badge">{t.podcast.badge}</span>
          <h2 id="podcast-title">{r.podcastTitle}</h2>
          <p>{r.podcastLead}</p>
          <Link className="btn btn-gold" href={ROUTES.podcast}>{r.podcastCta}</Link>
        </div>
      </div>
    </section>
  </>;
}

export function ArticleView({ post }) {
  const { t, lang } = useApp();
  return <>
    <article className="article-page">
      <div className="wrap article-wrap">
        <Link className="article-back" href={ROUTES.resources}><span aria-hidden="true">←</span> {t.blog.back}</Link>
        <header className="article-header" lang="fr">
          <span className="eyebrow">{t.resources.blogTitle}</span>
          <h1 className="big">{post.title}</h1>
          <PostMeta post={post} />
          {post.summary ? <p className="lead">{post.summary}</p> : null}
        </header>
        {lang !== 'fr' ? <p className="notice" role="status">{t.blog.frenchOnly}</p> : null}
        {post.image ? <Cover src={post.image} alt={post.imageAlt} eager /> : null}
        <div className="article-body" lang="fr"><Markdown source={post.body} /></div>
      </div>
    </article>
    <section>
      <div className="wrap">
        <div className="band">
          <div className="mark-lg"><LogoMark /></div>
          <h2>{t.blog.ctaTitle}</h2>
          <p>{t.blog.ctaLead}</p>
          <Link className="btn btn-gold" href={ROUTES.booking}>{t.ui.book}</Link>
        </div>
      </div>
    </section>
  </>;
}

export function PodcastView() {
  const { t } = useApp();
  const p = t.podcast;
  return <>
    <section className="page-hero"><PageHeader eyebrow={p.eyebrow} title={p.title} lead={p.lead} scene="resources" /></section>
    <section className="section-soft">
      <div className="wrap">
        <div className="podcast-soon">
          <span className="soon-badge">{p.badge}</span>
          <h2>{p.comingTitle}</h2>
          <p className="prose">{p.comingBody}</p>
          <Link className="btn btn-gold" href={ROUTES.resources}>{p.blogCta}</Link>
        </div>
      </div>
    </section>
  </>;
}
