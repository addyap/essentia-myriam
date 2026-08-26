'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

// Signature "Ascension" hero. One continuous gold line rises from below and
// blooms into the raised-arms figure of Myriam's MDB monogram — "the essence
// of your elevation" made literal. All copy comes from Tina (content/global),
// so the headline/aria adapt to every locale. The SVG renders fully drawn on
// the server (no-JS fallback); the entrance draw, pointer parallax, magnetic
// CTA, drifting motes and first-scroll dissolve are progressive enhancements
// added on mount and fully disabled under prefers-reduced-motion.
export function Hero({ h }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const rootStyle = document.documentElement.style;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const desktop =
      window.matchMedia('(min-width: 861px)').matches && !('ontouchstart' in window);
    const cleanups = [];

    // --- entrance: draw the line ---
    const paths = root.querySelectorAll('.hero-asc-svg .draw');
    const delays = [0, 900, 1250];
    const durs = [1300, 500, 1000];
    paths.forEach((p, i) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = len;
      if (reduce) {
        p.style.strokeDashoffset = 0;
        return;
      }
      p.style.strokeDashoffset = len;
      p.style.transition = `stroke-dashoffset ${durs[i]}ms cubic-bezier(.5,0,.15,1) ${delays[i]}ms`;
    });
    const head = root.querySelector('.hero-asc-svg .head');
    if (head && !reduce) {
      head.style.transformOrigin = '200px 150px';
      head.style.transform = 'scale(0)';
      head.style.opacity = '0';
      head.style.transition =
        'transform .7s 2050ms cubic-bezier(.2,1.5,.3,1), opacity .5s 2050ms';
    }
    const raf1 = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        paths.forEach((p) => (p.style.strokeDashoffset = 0));
        if (head && !reduce) {
          head.style.transform = 'scale(1)';
          head.style.opacity = '1';
        }
      })
    );

    // --- first-scroll dissolve ---
    const onScroll = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight || 1;
      let p = Math.min(1, Math.max(0, window.scrollY / (vh * 0.85)));
      if (!isFinite(p)) p = 0;
      rootStyle.setProperty('--asc-p', p.toFixed(3));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('load', onScroll);
    onScroll();
    cleanups.push(() => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('load', onScroll);
    });

    // --- pointer parallax + magnetic CTA (desktop, motion-ok only) ---
    let rafLoop = 0;
    if (desktop && !reduce) {
      let tmx = 0, tmy = 0, mx = 0, my = 0;
      let tMagX = 0, tMagY = 0, magX = 0, magY = 0;
      const mag = root.querySelector('.hero-asc-cta .btn-gold');
      const well = root.querySelector('.hero-asc-well');

      const onMove = (e) => {
        tmx = (e.clientX / window.innerWidth - 0.5) * 2;
        tmy = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener('pointermove', onMove, { passive: true });
      cleanups.push(() => window.removeEventListener('pointermove', onMove));

      if (well) {
        const enter = () => rootStyle.setProperty('--asc-aura', '1');
        const leave = () => rootStyle.setProperty('--asc-aura', '0');
        well.addEventListener('pointerenter', enter);
        well.addEventListener('pointerleave', leave);
        cleanups.push(() => {
          well.removeEventListener('pointerenter', enter);
          well.removeEventListener('pointerleave', leave);
        });
      }
      if (mag) {
        const mm = (e) => {
          const r = mag.getBoundingClientRect();
          tMagX = (e.clientX - (r.left + r.width / 2)) * 0.3;
          tMagY = (e.clientY - (r.top + r.height / 2)) * 0.45;
        };
        const ml = () => {
          tMagX = 0;
          tMagY = 0;
        };
        mag.addEventListener('pointermove', mm);
        mag.addEventListener('pointerleave', ml);
        cleanups.push(() => {
          mag.removeEventListener('pointermove', mm);
          mag.removeEventListener('pointerleave', ml);
        });
      }

      const loop = () => {
        mx += (tmx - mx) * 0.06;
        my += (tmy - my) * 0.06;
        rootStyle.setProperty('--asc-mx', mx.toFixed(3));
        rootStyle.setProperty('--asc-my', my.toFixed(3));
        if (mag) {
          magX += (tMagX - magX) * 0.12;
          magY += (tMagY - magY) * 0.12;
          mag.style.transform = `translate(${magX.toFixed(2)}px, ${magY.toFixed(2)}px)`;
        }
        rafLoop = requestAnimationFrame(loop);
      };
      loop();
    }

    // --- drifting gold motes ---
    let rafMotes = 0;
    const cv = root.querySelector('.hero-asc-motes');
    if (cv && !reduce) {
      const ctx = cv.getContext('2d');
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      let W = 0, H = 0;
      const M = [];
      const size = () => {
        const r = cv.parentElement.getBoundingClientRect();
        W = r.width;
        H = r.height;
        cv.width = W * dpr;
        cv.height = H * dpr;
        cv.style.width = W + 'px';
        cv.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      size();
      window.addEventListener('resize', size);
      cleanups.push(() => window.removeEventListener('resize', size));
      for (let i = 0; i < 24; i++) {
        M.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.6 + 0.4,
          s: Math.random() * 0.28 + 0.06,
          ph: Math.random() * 6.28,
        });
      }
      const glow = () =>
        getComputedStyle(document.documentElement).getPropertyValue('--gold-glow').trim() ||
        '224,180,104';
      const draw = (t) => {
        ctx.clearRect(0, 0, W, H);
        const g = glow();
        for (let i = 0; i < M.length; i++) {
          const m = M[i];
          m.y -= m.s;
          m.x += Math.sin(t / 2600 + m.ph) * 0.18;
          if (m.y < -6) {
            m.y = H + 6;
            m.x = Math.random() * W;
          }
          const a = 0.18 + 0.3 * (Math.sin(t / 1400 + m.ph) * 0.5 + 0.5);
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.r, 0, 6.28);
          ctx.fillStyle = `rgba(${g},${a})`;
          ctx.fill();
        }
        rafMotes = requestAnimationFrame(draw);
      };
      rafMotes = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(rafLoop);
      cancelAnimationFrame(rafMotes);
      cleanups.forEach((fn) => fn());
      rootStyle.removeProperty('--asc-p');
      rootStyle.removeProperty('--asc-mx');
      rootStyle.removeProperty('--asc-my');
      rootStyle.removeProperty('--asc-aura');
    };
  }, []);

  const title = h.heroTitle || ['', '', ''];

  return (
    <section className="hero-asc" ref={rootRef} aria-label={`${title[0]}${title[1]}${title[2]}`}>
      <div className="hero-asc-bg" aria-hidden="true" />
      <div className="wrap hero-asc-grid">
        <div className="hero-asc-copy">
          <span className="kicker">{h.heroKicker}</span>
          <h1 className="hero-asc-title">
            {title[0]}
            <em className="accent">{title[1]}</em>
            {title[2]}
          </h1>
          <p className="hero-asc-sub">{h.heroSub}</p>
          <div className="hero-asc-cta">
            <Link className="btn btn-gold" href={ROUTES.booking}>{h.heroCta1}</Link>
            <Link className="btn btn-soft" href={ROUTES.about}>{h.heroCta2}</Link>
          </div>
        </div>

        <div className="hero-asc-well" aria-hidden="true">
          <div className="hero-asc-stage">
            <svg className="hero-asc-svg" viewBox="0 0 400 560">
              <defs>
                <linearGradient id="ascGold" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0" stopColor="var(--asc-gold)" />
                  <stop offset="1" stopColor="var(--asc-gold-lite)" />
                </linearGradient>
              </defs>
              <path className="draw" d="M200,548 C150,472 262,410 198,352 C170,326 190,300 200,286" strokeWidth="3.4" />
              <path className="draw" d="M200,286 C200,258 200,232 200,206" strokeWidth="3.8" />
              <path className="draw" d="M112,120 C150,150 182,178 200,206 C218,178 250,150 288,120" strokeWidth="4" />
              <circle className="head" cx="200" cy="150" r="22" />
            </svg>
            <div className="hero-asc-pool" />
          </div>
          <canvas className="hero-asc-motes" />
        </div>
      </div>

      <div className="hero-asc-cue" aria-hidden="true">
        <span className="stem" />
      </div>
    </section>
  );
}
