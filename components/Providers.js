'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useTina } from 'tinacms/react';
import fr from '@/content/global/fr.json';
import { ENABLED_LANGS } from '@/lib/config';
import { CONTENT_QUERY } from '@/lib/tinaContentQuery';

// Content lives in content/global/*.json — editable through TinaCMS's visual
// admin at /admin (see tina/config.js), not just by hand-editing code.
// Only French is bundled synchronously (it's the SSR/first-paint default);
// other locales are fetched on demand so a visitor's browser never downloads
// content for languages they don't use.
const ALL_LOADERS = {
  fr: () => Promise.resolve(fr),
  en: () => import('@/content/global/en.json').then((m) => m.default),
  it: () => import('@/content/global/it.json').then((m) => m.default),
  es: () => import('@/content/global/es.json').then((m) => m.default),
};
// Only expose loaders for languages currently switched on (see lib/config.js)
// — a stale 'en'/'it'/'es' value in a returning visitor's localStorage must
// fall back to French rather than trying to load a disabled locale.
const LOADERS = Object.fromEntries(ENABLED_LANGS.map((l) => [l, ALL_LOADERS[l]]));

const AppContext = createContext(null);
const LANG_KEY = 'essentia-lang';

// Hoisted to module scope so these stay the exact same object reference on
// every render — useTina() watches `data`/`variables` identity in an effect,
// and a fresh `{...}` literal on every render defeats that memo and puts it
// in an infinite update loop (setData → re-render → new literal → setData…).
const TINA_VARIABLES = { relativePath: 'fr.json' };
const TINA_INITIAL_DATA = { content: fr };

export function Providers({ children }) {
  // useTina() is a no-op passthrough (returns `data` unchanged, no network
  // calls) for every normal visitor — it only becomes live/reactive inside
  // Tina's admin preview iframe, which posts updateData messages as Myriam
  // edits the form. This is what makes the French content update on screen
  // as she types, instead of only after she saves.
  const { data: tinaData } = useTina({
    query: CONTENT_QUERY,
    variables: TINA_VARIABLES,
    data: TINA_INITIAL_DATA,
  });
  const frContent = tinaData?.content ?? fr;

  const [lang, setLangState] = useState('fr'); // French-first; persisted choice loads after mount
  const [t, setT] = useState(fr); // always starts populated — never renders with missing content

  useEffect(() => {
    let cancelled = false;
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved && saved !== 'fr' && LOADERS[saved]) {
        LOADERS[saved]().then((content) => {
          if (!cancelled) {
            setT(content);
            setLangState(saved);
          }
        });
      }
    } catch {
      // localStorage unavailable (private browsing, sandboxed iframe, etc.) —
      // fall back to the in-memory French default rather than crashing the app.
    }
    return () => {
      cancelled = true;
    };
  }, []);

  // Keeps `t` in sync with live Tina edits whenever French is the active
  // language (the only case right now — see ENABLED_LANGS).
  useEffect(() => {
    if (lang === 'fr') setT(frContent);
  }, [frContent, lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l) => {
    if (l === lang) return;
    if (l === 'fr') {
      // French is always already loaded (and kept live via the effect above)
      // — no need to go through the async loader for it.
      setT(frContent);
      setLangState('fr');
      try {
        localStorage.setItem(LANG_KEY, 'fr');
      } catch {
        // Non-fatal: language just won't persist across sessions.
      }
      return;
    }
    // Only swap lang + content together once the new locale has actually
    // loaded, so the UI never flashes missing/undefined strings mid-switch.
    LOADERS[l]().then((content) => {
      setT(content);
      setLangState(l);
      try {
        localStorage.setItem(LANG_KEY, l);
      } catch {
        // Non-fatal: language just won't persist across sessions.
      }
    });
  };

  // The brand direction is fixed to "essentia" for the live site.
  const brand = t.brand.essentia;
  return (
    <AppContext.Provider value={{ lang, setLang, t, brand }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
