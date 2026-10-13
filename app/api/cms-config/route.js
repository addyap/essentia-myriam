import definitions from '@/cms/schema.json';
import french from '@/lib/french-content';
import legalDetails from '@/content/launch-placeholders.json';
import { cmsEnvironment } from '@/cms/environment';
import { makeCmsConfig } from '@/cms/config';
export const dynamic = 'force-dynamic';
export async function GET(request) {
  const url = new URL(request.url);
  const env = cmsEnvironment();
  // The test backend operates only on public content in browser memory; it has no gateway or credentials.
  const demo = url.searchParams.get('demo') === '1';
  const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' };
  if (!demo && !env.configured) return Response.json({ error: 'Votre accès sécurisé est en cours de préparation. Antony doit terminer la connexion.' }, { status: 503, headers });
  const config = makeCmsConfig(definitions, french, legalDetails, env.siteId, demo);
  const demoFiles = demo ? Object.fromEntries(config.collections.flatMap(collection => collection.files.map(file => [file.file, JSON.stringify(file.name === 'legalDetails' ? legalDetails : french[file.name], null, 2)]))) : undefined;
  return Response.json({ config, demoFiles }, { headers });
}
