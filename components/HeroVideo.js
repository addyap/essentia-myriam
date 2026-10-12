'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export function HeroVideo({ labels, desktopSource = '/videos/forest-sunlight.mp4', mobileSource = '/videos/forest-sunlight-mobile.mp4', controlsTarget = 'hero-logo-controls' }) {
  const ref = useRef(null);
  const wake = useRef(null);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [controls, setControls] = useState(null);

  useEffect(() => { pausedRef.current = paused; wake.current?.(); }, [paused]);
  useEffect(() => {
    const video = ref.current;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const connection = navigator.connection;
    // Choose once: rotating/resizing must not trigger a second video download.
    const source = matchMedia('(max-width: 600px)').matches
      ? mobileSource
      : desktopSource;
    let visible = true, failed = false, disposed = false;
    if (controlsTarget) setControls(document.getElementById(controlsTarget));
    const permitted = () => !preference.matches && !connection?.saveData && !['slow-2g', '2g'].includes(connection?.effectiveType);
    const fail = () => { if (!disposed) { failed = true; setReady(false); video.pause(); video.removeAttribute('src'); video.load(); } };
    const playing = () => {
      if (!permitted() || !visible || document.hidden || pausedRef.current) video.pause();
      else setReady(true);
    };
    const sync = () => {
      if (disposed) return;
      if (!permitted()) {
        video.pause(); setReady(false);
        if (video.getAttribute('src')) { video.removeAttribute('src'); video.load(); }
        return;
      }
      if (failed || !visible || document.hidden || pausedRef.current) { video.pause(); return; }
      if (!video.getAttribute('src')) { video.src = source; video.load(); }
      video.play()?.catch(error => { if (error.name !== 'AbortError') fail(); });
    };
    wake.current = sync;
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting; sync();
    });
    observer?.observe(video.parentElement);
    video.addEventListener('playing', playing);
    video.addEventListener('error', fail);
    preference.addEventListener('change', sync);
    connection?.addEventListener?.('change', sync);
    document.addEventListener('visibilitychange', sync);
    sync();
    return () => {
      disposed = true; wake.current = null; observer?.disconnect();
      video.removeEventListener('playing', playing); video.removeEventListener('error', fail);
      preference.removeEventListener('change', sync);
      connection?.removeEventListener?.('change', sync);
      document.removeEventListener('visibilitychange', sync);
      video.pause(); video.removeAttribute('src'); video.load();
    };
  }, [desktopSource, mobileSource, controlsTarget]);

  const button = <button className="hero-video-control" type="button" aria-label={paused ? labels.resume : labels.pause} aria-pressed={paused} onClick={() => setPaused(value => !value)}>
    <span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span>
  </button>;
  return <>
    <video ref={ref} className="hero-cine-video" data-ready={ready} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} />
    {ready && (controlsTarget ? controls && createPortal(button, controls) : button)}
  </>;
}
