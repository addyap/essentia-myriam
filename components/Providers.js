'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { T } from '@/lib/content';

const AppContext = createContext(null);
const LANG_KEY = 'essentia-lang';

export function Providers({ children }) {
  const [lang, setLangState] = useState('fr'); // French-first; persisted choice loads after mount

  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && T[saved]) setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l) => {
    setLangState(l);
    localStorage.setItem(LANG_KEY, l);
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
