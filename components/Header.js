'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from './Providers';
import { Logo } from './Logo';
import { Icon } from './Icon';
import { ROUTES, NAV } from '@/lib/routes';

const LANGS = ['fr', 'en', 'it', 'es'];

export function Header() {
  const { lang, setLang, t, brand } = useApp();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* language bar */}
      <div className="topbar">
        <div className="wrap">
          <div className="switch">
            <span className="lbl"><Icon name="globe" />{t.ui.language}</span>
            {LANGS.map((l) => (
              <button
                key={l}
                className={'chip' + (lang === l ? ' on' : '')}
                onClick={() => setLang(l)}
                aria-label={l.toUpperCase()}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* main header */}
      <header className="site">
        <div className="wrap nav">
          <Link href="/" className="brand" onClick={() => setOpen(false)}>
            <span className="mark"><Logo /></span>
            <span className="words">
              <span className="name">{brand.name}</span>
              <span className="sub">{brand.sub}</span>
            </span>
          </Link>

          <nav className={'main' + (open ? ' open' : '')}>
            {NAV.map((key) => {
              const href = ROUTES[key];
              const active = pathname === href;
              return (
                <Link
                  key={key}
                  href={href}
                  className={active ? 'active' : ''}
                  onClick={() => setOpen(false)}
                >
                  {t.nav[key]}
                </Link>
              );
            })}
            <Link className="btn btn-gold" href={ROUTES.booking} onClick={() => setOpen(false)}>
              {t.ui.book}
            </Link>
          </nav>

          <button
            className="menu-toggle"
            aria-label={t.ui.menu}
            onClick={() => setOpen((v) => !v)}
          >
            ☰
          </button>
        </div>
      </header>
    </>
  );
}
