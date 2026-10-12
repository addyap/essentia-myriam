'use client';
import { useEffect, useRef, useState } from 'react';
import { useApp } from './Providers';
import { HeroCrest } from './HeroCrest';
import { LogoMark } from './LogoMark';

// Each instance starts once on entry; the shared motion engine pauses offscreen.
export function SectionLogo({ banner = false }) {
  const { t } = useApp();
  const host = useRef(null);
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') { setEntered(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setEntered(true); observer.disconnect(); }
    }, { threshold: .15 });
    observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={host} className={`section-logo${banner ? ' section-logo--banner' : ''}`}>
    {entered ? <HeroCrest controlsTarget={null} labels={t.ui.logoMotion} /> : <div className="section-logo-still" aria-hidden="true"><LogoMark /></div>}
  </div>;
}
