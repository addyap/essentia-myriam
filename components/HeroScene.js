'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/components/Providers';

const LABELS = {
  fr: ['Mettre l’animation en pause', 'Reprendre l’animation'],
  en: ['Pause animation', 'Resume animation'],
  it: ['Metti in pausa l’animazione', 'Riprendi l’animazione'],
  es: ['Pausar animación', 'Reanudar animación'],
};

export function HeroScene({ scene = 'home' }) {
  const { lang } = useApp();
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const sceneRef = useRef(null);
  const labels = LABELS[lang] || LABELS.fr;

  useEffect(() => {
    let inView = true;
    const updateVisibility = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      updateVisibility();
    });
    observer.observe(sceneRef.current);
    document.addEventListener('visibilitychange', updateVisibility);
    updateVisibility();
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  return (
    <>
      <div ref={sceneRef} className={`hero-scene hero-scene--${scene}`}
        data-paused={paused || !visible} aria-hidden="true">
        <Image src={`/images/heroes/${scene}.webp`} alt="" fill priority sizes="100vw"
          className="hero-scene-photo" />
        <div className="hero-scene-light" />
        {scene === 'home' && <div className="hero-scene-mist" />}
      </div>
      <button type="button" className="hero-motion-toggle"
        onClick={() => setPaused(!paused)} aria-label={labels[paused ? 1 : 0]}
        title={labels[paused ? 1 : 0]}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
          {paused ? <path d="M7 4v16l13-8z" /> : <path d="M6 4h4v16H6zm8 0h4v16h-4z" />}
        </svg>
      </button>
    </>
  );
}
