import { notFound } from 'next/navigation';
import { ArticleView } from '@/components/Blog';
import { getPosts, getPost } from '@/lib/blog';
import { articlePath } from '@/lib/routes';
import { SITE_URL } from '@/lib/config';

// Articles are built from content/blog at deployment; unknown slugs are 404s.
export const dynamicParams = false;
export function generateStaticParams() {
  return getPosts().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const post = getPost((await params).slug);
  if (!post) return {};
  const title = `${post.title} | Essentia de Myriam Diougoan Blanch`;
  const description = post.summary || 'Un article de Myriam Diougoan Blanch sur le blog d’Essentia.';
  const images = [post.image ? { url: post.image, alt: post.imageAlt } : { url: '/og-image.jpg', width: 1200, height: 630 }];
  return {
    title, description,
    alternates: { canonical: articlePath(post.slug) },
    openGraph: { title, description, url: articlePath(post.slug), type: 'article', locale: 'fr_FR', publishedTime: post.date || undefined, authors: ['Myriam Diougoan Blanch'], images },
    twitter: { card: 'summary_large_image', title, description, images: images.map((image) => image.url) },
  };
}

export default async function ArticlePage({ params }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary || undefined,
    datePublished: post.date || undefined,
    inLanguage: 'fr',
    url: `${SITE_URL}${articlePath(post.slug)}`,
    image: post.image ? new URL(post.image, SITE_URL).href : undefined,
    author: { '@type': 'Person', name: 'Myriam Diougoan Blanch' },
    publisher: { '@type': 'Organization', name: 'Essentia de Myriam Diougoan Blanch', url: SITE_URL },
  };
  return <>
    {/* Article text comes from the CMS, so "<" is escaped to keep it inside this script. */}
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    <ArticleView post={post} />
  </>;
}
