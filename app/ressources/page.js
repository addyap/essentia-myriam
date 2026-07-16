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
      <section>
        <PageHeader eyebrow={r.eyebrow} title={r.title} lead={r.lead} />
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
                  <h4>{x.t}</h4>
                  <p>{x.d}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="news">
            <span className="kicker">{r.newsTitle}</span>
            <p style={{ color: 'var(--muted)', maxWidth: 460, margin: '6px auto 0' }}>{r.newsSub}</p>
            <form onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder={r.newsPlace} />
              <button className="btn btn-gold">{r.newsBtn}</button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
