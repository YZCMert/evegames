import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as skeletonClone } from 'three/addons/utils/SkeletonUtils.js';

const LW = (window.LW = window.LW || {});

const gltfLoader = new GLTFLoader();
const modelCache = new Map();
const MODEL_ROOT = 'models/';

export function loadModel(path) {
  const url = /^(https?:)?\//.test(path) ? path : MODEL_ROOT + path;
  if (!modelCache.has(url)) {
    modelCache.set(url, new Promise((resolve, reject) => {
      gltfLoader.load(url, gltf => {
        gltf.scene.traverse(o => {
          if (o.isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
            if (o.material && o.material.map) o.material.map.colorSpace = THREE.SRGBColorSpace;
          }
        });
        resolve(gltf);
      }, undefined, err => { modelCache.delete(url); reject(err); });
    }));
  }
  return modelCache.get(url);
}

export async function instance(path, opts = {}) {
  const gltf = await loadModel(path);
  const obj = gltf.animations && gltf.animations.length ? skeletonClone(gltf.scene) : gltf.scene.clone(true);
  obj.userData.animations = gltf.animations || [];
  obj.traverse(o => { if (o.isMesh && o.material) o.material = o.material.clone(); });
  if (opts.scale) obj.scale.multiplyScalar(opts.scale);
  if (opts.size || opts.ground !== false) {
    const box = new THREE.Box3().setFromObject(obj);
    const dims = box.getSize(new THREE.Vector3());
    if (opts.size) {
      const longest = Math.max(dims.x, dims.y, dims.z) || 1;
      obj.scale.multiplyScalar(opts.size / longest);
      box.setFromObject(obj);
    }
    if (opts.ground !== false) obj.position.y -= box.min.y;
  }
  if (opts.y) obj.position.y += opts.y;
  return obj;
}

export function preload(paths) {
  return Promise.all(paths.map(p => loadModel(p).catch(e => { console.warn('model missing', p, e); return null; })));
}

export function setEmissive(obj, hex, intensity = 1) {
  obj.traverse(o => {
    if (o.isMesh && o.material && o.material.emissive) {
      o.material.emissive.setHex(hex);
      o.material.emissiveIntensity = intensity;
    }
  });
}

export const ease = {
  linear: t => t,
  outCubic: t => 1 - Math.pow(1 - t, 3),
  inOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outBack: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  outBounce: t => {
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
  inQuad: t => t * t,
  outQuad: t => 1 - (1 - t) * (1 - t)
};

const texCache = new Map();

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function emojiTexture(emoji, px = 256) {
  const key = 'e:' + emoji + ':' + px;
  if (texCache.has(key)) return texCache.get(key);
  const c = document.createElement('canvas');
  c.width = c.height = px;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, px, px);
  ctx.font = Math.round(px * 0.72) + 'px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, px / 2, px / 2 + px * 0.04);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  texCache.set(key, tex);
  return tex;
}

export function textTexture(text, opts = {}) {
  const fontPx = opts.fontPx || 64;
  const pad = opts.pad == null ? fontPx * 0.45 : opts.pad;
  const font = (opts.weight || 600) + ' ' + fontPx + 'px ' + (opts.font || 'Fredoka, "Noto Sans Thai", "Segoe UI", sans-serif');
  const key = 't:' + JSON.stringify([text, fontPx, pad, font, opts.color, opts.bg, opts.border]);
  if (texCache.has(key)) return texCache.get(key);

  const measure = document.createElement('canvas').getContext('2d');
  measure.font = font;
  const tw = Math.ceil(measure.measureText(text).width);
  const w = Math.max(fontPx, tw + pad * 2), h = Math.round(fontPx * 1.35 + pad * 1.1);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  if (opts.bg) {
    ctx.fillStyle = opts.bg;
    roundRect(ctx, 3, 3, w - 6, h - 6, Math.min(h / 2, opts.radius == null ? 22 : opts.radius));
    ctx.fill();
    if (opts.border) { ctx.lineWidth = 6; ctx.strokeStyle = opts.border; ctx.stroke(); }
  }
  ctx.font = font;
  ctx.fillStyle = opts.color || '#2a2440';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2 + fontPx * 0.04);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const out = { texture: tex, w, h };
  texCache.set(key, out);
  return out;
}

const PALETTE = {
  ink: 0x2a2440, cream: 0xfffdf6, paper: 0xfff8e7,
  green: 0x45b36b, greenDk: 0x2f8f52, blue: 0x2f8fd8, red: 0xe8453c,
  amber: 0xf0a92c, purple: 0x9b5de5, pink: 0xef6fa0, teal: 0x30b8a0,
  wood: 0xc08a4e, woodDk: 0x8d5f33, wall: 0xf3e9d2, floor: 0xd9c3a0, grass: 0x8fd47a,
  road: 0x5a5a6e, stone: 0xb8b2c8, glass: 0xa9d8ff
};

function h(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

export function createStage(host, opts = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = opts.shadows !== false;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.className = 'gl-canvas';
  host.appendChild(renderer.domElement);

  const overlay = h('div', 'gl-overlay');
  host.appendChild(overlay);
  const fadeEl = h('div', 'gl-fade');
  overlay.appendChild(fadeEl);
  const vignette = h('div', 'gl-vignette');
  overlay.appendChild(vignette);

  const scene = new THREE.Scene();
  if (opts.fog) scene.fog = new THREE.Fog(opts.fog, opts.fogNear || 18, opts.fogFar || 60);
  const camera = new THREE.PerspectiveCamera(opts.fov || 42, 16 / 9, 0.1, 200);
  camera.position.set(0, 8, 14);
  camera.lookAt(0, 0, 0);

  const hemi = new THREE.HemisphereLight(0xffffff, 0xcfc4b8, opts.hemi == null ? 1.15 : opts.hemi);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, opts.sun == null ? 1.6 : opts.sun);
  sun.position.set(8, 14, 6);
  sun.castShadow = renderer.shadowMap.enabled;
  sun.shadow.mapSize.set(2048, 2048);
  const sb = opts.shadowBounds || 18;
  sun.shadow.camera.left = -sb; sun.shadow.camera.right = sb;
  sun.shadow.camera.top = sb; sun.shadow.camera.bottom = -sb;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 60;
  sun.shadow.bias = -0.0008;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);

  function size() {
    const w = Math.max(320, host.clientWidth || 800);
    const vh = window.innerHeight || 800;
    const ratio = opts.aspect || 16 / 9;
    const full = !!(document.fullscreenElement && host.closest && host.closest('.stage') === document.fullscreenElement);
    const reserve = full ? (opts.fullReserve == null ? 150 : opts.fullReserve) : (opts.reserve == null ? 210 : opts.reserve);
    const h0 = Math.round(Math.min(w / ratio, Math.max(opts.minHeight || 360, vh - reserve)));
    renderer.setSize(w, h0, false);
    renderer.domElement.style.width = w + 'px';
    renderer.domElement.style.height = h0 + 'px';
    camera.aspect = w / h0;
    camera.updateProjectionMatrix();
  }
  size();
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(size) : null;
  if (ro) ro.observe(host);
  window.addEventListener('resize', size);
  document.addEventListener('fullscreenchange', size);

  const frameFns = new Set();
  const tweens = new Set();
  const timer = new THREE.Timer();
  let disposed = false;

  function tween(target, to, o = {}) {
    const from = {};
    Object.keys(to).forEach(k => { from[k] = target[k]; });
    const tw = {
      target, from, to, ms: o.ms || 500, delay: o.delay || 0, ease: o.ease || ease.outCubic,
      onUpdate: o.onUpdate, onDone: o.onDone, t0: null
    };
    tweens.add(tw);
    tw.cancel = () => tweens.delete(tw);
    return tw;
  }

  function tweenP(target, to, o = {}) {
    return new Promise(res => tween(target, to, Object.assign({}, o, { onDone: () => { o.onDone && o.onDone(); res(); } })));
  }

  const camControl = { target: new THREE.Vector3(0, 0, 0) };
  const shakeState = { amp: 0, until: 0 };
  const shakeOffset = new THREE.Vector3();

  function step() {
    timer.update();
    const dt = Math.min(timer.getDelta(), 0.05);
    const now = performance.now();
    tweens.forEach(tw => {
      if (tw.t0 === null) tw.t0 = now + tw.delay;
      if (now < tw.t0) return;
      const k = Math.min(1, (now - tw.t0) / tw.ms);
      const e = tw.ease(k);
      Object.keys(tw.to).forEach(p => { tw.target[p] = tw.from[p] + (tw.to[p] - tw.from[p]) * e; });
      tw.onUpdate && tw.onUpdate(e, k);
      if (k >= 1) { tweens.delete(tw); tw.onDone && tw.onDone(); }
    });
    frameFns.forEach(fn => fn(dt, timer.getElapsed()));
    stepParticles(dt);
    camera.position.sub(shakeOffset);
    if (now < shakeState.until) {
      const k = (shakeState.until - now) / shakeState.ms;
      shakeOffset.set((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2).multiplyScalar(shakeState.amp * k);
    } else shakeOffset.set(0, 0, 0);
    camera.position.add(shakeOffset);
    camera.lookAt(camControl.target);
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(step);

  function shake(amp = 0.25, ms = 400) {
    shakeState.amp = amp; shakeState.ms = ms; shakeState.until = performance.now() + ms;
  }

  const particles = [];
  const particleGeo = new THREE.SphereGeometry(1, 6, 6);
  function burst(at, o = {}) {
    const n = o.n || 18;
    const color = o.color == null ? 0xf7d64a : o.color;
    const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
    for (let i = 0; i < n; i++) {
      const p = new THREE.Mesh(particleGeo, m.clone());
      const s = (o.size || 0.09) * (0.6 + Math.random() * 0.8);
      p.scale.setScalar(s);
      p.position.copy(at);
      const speed = (o.speed || 3.2) * (0.5 + Math.random());
      const dir = new THREE.Vector3(Math.random() - 0.5, Math.random() * (o.up == null ? 0.9 : o.up) + 0.2, Math.random() - 0.5).normalize();
      scene.add(p);
      particles.push({ mesh: p, v: dir.multiplyScalar(speed), life: o.life || 0.9, age: 0, g: o.gravity == null ? 7 : o.gravity });
    }
  }
  function stepParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.age += dt;
      p.v.y -= p.g * dt;
      p.mesh.position.addScaledVector(p.v, dt);
      const k = p.age / p.life;
      p.mesh.material.opacity = Math.max(0, 1 - k * k);
      if (p.age >= p.life) { scene.remove(p.mesh); p.mesh.material.dispose(); particles.splice(i, 1); }
    }
  }

  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const pickables = [];
  const pickFns = new Set();
  const hoverFns = new Set();
  let hovered = null;
  let down = null;

  function pickOwner(obj) {
    let o = obj;
    while (o) { if (o.userData && o.userData.pick !== undefined && !o.userData.disabled) return o; o = o.parent; }
    return null;
  }

  function hitAt(ev) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(pickables, true);
    for (const hit of hits) {
      const owner = pickOwner(hit.object);
      if (owner) return { owner, point: hit.point };
    }
    return null;
  }

  const el = renderer.domElement;
  el.addEventListener('pointerdown', ev => { down = { x: ev.clientX, y: ev.clientY, t: performance.now() }; });
  el.addEventListener('pointerup', ev => {
    if (!down) return;
    const moved = Math.hypot(ev.clientX - down.x, ev.clientY - down.y);
    down = null;
    if (moved > 8) return;
    const hit = hitAt(ev);
    pickFns.forEach(fn => fn(hit ? hit.owner.userData.pick : null, hit ? hit.owner : null, hit ? hit.point : null));
  });
  el.addEventListener('pointermove', ev => {
    const hit = hitAt(ev);
    const owner = hit ? hit.owner : null;
    if (owner !== hovered) {
      const prev = hovered;
      hovered = owner;
      el.style.cursor = owner ? 'pointer' : '';
      if (prev && prev.userData.glow !== false) setEmissive(prev, 0x000000, 1);
      if (owner && owner.userData.glow !== false) setEmissive(owner, owner.userData.glowColor == null ? 0x3a3a55 : owner.userData.glowColor, 1);
      hoverFns.forEach(fn => fn(owner, prev));
    }
  });
  el.addEventListener('pointerleave', () => {
    if (hovered) { const prev = hovered; hovered = null; if (prev.userData.glow !== false) setEmissive(prev, 0x000000, 1); hoverFns.forEach(fn => fn(null, prev)); }
    el.style.cursor = '';
  });

  function mat(color, o = {}) {
    return new THREE.MeshLambertMaterial(Object.assign({ color }, o));
  }
  function box(w, hh, d, color, o = {}) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, hh, d), typeof color === 'number' || typeof color === 'string' ? mat(color, o.mat) : color);
    m.castShadow = o.shadow !== false;
    m.receiveShadow = o.receive !== false;
    return m;
  }
  function cyl(rTop, rBot, hh, color, seg = 24, o = {}) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, hh, seg), mat(color, o.mat));
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  function sphere(r, color, seg = 18) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, seg), mat(color));
    m.castShadow = true;
    return m;
  }
  function plane(w, hh, color, o = {}) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, hh), mat(color, o.mat));
    m.receiveShadow = true;
    return m;
  }
  function emojiSprite(emoji, s = 1) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: emojiTexture(emoji), transparent: true, depthWrite: false }));
    sp.scale.set(s, s, 1);
    return sp;
  }
  function emojiPlane(emoji, s = 1) {
    return new THREE.Mesh(new THREE.PlaneGeometry(s, s),
      new THREE.MeshBasicMaterial({ map: emojiTexture(emoji), transparent: true, alphaTest: 0.1, side: THREE.DoubleSide }));
  }
  function label(text, o = {}) {
    const t = textTexture(text, Object.assign({ bg: '#fffdf6', border: '#2a2440' }, o));
    const hh = o.height || 0.6;
    const w = hh * (t.w / t.h);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, hh), new THREE.MeshBasicMaterial({ map: t.texture, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide }));
    m.userData.labelW = w; m.userData.labelH = hh;
    return m;
  }
  function labelSprite(text, o = {}) {
    const t = textTexture(text, Object.assign({ bg: '#fffdf6', border: '#2a2440' }, o));
    const hh = o.height || 0.6;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t.texture, transparent: true, depthWrite: false, depthTest: o.depthTest !== false }));
    sp.scale.set(hh * (t.w / t.h), hh, 1);
    return sp;
  }

  function lookAt(x, y, z, ms) {
    if (!ms) { camControl.target.set(x, y, z); camera.lookAt(camControl.target); return Promise.resolve(); }
    return tweenP(camControl.target, { x, y, z }, { ms, ease: ease.inOutCubic });
  }
  function moveCamera(pos, target, ms = 900, easing) {
    const a = tweenP(camera.position, pos, { ms, ease: easing || ease.inOutCubic });
    const b = tweenP(camControl.target, target, { ms, ease: easing || ease.inOutCubic });
    return Promise.all([a, b]);
  }
  function intro(from, to, target, ms = 1800) {
    camera.position.set(from.x, from.y, from.z);
    camControl.target.set(target.x, target.y, target.z);
    return moveCamera(to, target, ms, ease.outCubic);
  }

  function floatText(text, at, o = {}) {
    const sp = labelSprite(text, Object.assign({ height: o.height || 0.7, fontPx: 72, color: '#fff', bg: o.bg || '#2a2440', border: o.border || '#ffffff', depthTest: false }, o));
    sp.position.copy(at);
    sp.renderOrder = 999;
    scene.add(sp);
    const start = sp.position.y;
    tween(sp.position, { y: start + (o.rise || 1.4) }, { ms: o.ms || 1400, ease: ease.outCubic });
    tween(sp.material, { opacity: 0 }, { ms: o.ms || 1400, delay: 500, ease: ease.inQuad, onDone: () => { scene.remove(sp); sp.material.dispose(); } });
    return sp;
  }

  function title(text, sub, ms = 2200) {
    const card = h('div', 'gl-title');
    card.appendChild(h('div', 'gl-title-main', text));
    if (sub) card.appendChild(h('div', 'gl-title-sub', sub));
    overlay.appendChild(card);
    requestAnimationFrame(() => card.classList.add('in'));
    setTimeout(() => { card.classList.remove('in'); card.classList.add('out'); setTimeout(() => card.remove(), 600); }, ms);
    return card;
  }

  function fade(dark, ms = 500) {
    fadeEl.style.transitionDuration = ms + 'ms';
    fadeEl.classList.toggle('on', !!dark);
    return new Promise(res => setTimeout(res, ms));
  }

  function banner(text, cls) {
    const b = h('div', 'gl-banner ' + (cls || ''), text);
    overlay.appendChild(b);
    requestAnimationFrame(() => b.classList.add('in'));
    setTimeout(() => { b.classList.remove('in'); setTimeout(() => b.remove(), 400); }, 1500);
  }

  function sway(amp = 0.35, speed = 0.35) {
    const base = camera.position.clone();
    const fn = (dt, t) => {
      camera.position.x = base.x + Math.sin(t * speed) * amp;
      camera.position.y = base.y + Math.sin(t * speed * 0.7) * amp * 0.4;
    };
    frameFns.add(fn);
    return () => frameFns.delete(fn);
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    renderer.setAnimationLoop(null);
    if (ro) ro.disconnect();
    window.removeEventListener('resize', size);
    document.removeEventListener('fullscreenchange', size);
    scene.traverse(o => {
      if (o.geometry && o.geometry !== particleGeo) o.geometry.dispose();
      const mats = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []);
      mats.forEach(m => { if (m && m.dispose && !(m.map && texCache.has(m.map))) m.dispose(); });
    });
    renderer.dispose();
    renderer.forceContextLoss && renderer.forceContextLoss();
    if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }

  async function put(parent, path, x, z, rotDeg = 0, o = {}) {
    const obj = await instance(path, o);
    if (disposed) return obj;
    obj.position.x = x; obj.position.z = z;
    obj.rotation.y = rotDeg * Math.PI / 180;
    parent.add(obj);
    return obj;
  }

  return {
    THREE, PALETTE, scene, camera, renderer, canvas: renderer.domElement, overlay, vignette,
    tween, tweenP, ease, instance, put, loadModel, preload, setEmissive,
    onFrame: fn => { frameFns.add(fn); return () => frameFns.delete(fn); },
    pickables, onPick: fn => { pickFns.add(fn); return () => pickFns.delete(fn); },
    onHover: fn => { hoverFns.add(fn); return () => hoverFns.delete(fn); },
    mat, box, cyl, sphere, plane, emojiSprite, emojiPlane, label, labelSprite, floatText,
    lookAt, moveCamera, intro, camTarget: camControl.target, sway, shake, burst, title, fade, banner, size, dispose,
    get disposed() { return disposed; }
  };
}

const factories = {};
function webglOk() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch (e) { return false; }
}

LW.hs3d = {
  ok: webglOk(),
  register(id, factory) { factories[id] = factory; },
  create(id, host, hooks, options) {
    if (!LW.hs3d.ok || !factories[id]) return null;
    try {
      const handle = factories[id](host, hooks || {}, options || {});
      LW.hs3d.last = handle;
      return handle;
    } catch (e) {
      console.warn('3D scene failed, using the flat version:', e);
      return null;
    }
  },
  has(id) { return !!factories[id]; }
};
