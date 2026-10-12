'use client';
import Link from 'next/link';
import { useApp } from '@/components/Providers';
import { Icon } from '@/components/Icon';
import { LogoMark } from '@/components/LogoMark';
import { PageHeader } from '@/components/PageHeader';
import { ROUTES } from '@/lib/routes';

export default function RhPage() {
  const { t } = useApp();
  const r = t.rh;
  return (
    <>
      <section className="page-hero">
        <PageHeader eyebrow={r.eyebrow} title={r.title} lead={r.lead} scene="rh" />
      </section>

      <section className="section-soft">
        <div className="wrap">
          <div className="grid g-2">
            {r.items.map((it, i) => (
              <div className="card editorial-card" key={i}>
                <span className="editorial-number">0{i + 1}</span>
                <div className="ic"><Icon name={it.ic} /></div>
                <h3>{it.t}</h3>
                <p>{it.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap split">
          <div>
            <span className="kicker">{r.eyebrow}</span>
            <h2 className="big">{r.approachTitle}</h2>
            <div className="flourish"><Icon name="briefcase" /></div>
          </div>
          <div><p className="prose">{r.approachBody}</p></div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="band">
            <div className="mark-lg"><LogoMark /></div>
            <span className="script" style={{ fontSize: 26 }}>{t.ui.discover}</span>
            <h2>{r.ctaTitle}</h2>
            <Link className="btn btn-gold" href={ROUTES.booking}>{r.ctaBtn}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
