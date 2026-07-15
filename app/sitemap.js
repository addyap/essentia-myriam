import { ROUTES } from '@/lib/routes';

const BASE_URL = 'https://essentia.example.com';

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
