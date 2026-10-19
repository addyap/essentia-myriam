'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Loaded only once the film has ended, so it never competes with the pen.
const HeroCrest = dynamic(() => import('./HeroCrest').then(m => m.HeroCrest), { ssr: false });

// Myriam's own logo reveal: the monogram written by a glowing pen, then her
// name, directly over the forest. The film supplies only the shapes of the
// strokes, with Myriam's name levelled (it was inclined in her source video).
// The browser paints them (paintFrame) in the 3D logo's own gold, with the
// same formula as its shader and its deep-gold raised edge, so the colour
// never depends on how a browser decodes video colour and nothing changes when
// the 3D logo takes over. The name stays brand gold (#FCC200). If a browser
// cannot read the film's transparency in a canvas, the film shows as it is.
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

// Film frame size, where the 3D logo sits on it (globals.css .hero-logo-3d),
// and the rows below which Myriam's name is written.
const W = 1080, H = 792, SPLIT = 583;
const LOGO = { x: 0.31355 * W, y: 0.11581 * H, w: 0.36873 * W };
LOGO.h = LOGO.w * 842 / 681;
const EDGE = { dx: 4, dy: 3, colour: [176, 135, 6] }; // the 3D logo's lit sides, as measured on screen

// GoldLogo3D's face: brand gold times mix(0.84, 1.04, smoothstep(-421, 421, y - 0.35x))
// in the logo's own coordinates. The name keeps flat brand gold.
function goldFields() {
  const face = document.createElement('canvas'), edge = document.createElement('canvas');
  face.width = edge.width = W; face.height = edge.height = H;
  const f = face.getContext('2d'), e = edge.getContext('2d');
  const pixels = f.createImageData(W, H), d = pixels.data;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let k = 1;
    if (y < SPLIT) {
      const xs = (x - LOGO.x) / LOGO.w * 681 - 340.5, ys = 421 - (y - LOGO.y) / LOGO.h * 842;
      const t = Math.min(1, Math.max(0, (ys - 0.35 * xs + 421) / 842));
      k = 0.84 + 0.2 * t * t * (3 - 2 * t);
    }
    const i = (y * W + x) * 4;
    d[i] = Math.min(255, Math.round(252 * k)); d[i + 1] = Math.min(255, Math.round(194 * k)); d[i + 2] = 0; d[i + 3] = 255;
  }
  f.putImageData(pixels, 0, 0);
  e.fillStyle = `rgb(${EDGE.colour.join(',')})`; e.fillRect(0, 0, W, SPLIT);
  return { face, edge };
}

// Paints one film frame: the raised edge (the stroke shapes shifted down-right),
// then the gold face on top. Returns false if the canvas did not receive the
// film's transparency (its transparent corner came out opaque).
function paintFrame(ctx, layer, video, fields, check) {
  const lctx = layer.getContext('2d');
  lctx.globalCompositeOperation = 'source-over'; lctx.clearRect(0, 0, W, H);
  lctx.drawImage(video, 0, 0, W, H);
  if (check && lctx.getImageData(2, 2, 1, 1).data[3] > 8) return false;
  lctx.globalCompositeOperation = 'source-in'; lctx.drawImage(fields.face, 0, 0);
  ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, W, H);
  ctx.drawImage(video, EDGE.dx, EDGE.dy, W, H);
  ctx.globalCompositeOperation = 'source-in'; ctx.drawImage(fields.edge, 0, 0);
  ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(layer, 0, 0);
  return true;
}

export function HeroLogoFilm({ label }) {
  const ref = useRef(null);
  const canvas = useRef(null);
  const [state, setState] = useState('pending'); // pending | film | still | gold
  const [paint, setPaint] = useState('pending'); // pending | on | off
  const [ended, setEnded] = useState(false);
  const [saveData, setSaveData] = useState(false);
  // The 3D logo takes over from the film, or from the still when the film could not play.
  const takeover = useCallback(() => setState(current => (current === 'film' || current === 'still' ? 'gold' : current)), []);
  useEffect(() => {
    const video = ref.current;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    let settled = false, timer = 0;
    // The gold monogram takes over from the still too: as the 3D logo when the
    // film could not play, or as the still gold relief with reduced motion or
    // Save-Data, exactly as on the inner pages.
    const still = () => {
      settled = true; clearTimeout(timer); setState('still');
      video.pause(); video.removeAttribute('src'); video.load();
      setEnded(true);
    };
    const playing = () => { play(); if (!settled) { settled = true; clearTimeout(timer); setState('film'); } };
    const finished = () => { stop(); if (!reduce.matches) setEnded(true); };
    // Some browsers do not always report 'ended' at a slowed playback rate.
    const progress = () => { if (video.duration && video.currentTime >= video.duration - 0.1) finished(); };
    // The background video's pause button stops the logo as well.
    const motion = event => {
      if (event.detail?.paused) video.pause();
      else if (video.getAttribute('src') && !video.ended) video.play()?.catch(() => {});
    };
    // Repaint whenever the film shows a new frame while it plays.
    const ctx = canvas.current?.getContext?.('2d');
    let fields = null, layer = null, frame = 0, shown = -1, checked = false, painting = Boolean(ctx);
    const draw = () => {
      frame = 0;
      if (!painting) return;
      if (video.readyState >= 2 && video.currentTime !== shown) {
        shown = video.currentTime;
        if (!fields) { fields = goldFields(); layer = document.createElement('canvas'); layer.width = W; layer.height = H; }
        let ok = true;
        try { ok = paintFrame(ctx, layer, video, fields, !checked); } catch { ok = false; }
        if (!ok) { painting = false; setPaint('off'); return; }
        if (!checked) { checked = true; setPaint('on'); }
      }
      if (!video.paused && !video.ended) frame = requestAnimationFrame(draw);
    };
    const play = () => { if (!frame) frame = requestAnimationFrame(draw); };
    const stop = () => { cancelAnimationFrame(frame); frame = 0; draw(); };
    if (!ctx) setPaint('off');
    const preference = () => { if (reduce.matches) still(); };
    reduce.addEventListener('change', preference);
    window.addEventListener('hero-motion', motion);
    setSaveData(Boolean(navigator.connection?.saveData));
    if (reduce.matches || navigator.connection?.saveData) still();
    else {
      video.muted = true;
      video.src = navigator.vendor === 'Apple Computer, Inc.' ? WEBKIT_SOURCE : SOURCE;
      video.defaultPlaybackRate = PLAYBACK_RATE;
      video.playbackRate = PLAYBACK_RATE;
      video.addEventListener('playing', playing);
      video.addEventListener('play', play);
      video.addEventListener('pause', stop);
      video.addEventListener('ended', finished);
      video.addEventListener('timeupdate', progress);
      video.addEventListener('error', still);
      // A slow connection should not leave the hero without its logo.
      timer = setTimeout(() => { if (!settled) still(); }, START_TIMEOUT_MS);
      video.play()?.catch(error => { if (error?.name !== 'AbortError') still(); });
    }
    return () => {
      clearTimeout(timer); cancelAnimationFrame(frame);
      video.removeEventListener('play', play);
      video.removeEventListener('pause', stop);
      reduce.removeEventListener('change', preference);
      window.removeEventListener('hero-motion', motion);
      video.removeEventListener('playing', playing);
      video.removeEventListener('ended', finished);
      video.removeEventListener('timeupdate', progress);
      video.removeEventListener('error', still);
      video.pause();
    };
  }, []);
  return <div className="hero-logo-film" data-state={state} data-paint={paint} role="img" aria-label={label}>
    <img className="hero-logo-still" src="/images/logo-reveal-still.webp" alt="" width="1080" height="792" decoding="async" />
    <img className="hero-logo-name" src="/images/logo-reveal-name.webp" alt="" width="1080" height="792" decoding="async" />
    <video ref={ref} muted playsInline preload="auto" aria-hidden="true" tabIndex={-1} />
    <canvas ref={canvas} className="hero-logo-paint" width={W} height={H} aria-hidden="true" />
    {ended ? <div className="hero-logo-3d" aria-hidden="true"><HeroCrest skipDrawing onTakeover={takeover} noWebGL={saveData} /></div> : null}
  </div>;
}
