// Single source of truth for the deployed site origin — used by metadata,
// sitemap.xml, and robots.txt so they never drift out of sync.
export const SITE_URL = 'https://www.essentiademdb.com';

// Languages offered to visitors, backed by content/global/*.json.
export const ENABLED_LANGS = ['fr', 'en', 'it', 'es'];

// Test mode: form emails go only to Antony and the WhatsApp links open Antony's
// WhatsApp, so testing never reaches Myriam. Set to false to send everything to her.
export const TEST_MODE = true;
