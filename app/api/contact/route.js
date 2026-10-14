// Receives the Contact page form and forwards it to Myriam through Resend.
// Relative imports keep this route loadable by the node:test suite.
import { validateContact, composeEmail, CONTACT_FROM, CONTACT_TO } from '../../../lib/contact-form.js';
import { ENABLED_LANGS } from '../../../lib/config.js';

export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' };
const reply = (body, status = 200) => Response.json(body, { status, headers });

// Best-effort throttle per server instance: enough to blunt a burst from one
// address without storing anything about visitors beyond a few minutes.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recent = new Map();
function throttled(address, now = Date.now()) {
  for (const [key, times] of recent) if (times.every((time) => now - time > WINDOW_MS)) recent.delete(key);
  const times = (recent.get(address) || []).filter((time) => now - time <= WINDOW_MS);
  times.push(now);
  recent.set(address, times);
  return times.length > MAX_PER_WINDOW;
}

export async function POST(request) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return reply({ error: 'unavailable' }, 503);

  let body;
  try { body = await request.json(); } catch { return reply({ error: 'invalid' }, 400); }
  if (!body || typeof body !== 'object') return reply({ error: 'invalid' }, 400);

  // A filled hidden field, or a form completed in under three seconds, is a bot:
  // answer as if sent so it learns nothing, and send nothing. The browser
  // measures the duration itself, so visitors' clock settings cannot matter.
  const elapsed = Number(body.elapsedMs);
  if (body.website || (Number.isFinite(elapsed) && elapsed < 3000)) return reply({ ok: true });

  const address = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  if (throttled(address)) return reply({ error: 'busy' }, 429);

  const result = validateContact(body);
  if (!result.ok) return reply({ error: 'invalid', fields: Object.keys(result.errors) }, 400);

  const lang = ENABLED_LANGS.includes(body.lang) ? body.lang : 'fr';
  const email = composeEmail(result.data, { from: process.env.CONTACT_FROM || CONTACT_FROM, to: CONTACT_TO, lang });
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(email),
    });
    // Log Resend's reason, never the visitor's message.
    if (!response.ok) {
      console.error('Resend rejected the contact email', response.status, await response.text().catch(() => ''));
      return reply({ error: 'send' }, 502);
    }
  } catch (error) {
    console.error('Resend request failed', error?.message);
    return reply({ error: 'send' }, 502);
  }
  return reply({ ok: true });
}
