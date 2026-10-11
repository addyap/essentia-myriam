'use client';
import { useEffect, useRef, useState } from 'react';
import { LogoMark } from './LogoMark';
import { LogoMarkDraw } from './LogoMarkDraw';

export function HeroCrest() {
  const [phase, setPhase] = useState('static');
  const [run, setRun] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let seen = false;
    try { seen = sessionStorage.getItem('essentia-crest') === 'seen'; } catch {}
    if (!preference.matches && !seen) setPhase('drawing');
    const change = () => { if (preference.matches) setPhase('static'); };
    preference.addEventListener('change', change);
    return () => preference.removeEventListener('change', change);
  }, []);
  const finish = () => {
    setPhase('gold');
    try { sessionStorage.setItem('essentia-crest', 'seen'); } catch {}
  };
  const move = event => {
    if (phase === 'drawing' || !matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--tilt-x', `${-3 - ((event.clientY - box.top) / box.height - .5) * 6}deg`);
    ref.current.style.setProperty('--tilt-y', `${5 + ((event.clientX - box.left) / box.width - .5) * 6}deg`);
  };
  const reset = () => {
    ref.current.style.removeProperty('--tilt-x');
    ref.current.style.removeProperty('--tilt-y');
  };
  return <div className="crest-experience">
    <div className="crest-stage" ref={ref} data-phase={phase} onPointerMove={move} onPointerLeave={reset}>
      <div className="crest-ink">{phase === 'drawing' ? <LogoMarkDraw key={run} onComplete={finish} /> : <LogoMark />}</div>
      <div className="crest-relief" aria-hidden="true">
        {[4, 3, 2, 1].map(layer => <LogoMark key={layer} className="crest-side" style={{ transform: `translateZ(${-layer * 1.5}px)` }} />)}
        <LogoMark className="crest-face" />
        <div className="crest-highlight"><LogoMark /></div>
      </div>
    </div>
    <button className="crest-replay" type="button" disabled={phase === 'drawing'} onClick={() => { reset(); setRun(value => value + 1); setPhase('drawing'); }}>
      Rejouer le dessin du logo
    </button>
  </div>;
}
