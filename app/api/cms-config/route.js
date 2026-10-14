import definitions from '@/cms/schema.json';
import french from '@/lib/french-content';
import legalDetails from '@/content/launch-placeholders.json';
import { cmsEnvironment } from '@/cms/environment';
import { makeCmsConfig, BLOG_FOLDER } from '@/cms/config';
import { readBlogFiles } from '@/lib/blog';
export const dynamic = 'force-dynamic';

// The demonstration starts with the published articles plus one example, so
// Myriam can see how an article is laid out before writing her own.
const DEMO_ARTICLE = {
  title: 'Exemple : prendre le temps de souffler',
  date: '2026-01-15',
  summary: 'Cet article d’exemple n’existe que dans la démonstration. Modifiez-le librement pour découvrir l’éditeur.',
  image: '', imageAlt: '',
  body: 'Voici un **paragraphe** avec un mot en *italique* et un [lien vers la page contact](/contact).\n\n## Un intertitre\n\nLes intertitres structurent l’article.\n\n> Une citation mise en valeur.\n\n* Un premier point\n* Un second point',
};
function blogFiles() {
  const files = Object.fromEntries(readBlogFiles().map(({ slug, raw }) => [`${BLOG_FOLDER}/${slug}.json`, raw]));
  files[`${BLOG_FOLDER}/exemple-prendre-le-temps-de-souffler.json`] = JSON.stringify(DEMO_ARTICLE, null, 2);
  return files;
}

export async function GET(request) {
  const url = new URL(request.url);
  const env = cmsEnvironment();
  // The test backend operates only on public content in browser memory; it has no gateway or credentials.
  const demo = url.searchParams.get('demo') === '1';
  const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' };
  if (!demo && !env.configured) return Response.json({ error: 'Votre accès sécurisé est en cours de préparation. Antony doit terminer la connexion.' }, { status: 503, headers });
  const config = makeCmsConfig(definitions, french, legalDetails, env.siteId, demo);
  const demoFiles = demo ? {
    ...Object.fromEntries(config.collections.flatMap(collection => (collection.files || []).map(file => [file.file, JSON.stringify(file.name === 'legalDetails' ? legalDetails : french[file.name], null, 2)]))),
    ...blogFiles(),
  } : undefined;
  return Response.json({ config, demoFiles }, { headers });
}
