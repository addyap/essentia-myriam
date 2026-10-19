'use client';
import { useEffect, useRef, useState } from 'react';

// Myriam's own logo reveal: the monogram written by a glowing pen, then her
// name, in the logo's gold (#FCC200) directly over the forest. Her video's
// background was removed, so these are transparent videos: Safari and every
// iPhone browser (WebKit) play transparency only from HEVC, the others from
// VP9. It plays once and rests on its final frame. The still final frame
// stands in without JavaScript, with reduced motion or Save-Data, and
// whenever the video cannot start.
const WEBKIT_SOURCE = '/videos/logo-reveal.mov';
const SOURCE = '/videos/logo-reveal.webm';
const START_TIMEOUT_MS = 4000;
// Played slower than recorded: the 10-second film unfolds over 15 seconds.
const PLAYBACK_RATE = 2 / 3;

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
      video.src = navigator.vendor === 'Apple Computer, Inc.' ? WEBKIT_SOURCE : SOURCE;
      video.defaultPlaybackRate = PLAYBACK_RATE;
      video.playbackRate = PLAYBACK_RATE;
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
