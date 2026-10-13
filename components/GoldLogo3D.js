'use client';
import { useEffect, useRef } from 'react';

// Prepare behind the handwriting; start the pivot only after the handoff.
export function GoldLogo3D({ source, animate, paused = false, onReady, onFailure }) {
  const host = useRef(null);
  const pause = useRef(paused);
  const playing = useRef(animate);
  const wake = useRef(null);
  useEffect(() => { playing.current = animate; wake.current?.(); }, [animate]);
  useEffect(() => { pause.current = paused; wake.current?.(); }, [paused]);
  useEffect(() => {
    let disposed = false, renderer, frame, observer, resizeObserver, cleanup = () => {};
    const geometries = [], materials = [];
    let environment, pmrem;
    Promise.all([import('three'), import('three/addons/loaders/SVGLoader.js'), import('three/addons/environments/RoomEnvironment.js')]).then(([T, { SVGLoader }, { RoomEnvironment }]) => {
      if (disposed) return;
      const el = host.current;
      renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      // The crest is small on phones: cap raster work without removing 3D.
      const compact = matchMedia('(max-width: 600px)').matches;
      renderer.setPixelRatio(Math.min(devicePixelRatio, compact ? 1.25 : 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = T.SRGBColorSpace;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = .85;
      el.appendChild(renderer.domElement);
      const scene = new T.Scene();
      const camera = new T.OrthographicCamera(-340.5, 340.5, 421, -421, .1, 3000);
      camera.position.z = 1500;
      pmrem = new T.PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      environment = pmrem.fromScene(room, .04);
      room.dispose();
      scene.environment = environment.texture;
      const light = new T.DirectionalLight(0xfff4d4, 1.5);
      light.position.set(-300, 500, 800); scene.add(light);
      scene.add(new T.AmbientLight(0xffffff, .35));
      // Keep the front face exactly brand gold; lighting affects only the bevel and sides.
      const face = new T.MeshBasicMaterial({ color: '#FCC200', toneMapped: false, side: T.DoubleSide });
      const edge = new T.MeshStandardMaterial({ color: '#FCC200', metalness: .65, roughness: .38, side: T.DoubleSide });
      materials.push(face, edge);
      const group = new T.Group(); scene.add(group);
      const data = new SVGLoader().parse(source.replaceAll('currentColor', '#FCC200'));
      for (const path of data.paths) {
        for (const shape of path.toShapes()) {
          const geometry = new T.ExtrudeGeometry(shape, { depth: 14, bevelEnabled: true, bevelThickness: 1.1, bevelSize: .65, bevelSegments: 2, curveSegments: compact ? 12 : 20, steps: 1 });
          geometry.translate(-340.5, -421, -7);
          geometry.scale(1, -1, 1);
          geometries.push(geometry); group.add(new T.Mesh(geometry, [face, edge]));
        }
      }
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
        const targetX = Math.max(-.20, Math.min(.20, p * -.045 + Math.sin(p * Math.PI * 3) * -.14 + py * pointerBlend));
        const targetY = Math.max(-.52, Math.min(.52, excursion + p * .05 + px * pointerBlend));
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
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); environment?.dispose(); pmrem?.dispose();
      renderer?.dispose(); renderer?.domElement.remove();
    };
  }, [source, onReady, onFailure]);
  return <div ref={host} className="crest-webgl" aria-hidden="true" />;
}
