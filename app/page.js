'use client';
import { LogoMark } from '@/components/LogoMark';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/components/Providers';
import { Icon } from '@/components/Icon';
import { HomeHero } from '@/components/HomeHero';
import { ROUTES } from '@/lib/routes';

export default function HomePage() {
  const { t } = useApp();
  const h = t.home;
  return (
    <>
      <HomeHero />

      <section id="essence" className="home-intro">
        <div className="wrap intro-grid">
          <div className="intro-portrait">
            <Image src="/myriam.jpg" alt="Myriam Diougoan Blanch" fill sizes="(max-width: 900px) 80vw, 360px" style={{ objectFit: 'cover' }} />
          </div>
          <div className="intro-copy">
            <span className="eyebrow">{h.introEyebrow}</span>
            <h2 className="big">{h.introTitle}</h2>
            <p className="prose">{h.introBody}</p>
            <span className="intro-signature">Myriam Diougoan Blanch</span>
            <Link href={ROUTES.about} className="editorial-link">{h.heroCta2}<span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>

      <section className="section-soft home-pillars">
        <div className="wrap">
          <div className="center" style={{ marginBottom: 44 }}>
            <h2 className="eyebrow">{h.pillarsEyebrow}</h2>
          </div>
          <div className="grid g-3">
            {h.pillars.map((p, i) => (
              <div className="card editorial-card" key={i}>
                <span className="editorial-number">0{i + 1}</span>
                <div className="ic"><Icon name={p.ic} /></div>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-audience">
        <div className="wrap">
          <div className="center" style={{ marginBottom: 44 }}>
            <span className="eyebrow">{h.forEyebrow}</span>
            <h2 className="big">{h.forTitle}</h2>
          </div>
          <div className="grid g-3 audience-list">
            {h.forWho.map((p, i) => (
              <div className="card editorial-card" key={i}>
                <span className="editorial-number">0{i + 1}</span>
                <div className="ic"><Icon name={p.ic} /></div>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-accent section-photo philosophy">
        <Image src="/images/nature/testimonials.webp" alt="" fill sizes="100vw" style={{ objectFit: 'cover' }} className="section-bg-photo" />
        <div className="section-scrim" />
        <div className="wrap">
          <div className="center" style={{ marginBottom: 44 }}>
            <span className="eyebrow">{h.pauseEyebrow}</span>
            <h2 className="big">{h.testiTitle}</h2>
          </div>

        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="band">
            <div className="mark-lg"><LogoMark /></div>
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
