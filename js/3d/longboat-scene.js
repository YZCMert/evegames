import { createStage, ease, instance, preload } from './engine.js';
import * as THREE from 'three';

const LW = window.LW;
const CELL = 1.7;
const LANE = 1.7;
const PADDLERS = ['characters/character-female-a.glb', 'characters/character-male-c.glb', 'characters/character-female-d.glb', 'characters/character-male-f.glb', 'characters/character-female-e.glb', 'characters/character-male-g.glb', 'characters/character-female-b.glb', 'characters/character-male-d.glb'];
const CROWD = ['characters/character-worker.glb', 'characters/character-male-b.glb', 'characters/character-female-f.glb', 'characters/character-male-e.glb'];

function ordinal(n) { const m = n % 100; return n + ((m > 10 && m < 14) ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th'); }

LW.hs3d.register('longboat', function (host, hooks, options) {
  const S = createStage(host, { fov: 40, aspect: 16 / 8.5, shadowBounds: 20, hemi: 1.0, sun: 1.5, fog: 0xd6ecff, fogNear: 34, fogFar: 80, reserve: 470, fullReserve: 380, minHeight: 250 });
  if (!S) return null;
  const { scene, camera } = S;
  const teams = (options && options.teams) || [];
  const COURSE = (options && options.course) || 9;
  const crocs = (options && options.crocs) || [];
  const boosts = (options && options.boosts) || [];
  const n = Math.max(1, teams.length);
  const LEN = COURSE * CELL;
  const X0 = -LEN / 2;
  const RIVER_W = n * LANE + 2.6;
  const laneZ = i => (i - (n - 1) / 2) * LANE;
  const CAM = { pos: new THREE.Vector3(0, 7.2 + n * 0.55, 10.5 + n * 0.9), target: new THREE.Vector3(0, 0, 0) };
  camera.position.copy(CAM.pos);
  S.lookAt(0, 0, 0);
  S.fade(true, 0);

  const water = S.plane(90, RIVER_W, 0x3f9fd6); water.rotation.x = -Math.PI / 2; water.position.y = -0.02; scene.add(water);
  const waveCanvas = document.createElement('canvas'); waveCanvas.width = 256; waveCanvas.height = 128;
  const wctx = waveCanvas.getContext('2d');
  wctx.strokeStyle = 'rgba(255,255,255,0.55)'; wctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) { wctx.beginPath(); const y = 12 + i * 20; wctx.moveTo(0, y); for (let x = 0; x <= 256; x += 16) wctx.lineTo(x, y + Math.sin(x / 18 + i) * 5); wctx.stroke(); }
  const waveTex = new THREE.CanvasTexture(waveCanvas); waveTex.wrapS = waveTex.wrapT = THREE.RepeatWrapping; waveTex.repeat.set(14, Math.max(1, Math.round(RIVER_W / 3)));
  const waves = new THREE.Mesh(new THREE.PlaneGeometry(90, RIVER_W), new THREE.MeshBasicMaterial({ map: waveTex, transparent: true, opacity: 0.28, depthWrite: false }));
  waves.rotation.x = -Math.PI / 2; waves.position.y = 0.0; scene.add(waves);
  for (const side of [-1, 1]) {
    const bank = S.plane(90, 30, 0x8fd47a); bank.rotation.x = -Math.PI / 2; bank.position.set(0, 0.012, side * (RIVER_W / 2 + 15)); scene.add(bank);
    const sand = S.plane(90, 1.0, 0xe5d7a8); sand.rotation.x = -Math.PI / 2; sand.position.set(0, 0.008, side * (RIVER_W / 2 + 0.5)); scene.add(sand);
  }
  const startLine = S.plane(0.14, RIVER_W, 0xffffff); startLine.rotation.x = -Math.PI / 2; startLine.position.set(X0, 0.01, 0); scene.add(startLine);
  const finishX = X0 + LEN;
  for (let i = 0; i < 10; i++) {
    const sq = S.plane(0.3, RIVER_W / 10, i % 2 ? 0xffffff : 0x2a2440); sq.rotation.x = -Math.PI / 2; sq.position.set(finishX, 0.012, -RIVER_W / 2 + RIVER_W / 20 + i * RIVER_W / 10); scene.add(sq);
  }
  for (const side of [-1, 1]) {
    const pole = S.cyl(0.06, 0.08, 3.6, 0xf1ead8, 8); pole.position.set(finishX, 1.8, side * (RIVER_W / 2 + 0.3)); scene.add(pole);
    const pole0 = S.cyl(0.05, 0.06, 2.0, 0xf1ead8, 8); pole0.position.set(X0, 1.0, side * (RIVER_W / 2 + 0.3)); scene.add(pole0);
  }
  const banner = S.label('🏁 FINISH · เส้นชัย', { height: 0.7, fontPx: 72, color: '#fff', bg: '#c8102e', border: '#ffffff', font: '"Noto Sans Thai", Fredoka, sans-serif' });
  banner.position.set(finishX, 3.3, 0); banner.rotation.y = Math.PI / 2; scene.add(banner);
  const startSign = S.label('START', { height: 0.45, fontPx: 56, color: '#2a2440', bg: '#f7d64a', border: '#2a2440' });
  startSign.position.set(X0, 2.15, 0); startSign.rotation.y = Math.PI / 2; scene.add(startSign);

  const crocObjs = [];
  crocs.forEach(c => {
    const x = X0 + c * CELL;
    for (let i = 0; i < n; i++) {
      const croc = new THREE.Group();
      const body = S.box(1.5, 0.26, 0.5, 0x3f7a3a); body.position.y = 0.1; croc.add(body);
      const head = new THREE.Group(); head.position.set(0.72, 0.1, 0); croc.add(head);
      const jaw = S.box(0.7, 0.2, 0.38, 0x4b8a44); jaw.position.x = 0.35; head.add(jaw);
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.9, 8), S.mat(0x3f7a3a)); tail.rotation.z = Math.PI / 2; tail.position.set(-1.15, 0.08, 0); tail.castShadow = true; croc.add(tail);
      for (let s = 0; s < 5; s++) { const spike = S.box(0.14, 0.14, 0.14, 0x2f6b3a, { shadow: false }); spike.position.set(-0.6 + s * 0.3, 0.3, 0); spike.rotation.z = Math.PI / 4; croc.add(spike); }
      [-0.12, 0.12].forEach(z => { const eye = S.sphere(0.06, 0xf7d64a, 8); eye.position.set(0.85, 0.24, z); croc.add(eye); const pupil = S.sphere(0.03, 0x000000, 6); pupil.position.set(0.9, 0.25, z); croc.add(pupil); });
      croc.position.set(x + (Math.random() - 0.5) * 0.3, 0, laneZ(i) + (Math.random() - 0.5) * 0.3);
      croc.rotation.y = Math.PI + (Math.random() - 0.5) * 0.5;
      croc.userData = { cell: c, lane: i, head };
      scene.add(croc);
      crocObjs.push(croc);
    }
    const sp = S.emojiSprite('🐊', 0.8); sp.position.set(x, 1.3, -RIVER_W / 2 + 0.3); scene.add(sp);
  });
  function snap(cell, lane) {
    const croc = crocObjs.find(o => o.userData.cell === cell && o.userData.lane === lane);
    if (!croc) return;
    const head = croc.userData.head;
    S.tween(head.rotation, { z: 0.6 }, { ms: 120, onDone: () => S.tween(head.rotation, { z: 0 }, { ms: 160 }) });
    S.tween(croc.position, { y: 0.35 }, { ms: 140, ease: ease.outCubic, onDone: () => S.tween(croc.position, { y: 0 }, { ms: 260, ease: ease.outBounce }) });
  }
  boosts.forEach(c => {
    const x = X0 + c * CELL;
    const patch = new THREE.Mesh(new THREE.PlaneGeometry(CELL * 0.8, RIVER_W - 0.6), new THREE.MeshBasicMaterial({ color: 0xbfe9ff, transparent: true, opacity: 0.55, depthWrite: false }));
    patch.rotation.x = -Math.PI / 2; patch.position.set(x, 0.015, 0); scene.add(patch); patch.userData.boost = true;
    const sp = S.emojiSprite('🌊', 0.8); sp.position.set(x, 1.3, -RIVER_W / 2 + 0.3); scene.add(sp);
  });

  const world = new THREE.Group(); scene.add(world);
  const mixers = [];
  const boats = {};
  const paddlers = {};
  let ready = false;

  function makeBoat(team, i) {
    const col = new THREE.Color(team.color).getHex();
    const g = new THREE.Group();
    g.position.set(X0, 0, laneZ(i));
    const hull = S.box(2.4, 0.3, 0.64, col); hull.position.y = 0.2; g.add(hull);
    const bow = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.9, 10), S.mat(col)); bow.rotation.z = -Math.PI / 2; bow.position.set(1.65, 0.2, 0); bow.castShadow = true; g.add(bow);
    const stern = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.9, 10), S.mat(col)); stern.rotation.z = Math.PI / 2; stern.position.set(-1.65, 0.2, 0); stern.castShadow = true; g.add(stern);
    const rim = S.box(2.5, 0.08, 0.7, 0x2a2440, { shadow: false }); rim.position.y = 0.34; g.add(rim);
    const deck = S.box(2.1, 0.05, 0.42, 0xf1ead8, { shadow: false }); deck.position.y = 0.38; g.add(deck);
    const pole = S.cyl(0.03, 0.03, 1.3, 0x5a3a1a, 6); pole.position.set(-1.1, 1.0, 0); g.add(pole);
    const flag = S.box(0.5, 0.32, 0.04, col, { shadow: false }); flag.position.set(-0.84, 1.45, 0); g.add(flag);
    const ava = S.emojiSprite(team.avatar, 0.62); ava.position.set(-1.1, 1.95, 0); g.add(ava);
    const eye = S.sphere(0.07, 0xffffff, 8); eye.position.set(1.5, 0.42, 0.26); g.add(eye);
    const eye2 = eye.clone(); eye2.position.z = -0.26; g.add(eye2);
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.7, 1.95, 40), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.02; g.add(ring);
    const bubble = S.emojiSprite('❓', 0.8); bubble.position.set(0.4, 2.0, 0); bubble.visible = false; g.add(bubble);
    g.userData = { team, ring, bubble, lane: i };
    scene.add(g);
    boats[team.id] = g;
    paddlers[team.id] = [];
    return g;
  }
  teams.forEach(makeBoat);

  function playOn(p, name, once) {
    const a = p.actions[name];
    if (!a) return;
    if (p.current && p.actions[p.current] && p.current !== name) p.actions[p.current].fadeOut(0.15);
    a.reset().fadeIn(0.15);
    if (once) a.setLoop(THREE.LoopOnce, 1); else a.setLoop(THREE.LoopRepeat, Infinity);
    a.clampWhenFinished = !!once;
    a.play();
    p.current = name;
  }

  (async () => {
    await preload(PADDLERS.concat(CROWD, ['nature/tree_palm.glb', 'nature/tree_oak.glb', 'nature/tree_default.glb', 'nature/plant_bush.glb', 'nature/flower_redA.glb', 'nature/flower_yellowA.glb', 'nature/rock_largeA.glb', 'nature/rock_smallA.glb', 'nature/tent_smallClosed.glb', 'suburban/fence-1x3.glb']));
    if (S.disposed) return;
    let k = 0;
    for (const team of teams) {
      const g = boats[team.id];
      for (const slot of [0, 1]) {
        const p = await instance(PADDLERS[k++ % PADDLERS.length], { size: 0.95 });
        if (S.disposed) return;
        p.position.x += 0.55 - slot * 1.05; p.position.y += 0.38; p.rotation.y = Math.PI / 2;
        g.add(p);
        const mixer = new THREE.AnimationMixer(p); mixers.push(mixer);
        const actions = {}; p.userData.animations.forEach(c => { actions[c.name] = mixer.clipAction(c); });
        const entry = { obj: p, mixer, actions, current: '' };
        playOn(entry, 'idle');
        paddlers[team.id].push(entry);
      }
    }
    const bankZ = RIVER_W / 2 + 1.2;
    const trees = ['nature/tree_palm.glb', 'nature/tree_oak.glb', 'nature/tree_palm.glb', 'nature/tree_default.glb', 'nature/tree_palm.glb'];
    for (let i = 0; i < 9; i++) {
      const x = X0 - 4 + i * (LEN + 8) / 8;
      await S.put(world, trees[i % trees.length], x + (Math.random() - 0.5) * 1.5, -(bankZ + 2.2 + Math.random() * 2.5), Math.random() * 360, { size: 3.2 + Math.random() * 1.2 });
      await S.put(world, trees[(i + 2) % trees.length], x + (Math.random() - 0.5) * 1.5, bankZ + 2.6 + Math.random() * 2.5, Math.random() * 360, { size: 3.0 + Math.random() * 1.2 });
    }
    for (let i = 0; i < 6; i++) {
      await S.put(world, i % 2 ? 'nature/flower_redA.glb' : 'nature/flower_yellowA.glb', X0 + i * LEN / 5, -(bankZ + 0.6), 0, { size: 0.5 });
      await S.put(world, 'nature/plant_bush.glb', X0 + 1 + i * LEN / 5, bankZ + 0.9, 0, { size: 0.8 });
    }
    await S.put(world, 'nature/rock_largeA.glb', X0 - 3, bankZ + 0.6, 20, { size: 1.2 });
    await S.put(world, 'nature/rock_smallA.glb', finishX + 2.5, -(bankZ + 0.4), 0, { size: 0.6 });
    await S.put(world, 'nature/tent_smallClosed.glb', finishX + 3.5, bankZ + 2.0, -120, { size: 2.2 });
    for (let i = -1; i <= 1; i++) await S.put(world, 'suburban/fence-1x3.glb', finishX + 1.2 + i * 2.3, bankZ + 1.2, 0, { size: 2.3 });
    for (let i = 0; i < 6; i++) {
      const x = X0 + 2 + i * (LEN - 2) / 5;
      const z = (i % 2 ? 1 : -1) * (bankZ + 0.3);
      const who = await S.put(world, CROWD[i % CROWD.length], x, z, 0, { size: 1.5 });
      if (S.disposed) return;
      who.lookAt(x, 0, 0);
      const mx = new THREE.AnimationMixer(who); const idle = who.userData.animations.find(a => a.name === 'idle'); if (idle) mx.clipAction(idle).play(); mixers.push(mx);
      who.userData.mixer = mx;
      crowd.push(who);
    }
    for (const side of [-1, 1]) for (let i = 0; i < 4; i++) {
      const lp = S.cyl(0.04, 0.05, 2.2, 0x5a3a1a, 6); lp.position.set(X0 + 1 + i * (LEN - 2) / 3, 1.1, side * (bankZ + 0.1)); scene.add(lp);
      const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffb347 })); lantern.position.set(lp.position.x, 2.2, lp.position.z); scene.add(lantern);
    }
    ready = true;
    S.fade(false, 700);
    S.intro({ x: X0 - 6, y: 15, z: 24 }, CAM.pos, CAM.target, 2300);
    S.title('🛶 Longboat Race', 'Answer fast, paddle hard · mind the crocodiles, ride the current');
  })();
  const crowd = [];

  let camX = 0;
  S.onFrame((dt, t) => {
    mixers.forEach(m => m.update(dt));
    waveTex.offset.x -= dt * 0.12;
    let sum = 0, count = 0;
    Object.values(boats).forEach((g, i) => {
      g.position.y = Math.sin(t * 2 + i) * 0.03;
      g.rotation.z = Math.sin(t * 1.6 + i) * 0.02;
      if (g.userData.ring.material.opacity > 0) g.userData.ring.material.opacity = 0.45 + Math.sin(t * 4) * 0.2;
      if (g.userData.bubble.visible) g.userData.bubble.position.y = 2.0 + Math.sin(t * 3) * 0.1;
      sum += g.position.x; count++;
    });
    if (count) {
      const lead = Math.max(...Object.values(boats).map(g => g.position.x));
      const want = Math.max(X0 + 2, Math.min(finishX - 2, (sum / count) * 0.5 + lead * 0.5));
      camX += (want - camX) * Math.min(1, dt * 1.5);
      if (ready) { S.camTarget.x = camX; camera.position.x = CAM.pos.x + camX; }
    }
  });

  function spotlight(id) {
    Object.values(boats).forEach(g => { g.userData.ring.material.opacity = 0; g.userData.bubble.visible = false; });
    const g = boats[id];
    if (!g) return;
    g.userData.ring.material.opacity = 0.5;
    g.userData.bubble.visible = true;
  }

  function paddle(id, ms) {
    (paddlers[id] || []).forEach(p => playOn(p, 'walk'));
    setTimeout(() => { if (!S.disposed) (paddlers[id] || []).forEach(p => playOn(p, 'idle')); }, ms);
  }

  function moveBoat(id, pos, label, event) {
    const g = boats[id];
    if (!g) return;
    const finalX = X0 + pos * CELL;
    const firstX = event === 'croc' ? finalX + CELL : event === 'boost' ? finalX - CELL : finalX;
    const forward = firstX >= g.position.x;
    const bg = label && label.charAt(0) === '−' ? '#c0392b' : event === 'gust' ? '#1f6fb5' : '#2f8f52';
    S.floatText(label, g.position.clone().add(new THREE.Vector3(0.4, 2.3, 0)), { bg, height: 0.8 });
    paddle(id, event ? 1700 : 1000);
    S.burst(g.position.clone().add(new THREE.Vector3(forward ? -1.5 : 1.5, 0.1, 0)), { color: 0xffffff, n: 14, speed: 1.6, size: 0.06, gravity: 1.6, life: 0.7 });
    S.tween(g.position, { x: firstX }, { ms: 950, ease: forward ? ease.outCubic : ease.inOutCubic, onDone: () => {
      if (event === 'croc') {
        snap(pos + 1, g.userData.lane);
        LW.sound.thud();
        S.tween(g.rotation, { x: 0.35 }, { ms: 140, onDone: () => S.tween(g.rotation, { x: 0 }, { ms: 320, ease: ease.outBounce }) });
        S.burst(g.position.clone().add(new THREE.Vector3(1.4, 0.3, 0)), { color: 0x9fdcff, n: 16, speed: 2.4, size: 0.07 });
        S.floatText('🐊 −1', g.position.clone().add(new THREE.Vector3(0.4, 2.0, 0)), { bg: '#2f6b3a', height: 0.7, ms: 1100 });
        S.tween(g.position, { x: finalX }, { ms: 600, ease: ease.outCubic, delay: 200 });
      } else if (event === 'boost') {
        S.burst(g.position.clone().add(new THREE.Vector3(0, 0.3, 0)), { color: 0x9fdcff, n: 22, speed: 2.6, size: 0.07, gravity: 1 });
        S.floatText('🌊 +1', g.position.clone().add(new THREE.Vector3(0.4, 2.0, 0)), { bg: '#1f6fb5', height: 0.7, ms: 1100 });
        S.tween(g.position, { x: finalX }, { ms: 600, ease: ease.outCubic, delay: 100 });
      }
    } });
  }

  function react(id, ok, text) {
    const g = boats[id];
    if (!g) return;
    if (text) S.floatText(text, g.position.clone().add(new THREE.Vector3(0.4, 2.3, 0)), { bg: ok ? '#2f8f52' : '#c0392b', height: 0.75 });
    (paddlers[id] || []).forEach(p => playOn(p, ok ? 'emote-yes' : 'emote-no', true));
    setTimeout(() => { if (!S.disposed) (paddlers[id] || []).forEach(p => playOn(p, 'idle')); }, 1300);
  }

  function finish(id, place, bonus) {
    const g = boats[id];
    if (!g) return;
    const col = new THREE.Color(g.userData.team.color).getHex();
    S.floatText('🏁 ' + ordinal(place) + '  +' + bonus, g.position.clone().add(new THREE.Vector3(0.4, 2.6, 0)), { bg: '#2f8f52', height: 1.0, ms: 2000 });
    [col, 0xf7d64a, 0xffffff].forEach((c, i) => setTimeout(() => { if (!S.disposed) S.burst(g.position.clone().add(new THREE.Vector3(0, 1.5, 0)), { color: c, n: 22, speed: 4, gravity: 4, life: 1.3 }); }, i * 140));
    S.banner('🏁 ' + g.userData.team.name + ' finishes ' + ordinal(place) + '!', 'good');
    (paddlers[id] || []).forEach(p => playOn(p, 'emote-yes', true));
    crowd.forEach(w => { const yes = w.userData.animations.find(a => a.name === 'emote-yes'); if (yes && w.userData.mixer) w.userData.mixer.clipAction(yes).reset().setLoop(THREE.LoopOnce, 1).play(); });
    setTimeout(() => { if (!S.disposed) (paddlers[id] || []).forEach(p => playOn(p, 'idle')); }, 1500);
  }

  function podium(id) {
    const g = boats[id];
    if (!g) return;
    S.banner('🏆 ' + g.userData.team.name + ' wins the race! ชนะแล้ว!', 'good');
    for (let i = 0; i < 5; i++) setTimeout(() => { if (!S.disposed) S.burst(g.position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 3, 1.5 + Math.random(), (Math.random() - 0.5) * 2)), { color: [0xf7d64a, 0xef6fa0, 0x45b36b, 0x2f8fd8, 0xffffff][i], n: 26, speed: 4.5, gravity: 4, life: 1.4 }); }, i * 180);
    S.moveCamera({ x: g.position.x + 2, y: 4.5, z: g.position.z + 7 }, { x: g.position.x, y: 0.8, z: g.position.z }, 1500);
    ready = false;
  }

  return { spotlight, moveBoat, react, finish, podium, stage: S, dispose: S.dispose };
});
