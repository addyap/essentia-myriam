'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Loaded only once the film has ended, so it never competes with the pen.
const HeroCrest = dynamic(() => import('./HeroCrest').then(m => m.HeroCrest), { ssr: false });

// Myriam's own logo reveal: the monogram written by a glowing pen, then her
// name, directly over the forest. The monogram is shaded from bright to deep
// gold like the inner pages' 3D logo; the name stays brand gold (#FCC200).
// Her video's background was removed, so these are transparent videos: Safari
// and every iPhone browser (WebKit) play transparency only from HEVC, the
// others from VP9. The still final frame stands in without JavaScript, with
// reduced motion or Save-Data, and whenever the video cannot start.
// When the film ends, the inner pages' 3D gold monogram is prepared exactly
// over the film's monogram and cross-fades in, while the name and sparkles
// stay (logo-reveal-name.webp is the final frame without the monogram).
const WEBKIT_SOURCE = '/videos/logo-reveal.mov';
const SOURCE = '/videos/logo-reveal.webm';
const START_TIMEOUT_MS = 4000;
// Played slower than recorded: the 10-second film unfolds over 15 seconds.
const PLAYBACK_RATE = 2 / 3;

export function HeroLogoFilm({ label }) {
  const ref = useRef(null);
  const [state, setState] = useState('pending'); // pending | film | still | gold
  const [ended, setEnded] = useState(false);
  // The 3D logo takes over from the film, or from the still when the film could not play.
  const takeover = useCallback(() => setState(current => (current === 'film' || current === 'still' ? 'gold' : current)), []);
  useEffect(() => {
    const video = ref.current;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    let settled = false, timer = 0;
    // allowGold: the film could not play (slow start, blocked autoplay, error),
    // but motion is welcome, so the 3D logo still takes over from the still.
    const still = (allowGold = true) => {
      settled = true; clearTimeout(timer); setState('still');
      video.pause(); video.removeAttribute('src'); video.load();
      if (allowGold !== false && !reduce.matches && !navigator.connection?.saveData) setEnded(true);
    };
    const playing = () => { if (!settled) { settled = true; clearTimeout(timer); setState('film'); } };
    const finished = () => { if (!reduce.matches) setEnded(true); };
    // Some browsers do not always report 'ended' at a slowed playback rate.
    const progress = () => { if (video.duration && video.currentTime >= video.duration - 0.1) finished(); };
    // The background video's pause button stops the logo as well.
    const motion = event => {
      if (event.detail?.paused) video.pause();
      else if (video.getAttribute('src') && !video.ended) video.play()?.catch(() => {});
    };
    const preference = () => { if (reduce.matches) still(false); };
    reduce.addEventListener('change', preference);
    window.addEventListener('hero-motion', motion);
    if (reduce.matches || navigator.connection?.saveData) still(false);
    else {
      video.muted = true;
      video.src = navigator.vendor === 'Apple Computer, Inc.' ? WEBKIT_SOURCE : SOURCE;
      video.defaultPlaybackRate = PLAYBACK_RATE;
      video.playbackRate = PLAYBACK_RATE;
      video.addEventListener('playing', playing);
      video.addEventListener('ended', finished);
      video.addEventListener('timeupdate', progress);
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
      video.removeEventListener('ended', finished);
      video.removeEventListener('timeupdate', progress);
      video.removeEventListener('error', still);
      video.pause();
    };
  }, []);
  return <div className="hero-logo-film" data-state={state} role="img" aria-label={label}>
    <img className="hero-logo-still" src="/images/logo-reveal-still.webp" alt="" width="1080" height="792" decoding="async" />
    <img className="hero-logo-name" src="/images/logo-reveal-name.webp" alt="" width="1080" height="792" decoding="async" />
    <video ref={ref} muted playsInline preload="auto" aria-hidden="true" tabIndex={-1} />
    {ended ? <div className="hero-logo-3d" aria-hidden="true"><HeroCrest skipDrawing onTakeover={takeover} /></div> : null}
  </div>;
}
