// Receives the Contact page form and forwards it to Myriam through Resend.
// Relative imports keep this route loadable by the node:test suite.
import { validateContact, composeEmail, composeConfirmation, CONTACT_FROM, CONTACT_TO } from '../../../lib/contact-form.js';
import { ENABLED_LANGS } from '../../../lib/config.js';
import { countLinks } from '../../../lib/contact-rules.js';
import { formSecret, checkToken } from '../../../lib/form-token.js';
import { messageDigest, checkProof } from '../../../lib/proof.js';
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

// A token is spent once its message is accepted, so it cannot be replayed.
const spent = new Map();
function spend(nonce, now = Date.now()) {
  for (const [key, time] of spent) if (now - time > 24 * 60 * 60 * 1000) spent.delete(key);
  if (spent.has(nonce)) return false;
  spent.set(nonce, now);
  return true;
}

// The acknowledgement goes to whatever address was typed, so it is rationed:
// one per address per day, and no more than 20 an hour in all. Myriam still
// receives every message. Like the throttle above, these counts live in one
// server instance's memory: a strong brake, not an absolute guarantee.
const DAY_MS = 24 * 60 * 60 * 1000, HOUR_MS = 60 * 60 * 1000, CONFIRMATIONS_PER_HOUR = 20;
const acknowledged = new Map();
let confirmationTimes = [];
function mayConfirm(email, now = Date.now()) {
  for (const [key, time] of acknowledged) if (now - time > DAY_MS) acknowledged.delete(key);
  confirmationTimes = confirmationTimes.filter((time) => now - time <= HOUR_MS);
  const key = email.toLowerCase();
  if (acknowledged.has(key) || confirmationTimes.length >= CONFIRMATIONS_PER_HOUR) return false;
  acknowledged.set(key, now); confirmationTimes.push(now);
  return true;
}

// Browsers say where a request comes from; a form posted from another site is refused.
function crossSite(request) {
  const site = request.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin') return true;
  const origin = request.headers.get('origin');
  if (!origin) return false;
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || new URL(request.url).host;
  try { return new URL(origin).host !== host; } catch { return true; }
}

export async function POST(request) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return reply({ error: 'unavailable' }, 503);

  if (crossSite(request)) return reply({ error: 'origin' }, 403);

  let body;
  try { body = await request.json(); } catch { return reply({ error: 'invalid' }, 400); }
  if (!body || typeof body !== 'object') return reply({ error: 'invalid' }, 400);

  // Bots are answered as if their message was sent, so they learn nothing, and
  // nothing is sent: a filled hidden field, a missing or forged token (the page
  // was never loaded), or a form completed within three seconds of opening.
  // The form only submits with a token, so visitors are never silently dropped.
  const silent = () => reply({ ok: true });
  if (body.website) return silent();
  const token = checkToken(body.token, formSecret());
  if (!token.ok && token.reason === 'expired') return reply({ error: 'expired' }, 409);
  if (!token.ok) return silent();

  const address = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  if (throttled(address)) return reply({ error: 'busy' }, 429);

  const result = validateContact(body);
  if (!result.ok) return reply({ error: 'invalid', fields: Object.keys(result.errors) }, 400);

  // The browser must have solved the puzzle for this exact message (lib/proof.js).
  if (!(await checkProof(token.nonce, await messageDigest(result.data), body.proof))) return silent();
  if (!spend(token.nonce)) return silent();

  const lang = ENABLED_LANGS.includes(body.lang) ? body.lang : 'fr';
  const from = process.env.CONTACT_FROM || CONTACT_FROM;
  const send = (email) => fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(email),
  });

  try {
    const response = await send(composeEmail(result.data, { from, to: CONTACT_TO, lang, wording: contact.email }));
    // Log Resend's reason, never the visitor's message.
    if (!response.ok) {
      console.error('Resend rejected the contact email', response.status, await response.text().catch(() => ''));
      spent.delete(token.nonce); // Nothing was delivered, so the visitor may retry.
      return reply({ error: 'send' }, 502);
    }
  } catch (error) {
    console.error('Resend request failed', error?.message);
    spent.delete(token.nonce);
    return reply({ error: 'send' }, 502);
  }

  // Myriam has the message; the visitor's acknowledgement is a courtesy, so a
  // failure here is logged and reported but does not undo the success. A
  // message containing links gets none: that is how spam would use it.
  const text = FORM_TEXT[lang];
  let confirmed = false;
  if (countLinks(result.data.message) || !mayConfirm(result.data.email)) return reply({ ok: true, confirmed });
  try {
    const response = await send(composeConfirmation(result.data, { from, replyTo: CONTACT_TO, senderName: contact.email?.senderName, lang, title: text.successTitle, subject: text.confirmSubject, body: text.confirmBody, notice: text.confirmNotice }));
    confirmed = response.ok;
    if (!response.ok) console.error('Resend rejected the confirmation email', response.status, await response.text().catch(() => ''));
  } catch (error) {
    console.error('Confirmation request failed', error?.message);
  }
  return reply({ ok: true, confirmed });
}
