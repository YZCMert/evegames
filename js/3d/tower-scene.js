import { createStage, ease, instance, preload } from './engine.js';
import * as THREE from 'three';

const LW = window.LW;
const BLOCK_H = 0.62;
const COLORS = ['#f0a92c', '#2f8fd8', '#45b36b', '#ef6fa0', '#9b5de5', '#30b8a0', '#e8453c', '#f7d64a'];
const CAM = { pos: new THREE.Vector3(7.5, 5.2, 11), target: new THREE.Vector3(0, 2.2, 0) };
const PIVOT_Y = 7.6;

LW.hs3d.register('tower', function (host, hooks) {
  hooks = hooks || {};
  const S = createStage(host, { fov: 38, aspect: 16 / 8.5, shadowBounds: 14, hemi: 1.1, sun: 1.7, fog: 0xcfe9ff, fogNear: 28, fogFar: 70, reserve: 345, fullReserve: 265 });
  if (!S) return null;
  const { scene, camera } = S;

  camera.position.copy(CAM.pos);
  S.lookAt(CAM.target.x, CAM.target.y, CAM.target.z);
  const faceYaw = Math.atan2(CAM.pos.x, CAM.pos.z);

  const ground = S.plane(80, 80, 0x9fd48a); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.01; scene.add(ground);
  const dirt = S.plane(9, 8, 0xb5a07a); dirt.rotation.x = -Math.PI / 2; dirt.position.set(0, 0.005, 0.4); scene.add(dirt);
  const slab = S.box(5.2, 0.3, 5.2, 0xb8b2c8); slab.position.y = 0.15; scene.add(slab);
  const pad = S.box(2.6, 0.08, 2.6, 0x8d5f33); pad.position.y = 0.34; scene.add(pad);
  const stripe = new THREE.Group(); scene.add(stripe);
  for (let i = 0; i < 12; i++) {
    const c = i % 2 ? 0x2a2440 : 0xf7d64a;
    const seg = 5.2 / 12;
    [[-2.6 + seg / 2 + i * seg, 2.6], [-2.6 + seg / 2 + i * seg, -2.6]].forEach(([x, z]) => { const b = S.box(seg, 0.06, 0.16, c, { shadow: false }); b.position.set(x, 0.33, z); stripe.add(b); });
    [[2.6, -2.6 + seg / 2 + i * seg], [-2.6, -2.6 + seg / 2 + i * seg]].forEach(([x, z]) => { const b = S.box(0.16, 0.06, seg, c, { shadow: false }); b.position.set(x, 0.33, z); stripe.add(b); });
  }
  const path = S.plane(1.6, 12, 0xd9d2c5); path.rotation.x = -Math.PI / 2; path.position.set(0, 0.004, 9); scene.add(path);

  const world = new THREE.Group(); scene.add(world);
  let mixer = null, workerObj = null;
  (async () => {
    await preload(['commercial/building-c.glb', 'commercial/building-f.glb', 'commercial/building-skyscraper-b.glb', 'commercial/building-h.glb', 'suburban/tree-large.glb', 'suburban/tree-small.glb', 'nature/tree_oak.glb', 'nature/plant_bush.glb', 'suburban/fence-1x3.glb', 'cars/truck.glb', 'cars/cone.glb', 'characters/character-worker.glb', 'nature/sign.glb']);
    if (S.disposed) return;
    S.put(world, 'commercial/building-c.glb', -9, -9, 0, { size: 7 });
    S.put(world, 'commercial/building-f.glb', -2, -11, 0, { size: 8 });
    S.put(world, 'commercial/building-skyscraper-b.glb', 6, -12, 0, { size: 14 });
    S.put(world, 'commercial/building-h.glb', 14, -6, -30, { size: 7 });
    S.put(world, 'suburban/tree-large.glb', -7, -3, 0, { size: 3.2 });
    S.put(world, 'suburban/tree-small.glb', 7.5, -5, 0, { size: 2.2 });
    S.put(world, 'nature/tree_oak.glb', -8.5, 3, 40, { size: 3.0 });
    S.put(world, 'nature/tree_oak.glb', 10, 3, 10, { size: 3.4 });
    S.put(world, 'nature/plant_bush.glb', -5.4, 4.2, 0, { size: 1.0 });
    S.put(world, 'nature/plant_bush.glb', 5.6, 4.6, 0, { size: 0.9 });
    for (let i = -1; i <= 1; i++) S.put(world, 'suburban/fence-1x3.glb', i * 2.3, -3.9, 0, { size: 2.3 });
    for (let i = -1; i <= 1; i++) S.put(world, 'suburban/fence-1x3.glb', -3.9, i * 2.3, 90, { size: 2.3 });
    for (let i = -1; i <= 1; i++) S.put(world, 'suburban/fence-1x3.glb', 3.9, i * 2.3, 90, { size: 2.3 });
    S.put(world, 'cars/truck.glb', 7.2, 3.2, -70, { size: 3.2 });
    S.put(world, 'cars/cone.glb', 3.4, 4.2, 0, { size: 0.5 });
    S.put(world, 'cars/cone.glb', -3.4, 4.4, 0, { size: 0.5 });
    S.put(world, 'cars/cone.glb', 1.2, 5.0, 0, { size: 0.5 });
    const sign = await S.put(world, 'nature/sign.glb', -4.6, 4.6, 20, { size: 1.6 });
    const warn = S.label('⚠ BUILDING SITE', { height: 0.45, fontPx: 56, color: '#2a2440', bg: '#f7d64a', border: '#2a2440' });
    warn.position.set(-4.6, 1.75, 4.9); warn.rotation.y = 0.35; scene.add(warn);
    const spare = new THREE.Group(); spare.position.set(-5.2, 0, 1.6); scene.add(spare);
    [[0x2f8fd8, 0, 0.31, 0], [0xef6fa0, 0.2, 0.93, 0.1], [0x45b36b, 1.3, 0.31, 0.6]].forEach(([c, x, y, r]) => { const b = S.box(1.4, 0.6, 1.0, c); b.position.set(x, y, 0); b.rotation.y = r; spare.add(b); });
    const worker = await S.put(world, 'characters/character-worker.glb', -3.0, 3.0, 35, { size: 1.7 });
    if (S.disposed) return;
    mixer = new THREE.AnimationMixer(worker);
    const idle = worker.userData.animations.find(a => a.name === 'idle');
    if (idle) mixer.clipAction(idle).play();
    workerObj = worker;
  })();
  S.onFrame(dt => { if (mixer) mixer.update(dt); });

  const crane = new THREE.Group(); scene.add(crane);
  const mastH = PIVOT_Y + 0.6;
  const mast = S.box(0.5, mastH, 0.5, 0xf0a92c); mast.position.set(-6.2, mastH / 2, 0.6); crane.add(mast);
  for (let y = 1; y < mastH; y += 1.2) { const brace = S.box(0.62, 0.08, 0.62, 0x2a2440, { shadow: false }); brace.position.set(-6.2, y, 0.6); crane.add(brace); }
  const jib = S.box(8.4, 0.36, 0.36, 0xf0a92c); jib.position.set(-2.6, PIVOT_Y + 0.2, 0.3); crane.add(jib);
  const counter = S.box(1.6, 0.9, 0.9, 0x2a2440); counter.position.set(-7.6, PIVOT_Y + 0.2, 0.6); crane.add(counter);
  const cab = S.box(1.1, 0.9, 0.9, 0xf7d64a); cab.position.set(-6.2, PIVOT_Y - 0.6, 1.2); crane.add(cab);
  const cabGlass = S.box(0.7, 0.5, 0.1, 0xa9d8ff, { shadow: false }); cabGlass.position.set(-6.2, PIVOT_Y - 0.5, 1.66); crane.add(cabGlass);
  const tie = S.cyl(0.03, 0.03, 7.6, 0x333333, 6); tie.position.set(-2.8, PIVOT_Y + 1.6, 0.4); tie.rotation.z = Math.PI / 2 - 0.42; crane.add(tie);
  const pivot = new THREE.Group(); pivot.position.set(0.8, PIVOT_Y, 0.3); crane.add(pivot);
  const cable = S.cyl(0.03, 0.03, 1, 0x333333, 6); pivot.add(cable);
  const ball = S.sphere(0.55, 0x3a3348, 20); pivot.add(ball);
  const REST = -0.42;
  pivot.rotation.z = REST;
  function hangTo(y) {
    const len = Math.max(2, pivot.position.y - y);
    cable.scale.y = len; cable.position.y = -len / 2;
    ball.position.y = -len;
  }
  hangTo(1.2);

  const tower = new THREE.Group(); scene.add(tower);
  tower.rotation.y = faceYaw;
  let blocks = [];
  let wobbleT = 0, wobbleAmp = 0;
  const debris = [];

  const texCache = new Map();
  function textTex(word) {
    if (texCache.has(word)) return texCache.get(word);
    const c = document.createElement('canvas'); c.width = 512; c.height = 160;
    const ctx = c.getContext('2d');
    let size = 96;
    ctx.font = '700 ' + size + 'px Fredoka, "Segoe UI", sans-serif';
    while (ctx.measureText(word).width > 470 && size > 40) { size -= 6; ctx.font = '700 ' + size + 'px Fredoka, "Segoe UI", sans-serif'; }
    ctx.fillStyle = 'rgba(42,36,64,0.25)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(word, 259, 87);
    ctx.fillStyle = '#2a2440';
    ctx.fillText(word, 256, 84);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const out = { texture: tex, w: Math.max(200, ctx.measureText(word).width + 60), h: 160 };
    texCache.set(word, out);
    return out;
  }

  function makeBlock(word, i, gold) {
    const color = gold ? 0xf7d64a : COLORS[i % COLORS.length];
    const t = textTex(word);
    const w = Math.max(1.6, Math.min(3.4, t.w / t.h * BLOCK_H * 0.95));
    const g = new THREE.Group();
    const body = S.box(w, BLOCK_H, 1.4, color, gold ? { mat: { emissive: 0x7a5a00, emissiveIntensity: 0.6 } } : {});
    g.add(body);
    const rim = S.box(w + 0.04, 0.06, 1.44, gold ? 0xb8860b : 0x2a2440, { shadow: false }); rim.position.y = -BLOCK_H / 2 + 0.03; g.add(rim);
    if (gold) { g.userData.gold = true; const star = S.emojiSprite('✨', 0.7); star.position.set(w / 2 + 0.2, BLOCK_H / 2 + 0.1, 0.4); g.add(star); }
    const face = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.96, BLOCK_H * 0.9), new THREE.MeshBasicMaterial({ map: t.texture, transparent: true }));
    face.position.z = 0.71; g.add(face);
    const face2 = face.clone(); face2.rotation.y = Math.PI; face2.position.z = -0.71; g.add(face2);
    return g;
  }

  function newSentence() { if (crowState === 'hover' || crowState === 'coming') crowCome(false); clearTower(); }

  function clearTower() {
    blocks.forEach(b => tower.remove(b));
    blocks = [];
    tower.rotation.set(0, faceYaw, 0);
    tower.position.set(0, 0, 0);
    S.moveCamera(CAM.pos, CAM.target, 700);
  }

  function stack(word, index, gold) {
    const b = makeBlock(word, index, gold);
    const y = 0.38 + BLOCK_H / 2 + index * BLOCK_H;
    b.position.set(0, y + 6, 0);
    b.rotation.y = (Math.random() - 0.5) * 0.08;
    tower.add(b);
    blocks.push(b);
    LW.sound.whoosh();
    S.tween(b.position, { y }, { ms: 520, ease: ease.outBounce, onDone: () => {
      S.burst(new THREE.Vector3(0, y - BLOCK_H / 2, 0), { color: gold ? 0xfff1a0 : 0xd9d2c5, n: gold ? 26 : 10, speed: gold ? 2.6 : 1.6, size: 0.07, gravity: gold ? 1.5 : 3, life: gold ? 1.1 : 0.6, up: 0.4 });
      S.shake(0.04, 160);
      LW.sound.thud();
      if (gold) S.floatText('+12 ✨ ทอง!', new THREE.Vector3(0, y + 1.0, 0), { bg: '#b8860b', height: 0.85, ms: 1400 });
    } });
    const top = Math.max(2.2, y + 1.2);
    S.tween(S.camTarget, { y: top * 0.55 }, { ms: 600 });
    S.tween(camera.position, { y: CAM.pos.y + y * 0.55, z: CAM.pos.z + y * 0.35 }, { ms: 600 });
  }

  function wobble(strikes) {
    wobbleAmp = 0.06 * strikes;
    wobbleT = 1.2;
    S.shake(0.05 + strikes * 0.02, 300);
  }
  const crow = new THREE.Group(); crow.visible = false; scene.add(crow);
  const cbody = S.sphere(0.3, 0x1b1b24, 14); cbody.scale.set(1.5, 1, 1); crow.add(cbody);
  const chead = S.sphere(0.19, 0x1b1b24, 12); chead.position.set(0.48, 0.2, 0); crow.add(chead);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, 8), S.mat(0xf0a92c)); beak.rotation.z = -Math.PI / 2; beak.position.set(0.76, 0.17, 0); crow.add(beak);
  [[0.12], [-0.12]].forEach(([z]) => { const eye = S.sphere(0.045, 0xffffff, 8); eye.position.set(0.6, 0.27, z); crow.add(eye); const pupil = S.sphere(0.022, 0x000000, 6); pupil.position.set(0.64, 0.27, z); crow.add(pupil); });
  const tail = S.box(0.45, 0.05, 0.3, 0x23232e, { shadow: false }); tail.position.set(-0.5, 0.05, 0); tail.rotation.z = 0.3; crow.add(tail);
  const wings = [1, -1].map(side => {
    const piv = new THREE.Group(); piv.position.set(-0.05, 0.14, side * 0.2); crow.add(piv);
    const wing = S.box(0.75, 0.05, 0.6, 0x23232e, { shadow: false }); wing.position.set(0, 0, side * 0.32); piv.add(wing);
    piv.userData.side = side;
    return piv;
  });
  const crowHit = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.3, 1.5), new THREE.MeshBasicMaterial({ visible: false })); crow.add(crowHit);
  const crowBubble = S.emojiSprite('❗', 0.9); crowBubble.position.set(0, 0.95, 0); crow.add(crowBubble);
  crow.userData.pick = 'crow'; crow.userData.glow = false; crow.userData.disabled = true;
  S.pickables.push(crow);
  let crowState = 'away', hoverY = 0;
  const towerTop = () => blocks.length ? blocks[blocks.length - 1].position.y + BLOCK_H / 2 : 0.7;
  function faceToward(x, z) { crow.rotation.y = Math.atan2(-(z - crow.position.z), x - crow.position.x); }

  function crowCome(active) {
    if (active) {
      if (crowState === 'coming' || crowState === 'hover') return;
      crowState = 'coming';
      const top = towerTop();
      crow.visible = true;
      crow.position.set(-14, top + 6, -5);
      const to = { x: 0.9, y: top + 1.9, z: 0.6 };
      faceToward(to.x, to.z);
      hoverY = to.y;
      crow.userData.disabled = false;
      LW.sound.whoosh();
      S.banner('🐦 Crow! Click it before it steals a block');
      S.tween(crow.position, to, { ms: 1100, ease: ease.outCubic, onDone: () => { if (crowState === 'coming') { crowState = 'hover'; faceToward(camera.position.x, camera.position.z); } } });
    } else {
      if (crowState === 'away' || crowState === 'leaving' || crowState === 'steal') return;
      crowState = 'leaving';
      crow.userData.disabled = true;
      const away = { x: 15, y: crow.position.y + 7, z: -8 };
      faceToward(away.x, away.z);
      S.burst(crow.position.clone(), { color: 0x2a2440, n: 10, speed: 2, size: 0.06, gravity: 1.5, life: 0.8 });
      S.floatText('👋 shoo!', crow.position.clone().add(new THREE.Vector3(0, 0.8, 0)), { bg: '#2f8f52', height: 0.7, ms: 900 });
      S.tween(crow.position, away, { ms: 900, ease: ease.inCubic, onDone: () => { crow.visible = false; crowState = 'away'; } });
    }
  }

  function crowSteal() {
    if (!blocks.length) { crowCome(false); return; }
    crowState = 'steal';
    crow.userData.disabled = true;
    const b = blocks.pop();
    const wp = b.getWorldPosition(new THREE.Vector3());
    tower.remove(b); scene.add(b); b.position.copy(wp); b.rotation.y = faceYaw;
    faceToward(wp.x, wp.z);
    S.tween(crow.position, { x: wp.x, y: wp.y + 0.75, z: wp.z }, { ms: 320, ease: ease.inQuad, onDone: () => {
      crow.attach(b);
      wobble(1);
      S.shake(0.14, 320);
      LW.sound.crash();
      S.burst(wp, { color: 0x2a2440, n: 14, speed: 2.4, size: 0.07, gravity: 2, life: 0.9 });
      S.floatText('−6 อีกาขโมย!', wp.clone().add(new THREE.Vector3(0, 1.4, 0)), { bg: '#c0392b', height: 0.9, ms: 1800 });
      const away = { x: 16, y: wp.y + 8, z: -9 };
      faceToward(away.x, away.z);
      S.tween(crow.position, away, { ms: 2300, ease: ease.inQuad, onDone: () => { crow.remove(b); crow.visible = false; crowState = 'away'; } });
    } });
  }

  S.onPick(id => { if (id === 'crow') hooks.onCrow && hooks.onCrow(); });

  let swinging = false, sparkleT = 0;
  S.onFrame((dt, t) => {
    if (wobbleT > 0) {
      wobbleT -= dt;
      tower.rotation.z = Math.sin(t * 14) * wobbleAmp * Math.max(0, wobbleT);
    } else tower.rotation.z *= 0.9;
    if (!swinging) pivot.rotation.z = REST + Math.sin(t * 0.8) * 0.04;
    if (crow.visible) {
      const flap = crowState === 'hover' ? 9 : 16;
      wings.forEach(w => { w.rotation.x = w.userData.side * Math.sin(t * flap) * 0.65; });
      if (crowState === 'hover') { crow.position.y = hoverY + Math.sin(t * 4) * 0.15; crow.position.x = 0.9 + Math.sin(t * 1.7) * 0.3; }
      crowBubble.visible = crowState === 'hover' || crowState === 'coming';
    }
    sparkleT += dt;
    if (sparkleT > 0.35) {
      sparkleT = 0;
      blocks.forEach(b => { if (b.userData.gold) S.burst(b.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3((Math.random() - 0.5) * 1.6, 0.2, (Math.random() - 0.5) * 1.2)), { color: 0xfff1a0, n: 2, speed: 0.5, size: 0.05, gravity: -0.6, life: 0.6 }); });
    }
    for (let i = debris.length - 1; i >= 0; i--) {
      const d = debris[i];
      d.v.y -= 9.8 * dt;
      d.obj.position.addScaledVector(d.v, dt);
      d.obj.rotation.x += d.w.x * dt; d.obj.rotation.z += d.w.z * dt;
      if (d.obj.position.y < -4) { scene.remove(d.obj); debris.splice(i, 1); }
    }
  });

  function swing(hit) {
    if (swinging) return;
    swinging = true;
    const topY = blocks.length ? blocks[blocks.length - 1].position.y : 1;
    hangTo(topY);
    LW.sound.whoosh();
    S.tween(pivot.rotation, { z: -1.05 }, { ms: 700, ease: ease.inOutCubic, onDone: () => {
      S.tween(pivot.rotation, { z: hit ? 0.5 : -0.05 }, { ms: hit ? 380 : 520, ease: ease.inQuad, onDone: () => {
        if (hit && blocks.length) {
          const b = blocks.pop();
          const wp = b.getWorldPosition(new THREE.Vector3());
          tower.remove(b);
          scene.add(b);
          b.position.copy(wp);
          b.rotation.y = faceYaw;
          debris.push({ obj: b, v: new THREE.Vector3(5 + Math.random() * 2, 3, 2), w: new THREE.Vector3(3, 0, 4) });
          wobble(1);
          S.shake(0.2, 350);
          S.burst(wp, { color: 0xd9d2c5, n: 16, speed: 2.5, size: 0.08, gravity: 4 });
          LW.sound.crash();
          S.floatText('−6 โดนทุบ!', new THREE.Vector3(0, topY + 1.2, 0), { bg: '#c0392b', height: 0.9 });
        } else {
          S.floatText('ทันเวลา! safe', new THREE.Vector3(0, topY + 1.4, 0), { bg: '#2f8f52', height: 0.7, ms: 1000 });
        }
        S.tween(pivot.rotation, { z: REST }, { ms: 900, ease: ease.outCubic, onDone: () => { swinging = false; } });
      } });
    } });
  }

  function collapse() {
    const list = blocks.slice();
    blocks = [];
    list.forEach((b, i) => {
      const wp = b.getWorldPosition(new THREE.Vector3());
      tower.remove(b);
      scene.add(b);
      b.position.copy(wp);
      b.rotation.y = faceYaw;
      const dir = Math.random() > 0.5 ? 1 : -1;
      debris.push({ obj: b, v: new THREE.Vector3(dir * (1 + Math.random() * 3), 1 + i * 0.4, 1 + Math.random() * 2), w: new THREE.Vector3(Math.random() * 4, 0, dir * 3) });
    });
    tower.rotation.set(0, faceYaw, 0);
    S.shake(0.35, 700);
    S.burst(new THREE.Vector3(0, 0.6, 0), { color: 0xb5a07a, n: 36, speed: 3.5, size: 0.11, gravity: 3, life: 1.2 });
    LW.sound.crash();
    S.banner('💥 Collapsed!');
    S.moveCamera(CAM.pos, CAM.target, 900);
  }

  function celebrate() {
    const topY = blocks.length ? blocks[blocks.length - 1].position.y : 1;
    S.floatText('+20 สุดยอด!', new THREE.Vector3(0, topY + 1.2, 0), { bg: '#2f8f52', height: 1.0, ms: 1800 });
    [0xf7d64a, 0x45b36b, 0x2f8fd8, 0xef6fa0].forEach((c, i) => setTimeout(() => { if (!S.disposed) S.burst(new THREE.Vector3((Math.random() - 0.5) * 2, topY + 0.8, (Math.random() - 0.5) * 2), { color: c, n: 20, speed: 4, gravity: 5, life: 1.3 }); }, i * 140));
    S.banner('🏗️ Built!', 'good');
    blocks.forEach((b, i) => S.tween(b.rotation, { y: b.rotation.y + Math.PI * 2 }, { ms: 900, delay: i * 60 }));
    if (workerObj) {
      const yes = workerObj.userData.animations.find(a => a.name === 'emote-yes');
      if (yes && mixer) { const a = mixer.clipAction(yes); a.reset().setLoop(THREE.LoopOnce).play(); }
    }
  }

  S.fade(true, 0);
  setTimeout(() => { if (S.disposed) return; S.fade(false, 600); S.intro({ x: 16, y: 10, z: 20 }, CAM.pos, CAM.target, 2000); S.title('🧱 Sentence Tower', 'Tap the words in order · golden word ×3 · mind the ball and the crow'); }, 250);

  return { newSentence, stack, wobble, swing, collapse, celebrate, crow: crowCome, crowSteal, stage: S, dispose: S.dispose };
});
