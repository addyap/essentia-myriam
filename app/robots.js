const BASE_URL = 'https://essentia.example.com';

export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
