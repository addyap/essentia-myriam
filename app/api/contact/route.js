// Receives the Contact page form and forwards it to Myriam through Resend.
// Relative imports keep this route loadable by the node:test suite.
import { validateContact, composeEmail, composeConfirmation, CONTACT_FROM, RECIPIENT } from '../../../lib/contact-form.js';
import { ENABLED_LANGS } from '../../../lib/config.js';
import contact from '../../../content/fr/contact.json' with { type: 'json' };
import en from '../../../content/global/en.json' with { type: 'json' };
import it from '../../../content/global/it.json' with { type: 'json' };
import es from '../../../content/global/es.json' with { type: 'json' };

const FORM_TEXT = { fr: contact.form, en: en.contact.form, it: it.contact.form, es: es.contact.form };

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
  const from = process.env.CONTACT_FROM || CONTACT_FROM;
  const send = (email) => fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(email),
  });

  try {
    const response = await send(composeEmail(result.data, { from, to: RECIPIENT, lang, wording: contact.email }));
    // Log Resend's reason, never the visitor's message.
    if (!response.ok) {
      console.error('Resend rejected the contact email', response.status, await response.text().catch(() => ''));
      return reply({ error: 'send' }, 502);
    }
  } catch (error) {
    console.error('Resend request failed', error?.message);
    return reply({ error: 'send' }, 502);
  }

  // Myriam has the message; the visitor's acknowledgement is a courtesy, so a
  // failure here is logged and reported but does not undo the success.
  const text = FORM_TEXT[lang];
  let confirmed = false;
  try {
    const response = await send(composeConfirmation(result.data, { from, replyTo: RECIPIENT, senderName: contact.email?.senderName, lang, title: text.successTitle, subject: text.confirmSubject, body: text.confirmBody, notice: text.confirmNotice }));
    confirmed = response.ok;
    if (!response.ok) console.error('Resend rejected the confirmation email', response.status, await response.text().catch(() => ''));
  } catch (error) {
    console.error('Confirmation request failed', error?.message);
  }
  return reply({ ok: true, confirmed });
}
