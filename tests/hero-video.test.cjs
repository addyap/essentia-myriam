const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mount, find } = require('./helpers/mount.cjs');
function videoHost(rejection) {
  const events = new Map();
  return {
    parentElement: {}, plays: 0, pauses: 0, src: '',
    getAttribute() { return this.src; }, removeAttribute() { this.src = ''; }, load() {},
    play() { this.plays++; return rejection ? Promise.reject(rejection) : Promise.resolve(); },
    pause() { this.pauses++; },
    addEventListener(name, fn) { events.set(name, fn); },
    removeEventListener(name) { events.delete(name); },
    emit(name) { events.get(name)?.(); },
  };
}
const labels = { pause: 'Pause video', resume: 'Resume video' };
const start = (host, options = {}) => mount('components/HeroVideo.js', 'HeroVideo', { host, props: { labels }, ...options });
const ready = app => find(app.tree, n => n.type === 'video').props['data-ready'];
test('reduced motion and data saving do not attach or download the video source', async () => {
  for (const options of [{ reduced: true }, { environment: { navigator: { connection: { effectiveType: '2g' } } } }, { environment: { navigator: { connection: { saveData: true } } } }]) {
    const host = videoHost(), app = await start(host, options);
    assert.equal(host.src, ''); assert.equal(host.plays, 0); assert.equal(ready(app), false);
    app.unmount();
  }
});
test('video becomes visible only after playback, and pause/resume controls work', async () => {
  const host = videoHost(), app = await start(host);
  assert.equal(ready(app), false); assert.equal(host.src, '/videos/forest-sunlight.mp4');
  host.emit('playing'); app.flush(); assert.equal(ready(app), true);
  find(app.tree, n => n.type === 'button').props.onClick(); app.flush();
  assert.equal(find(app.tree, n => n.type === 'button').props['aria-pressed'], true);
  const plays = host.plays;
  find(app.tree, n => n.type === 'button').props.onClick(); app.flush(); assert.ok(host.plays > plays);
  app.unmount(); assert.equal(host.src, '');
});
test('offscreen playback suspends and live reduced motion restores the still', async () => {
  const host = videoHost(), app = await start(host);
  host.emit('playing'); app.flush();
  app.intersections[0].fn([{ isIntersecting: false }]); assert.ok(host.pauses > 0);
  const plays = host.plays;
  app.intersections[0].fn([{ isIntersecting: true }]); assert.ok(host.plays > plays);
  app.reduce(true); assert.equal(host.src, ''); assert.equal(ready(app), false);
  app.unmount();
});
test('autoplay rejection preserves the image fallback without a broken pause control', async () => {
  const host = videoHost(Object.assign(Error('blocked'), { name: 'NotAllowedError' }));
  const app = await start(host); await Promise.resolve(); app.flush();
  assert.equal(ready(app), false); assert.equal(find(app.tree, n => n.type === 'button'), null);
  assert.equal(host.src, '');
  app.unmount();
});

test('phones select only the portrait mobile asset and retain it on resume', async () => {
  const host = videoHost(), app = await start(host, { mobile: true });
  assert.equal(host.src, '/videos/forest-sunlight-mobile.mp4');
  host.emit('playing'); app.flush();
  find(app.tree, n => n.type === 'button').props.onClick(); app.flush();
  find(app.tree, n => n.type === 'button').props.onClick(); app.flush();
  assert.equal(host.src, '/videos/forest-sunlight-mobile.mp4');
  app.unmount();
});

test('mobile video stays within its one-megabyte payload budget', () => {
  const { statSync } = require('node:fs');
  assert.ok(statSync('public/videos/forest-sunlight-mobile.mp4').size < 1000000);
});

test('section headers select their own mobile video and keep pause controls local', async () => {
  for (const clip of ['sunrise-valley', 'golden-sea']) {
    const host = videoHost();
    const app = await mount('components/HeroVideo.js', 'HeroVideo', { host, mobile: true,
      props: { labels, desktopSource: `/videos/${clip}.mp4`, mobileSource: `/videos/${clip}-mobile.mp4`, controlsTarget: null },
      modules: { 'react-dom': { createPortal() { throw Error('Section controls must stay local'); } } },
    });
    assert.equal(host.src, `/videos/${clip}-mobile.mp4`);
    host.emit('playing'); app.flush();
    const button = find(app.tree, n => n.type === 'button');
    assert.equal(button.props['aria-label'], labels.pause);
    button.props.onClick(); app.flush();
    assert.equal(find(app.tree, n => n.type === 'button').props['aria-label'], labels.resume);
    app.reduce(true); assert.equal(host.src, '');
    app.unmount();
  }
});

test('each new header has a matching poster and a mobile video below one megabyte', () => {
  const { statSync } = require('node:fs');
  for (const clip of ['sunrise-valley', 'golden-sea']) {
    assert.ok(statSync(`public/videos/${clip}-mobile.mp4`).size < 1000000);
    assert.ok(statSync(`public/images/nature/${clip}.webp`).size > 0);
  }
});
