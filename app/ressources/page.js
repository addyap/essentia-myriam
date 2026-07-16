'use client';
import { useState } from 'react';
import { useApp } from '@/components/Providers';
import { PageHeader } from '@/components/PageHeader';

const THUMB = { Blog: '/res-blog.jpg', Vlog: '/res-vlog.jpg', Podcast: '/res-podcast.jpg' };

export default function ResourcesPage() {
  const { t } = useApp();
  const r = t.resources;
  const [filter, setFilter] = useState('__all');
  const [subscribed, setSubscribed] = useState(false);

  const visible = r.items.filter((x) => filter === '__all' || x.cat === filter);

  return (
    <>
      <section className="page-hero">
        <PageHeader eyebrow={r.eyebrow} title={r.title} lead={r.lead} photo="/hero-resources.jpg" />
      </section>
      <section className="section-soft" style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="tabs">
            {r.tabs.map((tab, i) => {
              const f = i === 0 ? '__all' : tab;
              return (
                <button
                  key={i}
                  className={'tab' + (filter === f ? ' on' : '')}
                  onClick={() => setFilter(f)}
                >
                  {tab}
                </button>
              );
            })}
          </div>
          <div className="res-grid">
            {visible.map((x, i) => (
              <div className="res" key={i}>
                <div className="thumb" style={{ backgroundImage: `url(${THUMB[x.cat]})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div className="body">
                  <span className="tag">{x.cat}</span>
                  <h3>{x.t}</h3>
                  <p>{x.d}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="news">
            <span className="kicker">{r.newsTitle}</span>
            <p style={{ color: 'var(--muted)', maxWidth: 460, margin: '6px auto 0' }}>{r.newsSub}</p>
            <form onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }}>
              <label htmlFor="newsletter-email" className="sr-only">{r.newsPlace}</label>
              <input id="newsletter-email" name="email" type="email" autoComplete="email" placeholder={r.newsPlace} required />
              <button className="btn btn-gold" disabled={subscribed}>{r.newsBtn}</button>
            </form>
            {subscribed ? <p className="notice" style={{ margin: '14px auto 0' }} role="status">{t.ui.formUnavailable}</p> : null}
          </div>
        </div>
      </section>
    </>
  );
}
