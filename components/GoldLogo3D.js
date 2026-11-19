'use client';
import { useEffect, useRef } from 'react';

// The sculpted gold monogram, modelled in Blender (design/blender-logo-test/logo-test.blend)
// from the same SVG outline: rounded strokes whose front silhouette matches the SVG
// exactly, in SVG units centred on the viewBox, so the handwriting hands over in place.
// Meshopt-compressed (about 120 KB over the wire); the decoder is about 8 KB.
export const CREST_MODEL = '/models/mdb-crest.glb';
const KEY = 4.4, FILL = 2.4, RIM = 2.2, AMBIENT = 2.1;

// Prepare behind the handwriting; start the pivot only after the handoff.
export function GoldLogo3D({ animate, paused = false, onReady, onFailure }) {
  const host = useRef(null);
  const pause = useRef(paused);
  const playing = useRef(animate);
  const wake = useRef(null);
  useEffect(() => { playing.current = animate; wake.current?.(); }, [animate]);
  useEffect(() => { pause.current = paused; wake.current?.(); }, [paused]);
  useEffect(() => {
    let disposed = false, renderer, frame, observer, resizeObserver, cleanup = () => {};
    const geometries = [], materials = [];
    Promise.all([
      import('three'), import('three/addons/loaders/GLTFLoader.js'), import('three/addons/libs/meshopt_decoder.module.js'),
    ]).then(async ([T, { GLTFLoader }, { MeshoptDecoder }]) => {
      if (disposed) return;
      const model = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(CREST_MODEL);
      if (disposed) return;
      const el = host.current;
      renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      // The crest is small on phones: cap raster work without removing 3D.
      const compact = matchMedia('(max-width: 600px)').matches;
      renderer.setPixelRatio(Math.min(devicePixelRatio, compact ? 1.25 : 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = T.SRGBColorSpace;
      el.appendChild(renderer.domElement);
      const scene = new T.Scene();
      const camera = new T.OrthographicCamera(-340.5, 340.5, 421, -421, .1, 3000);
      camera.position.z = 1500;
      // The Blender studio: a warm key from the upper left, a soft fill from the
      // right and a rim from behind that lights the rounded edges.
      const warm = 0xffeecc;
      const key = new T.DirectionalLight(warm, KEY); key.position.set(-3, 4, 4); scene.add(key);
      const fill = new T.DirectionalLight(warm, FILL); fill.position.set(4, -1, 6); scene.add(fill);
      const rim = new T.DirectionalLight(warm, RIM); rim.position.set(2, 4, -2); scene.add(rim);
      scene.add(new T.AmbientLight(0xffffff, AMBIENT));
      // Satin gold: light falls across the whole surface, as in the studio render.
      const gold = new T.MeshStandardMaterial({ color: '#FCC200', roughness: .5, metalness: .4 });
      materials.push(gold);
      const group = new T.Group(); scene.add(group);
      model.scene.traverse(node => {
        if (!node.isMesh) return;
        geometries.push(node.geometry);
        group.add(new T.Mesh(node.geometry, gold));
      });
      let elapsed = 0, last = null, visible = true, px = 0, py = 0;
      const duration = 32000;
      const handoff = 900;
      const draw = now => {
        frame = null;
        if (disposed || !visible || document.hidden) { last = null; return; }
        const dt = Math.min(last === null ? 16 : now - last, 50);
        if (last !== null && playing.current && !pause.current) elapsed += Math.min(now - last, 50);
        last = now;
        const p = Math.min(1, Math.max(0, elapsed - handoff) / duration);
        // Broader, lingering turns add presence without exceeding the readable yaw limit.
        const envelope = Math.min(1, p / .08, (1 - p) / .08);
        const wave = Math.sin(p * Math.PI * 6);
        const excursion = Math.sign(wave) * Math.pow(Math.abs(wave), .8) * .50 * Math.max(0, envelope);
        const pointerBlend = Math.min(1, Math.max(0, elapsed - handoff) / 250);
        const targetX = Math.max(-.20, Math.min(.20, p * -.10 + Math.sin(p * Math.PI * 3) * -.14 + py * pointerBlend));
        const settle = Math.max(0, (p - .9) / .1);
        const restYaw = p * .18 + .08 * settle * settle * (3 - 2 * settle);
        const targetY = Math.max(-.52, Math.min(.52, excursion + restYaw + px * pointerBlend));
        const blend = 1 - Math.exp(-dt / 130);
        group.rotation.x += (targetX - group.rotation.x) * blend;
        group.rotation.y += (targetY - group.rotation.y) * blend;
        renderer.render(scene, camera);
        if ((playing.current && !pause.current && p < 1) || Math.abs(targetX - group.rotation.x) > .0001 || Math.abs(targetY - group.rotation.y) > .0001) frame = requestAnimationFrame(draw);
      };
      const schedule = () => { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw); };
      wake.current = () => { last = null; schedule(); };
      const resize = () => { renderer.setSize(el.clientWidth, el.clientHeight); schedule(); };
      const move = event => {
        if (!playing.current || elapsed < handoff || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        const r = el.getBoundingClientRect();
        px = ((event.clientX - r.left) / r.width - .5) * .14;
        py = ((event.clientY - r.top) / r.height - .5) * .14;
        schedule();
      };
      const leave = () => { px = py = 0; schedule(); };
      const visibility = () => { last = null; schedule(); };
      const lost = event => { event.preventDefault(); onFailure(); };
      el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave);
      renderer.domElement.addEventListener('webglcontextlost', lost);
      document.addEventListener('visibilitychange', visibility);
      resizeObserver = new ResizeObserver(resize); resizeObserver.observe(el);
      observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => { visible = entries[0].isIntersecting; last = null; schedule(); }); observer?.observe(el);
      cleanup = () => {
        el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave);
        renderer.domElement.removeEventListener('webglcontextlost', lost);
        document.removeEventListener('visibilitychange', visibility);
      };
      resize(); renderer.render(scene, camera); onReady();
    }).catch(() => { if (!disposed) onFailure(); });
    return () => {
      disposed = true; wake.current = null; cancelAnimationFrame(frame); cleanup(); observer?.disconnect(); resizeObserver?.disconnect();
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose());
      renderer?.dispose(); renderer?.domElement.remove();
    };
  }, [onReady, onFailure]);
  return <div ref={host} className="crest-webgl" aria-hidden="true" />;
}
