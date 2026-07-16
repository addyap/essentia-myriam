import { ROUTES } from '@/lib/routes';
import { SITE_URL as BASE_URL } from '@/lib/config';

export default function sitemap() {
  const paths = Object.values(ROUTES);
  const lastModified = new Date();
  return paths.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }));
}
