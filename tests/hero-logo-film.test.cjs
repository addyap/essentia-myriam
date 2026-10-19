const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mount, find } = require('./helpers/mount.cjs');

// A fake <video> that records what the component asks of it.
function videoHost({ play = () => Promise.resolve() } = {}) {
  const listeners = {};
  return {
    listeners, src: null, muted: false, ended: false, paused: true, loads: 0,
    addEventListener: (name, fn) => { listeners[name] = fn; }, removeEventListener: (name) => { delete listeners[name]; },
    setAttribute() {}, getAttribute(name) { return name === 'src' ? this.src : null; },
    removeAttribute(name) { if (name === 'src') this.src = null; }, load() { this.loads++; },
    play() { this.paused = false; return play(); }, pause() { this.paused = true; },
    set srcValue(v) { this.src = v; },
  };
}
const environment = (vendor = 'Google Inc.', extra = {}) => {
  const events = {};
  return { events, env: {
    navigator: { vendor, ...extra },
    window: { addEventListener: (n, fn) => { events[n] = fn; }, removeEventListener: (n) => { delete events[n]; } },
    setTimeout: (fn) => { events.timeout = fn; return 1; }, clearTimeout: () => { delete events.timeout; },
  } };
};
const film = app => find(app.tree, node => node.props.className === 'hero-logo-film').props;
async function start(options = {}) {
  const host = videoHost(options);
  // The component assigns video.src; mirror it into the attribute the fake reads.
  const proxy = new Proxy(host, { set(target, key, value) { if (key === 'src') target.src = value; else target[key] = value; return true; } });
  const { events, env } = environment(options.vendor, options.navigator);
  const app = await mount('components/HeroLogoFilm.js', 'HeroLogoFilm', { host: proxy, reduced: options.reduced, environment: env, props: { label: 'Myriam Diougoan Blanch' } });
  return { app, host, events };
}

test('plays the logo film once it starts, labelled with Myriam\'s name', async () => {
  const chrome = await start();
  assert.equal(chrome.host.src, '/videos/logo-reveal.mp4');
  assert.equal(chrome.host.muted, true);
  assert.ok(Math.abs(chrome.host.playbackRate - 2 / 3) < 1e-9, 'played slower than recorded');
  assert.equal(film(chrome.app)['data-state'], 'pending');
  chrome.host.listeners.playing(); chrome.app.flush();
  assert.equal(film(chrome.app)['data-state'], 'film');
  assert.equal(film(chrome.app)['aria-label'], 'Myriam Diougoan Blanch');
});

test('reduced motion and Save-Data show the still logo without loading the film', async () => {
  for (const options of [{ reduced: true }, { navigator: { connection: { saveData: true } } }]) {
    const { app, host } = await start(options);
    assert.equal(film(app)['data-state'], 'still');
    assert.equal(host.src, null);
  }
});

test('a refused autoplay, a decoding error or a slow start fall back to the still logo', async () => {
  const refused = await start({ play: () => Promise.reject(Object.assign(Error('denied'), { name: 'NotAllowedError' })) });
  await new Promise(resolve => setImmediate(resolve)); refused.app.flush();
  assert.equal(film(refused.app)['data-state'], 'still');

  const broken = await start();
  broken.host.listeners.error(); broken.app.flush();
  assert.equal(film(broken.app)['data-state'], 'still');

  const slow = await start();
  slow.events.timeout(); slow.app.flush();
  assert.equal(film(slow.app)['data-state'], 'still');
  assert.equal(slow.host.src, null, 'stops downloading');
});

test('the hero pause button pauses and resumes the logo film', async () => {
  const { app, host, events } = await start();
  host.listeners.playing(); app.flush();
  events['hero-motion']({ detail: { paused: true } });
  assert.equal(host.paused, true);
  events['hero-motion']({ detail: { paused: false } });
  assert.equal(host.paused, false);
});

test('turning on reduced motion mid-film switches to the still logo', async () => {
  const { app } = await start();
  app.reduce(true);
  assert.equal(film(app)['data-state'], 'still');
});
