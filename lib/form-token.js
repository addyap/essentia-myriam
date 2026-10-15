// Signed form tokens for the contact form. Server-only: the signing secret
// never reaches the browser. A token records when the form was opened, so the
// server itself (not the visitor's browser) decides whether it was filled in
// too fast to be human, and a submission without a genuine token is a bot that
// never loaded the page.
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const MIN_AGE_MS = 3000;
export const MAX_AGE_MS = 24 * 60 * 60 * 1000;

// FORM_SECRET is a random value set in Vercel. Until it is, a secret is derived
// from the Resend key, which the form already needs, so it keeps working.
export function formSecret(env = process.env) {
  if (env.FORM_SECRET && env.FORM_SECRET.length >= 32) return env.FORM_SECRET;
  if (env.RESEND_API_KEY) return createHmac('sha256', env.RESEND_API_KEY).update('essentia-contact-form-token').digest('base64url');
  return null;
}

const sign = (secret, payload) => createHmac('sha256', secret).update(payload).digest('base64url');

export function issueToken(secret, now = Date.now()) {
  const payload = `${now}.${randomBytes(16).toString('base64url')}`;
  return `${payload}.${sign(secret, payload)}`;
}

// Returns { ok: true, nonce } or { ok: false, reason: 'forged' | 'early' | 'expired' }.
export function checkToken(token, secret, now = Date.now()) {
  const parts = typeof token === 'string' && token.length < 200 ? token.split('.') : [];
  if (parts.length !== 3 || !/^\d{13}$/.test(parts[0])) return { ok: false, reason: 'forged' };
  const expected = Buffer.from(sign(secret, `${parts[0]}.${parts[1]}`));
  const given = Buffer.from(parts[2]);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return { ok: false, reason: 'forged' };
  const age = now - Number(parts[0]);
  if (age < MIN_AGE_MS) return { ok: false, reason: 'early' };
  if (age > MAX_AGE_MS) return { ok: false, reason: 'expired' };
  return { ok: true, nonce: parts[1] };
}
