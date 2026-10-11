'use client';
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import fr from '@/content/global/fr.json';
import { ENABLED_LANGS } from '@/lib/config';

// Content lives in content/global/*.json.
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

export function Providers({ children }) {
  const [lang, setLangState] = useState('fr'); // French-first; persisted choice loads after mount
  const [t, setT] = useState(fr); // always starts populated — never renders with missing content

  const request = useRef(0);
  const [languageError, setLanguageError] = useState(false);
  const setLang = useCallback(async (next) => {
    if (!LOADERS[next]) return;
    const ticket = ++request.current;
    setLanguageError(false);
    try {
      const content = await LOADERS[next]();
      if (ticket !== request.current) return;
      setT(content);
      setLangState(next);
      try { localStorage.setItem(LANG_KEY, next); } catch {}
    } catch {
      if (ticket === request.current) setLanguageError(true);
    }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved && saved !== 'fr') setLang(saved);
    } catch {}
    return () => { request.current++; };
  }, [setLang]);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  // The brand direction is fixed to "essentia" for the live site.
  const brand = t.brand.essentia;
  return (
    <AppContext.Provider value={{ lang, setLang, t, brand }}>
      {children}
      {languageError && <p role="alert" className="notice" lang="fr">Cette langue n’a pas pu être chargée. Veuillez réessayer.</p>}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
