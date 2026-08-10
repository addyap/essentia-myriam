'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/components/Providers';
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/Logo';
import { ROUTES } from '@/lib/routes';

export default function HomePage() {
  const { t } = useApp();
  const h = t.home;
  return (
    <>
      <section className="hero-full">
        <Image src="/hero.jpg" alt="" fill priority sizes="100vw" style={{ objectFit: 'cover' }} className="hero-photo" />
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
              <Link className="btn btn-soft" href={ROUTES.about}>{h.heroCta2}</Link>
            </div>
          </div>
        </div>
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

      <section className="section-accent section-photo">
        <Image src="/hero-testimonials.jpg" alt="" fill sizes="100vw" style={{ objectFit: 'cover' }} className="section-bg-photo" />
        <div className="section-scrim" />
        <div className="wrap">
          <div className="center" style={{ marginBottom: 44 }}>
            <span className="eyebrow">{h.testiEyebrow}</span>
            <h2 className="big">{h.testiTitle}</h2>
          </div>
          {/* Testimonial quotes hidden until real client testimonials are collected.
              Restore by re-mapping h.testi here (data kept in content/global per locale). */}
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
