'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from './Providers';
import { LogoMark } from './LogoMark';
import { Icon } from './Icon';
import { ROUTES, NAV } from '@/lib/routes';
import { ENABLED_LANGS } from '@/lib/config';

export function Header() {
  const { lang, setLang, t, brand } = useApp();
  const pathname = usePathname();
  const toggle = useRef(null);
  const nav = useRef(null);
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    // Mirrors the @media(max-width:1080px) breakpoint in globals.css — below it,
    // nav.main is visually hidden off-screen via transform (not display:none),
    // so its links must be pulled out of the tab order by hand when closed.
    const mq = window.matchMedia('(max-width: 1080px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!isMobile && open) setOpen(false);
  }, [isMobile, open]);

  useEffect(() => {
    if (!open || !isMobile) return;
    const previous = document.activeElement;
    const elements = () => [toggle.current, ...nav.current.querySelectorAll('a[href], button:not(:disabled)')].filter(Boolean);
    // Wait for the panel's visibility transition before moving focus.
    const focusTimer = setTimeout(() => nav.current?.querySelector('a')?.focus(), 320);
    const keydown = event => {
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
      if (event.key === 'Tab') {
        const items = elements();
        const index = items.indexOf(document.activeElement);
        if (event.shiftKey && index <= 0) { event.preventDefault(); items.at(-1).focus(); }
        else if (!event.shiftKey && (index === items.length - 1 || index === -1)) { event.preventDefault(); items[0].focus(); }
      }
    };
    document.addEventListener('keydown', keydown);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', keydown);
      if (document.activeElement === document.body || nav.current?.contains(document.activeElement)) previous?.focus();
    };
  }, [open, isMobile]);

  const navHidden = isMobile && !open;

  // Switcher only makes sense once a second language is actually reachable
  // again (see lib/config.js ENABLED_LANGS) — a lone "FR" chip does nothing.
  const showSwitcher = ENABLED_LANGS.length > 1;
  const langChips = ENABLED_LANGS.map((l) => (
    <button
      key={l}
      className={'chip' + (lang === l ? ' on' : '')}
      onClick={() => setLang(l)}
      aria-label={l.toUpperCase()}
      aria-pressed={lang === l}
    >
      {l.toUpperCase()}
    </button>
  ));

  return (
    <>
      {/* language bar — mobile/tablet only; on desktop the switch lives in the header row */}
      {showSwitcher && (
        <div className="topbar">
          <div className="wrap">
            <div className="switch">
              <span className="lbl"><Icon name="globe" />{t.ui.language}</span>
              {langChips}
            </div>
          </div>
        </div>
      )}

      {/* main header */}
      <header className="site">
        <div className="wrap nav">
          <Link href="/" className="brand" onClick={() => setOpen(false)}>
            <span className="mark"><LogoMark /></span>
            <span className="words">
              <span className="name">{brand.name.toLowerCase() === 'essentia' ? 'Essentia' : brand.name}</span>
              <span className="byline">{brand.byline}</span>
            </span>
          </Link>

          {showSwitcher && (
            <div className="lang-side switch">
              <span className="lbl"><Icon name="globe" />{t.ui.language}</span>
              {langChips}
            </div>
          )}

          <button
            ref={toggle}
            aria-controls="main-navigation"
            className="menu-toggle"
            aria-label={t.ui.menu}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>

        {/* desktop: centred menu row under the brand row; mobile: display:contents
            wrapper so nav.main keeps working as the fixed slide-down overlay */}
        <div className="nav-row">
          <nav ref={nav} id="main-navigation" className={'main' + (open ? ' open' : '')} aria-hidden={navHidden}>
            {NAV.map((key) => {
              const href = ROUTES[key];
              const active = pathname === href;
              return (
                <Link
                  key={key}
                  href={href}
                  className={active ? 'active' : ''}
                  aria-current={active ? 'page' : undefined}
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
        </div>
      </header>
    </>
  );
}
