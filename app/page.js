'use client';
import Link from 'next/link';
import { useApp } from '@/components/Providers';
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/Logo';
import { ROUTES } from '@/lib/routes';

export default function HomePage() {
  const { t } = useApp();
  const h = t.home;
  return (
    <>
      {/* PHOTO-READY HERO — to use a real image, add a background-image to .hero-photo
          (e.g. style={{ backgroundImage: "url('/hero.jpg')" }}) or drop in a next/image
          <Image fill> as the first child. The scrim keeps the headline legible. */}
      <section className="hero-full">
        <div className="hero-photo">
          <div className="glow" />
          <svg className="hills2" viewBox="0 0 600 240" preserveAspectRatio="none">
            <path d="M0 150 C120 110 220 170 320 140 C420 110 520 160 600 130 L600 240 L0 240Z" fill="rgba(198,146,58,.10)" />
            <path d="M0 190 C140 160 260 205 380 180 C480 160 560 195 600 180 L600 240 L0 240Z" fill="rgba(198,146,58,.16)" />
          </svg>
        </div>
        <div className="hero-scrim" />
        <span className="hero-mark-bg"><Logo /></span>
        <div className="wrap hero-full-inner">
          <div className="hero-copy">
            <span className="kicker">{h.heroKicker}</span>
            <h1 className="h-title">
              {h.heroTitle[0]}<em>{h.heroTitle[1]}</em>{h.heroTitle[2]}
            </h1>
            <p className="h-sub">{h.heroSub}</p>
            <div className="hero-cta">
              <Link className="btn btn-gold" href={ROUTES.booking}>{h.heroCta1}</Link>
              <Link className="btn btn-ghost" href={ROUTES.about}>{h.heroCta2}</Link>
            </div>
          </div>
        </div>
        <span className="photo-tag">{t.ui.photoSlot}</span>
      </section>

      <section>
        <div className="wrap center">
          <span className="eyebrow">{h.introEyebrow}</span>
          <h2 className="big">{h.introTitle}</h2>
          <div className="divider" />
          <p className="lead">{h.introBody}</p>
        </div>
      </section>

      <section className="section-soft">
        <div className="wrap">
          <div className="center" style={{ marginBottom: 44 }}>
            <span className="kicker">{h.pillarsEyebrow}</span>
          </div>
          <div className="grid g-3">
            {h.pillars.map((p, i) => (
              <div className="card" key={i}>
                <div className="ic"><Icon name={p.ic} /></div>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="center" style={{ marginBottom: 44 }}>
            <span className="eyebrow">{h.forEyebrow}</span>
            <h2 className="big">{h.forTitle}</h2>
          </div>
          <div className="grid g-3">
            {h.forWho.map((p, i) => (
              <div className="card" key={i}>
                <div className="ic"><Icon name={p.ic} /></div>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-accent">
        <div className="wrap">
          <div className="center" style={{ marginBottom: 44 }}>
            <span className="eyebrow">{h.testiEyebrow}</span>
            <h2 className="big">{h.testiTitle}</h2>
          </div>
          <div className="quotes">
            {h.testi.map((q, i) => (
              <div className="quote" key={i}>
                <div className="qm">&rdquo;</div>
                <p>{q.q}</p>
                <span className="who">{q.w}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="band">
            <div className="mark-lg"><Logo /></div>
            <span className="script" style={{ fontSize: 26 }}>{t.ui.discover}</span>
            <h2>{h.bandTitle}</h2>
            <p>{h.bandText}</p>
            <Link className="btn btn-gold" href={ROUTES.booking}>{h.bandBtn}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
