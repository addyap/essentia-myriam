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
    createContext: () => ({ Provider: 'ContextProvider' }), useContext: () => null,
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
  const document = { documentElement: { lang: 'fr' }, hidden: false, getElementById: () => ({}), addEventListener() {}, removeEventListener() {} };
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
    localStorage: { getItem: () => null, setItem() {} },
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

module.exports = { mount, find };
