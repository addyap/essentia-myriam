'use client';
import Image from 'next/image';
import { useApp } from '@/components/Providers';
import { PendingDetails } from '@/components/PendingDetails';
import { PageHeader } from '@/components/PageHeader';
import { Icon } from '@/components/Icon';

export default function AboutPage() {
  const { t } = useApp();
  const a = t.about;
  return (
    <>
      <section className="page-hero"><PageHeader eyebrow={a.eyebrow} title={a.title} lead={a.lead} scene="about" /></section>
      <section className="about-introduction">
        <div className="wrap split">
          <div className="portrait">
            <Image src="/myriam.jpg" alt={a.title} fill priority sizes="(max-width: 900px) 100vw, 480px" style={{ objectFit: 'cover' }} />
          </div>
          <div>
            <p className="prose" style={{ marginBottom: 14 }}>{a.p1}</p>
            <p className="prose">{a.p2}</p>
            <span className="kicker" style={{ marginTop: 18, display: 'block' }}>{a.langsTitle}</span>
            <p className="spoken-languages">Français · English · Italiano · Español</p>
          </div>
        </div>
      </section>

      <section className="section-soft">
        <div className="wrap"><PendingDetails title={t.launchDetails.credentials.title} status={t.launchDetails.status} note={t.launchDetails.note} fields={t.launchDetails.credentials.fields} /></div>
      </section>

      <section>
        <div className="wrap split">
          <div>
            <span className="kicker">{a.eyebrow}</span>
            <h2 className="big">{a.journeyTitle}</h2>
            <div className="about-nature">
              <Image src="/images/nature/about.webp" alt="" fill sizes="(max-width: 900px) 100vw, 540px" style={{ objectFit: 'cover' }} />
            </div>
          </div>
          <div><p className="prose">{a.journeyBody}</p></div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="center" style={{ marginBottom: 30 }}>
            <span className="kicker">{a.eyebrow}</span>
            <h2 className="big">{a.valuesTitle}</h2>
            <p className="lead">{a.valuesSub}</p>
          </div>
          <div className="grid g-2">
            {a.values.map((v, i) => (
              <div className="card editorial-card" key={i}>
                <span className="editorial-number">0{i + 1}</span>
                <div className="ic"><Icon name={v.ic} /></div>
                <h3>{v.t}</h3>
                <p>{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-accent">
        <div className="wrap split">
          <div>
            <span className="kicker">{a.eyebrow}</span>
            <h2 className="big">{a.whyTitle}</h2>
            <div className="flourish"><Icon name="spark" /></div>
          </div>
          <div><p className="prose">{a.whyBody}</p></div>
        </div>
      </section>
    </>
  );
}
