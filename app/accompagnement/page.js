'use client';
import Link from 'next/link';
import { useApp } from '@/components/Providers';
import { Icon } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';
import { ROUTES } from '@/lib/routes';

export default function CoachingPage() {
  const { t } = useApp();
  const c = t.coaching;
  return (
    <>
      <section>
        <PageHeader eyebrow={c.eyebrow} title={c.title} lead={c.lead} />
      </section>

      <section className="section-soft">
        <div className="wrap">
          <span className="kicker">{c.listTitle}</span>
          <div className="grid g-2" style={{ marginTop: 22 }}>
            {c.items.map((it, i) => (
              <div className="card" key={i}>
                <div className="ic"><Icon name={it.ic} /></div>
                <span className="num">0{i + 1}</span>
                <h3>{it.t}</h3>
                <p>{it.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap center">
          <span className="eyebrow">{c.methodsEyebrow}</span>
          <h2 className="big">{c.methodsTitle}</h2>
          <p className="lead">{c.methodsSub}</p>
          <div className="chips-langs" style={{ justifyContent: 'center', marginTop: 24 }}>
            {c.methods.map((m, i) => <span key={i}>{m}</span>)}
          </div>
        </div>
      </section>

      <section className="section-accent">
        <div className="wrap">
          <div className="center" style={{ marginBottom: 20 }}>
            <span className="eyebrow">{c.pricingEyebrow}</span>
            <h2 className="big">{c.pricingTitle}</h2>
            <p className="lead">{c.pricingSub}</p>
          </div>
          <div className="price-grid">
            {c.prices.map((p, i) => (
              <div className="price" key={i}>
                <h3>{p.t}</h3>
                <div className="amt">{p.amt} {p.per ? <small>/ {p.per}</small> : null}</div>
                <ul>
                  {p.feat.map((f, j) => (
                    <li key={j}><span className="tick">✦</span> {f}</li>
                  ))}
                </ul>
                <Link className="btn btn-ghost" href={ROUTES.booking}
                  style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
                  {t.ui.book}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
