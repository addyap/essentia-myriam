const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mount, find } = require('./helpers/mount.cjs');

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
test('failed 3D uses the SVG fallback without visible logo controls', async () => {
  const app = await mount('components/HeroCrest.js', 'HeroCrest', { host });
  model(app).props.onFailure(); app.flush();
  pen(app).props.onComplete(); app.flush();
  assert.equal(stage(app)['data-fallback'], true);
  assert.equal(model(app), null);
  assert.equal(find(app.tree, node => node.type === 'button'), null);
  app.unmount();
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

test('3D waits for handwriting, holds the crossfade, pivots gently within readable angles and settles', async () => {
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
  assert.ok(Math.abs(rotations.at(-1).y-.05)>.01,'The longer choreography is still moving after 27 seconds');
  for(let i=0;i<200;i++)app.frame();
  assert.ok(Math.max(...rotations.map(r=>r.y))>.47, 'The fuller pivot is visible');
  assert.ok(rotations.every(r=>Math.abs(r.y)<=.52), 'Yaw stays below 30 degrees');
  assert.ok(rotations.every(r=>Math.abs(r.x)<=.20), 'Pitch stays within its readable limit');
  assert.ok(Math.min(...rotations.map(r=>r.x))<-.15, 'Forward and backward tilt adds visible depth');
  assert.ok(Math.min(...rotations.map(r=>r.y))<-.43, 'The fuller pivot reaches both sides');
  assert.ok(Math.abs(rotations.at(-1).y-.05)<.001,'Returns to the rest angle');
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

test('section logos keep a still preview until entering the viewport', async () => {
  const app = await mount('components/SectionLogo.js', 'SectionLogo', {
    host: {}, modules: { './Providers': { useApp: () => ({ t: { ui: { logoMotion: {} } } }) }, './HeroCrest': { HeroCrest: 'HeroCrest' } },
  });
  assert.equal(find(app.tree, node => node.type === 'HeroCrest'), null);
  app.intersections[0].fn([{ isIntersecting: false }]); app.flush();
  assert.equal(find(app.tree, node => node.type === 'HeroCrest'), null);
  app.intersections[0].fn([{ isIntersecting: true }]); app.flush();
  assert.ok(find(app.tree, node => node.type === 'HeroCrest'));
  app.unmount();
});

test('hero logos render no controls during drawing or pivoting', async () => {
  const app = await mount('components/HeroCrest.js', 'HeroCrest', { host });
  assert.equal(find(app.tree, node => node.type === 'button'), null);
  pen(app).props.onComplete(); app.flush();
  model(app).props.onReady(); app.flush();
  assert.equal(stage(app)['data-webgl'], true);
  assert.equal(find(app.tree, node => node.type === 'button'), null);
  app.unmount();
});
