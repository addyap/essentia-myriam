// Single source of truth for the deployed site origin — used by metadata,
// sitemap.xml, and robots.txt so they never drift out of sync.
export const SITE_URL = 'https://www.essentiademdb.com';

// Languages offered to visitors. Only French is editable through TinaCMS
// right now (see tina/config.js's `match` filter) — en/it/es are the
// last-translated static content from content/global/*.json.
export const ENABLED_LANGS = ['fr', 'en', 'it', 'es'];
