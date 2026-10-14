import { ROUTES } from '@/lib/routes';
import { SITE_URL as BASE_URL } from '@/lib/config';
import { getPosts } from '@/lib/blog';
import { articlePath } from '@/lib/routes';

// The podcast page stays out until its first episode is published.
export default function sitemap() {
  const paths = Object.values(ROUTES).filter(path => path !== ROUTES.podcast);
  const pages = paths.map((path) => ({
    url: `${BASE_URL}${path}`,
    changeFrequency: path === ROUTES.resources ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }));
  const articles = getPosts().map((post) => ({
    url: `${BASE_URL}${articlePath(post.slug)}`,
    ...(post.date ? { lastModified: post.date } : {}),
    changeFrequency: 'yearly',
    priority: 0.6,
  }));
  return [...pages, ...articles];
}
