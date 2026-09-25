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

const HOME_HERO_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_3HLwpLD1FOebllTZVNLdHOfLdQV/hf_20260925_151254_d520c4af-0405-4c04-9032-1cc5b7950012.mp4';

export function HeroScene({ scene = 'home' }) {
  const { lang } = useApp();
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const sceneRef = useRef(null);
  const videoRef = useRef(null);
  const labels = LABELS[lang] || LABELS.fr;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener('change', updateMotionPreference);
    return () => mediaQuery.removeEventListener('change', updateMotionPreference);
  }, []);

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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (paused || !visible || reducedMotion) {
      video.pause();
      return;
    }

    video.play().catch(() => {
      // Keep the still poster visible if autoplay is unavailable.
    });
  }, [paused, visible, reducedMotion, scene]);

  return (
    <>
      <div ref={sceneRef} className={`hero-scene hero-scene--${scene}`}
        data-paused={paused || !visible || reducedMotion} aria-hidden="true">
        {scene === 'home' ? (
          <video ref={videoRef} className="hero-scene-photo" src={HOME_HERO_VIDEO}
            poster="/images/heroes/home.webp" muted loop playsInline preload="metadata"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        ) : (
          <Image src={`/images/heroes/${scene}.webp`} alt="" fill priority sizes="100vw"
            className="hero-scene-photo" />
        )}
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
