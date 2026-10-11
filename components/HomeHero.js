'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useApp } from '@/components/Providers';
import { HeroCrest } from '@/components/HeroCrest';
import { ROUTES } from '@/lib/routes';

// "Clairière" — the art-directed home hero. A cinematic forest-at-golden-hour
// scene graded to let the type sit in light on the left while the hand-signed
// gold monogram crest glows in the shadowed right. Depth comes from layered
// pointer parallax; the crest adds a progressively enhanced 3D pivot. All
// motion is transform/opacity and disabled under prefers-reduced-motion.
export function HomeHero() {
  const { t } = useApp();
  const h = t.home;
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;



    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    let mx = 0, my = 0, tmx = 0, tmy = 0, raf = 0, last = null, visible = true;
    const tick = now => {
      raf = 0;
      if (!visible || document.hidden || preference.matches) { last = null; return; }
      const blend = 1 - Math.exp(-Math.min(last === null ? 16 : now - last, 50) / 160);
      last = now;
      mx += (tmx - mx) * blend; my += (tmy - my) * blend;
      el.style.setProperty('--mx', mx.toFixed(4));
      el.style.setProperty('--my', my.toFixed(4));
      if (Math.abs(tmx - mx) > .001 || Math.abs(tmy - my) > .001) schedule();
    };
    const schedule = () => { if (!raf && visible && !document.hidden && !preference.matches) raf = requestAnimationFrame(tick); };
    const onMove = event => {
      if (!fine.matches || preference.matches || !visible) return;
      const r = el.getBoundingClientRect();
      tmx = ((event.clientX - r.left) / r.width - .5) * 2;
      tmy = ((event.clientY - r.top) / r.height - .5) * 2;
      schedule();
    };
    const leave = () => { tmx = tmy = 0; schedule(); };
    const reset = () => {
      cancelAnimationFrame(raf); raf = 0; last = null;
      mx = my = tmx = tmy = 0;
      el.style.setProperty('--mx', '0'); el.style.setProperty('--my', '0');
    };
    const visibility = () => { last = null; schedule(); };
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (!visible) { cancelAnimationFrame(raf); raf = 0; last = null; }
      else schedule();
    });
    observer.observe(el);
    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', leave);
    preference.addEventListener('change', reset);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      reset(); observer.disconnect();
      el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerleave', leave);
      preference.removeEventListener('change', reset);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);

  const title = Array.isArray(h.heroTitle) ? h.heroTitle : ['', '', ''];

  return (
    <section className="hero-cine" ref={ref} aria-label="Essentia">
      <div className="hero-cine-bg" aria-hidden="true">
        <Image src="/images/nature/home.webp" alt="" fill priority sizes="100vw" className="hero-cine-photo" />
      </div>
      <div className="hero-cine-grade" aria-hidden="true" />
      <div className="hero-cine-rays" aria-hidden="true"><span /><span /></div>
      <div className="hero-cine-grain" aria-hidden="true" />
      <div className="hero-cine-frame" aria-hidden="true"><i /><i /><i /><i /></div>

      <div className="wrap hero-cine-inner">
        <div className="hero-cine-copy">
          <span className="hero-cine-kicker">{h.heroKicker}</span>
          <h1 className="hero-cine-title">
            {title[0]}<em>{title[1]}</em>{title[2]}
          </h1>
          <p className="hero-cine-sub">{h.heroSub}</p>
          <div className="hero-cine-cta">
            <Link className="hero-btn hero-btn-gold" href={ROUTES.booking}>
              <span>{h.heroCta1}</span>
              <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
            <Link className="hero-btn hero-btn-ghost" href={ROUTES.about}>{h.heroCta2}</Link>
          </div>
          <div id="hero-logo-controls" className="hero-logo-controls" />
        </div>

        <div className="hero-cine-crest">
          <div className="hero-cine-halo" aria-hidden="true" />
          <div className="hero-cine-mark"><HeroCrest /></div>
          <span className="hero-cine-sign">Myriam Diougoan Blanch</span>
        </div>
      </div>

      <a className="hero-cine-scroll" href="#essence" aria-label="Défiler">
        <span className="hero-cine-scroll-word">Explorer</span>
        <span className="hero-cine-scroll-line" />
      </a>
    </section>
  );
}
