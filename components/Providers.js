'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { fr } from '@/lib/content/fr';

// Only French is bundled synchronously (it's the SSR/first-paint default);
// the other three locales are fetched on demand so a visitor's browser never
// downloads content for languages they don't use.
const LOADERS = {
  fr: () => Promise.resolve(fr),
  en: () => import('@/lib/content/en').then((m) => m.en),
  it: () => import('@/lib/content/it').then((m) => m.it),
  es: () => import('@/lib/content/es').then((m) => m.es),
};

const AppContext = createContext(null);
const LANG_KEY = 'essentia-lang';

export function Providers({ children }) {
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

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l) => {
    if (l === lang) return;
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
