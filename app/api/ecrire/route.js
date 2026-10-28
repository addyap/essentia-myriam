// Stores and returns Myriam's locked notebook for /ecrire sync. Everything
// arriving here is already encrypted on her device; this route only checks
// who may read or replace a copy, never what it says.
// Relative imports keep this route loadable by the node:test suite.
import { createHash } from 'node:crypto';
import { vaultStore, Conflict } from '../../../lib/ecrire-store.js';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 4_000_000;
// Only Myriam uses this, from a few devices. A small cap on notebooks stops
// anyone who finds the page from filling the storage with copies of their own.
const MAX_VAULTS = 5;

const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' };
const reply = (body, status = 200, extra = {}) => Response.json(body, { status, headers: { ...headers, ...extra } });

// Best-effort throttle per server instance, as on the contact form.
const WINDOW_MS = 10 * 60 * 1000;
const recent = new Map();
function throttled(address, limit, now = Date.now()) {
  for (const [key, times] of recent) if (times.every((time) => now - time > WINDOW_MS)) recent.delete(key);
  const times = (recent.get(address) || []).filter((time) => now - time <= WINDOW_MS);
  times.push(now);
  recent.set(address, times);
  return times.length > limit;
}

function crossSite(request) {
  const site = request.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin') return true;
  const origin = request.headers.get('origin');
  if (!origin) return false;
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || new URL(request.url).host;
  try { return new URL(origin).host !== host; } catch { return true; }
}

// The access secret (derived from the passphrase) is never stored: the copy
// is filed under its fingerprint, so only the passphrase leads back to it.
function vaultOf(request) {
  const access = request.headers.get('x-ecrire-access') || '';
  if (!/^[\w-]{43}$/.test(access)) return null;
  return createHash('sha256').update(`ecrire:${access}`).digest('hex');
}

function guard(request, limit) {
  if (crossSite(request)) return { error: reply({ error: 'origin' }, 403) };
  const address = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
  if (throttled(`${request.method}:${address}`, limit)) return { error: reply({ error: 'busy' }, 429) };
  const store = vaultStore();
  if (!store) return { error: reply({ error: 'unconfigured' }, 503) };
  const vault = vaultOf(request);
  if (!vault) return { error: reply({ error: 'invalid' }, 400) };
  return { store, vault };
}

export async function GET(request) {
  const { error, store, vault } = guard(request, 400);
  if (error) return error;
  try {
    const found = await store.read(vault, request.headers.get('x-ecrire-known') || undefined);
    if (!found) return reply({ error: 'none' }, 404);
    // Custom headers, not ETag/304, so no cache or proxy on the way can reinterpret them.
    if (found.unchanged) return new Response(null, { status: 204, headers: { ...headers, 'X-Ecrire-Version': found.etag } });
    return new Response(found.bytes, { status: 200, headers: { ...headers, 'X-Ecrire-Version': found.etag, 'Content-Type': 'application/octet-stream' } });
  } catch {
    return reply({ error: 'storage' }, 502);
  }
}

export async function PUT(request) {
  const { error, store, vault } = guard(request, 200);
  if (error) return error;
  if (Number(request.headers.get('content-length') || 0) > MAX_BYTES) return reply({ error: 'too-large' }, 413);
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.length > MAX_BYTES) return reply({ error: 'too-large' }, 413);
  if (bytes.length < 30 || bytes[0] !== 1) return reply({ error: 'invalid' }, 400);
  const etag = request.headers.get('x-ecrire-base') || undefined;
  try {
    if (!etag && (await store.count()) >= MAX_VAULTS) return reply({ error: 'full' }, 507);
    const saved = await store.write(vault, bytes, etag);
    return reply({ ok: true }, 200, { 'X-Ecrire-Version': saved });
  } catch (err) {
    if (err instanceof Conflict) return reply({ error: 'conflict' }, 409);
    return reply({ error: 'storage' }, 502);
  }
}
