'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LogoMark } from './LogoMark';
import { LogoMarkDraw } from './LogoMarkDraw';
import dynamic from 'next/dynamic';
const GoldLogo3D = dynamic(() => import('./GoldLogo3D').then(m => m.GoldLogo3D), { ssr: false });

export function HeroCrest() {
  const [phase, setPhase] = useState('static');
  const [source, setSource] = useState('');
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reduced, setReduced] = useState(true);
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => { setReady(false); setFailed(true); }, []);
  const ref = useRef(null);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(preference.matches);
    const svg = ref.current.querySelector('.crest-face');
    setSource(svg.outerHTML);
    if (!preference.matches) setPhase('drawing');
    const change = () => { setReduced(preference.matches); if (preference.matches) setPhase('static'); };
    preference.addEventListener('change', change);
    return () => preference.removeEventListener('change', change);
  }, []);
  const finish = () => {
    setPhase(matchMedia('(prefers-reduced-motion: reduce)').matches ? 'static' : 'gold');
  };
  const move = event => {
    if (ready || phase === 'drawing' || !matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--tilt-x', `${-3 - ((event.clientY - box.top) / box.height - .5) * 6}deg`);
    ref.current.style.setProperty('--tilt-y', `${5 + ((event.clientX - box.left) / box.width - .5) * 6}deg`);
  };
  const reset = () => {
    ref.current.style.removeProperty('--tilt-x');
    ref.current.style.removeProperty('--tilt-y');
  };
  return <div className="crest-experience">
    <div className="crest-stage" ref={ref} data-phase={phase} data-fallback={failed || reduced} data-webgl={ready && !reduced && phase !== 'drawing'} onPointerMove={move} onPointerLeave={reset}>
      <div className="crest-ink">{phase === 'drawing' ? <LogoMarkDraw onComplete={finish} /> : <LogoMark />}</div>
      <div className="crest-relief" aria-hidden="true">
        {[4, 3, 2, 1].map(layer => <LogoMark key={layer} className="crest-side" style={{ transform: `translate3d(${layer * .45}px,${layer * .6}px,${-layer * 1.5}px)` }} />)}
        <LogoMark className="crest-face" />
        <div className="crest-highlight"><LogoMark /></div>
      </div>
      {!reduced && !failed && source && <GoldLogo3D source={source} animate={phase === 'gold'} onReady={onReady} onFailure={onFailure} />}
    </div>
  </div>;
}
