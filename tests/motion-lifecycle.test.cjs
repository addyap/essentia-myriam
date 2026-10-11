const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { transform, loadBindings } = require('next/dist/build/swc');

// Exercise the real component effects with a deterministic clock and host mocks.
// GPU appearance and browser focus are checked separately in the built site.
async function mount(file, name, { reduced = false, host = {}, modules = {}, props = {} } = {}) {
  const hooks = [], effects = [], listeners = new Set(), frames = new Map();
  let cursor = 0, dirty = false, tree, frameId = 0, now = 0;
  const media = { matches: reduced, addEventListener: (_, fn) => listeners.add(fn), removeEventListener: (_, fn) => listeners.delete(fn) };
  const intersections = [];
  const jsx = (type, props) => {
    if (props?.ref) props.ref.current = host;
    return { type, props: props || {} };
  };
  const react = {
    useState(initial) {
      const i = cursor++;
      if (!(i in hooks)) hooks[i] = typeof initial === 'function' ? initial() : initial;
      return [hooks[i], value => { const next = typeof value === 'function' ? value(hooks[i]) : value; if (next !== hooks[i]) { hooks[i] = next; dirty = true; } }];
    },
    useRef(initial) { const i = cursor++; return hooks[i] ||= { current: initial }; },
    useCallback(fn, deps) { const i = cursor++; if (!hooks[i] || deps.some((d,j) => d !== hooks[i].deps[j])) hooks[i] = { fn, deps }; return hooks[i].fn; },
    useEffect(fn, deps) {
      const i = cursor++;
      if (!hooks[i] || deps.some((d,j) => d !== hooks[i].deps[j])) effects.push(() => { hooks[i]?.cleanup?.(); hooks[i] = { deps, cleanup: fn() }; });
    },
  };
  const document = { hidden: false, getElementById: () => ({}), addEventListener() {}, removeEventListener() {} };
  class Observer { constructor(fn) { this.fn = fn; intersections.push(this); } observe() {} disconnect() {} }
  const stubs = {
    react, 'react/jsx-runtime': { jsx, jsxs: jsx }, 'react-dom': { createPortal: children => children },
    'next/dynamic': () => 'Mock3D', './LogoMark': { LogoMark: 'LogoMark' }, './LogoMarkDraw': { LogoMarkDraw: 'LogoMarkDraw' }, ...modules,
  };
  await loadBindings();
  const compiled = await transform(fs.readFileSync(file, 'utf8'), { filename: file, jsc: { parser: { syntax:'ecmascript', jsx:true }, target:'es2020', transform:{ react:{runtime:'automatic'} } }, module:{type:'commonjs'} });
  const exports = {};
  vm.runInNewContext(compiled.code, {
    exports, require: id => { if (!(id in stubs)) throw Error(`Unexpected import: ${id}`); return stubs[id]; },
    matchMedia: () => media, document, devicePixelRatio: 1,
    IntersectionObserver: Observer, ResizeObserver: Observer,
    requestAnimationFrame: fn => { frames.set(++frameId, fn); return frameId; },
    cancelAnimationFrame: id => frames.delete(id),
  });
  const Component = exports[name];
  const flush = () => {
    do { dirty = false; cursor = 0; tree = Component(props); while (effects.length) effects.shift()(); } while (dirty);
    return tree;
  };
  flush();
  return {
    get tree() { return tree; }, media, document, intersections,
    flush,
    update(next) { props = { ...props, ...next }; flush(); },
    reduce(value) { media.matches = value; listeners.forEach(fn => fn()); flush(); },
    frame(dt = 50) { now += dt; const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(now)); flush(); },
    unmount() { hooks.forEach(hook => hook?.cleanup?.()); },
  };
}
function find(node, predicate) {
  if (!node || typeof node !== 'object') return null;
  if (predicate(node)) return node;
  for (const child of [node.props?.children].flat(Infinity)) { const match = find(child, predicate); if (match) return match; }
  return null;
}
const host = { querySelector: () => ({ outerHTML: '<svg viewBox="0 0 681 842" />' }), style: { removeProperty() {} } };
const stage = app => find(app.tree, node => node.props.className === 'crest-stage').props;
const model = app => find(app.tree, node => node.type === 'Mock3D');
const pen = app => find(app.tree, node => node.type === 'LogoMarkDraw');

test('late 3D readiness keeps the completed SVG visible and starts one takeover', async () => {
  const app = await mount('components/HeroCrest.js', 'HeroCrest', { host });
  assert.equal(stage(app)['data-phase'], 'drawing');
  assert.equal(model(app).props.animate, false);
  pen(app).props.onComplete(); app.flush();
  assert.equal(stage(app)['data-webgl'], false);
  assert.equal(stage(app)['data-phase'], 'gold');
  model(app).props.onReady(); app.flush();
  assert.equal(stage(app)['data-webgl'], true);
  app.unmount();
});
test('failed 3D uses the SVG fallback, and replay retries the model', async () => {
  const app = await mount('components/HeroCrest.js', 'HeroCrest', { host });
  model(app).props.onFailure(); app.flush();
  pen(app).props.onComplete(); app.flush();
  assert.equal(stage(app)['data-fallback'], true);
  assert.equal(model(app), null);
  find(app.tree, node => node.props.className === 'crest-replay').props.onClick(); app.flush();
  assert.equal(stage(app)['data-phase'], 'drawing');
  assert.ok(model(app)); app.unmount();
});
test('live reduced-motion changes remove the canvas and retain a static SVG', async () => {
  const app = await mount('components/HeroCrest.js', 'HeroCrest', { host });
  const finish = pen(app).props.onComplete;
  app.reduce(true);
  // A pen-completion event racing the preference change must not restart gold.
  finish(); app.flush();
  assert.equal(stage(app)['data-phase'], 'static');
  assert.equal(model(app), null);
  assert.equal(find(app.tree, node => node.props.className === 'crest-controls'), null);
  app.unmount();
});
test('reduced-motion initial load never starts handwriting or WebGL', async () => {
  const app = await mount('components/HeroCrest.js', 'HeroCrest', { host, reduced:true });
  assert.equal(stage(app)['data-phase'], 'static');
  assert.equal(pen(app), null); assert.equal(model(app), null); app.unmount();
});
test('handwriting pause and offscreen suspension preserve the pen position', async () => {
  const strokes = [{style:{}}], nibs = [{setAttribute(){}}];
  const fill = {style:{}};
  const svg = {querySelectorAll: selector => selector === '.hd-s' ? strokes : selector === '.hd-nib' ? nibs : [{getTotalLength:()=>100,getPointAtLength:()=>({x:0,y:0})}],querySelector:()=>fill};
  let completed = 0;
  const app = await mount('components/LogoMarkDraw.js','LogoMarkDraw',{host:svg,props:{onComplete:()=>completed++}});
  for(let i=0;i<30;i++) app.frame();
  const position = strokes[0].style.strokeDashoffset;
  app.update({paused:true}); for(let i=0;i<80;i++) app.frame();
  assert.equal(strokes[0].style.strokeDashoffset,position);
  app.update({paused:false}); app.intersections[0].fn([{isIntersecting:false}]);
  for(let i=0;i<80;i++) app.frame();
  assert.equal(strokes[0].style.strokeDashoffset,position);
  app.intersections[0].fn([{isIntersecting:true}]);
  for(let i=0;i<160;i++) app.frame();
  assert.equal(completed,1); assert.equal(fill.style.opacity,1); app.unmount();
});
test('reduced motion during handwriting immediately completes without pending frames', async () => {
  const stroke = {style:{}}, fill = {style:{}};
  const svg = {querySelectorAll: selector => selector === '.hd-s' ? [stroke] : selector === '.hd-nib' ? [{setAttribute(){}}] : [{getTotalLength:()=>100,getPointAtLength:()=>({x:0,y:0})}], querySelector:()=>fill};
  let completed = 0;
  const app = await mount('components/LogoMarkDraw.js','LogoMarkDraw',{host:svg,props:{onComplete:()=>completed++}});
  app.frame(); app.reduce(true);
  for(let i=0;i<20;i++)app.frame();
  assert.equal(completed,1); assert.equal(fill.style.opacity,1); app.unmount();
});

function gpu() {
  const rotations = [];
  class Item { constructor() { this.position = {set(){}}; this.rotation = {x:0,y:0}; } add(item) { if(item.rotation) this.group=item; } dispose() {} }
  class Renderer {
    constructor() { this.domElement={addEventListener(){},removeEventListener(){},remove(){}}; }
    setPixelRatio() {} setClearColor() {} setSize() {} dispose() {}
    render(scene) { rotations.push({...scene.group.rotation}); }
  }
  const T = { WebGLRenderer:Renderer, Scene:Item, Group:Item, OrthographicCamera:Item, DirectionalLight:Item, AmbientLight:Item, MeshBasicMaterial:Item, MeshStandardMaterial:Item,
    PMREMGenerator:class {fromScene(){return {texture:{},dispose(){}}}dispose(){}},
  };
  // No geometry required to exercise the production animation clock.
  class Loader { parse(){return {paths:[]}} }
  return { rotations, modules:{three:T,'three/addons/loaders/SVGLoader.js':{SVGLoader:Loader},'three/addons/environments/RoomEnvironment.js':{RoomEnvironment:Item}} };
}
const gpuHost = () => ({clientWidth:250,clientHeight:309,appendChild(){},addEventListener(){},removeEventListener(){}});
const importsReady = () => new Promise(resolve=>setImmediate(resolve));

test('3D waits for handwriting, holds the crossfade, pivots wider and settles', async () => {
  const { rotations, modules }=gpu();
  let ready=0;
  const app=await mount('components/GoldLogo3D.js','GoldLogo3D',{host:gpuHost(),modules,props:{source:'<svg/>',animate:false,onReady:()=>ready++,onFailure:()=>assert.fail('Unexpected GPU failure')}});
  await importsReady();
  for(let i=0;i<40;i++)app.frame();
  assert.equal(ready,1); assert.equal(rotations.at(-1).y,0);
  app.update({animate:true});
  for(let i=0;i<18;i++)app.frame();
  assert.equal(rotations.at(-1).y,0);
  for(let i=0;i<550;i++)app.frame();
  assert.ok(Math.max(...rotations.map(r=>r.y))>1, 'Yaw reaches roughly 60 degrees');
  assert.ok(Math.min(...rotations.map(r=>r.y))<-.95, 'Yaw reaches both sides');
  assert.ok(Math.abs(rotations.at(-1).y-.075)<.001,'Returns to the rest angle');
  assert.equal(ready,1,'Starting animation does not recreate the renderer');
  app.unmount();
});
test('3D pause stops rendering once settled, and resume wakes the animation', async () => {
  const {rotations,modules}=gpu();
  const app=await mount('components/GoldLogo3D.js','GoldLogo3D',{host:gpuHost(),modules,props:{source:'<svg/>',animate:true,onReady(){},onFailure:()=>assert.fail('Unexpected GPU failure')}});
  await importsReady(); for(let i=0;i<80;i++)app.frame();
  app.update({paused:true}); for(let i=0;i<50;i++)app.frame();
  const count=rotations.length, yaw=rotations.at(-1).y;
  for(let i=0;i<100;i++)app.frame();
  assert.equal(rotations.length,count);
  app.update({paused:false}); for(let i=0;i<20;i++)app.frame();
  assert.notEqual(rotations.at(-1).y,yaw); app.unmount();
});
test('WebGL initialization failure calls fallback without reporting readiness', async () => {
  const {modules}=gpu(); modules.three.WebGLRenderer=class {constructor(){throw Error('No WebGL context')}};
  let failed=0;
  const app=await mount('components/GoldLogo3D.js','GoldLogo3D',{host:gpuHost(),modules,props:{source:'<svg/>',animate:true,onReady:()=>assert.fail('Failed renderer cannot be ready'),onFailure:()=>failed++}});
  await importsReady(); assert.equal(failed,1); app.unmount();
});
