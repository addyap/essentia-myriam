// Passphrase sync for /ecrire. Runs in the browser (and in tests); uses only
// the built-in Web Crypto, so the site's server never sees the passphrase or
// a readable text.
//
// One passphrase gives two unrelated secrets:
//   - a key that locks the texts on the device, before they leave it;
//   - an access secret the server uses to find and guard that locked copy.
// The server stores the locked copy under a fingerprint of the access secret
// and cannot open it: it never receives the key.

export const SYNC_KEY = 'essentia_ecrire_sync';
export const MAX_VAULT_BYTES = 4_000_000; // under the hosting limit for one request
const SALT = 'essentiademdb.com/ecrire/sync/v1';
const ITERATIONS = 600_000;
const FORMAT = 1;
const TOMBSTONE_DAYS = 120;

const enc = new TextEncoder();
const dec = new TextDecoder();

export const toB64 = (bytes) => {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
export const fromB64 = (text) => Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

// Phones capitalise the first letter and add stray spaces; neither should
// make the same phrase open a different notebook.
export function normalizePhrase(phrase) {
  return String(phrase || '').normalize('NFC').toLocaleLowerCase('fr').replace(/\s+/g, ' ').trim();
}

export function phraseProblem(phrase) {
  const text = normalizePhrase(phrase);
  if (text.length < 20) return 'Au moins 20 caractères.';
  if (text.split(' ').length < 4) return 'Au moins 4 mots.';
  return null;
}

export async function deriveSecrets(phrase) {
  const material = await crypto.subtle.importKey('raw', enc.encode(normalizePhrase(phrase)), 'PBKDF2', false, ['deriveBits']);
  const bits = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(SALT), iterations: ITERATIONS }, material, 512));
  return { key: toB64(bits.slice(0, 32)), access: toB64(bits.slice(32)) };
}

const pipe = async (bytes, stream) => new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());
const aesKey = (key, use) => crypto.subtle.importKey('raw', fromB64(key), 'AES-GCM', false, [use]);

// Locked format: [format byte][12-byte nonce][AES-GCM ciphertext of deflated JSON]
export async function lockVault(vault, key) {
  const packed = await pipe(enc.encode(JSON.stringify(vault)), new CompressionStream('deflate-raw'));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const sealed = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await aesKey(key, 'encrypt'), packed));
  const out = new Uint8Array(1 + iv.length + sealed.length);
  out[0] = FORMAT;
  out.set(iv, 1);
  out.set(sealed, 1 + iv.length);
  return out;
}

export async function unlockVault(bytes, key) {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (data[0] !== FORMAT || data.length < 30) throw new Error('format');
  const opened = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: data.subarray(1, 13) }, await aesKey(key, 'decrypt'), data.subarray(13));
  return JSON.parse(dec.decode(await pipe(new Uint8Array(opened), new DecompressionStream('deflate-raw'))));
}

// ---- Merging two copies of the notebook.
// Each text keeps its most recently edited version; a deleted text stays
// deleted unless it was edited after the deletion.

export function cleanTombstones(deleted, now = Date.now()) {
  const out = {};
  for (const [id, time] of Object.entries(deleted && typeof deleted === 'object' ? deleted : {})) {
    if (typeof id === 'string' && id.length <= 60 && Number.isFinite(time) && now - time < TOMBSTONE_DAYS * 864e5) out[id] = time;
  }
  return out;
}

export function mergeVaults(local, remote, now = Date.now()) {
  const deleted = cleanTombstones({ ...remote.deleted }, now);
  for (const [id, time] of Object.entries(cleanTombstones(local.deleted, now))) deleted[id] = Math.max(time, deleted[id] || 0);
  const byId = new Map();
  for (const doc of [...remote.docs, ...local.docs]) {
    const seen = byId.get(doc.id);
    if (!seen || doc.updatedAt > seen.updatedAt) byId.set(doc.id, doc);
  }
  const docs = [...byId.values()].filter((doc) => !(deleted[doc.id] >= doc.updatedAt));
  return { docs, deleted };
}

// A short summary of a notebook's state, to tell whether two copies differ.
export function vaultStamp({ docs, deleted }) {
  const d = docs.map((doc) => `${doc.id}:${doc.updatedAt}`).sort().join(',');
  const t = Object.keys(deleted || {}).sort().join(',');
  return `${d}|${t}`;
}
