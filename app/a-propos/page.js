'use client';
import Image from 'next/image';
import { useApp } from '@/components/Providers';
import { Icon } from '@/components/Icon';

export default function AboutPage() {
  const { t } = useApp();
  const a = t.about;
  return (
    <>
      <section>
        <div className="wrap split">
          <div className="portrait">
            <Image src="/myriam.jpg" alt={a.title} fill priority sizes="(max-width: 900px) 100vw, 480px" style={{ objectFit: 'cover' }} />
          </div>
          <div>
            <span className="eyebrow">{a.eyebrow}</span>
            <h1 className="big">{a.title}</h1>
            <p className="lead" style={{ margin: '10px 0 18px' }}>{a.lead}</p>
            <p className="prose" style={{ marginBottom: 14 }}>{a.p1}</p>
            <p className="prose">{a.p2}</p>
            <span className="kicker" style={{ marginTop: 18, display: 'block' }}>{a.langsTitle}</span>
            <div className="chips-langs">
              <span>Français</span><span>English</span><span>Italiano</span><span>Español</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-soft">
        <div className="wrap split">
          <div>
            <span className="kicker">{a.eyebrow}</span>
            <h2 className="big">{a.journeyTitle}</h2>
            <div className="flourish"><Icon name="compass" /></div>
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
              <div className="card" key={i}>
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
