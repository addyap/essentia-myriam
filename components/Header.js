'use client';
import { useState, useEffect } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    // Mirrors the @media(max-width:900px) breakpoint in globals.css — below it,
    // nav.main is visually hidden off-screen via transform (not display:none),
    // so its links must be pulled out of the tab order by hand when closed.
    const mq = window.matchMedia('(max-width: 900px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const navHidden = isMobile && !open;

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
              <span className="byline">by Myriam Diougoan Blanch</span>
              <span className="sub">{brand.sub}</span>
            </span>
          </Link>

          <nav className={'main' + (open ? ' open' : '')} aria-hidden={navHidden}>
            {NAV.map((key) => {
              const href = ROUTES[key];
              const active = pathname === href;
              return (
                <Link
                  key={key}
                  href={href}
                  className={active ? 'active' : ''}
                  tabIndex={navHidden ? -1 : undefined}
                  onClick={() => setOpen(false)}
                >
                  {t.nav[key]}
                </Link>
              );
            })}
            <Link className="btn btn-gold" href={ROUTES.booking} tabIndex={navHidden ? -1 : undefined} onClick={() => setOpen(false)}>
              {t.ui.book}
            </Link>
          </nav>

          <button
            className="menu-toggle"
            aria-label={t.ui.menu}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </header>
    </>
  );
}
