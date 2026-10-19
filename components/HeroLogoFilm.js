'use client';
import { useEffect, useRef, useState } from 'react';

// Myriam's own logo reveal: the monogram written in gold, then her name, with a
// gentle turn and passing light, on the dark background of her original video,
// which a soft oval fade (globals.css) melts into the forest. It plays once and
// rests on its final frame. The still final frame stands in without
// JavaScript, with reduced motion or Save-Data, and whenever the video cannot start.
const SOURCE = '/videos/logo-reveal.mp4';
const START_TIMEOUT_MS = 4000;

export function HeroLogoFilm({ label }) {
  const ref = useRef(null);
  const [state, setState] = useState('pending'); // pending | film | still
  useEffect(() => {
    const video = ref.current;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    let settled = false, timer = 0;
    const still = () => {
      settled = true; clearTimeout(timer); setState('still');
      video.pause(); video.removeAttribute('src'); video.load();
    };
    const playing = () => { if (!settled) { settled = true; clearTimeout(timer); setState('film'); } };
    // The background video's pause button stops the logo as well.
    const motion = event => {
      if (event.detail?.paused) video.pause();
      else if (video.getAttribute('src') && !video.ended) video.play()?.catch(() => {});
    };
    const preference = () => { if (reduce.matches) still(); };
    reduce.addEventListener('change', preference);
    window.addEventListener('hero-motion', motion);
    if (reduce.matches || navigator.connection?.saveData) still();
    else {
      video.muted = true;
      video.src = SOURCE;
      video.addEventListener('playing', playing);
      video.addEventListener('error', still);
      // A slow connection should not leave the hero without its logo.
      timer = setTimeout(() => { if (!settled) still(); }, START_TIMEOUT_MS);
      video.play()?.catch(error => { if (error?.name !== 'AbortError') still(); });
    }
    return () => {
      clearTimeout(timer);
      reduce.removeEventListener('change', preference);
      window.removeEventListener('hero-motion', motion);
      video.removeEventListener('playing', playing);
      video.removeEventListener('error', still);
      video.pause();
    };
  }, []);
  return <div className="hero-logo-film" data-state={state} role="img" aria-label={label}>
    <img className="hero-logo-still" src="/images/logo-reveal-still.webp" alt="" width="1080" height="792" decoding="async" />
    <video ref={ref} muted playsInline preload="auto" aria-hidden="true" tabIndex={-1} />
  </div>;
}
