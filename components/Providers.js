'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { T } from '@/lib/content';

const AppContext = createContext(null);
const LANG_KEY = 'essentia-lang';

export function Providers({ children }) {
  const [lang, setLangState] = useState('fr'); // French-first; persisted choice loads after mount

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved && T[saved]) setLangState(saved);
    } catch {
      // localStorage unavailable (private browsing, sandboxed iframe, etc.) —
      // fall back to the in-memory French default rather than crashing the app.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      // Non-fatal: language just won't persist across sessions.
    }
  };

  const t = T[lang];
  // The brand direction is fixed to "essentia" for the live site.
  const brand = t.brand.essentia;
  return (
    <AppContext.Provider value={{ lang, setLang, t, brand }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
