import { makeRouteHandler } from '@keystatic/next/route-handler';
import config from '../../../../keystatic.config';
import { cmsEnvironment } from '../../../../cms/environment';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
async function handle(request) {
  const { local, configured } = cmsEnvironment();
  // Allow the official GitHub App setup wizard only on the developer's machine.
  const hostname = new URL(request.url).hostname;
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(hostname);
  const localSetup = process.env.NODE_ENV === 'development' && !process.env.VERCEL;
  if ((local || localSetup) && !loopback) return new Response('Forbidden', { status: 403 });
  if (!local && !configured && !localSetup) return Response.json({ error: 'L’accès à l’éditeur est en cours de configuration.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  const handlers = makeRouteHandler({ config });
  const response = await handlers[request.method](request);
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}
export const GET = handle;
export const POST = handle;
