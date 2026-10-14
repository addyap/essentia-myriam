// Search and sharing text for each page, edited by Myriam in the CMS
// ("Référencement") and stored in content/fr/seo.json. Server-only.
import seo from '@/content/fr/seo.json';
import { ROUTES } from '@/lib/routes';

export { seo };
const SHARE_IMAGE = { url: '/og-image.jpg', width: 1200, height: 630 };

export function pageMetadata(key, extra = {}) {
  const { title, description } = seo[key];
  const url = ROUTES[key];
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', images: [SHARE_IMAGE] },
    twitter: { card: 'summary_large_image', title, description, images: [SHARE_IMAGE.url] },
    ...extra,
  };
}
