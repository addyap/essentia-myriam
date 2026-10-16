'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from './Providers';
import { LogoMark } from './LogoMark';
import { Icon } from './Icon';
import { ROUTES, NAV } from '@/lib/routes';
import { ENABLED_LANGS } from '@/lib/config';

// Each language is named in itself, so a visitor can always find their own.
const LANG_NAMES = { fr: 'Français', en: 'English', it: 'Italiano', es: 'Español' };

export function Header() {
  const { lang, setLang, t, brand } = useApp();
  const pathname = usePathname();
  const toggle = useRef(null);
  const nav = useRef(null);
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [compact, setCompact] = useState(false);
  const header = useRef(null);

  useEffect(() => {
    // Keep the bar at least as tall as the logo and full name (see globals.css).
    const el = header.current, brand = el?.querySelector('.brand');
    if (!brand || typeof ResizeObserver === 'undefined') return;
    const fit = () => { el.style.setProperty('--brand-h', `${brand.offsetHeight}px`); el.dataset.fit = ''; };
    const observer = new ResizeObserver(fit);
    observer.observe(brand); fit();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Slim the bar after a little scrolling; the gap between the two
    // thresholds stops it flickering when the page rests near the top.
    let frame = 0;
    const update = () => { frame = 0; const y = window.scrollY; setCompact(was => (was ? y > 8 : y > 48)); };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', scroll, { passive: true });
    return () => { window.removeEventListener('scroll', scroll); cancelAnimationFrame(frame); };
  }, []);

  useEffect(() => {
    // Lock the page, not <body>: with html{overflow-x:clip}, a hidden body
    // becomes its own scroll box, the header stops sticking and the page jumps.
    document.documentElement.style.overflow = open ? 'hidden' : '';
    return () => { document.documentElement.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    // Mirrors the @media(max-width:1500px) navigation breakpoint in globals.css —
    // below it, nav.main is visually hidden off-screen via transform (not
    // display:none), so its links must be pulled out of the tab order by hand.
    const mq = window.matchMedia('(max-width: 1500px)');
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
  // Short codes in the desktop row, full native names in the roomier mobile menu.
  const langButtons = (full) => ENABLED_LANGS.map((l) => (
    <button
      key={l}
      type="button"
      lang={l}
      className={full ? 'chip' + (lang === l ? ' on' : '') : (lang === l ? 'on' : undefined)}
      onClick={() => setLang(l)}
      tabIndex={full && navHidden ? -1 : undefined}
      aria-label={full ? undefined : LANG_NAMES[l]}
      title={full ? undefined : LANG_NAMES[l]}
      aria-pressed={lang === l}
    >
      {full ? LANG_NAMES[l] : l.toUpperCase()}
    </button>
  ));

  return (
    <>
      {/* main header */}
      <header ref={header} className={'site' + (compact ? ' is-compact' : '')}>
        <div className="wrap nav">
          <Link href="/" className="brand" aria-label={`${brand.name} ${brand.byline}`} onClick={() => setOpen(false)}>
            <span className="mark"><LogoMark /></span>
            <span className="words">
              <span className="name">{brand.name.toLowerCase() === 'essentia' ? 'Essentia' : brand.name}</span>
              <span className="byline">{brand.byline.replace(/ Diougoan Blanch$/, '')}<span className="brand-surname">{brand.byline.endsWith(' Diougoan Blanch') ? ' Diougoan Blanch' : ''}</span></span>
            </span>
          </Link>

          <button
            ref={toggle}
            aria-controls="main-navigation"
            className="menu-toggle"
            aria-label={t.ui.menu}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="menu-toggle-lines" aria-hidden="true"><i /><i /></span>
          </button>
          <nav ref={nav} id="main-navigation" className={'main' + (open ? ' open' : '')} aria-hidden={navHidden}>
            {NAV.map((key) => {
              const href = ROUTES[key];
              // Articles and the podcast page sit under "Blog & podcast".
              const active = pathname === href || (key === 'resources' && (pathname === ROUTES.podcast || pathname.startsWith('/blog/')));
              return (
                <Link
                  key={key}
                  href={href}
                  className={active ? 'active' : ''}
                  aria-current={pathname === href ? 'page' : active ? 'true' : undefined}
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
            {showSwitcher && (
              <div className="menu-languages" role="group" aria-label={t.ui.language}>
                <span className="lbl"><Icon name="globe" />{t.ui.language}</span>
                <div className="menu-languages-list">{langButtons(true)}</div>
              </div>
            )}
          </nav>
          {showSwitcher && (
            <div className="header-languages" role="group" aria-label={t.ui.language}>
              {langButtons(false)}
            </div>
          )}
        </div>
      </header>
    </>
  );
}
