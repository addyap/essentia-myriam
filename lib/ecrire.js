// Pure helpers for Myriam's private writing page (/ecrire). Nothing here
// touches the page or the network, so it can be tested on its own.

export const STORAGE_KEY = 'essentia_ecrire_v1';
export const SETTINGS_KEY = 'essentia_ecrire_settings';
export const DAILY_KEY = 'essentia_ecrire_daily';

export const THEMES = {
  essentia: 'Essentia',
  sauge: 'Sauge',
  serenite: 'Sérénité',
  nuit: 'Nuit',
};
export const FONTS = {
  didot: 'Didot (élégant)',
  mulish: 'Mulish (moderne)',
  georgia: 'Georgia (classique)',
  mono: 'Machine à écrire',
};
export const SIZES = { s: 'Petit', m: 'Moyen', l: 'Grand' };
export const DEFAULT_SETTINGS = { theme: 'essentia', font: 'didot', size: 'm', goal: 500 };

export const PROMPTS = [
  'Quel souvenir vous a appris quelque chose de la sérénité ?',
  'Racontez un moment où un choix audacieux a changé votre chemin.',
  'Écrivez une lettre à la personne que vous étiez il y a dix ans.',
  'Quelles sont trois choses simples qui vous apportent une joie profonde aujourd’hui ?',
  'Imaginez un dialogue entre la voix de vos doutes et celle de votre sagesse.',
  'Qu’est-ce que vous aimeriez que l’on comprenne de votre métier ?',
  'Décrivez un lieu où vous vous sentez pleinement vous-même.',
  'Quelle question une personne accompagnée vous a-t-elle posée, et que vous gardez en tête ?',
];

const MAX_TEXT = 2_000_000;

export function newId(prefix = 'd') {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${random}`;
}

export function countWords(text) {
  const trimmed = String(text || '').trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function todayKey(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Words written today = total now minus the total when the day started.
export function dailyProgress(daily, total, date = new Date()) {
  const key = todayKey(date);
  const next = daily && daily.date === key && Number.isFinite(daily.baseline) ? daily : { date: key, baseline: total };
  return { daily: next, written: Math.max(0, total - next.baseline) };
}

export function isWebLink(value) {
  return /^https?:\/\/[^\s]+$/i.test(String(value || '').trim());
}

export function safeFileName(title, fallback = 'texte') {
  const name = String(title || '').normalize('NFKC').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
  return name || fallback;
}

export function readSettings(raw) {
  const value = raw && typeof raw === 'object' ? raw : {};
  return {
    theme: Object.hasOwn(THEMES, value.theme) ? value.theme : DEFAULT_SETTINGS.theme,
    font: Object.hasOwn(FONTS, value.font) ? value.font : DEFAULT_SETTINGS.font,
    size: Object.hasOwn(SIZES, value.size) ? value.size : DEFAULT_SETTINGS.size,
    goal: Number.isInteger(value.goal) && value.goal >= 50 && value.goal <= 20000 ? value.goal : DEFAULT_SETTINGS.goal,
  };
}

const str = (value, max) => (typeof value === 'string' ? value.slice(0, max) : '');

function readSource(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const type = ['image', 'text', 'note'].includes(raw.type) ? raw.type : null;
  if (!type) return null;
  const data = str(raw.data, MAX_TEXT);
  // Only photos the page itself made are kept: never another kind of address.
  if (type === 'image' && !/^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(data)) return null;
  return { id: str(raw.id, 60) || newId('s'), type, name: str(raw.name, 200) || 'Source', data };
}

// Reads a library from storage or from a backup file. Returns null when the
// value is not a library at all, so a bad file never replaces real texts.
export function readLibrary(raw) {
  const list = Array.isArray(raw) ? raw : raw && Array.isArray(raw.docs) ? raw.docs : null;
  if (!list) return null;
  const docs = list.filter((doc) => doc && typeof doc === 'object').map((doc) => ({
    id: str(doc.id, 60) || newId(),
    title: str(doc.title, 300),
    // Older Gemini backups called the text "content".
    html: str(doc.html ?? doc.content, MAX_TEXT),
    words: Number.isInteger(doc.words) && doc.words >= 0 ? doc.words : null,
    updatedAt: Number.isFinite(doc.updatedAt) ? doc.updatedAt : Date.now(),
    sources: Array.isArray(doc.sources) ? doc.sources.map(readSource).filter(Boolean) : [],
  }));
  const activeId = raw && typeof raw.activeId === 'string' && docs.some((d) => d.id === raw.activeId) ? raw.activeId : docs[0]?.id ?? null;
  return { docs, activeId };
}

// Adds backed-up texts beside the current ones; a text with the same id is
// kept twice rather than overwritten, so nothing is ever lost on import.
export function mergeLibraries(current, incoming) {
  const ids = new Set(current.map((d) => d.id));
  const added = incoming.map((doc) => (ids.has(doc.id) ? { ...doc, id: newId(), title: `${doc.title || 'Sans titre'} (copie)` } : doc));
  return [...added, ...current];
}

// ---- Transfer links: the text travels inside the link itself (after the #,
// which browsers never send to a server). Compressed to keep links short.

const toBase64Url = (bytes) => {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromBase64Url = (text) => {
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
};
const pipe = async (bytes, stream) => new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());

export async function encodeShare({ title, html }) {
  const bytes = new TextEncoder().encode(JSON.stringify({ v: 1, t: title || '', h: html || '' }));
  return toBase64Url(await pipe(bytes, new CompressionStream('deflate-raw')));
}

export async function decodeShare(code) {
  if (typeof code !== 'string' || !/^[\w-]{4,3000000}$/.test(code)) return null;
  try {
    const bytes = await pipe(fromBase64Url(code), new DecompressionStream('deflate-raw'));
    if (bytes.length > MAX_TEXT) return null;
    const value = JSON.parse(new TextDecoder().decode(bytes));
    if (!value || value.v !== 1 || typeof value.t !== 'string' || typeof value.h !== 'string') return null;
    return { title: value.t.slice(0, 300), html: value.h };
  } catch {
    return null;
  }
}
