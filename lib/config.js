// Single source of truth for the deployed site origin — used by metadata,
// sitemap.xml, and robots.txt so they never drift out of sync.
export const SITE_URL = 'https://www.essentiademdb.com';

// Languages currently offered to visitors. Content for 'en'/'it'/'es' still
// lives in content/global/*.json and stays fully translated — it's just not
// reachable from the UI for the moment (Myriam only needs French editable
// right now). To bring a language back, add its code here; no content is lost
// by removing one.
export const ENABLED_LANGS = ['fr'];
