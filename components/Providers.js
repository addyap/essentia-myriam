'use client';
import { createContext, useContext, useState } from 'react';
import { T } from '@/lib/content';

const AppContext = createContext(null);

export function Providers({ children }) {
  const [lang, setLang] = useState('fr'); // French-first
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
