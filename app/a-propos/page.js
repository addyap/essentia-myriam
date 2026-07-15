'use client';
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
            <div className="ph"><Icon name="user" /><br />{a.photoCaption}</div>
          </div>
          <div>
            <span className="eyebrow">{a.eyebrow}</span>
            <h2 className="big">{a.title}</h2>
            <p className="lead" style={{ margin: '10px 0 18px' }}>{a.lead}</p>
            <p style={{ color: 'var(--muted)', marginBottom: 14 }}>{a.p1}</p>
            <p style={{ color: 'var(--muted)' }}>{a.p2}</p>
            <div className="chips-langs">
              <span>Français</span><span>English</span><span>Italiano</span><span>Español</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-soft">
        <div className="wrap">
          <span className="kicker">{a.eyebrow}</span>
          <h2 className="big" style={{ maxWidth: 760, marginBottom: 18 }}>{a.journeyTitle}</h2>
          <p className="lead" style={{ maxWidth: 820 }}>{a.journeyBody}</p>
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
          </div>
          <div><p className="lead">{a.whyBody}</p></div>
        </div>
      </section>
    </>
  );
}
