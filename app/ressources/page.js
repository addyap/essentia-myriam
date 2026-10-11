'use client';
import { useState } from 'react';
import { useApp } from '@/components/Providers';
import { PageHeader } from '@/components/PageHeader';

const THUMB = { Blog: '/res-blog.jpg', Vlog: '/res-vlog.jpg', Podcast: '/res-podcast.jpg' };

export default function ResourcesPage() {
  const { t } = useApp();
  const r = t.resources;
  const [filter, setFilter] = useState('__all');

  const visible = r.items.filter((x) => filter === '__all' || x.cat === filter);

  return (
    <>
      <section className="page-hero">
        <PageHeader eyebrow={r.eyebrow} title={r.title} lead={r.lead} scene="resources" />
      </section>
      <section className="section-soft" style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="tabs">
            {r.tabs.map((tab, i) => {
              const f = i === 0 ? '__all' : tab;
              return (
                <button
                  key={i}
                  aria-pressed={filter === f}
                  className={'tab' + (filter === f ? ' on' : '')}
                  onClick={() => setFilter(f)}
                >
                  {tab}
                </button>
              );
            })}
          </div>
          <div className="res-grid motion-filter" key={filter}>
            {visible.map((x, i) => (
              <div className="res" key={`${x.cat}-${x.t}`}>
                <div className="thumb" style={{ backgroundImage: `url(${THUMB[x.cat]})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div className="body">
                  <span className="tag">{x.cat}</span>
                  <span className="resource-status">{r.comingSoon}</span>
                  <h3>{x.t}</h3>
                  <p>{x.d}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}
