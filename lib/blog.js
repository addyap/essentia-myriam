// Reads the blog articles published through the CMS. Server-only: pages call
// this at build time, so publishing an article means a new deployment. The
// folder is spelled out in each call so the bundler ships only content/blog.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { normalizePost, byDate, SLUG } from './post.js';

export function readBlogFiles() {
  let names;
  try { names = readdirSync(join(process.cwd(), 'content', 'blog')); } catch { return []; }
  return names
    .filter((name) => name.endsWith('.json') && SLUG.test(name.slice(0, -5)))
    .map((name) => ({ slug: name.slice(0, -5), raw: readFileSync(join(process.cwd(), 'content', 'blog', name), 'utf8') }));
}

export function getPosts() {
  return readBlogFiles()
    .map(({ slug, raw }) => { try { return normalizePost(JSON.parse(raw), slug); } catch { return null; } })
    .filter(Boolean)
    .sort(byDate);
}

export const getPost = (slug) => (SLUG.test(slug) ? getPosts().find((post) => post.slug === slug) || null : null);
