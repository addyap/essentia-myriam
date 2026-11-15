// Shape of a blog article as written by the CMS (content/blog/<slug>.json),
// shared by the server pages and the editor's live preview.
import { safeImage } from './markdown.js';

// An article published on another site links there instead of having its own page.
const EXTERNAL = /^https:\/\/[^\s/]+\.[^\s]+$/i;

export const SLUG = /^[a-z0-9](?:[a-z0-9._~-]*[a-z0-9])?$/i;
const DATE = /^\d{4}-\d{2}-\d{2}/;
const text = (value) => (typeof value === 'string' ? value.trim() : '');

export function normalizePost(data, slug = '') {
  if (!data || typeof data !== 'object') return null;
  const title = text(data.title);
  if (!title) return null;
  const date = DATE.test(text(data.date)) ? text(data.date).slice(0, 10) : '';
  const image = safeImage(text(data.image)) || '';
  const externalUrl = EXTERNAL.test(text(data.externalUrl)) ? text(data.externalUrl) : '';
  return { slug, title, date, summary: text(data.summary), image, imageAlt: image ? text(data.imageAlt) : '', body: typeof data.body === 'string' ? data.body : '', externalUrl };
}

// The site name shown on cards that lead elsewhere, e.g. "cap-coherence.fr".
export const externalSite = (url) => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } };

// Newest first; undated drafts last, then by title.
export const byDate = (a, b) => (b.date || '').localeCompare(a.date || '') || a.title.localeCompare(b.title, 'fr');
