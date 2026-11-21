import { createStage, ease, instance, preload } from './engine.js';
import * as THREE from 'three';

const LW = window.LW;

const LOTS = {
  cafe:     { x: -7, z: -6.5, model: 'commercial/building-d.glb', color: '#f0a92c', short: 'Café' },
  shop:     { x: 0, z: -7, model: 'commercial/building-a.glb', color: '#ef6fa0', short: 'Shop' },
  bank:     { x: 7, z: -6.5, model: 'commercial/building-h.glb', color: '#2f8fd8', short: 'Bank' },
  hotel:    { x: 8.5, z: 1, model: 'commercial/building-skyscraper-c.glb', color: '#9b5de5', short: 'Hotel' },
  pharmacy: { x: 7, z: 7, model: 'commercial/building-b.glb', color: '#45b36b', short: 'Pharmacy' },
  cinema:   { x: -1.5, z: 8, model: 'commercial/building-f.glb', color: '#e8453c', short: 'Cinema' },
  library:  { x: -7, z: 7, model: 'commercial/building-k.glb', color: '#30b8a0', short: 'Library' },
  school:   { x: -8.5, z: 1, model: 'suburban/building-type-k.glb', color: '#f7d64a', short: 'School' },
  station:  { x: 8.5, z: -2, model: 'commercial/building-m.glb', color: '#5b4bd6', short: 'Station' },
  park:     { x: -8.5, z: -2, model: 'nature/tree_oak.glb', color: '#2f8f52', short: 'Park', tree: true },
  market:   { x: 4.0, z: 8, model: 'commercial/building-c.glb', color: '#b1793a', short: 'Market' },
  bus:      { x: -3.5, z: -7, model: 'commercial/building-e.glb', color: '#e07b2a', short: 'Bus stop' }
};
const ROAD = 4.2;
const ROAD_W = 1.6;
const CAM = { pos: new THREE.Vector3(0, 16.5, 17.5), target: new THREE.Vector3(0, 0.4, -1.2) };
const NPC_MODELS = ['characters/character-female-a.glb', 'characters/character-male-c.glb', 'characters/character-female-d.glb', 'characters/character-male-f.glb', 'characters/character-female-e.glb'];

LW.hs3d.register('city', function (host, hooks, options) {
  const S = createStage(host, { fov: 40, aspect: 16 / 8.5, shadowBounds: 16, hemi: 1.0, sun: 1.6, fog: 0xcfe9ff, fogNear: 30, fogFar: 60, reserve: 360, fullReserve: 285 });
  if (!S) return null;
  const { scene, camera } = S;
  const places = (options && options.places) || [];

  camera.position.copy(CAM.pos);
  S.lookAt(0, 0, 0);
  S.fade(true, 0);

  const ground = S.plane(80, 80, 0x8fd47a); ground.rotation.x = -Math.PI / 2; scene.add(ground);
  const roadMat = S.mat(0x5a5a6e);
  const roadLen = (ROAD + ROAD_W) * 2;
  [[0, -ROAD, roadLen, ROAD_W * 2], [0, ROAD, roadLen, ROAD_W * 2], [-ROAD, 0, ROAD_W * 2, roadLen], [ROAD, 0, ROAD_W * 2, roadLen]].forEach(([x, z, w, d]) => {
    const r = new THREE.Mesh(new THREE.PlaneGeometry(w, d), roadMat); r.rotation.x = -Math.PI / 2; r.position.set(x, 0.01, z); r.receiveShadow = true; scene.add(r);
  });
  const kerbOut = (ROAD + ROAD_W) * 2 + 1.6, kerbIn = (ROAD - ROAD_W) * 2;
  const paveOut = new THREE.Mesh(new THREE.PlaneGeometry(kerbOut, kerbOut), S.mat(0xd9d2c5)); paveOut.rotation.x = -Math.PI / 2; paveOut.position.y = 0.006; paveOut.receiveShadow = true; scene.add(paveOut);
  const paveIn = new THREE.Mesh(new THREE.PlaneGeometry(kerbIn, kerbIn), S.mat(0xd9d2c5)); paveIn.rotation.x = -Math.PI / 2; paveIn.position.y = 0.012; paveIn.receiveShadow = true; scene.add(paveIn);
  const dash = S.mat(0xf4f4f4);
  for (let i = -3; i <= 3; i++) {
    if (Math.abs(i) <= 1) continue;
    [[i * 1.3, -ROAD, 0], [i * 1.3, ROAD, 0], [-ROAD, i * 1.3, 1], [ROAD, i * 1.3, 1]].forEach(([x, z, vert]) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(vert ? 0.12 : 0.6, vert ? 0.6 : 0.12), dash); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.02, z); scene.add(m);
    });
  }
  const stripe = S.mat(0xf4f4f4);
  [[0, -ROAD, 0], [0, ROAD, 0], [-ROAD, 0, 1], [ROAD, 0, 1]].forEach(([x, z, vert]) => {
    for (let i = -2; i <= 2; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(vert ? ROAD_W * 2 : 0.35, vert ? 0.35 : ROAD_W * 2), stripe);
      m.rotation.x = -Math.PI / 2; m.position.set(x + (vert ? 0 : i * 0.7), 0.02, z + (vert ? i * 0.7 : 0)); scene.add(m);
    }
  });
  const basin = S.cyl(1.1, 1.2, 0.35, 0xb8b2c8, 24); basin.position.y = 0.17; scene.add(basin);
  const water = S.cyl(0.95, 0.95, 0.3, 0x7cc6ff, 24); water.position.y = 0.22; scene.add(water);
  const jet = S.cyl(0.12, 0.2, 1.0, 0xa9d8ff, 10); jet.position.y = 0.8; scene.add(jet);
  for (const [x, z] of [[-6.2, -6.2], [6.2, -6.2], [-6.2, 6.2], [6.2, 6.2]]) {
    const pole = S.cyl(0.05, 0.07, 2.6, 0x3a3348, 8); pole.position.set(x, 1.3, z); scene.add(pole);
    const head = S.box(0.5, 0.18, 0.3, 0x3a3348); head.position.set(x, 2.65, z); scene.add(head);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff1c8 })); bulb.position.set(x, 2.55, z); scene.add(bulb);
  }

  const town = new THREE.Group(); scene.add(town);
  const signs = {};
  const lotOf = {};
  const doorNpc = {};
  const mixers = [];
  const cars = [];
  places.forEach(p => { lotOf[p.id] = LOTS[p.place] || LOTS.shop; });

  const arrow = new THREE.Group(); arrow.visible = false; scene.add(arrow);
  const arrowCone = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.9, 12), new THREE.MeshBasicMaterial({ color: 0xf7d64a })); arrowCone.rotation.x = Math.PI; arrow.add(arrowCone);
  const arrowRing = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.15, 32), new THREE.MeshBasicMaterial({ color: 0xf7d64a, transparent: true, opacity: 0.7, side: THREE.DoubleSide })); arrowRing.rotation.x = -Math.PI / 2; scene.add(arrowRing); arrowRing.visible = false;

  let hero = null, heroMixer = null, heroActions = {}, heroCurrent = '', ready = false;
  const heroMarker = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.6, 24), new THREE.MeshBasicMaterial({ color: 0x2f8fd8, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
  heroMarker.rotation.x = -Math.PI / 2; heroMarker.position.y = 0.03; scene.add(heroMarker);

  (async () => {
    const used = new Set(places.map(p => (LOTS[p.place] || LOTS.shop).model));
    await preload([...used, 'nature/tree_default.glb', 'nature/tree_oak.glb', 'nature/plant_bush.glb', 'nature/flower_redA.glb', 'nature/flower_yellowA.glb', 'suburban/building-type-c.glb', 'suburban/building-type-f.glb', 'commercial/low-detail-building-a.glb', 'commercial/low-detail-building-d.glb', 'cars/sedan.glb', 'cars/taxi.glb', 'cars/van.glb', 'cars/police.glb', 'characters/character-male-d.glb', 'characters/character-female-b.glb', 'characters/character-worker.glb', 'characters/character-male-a.glb', 'characters/character-male-b.glb', 'characters/character-female-f.glb', 'characters/item-luggage.glb', 'furniture/bench.glb', ...NPC_MODELS]);
    if (S.disposed) return;
    let n = 0;
    for (const p of places) {
      const L = LOTS[p.place] || LOTS.shop;
      const b = await S.put(town, L.model, L.x, L.z, L.z < 0 ? 0 : 180, { size: L.tree ? 4.5 : 5.2 });
      if (L.x > 6) b.rotation.y = -Math.PI / 2; if (L.x < -6) b.rotation.y = Math.PI / 2;
      const sign = S.labelSprite(p.emoji + ' ' + L.short, { height: 0.8, fontPx: 64, color: '#2a2440', bg: '#fffdf6', border: L.color });
      sign.position.set(L.x, L.tree ? 5.0 : 5.7, L.z); scene.add(sign); signs[p.id] = sign;
      const hit = new THREE.Mesh(new THREE.BoxGeometry(5.5, 7, 5.5), new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.set(L.x, 3.5, L.z); hit.userData.pick = p.id; hit.userData.glow = false; scene.add(hit); S.pickables.push(hit);
      const d = doorOf(L);
      const ring = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.3, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(L.color), transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2; ring.position.set(d.x, 0.03, d.z); scene.add(ring); sign.userData.ring = ring;
      const who = await S.put(town, NPC_MODELS[n++ % NPC_MODELS.length], d.x + (L.x > 6 ? 0.9 : L.x < -6 ? -0.9 : 0), d.z + (L.z > 6 ? 0.9 : L.z < -6 ? -0.9 : 0), 0, { size: 1.6 });
      who.lookAt(0, 0, 0);
      const mx = new THREE.AnimationMixer(who); const idle = who.userData.animations.find(a => a.name === 'idle'); if (idle) mx.clipAction(idle).play(); mixers.push(mx);
      who.userData.mixer = mx;
      doorNpc[p.id] = who;
      const bubble = S.emojiSprite(p.npcEmoji || '💬', 0.9); bubble.position.set(0, 2.4, 0); who.add(bubble); who.userData.bubble = bubble;
    }
    const usedLots = new Set(places.map(p => p.place));
    const fillers = ['suburban/building-type-c.glb', 'commercial/low-detail-building-a.glb', 'suburban/building-type-f.glb', 'commercial/low-detail-building-d.glb'];
    let f = 0;
    for (const key of Object.keys(LOTS)) {
      if (usedLots.has(key)) continue;
      const L = LOTS[key];
      if (f % 3 === 2) { await S.put(town, 'nature/tree_default.glb', L.x, L.z, 0, { size: 3.4 }); f++; continue; }
      const b = await S.put(town, fillers[f++ % fillers.length], L.x, L.z, L.z < 0 ? 0 : 180, { size: 4.2 });
      if (L.x > 6) b.rotation.y = -Math.PI / 2; if (L.x < -6) b.rotation.y = Math.PI / 2;
    }
    for (const [x, z] of [[-2.4, 2.4], [2.4, 2.4], [-2.4, -2.4], [2.4, -2.4]]) await S.put(town, 'nature/tree_oak.glb', x, z, Math.random() * 360, { size: 2.6 });
    for (const [x, z] of [[-1.2, 2.6], [1.4, -2.6], [2.8, 0.6], [-2.8, -0.4]]) await S.put(town, 'nature/plant_bush.glb', x, z, 0, { size: 0.9 });
    for (const [x, z, m] of [[-1.8, 0.4, 'nature/flower_redA.glb'], [1.9, -0.8, 'nature/flower_yellowA.glb'], [0.6, 1.9, 'nature/flower_redA.glb'], [-0.4, -1.9, 'nature/flower_yellowA.glb']]) await S.put(town, m, x, z, 0, { size: 0.5 });
    await S.put(town, 'furniture/bench.glb', 1.6, 1.6, 225, { size: 1.4 });
    await S.put(town, 'furniture/bench.glb', -1.6, -1.6, 45, { size: 1.4 });
    for (const [m, x, z, r] of [['characters/character-male-d.glb', -1.6, 1.0, 60], ['characters/character-female-b.glb', 1.8, 1.4, -120], ['characters/character-worker.glb', -1.0, -1.8, 10]]) {
      const ped = await S.put(town, m, x, z, r, { size: 1.6 });
      const mx = new THREE.AnimationMixer(ped); const idle = ped.userData.animations.find(a => a.name === 'idle'); if (idle) mx.clipAction(idle).play(); mixers.push(mx);
    }
    const carModels = ['cars/sedan.glb', 'cars/taxi.glb', 'cars/van.glb', 'cars/police.glb'];
    for (let i = 0; i < 4; i++) {
      const car = await instance(carModels[i], { size: 2.4 });
      car.userData.t = i * 0.25;
      car.userData.speed = 0.055 + Math.random() * 0.02;
      scene.add(car); cars.push(car);
    }
    hero = await instance('characters/character-male-a.glb', { size: 1.7 });
    hero.position.set(0.8, 0, 1.4);
    scene.add(hero);
    heroMixer = new THREE.AnimationMixer(hero);
    hero.userData.animations.forEach(c => { heroActions[c.name] = heroMixer.clipAction(c); });
    play('idle');
    thief = await instance('characters/character-male-b.glb', { size: 1.65 });
    thief.traverse(o => { if (o.isMesh) o.material.color.setHex(0x7a7a8c); });
    thief.visible = false; scene.add(thief);
    const tm = new THREE.AnimationMixer(thief); thief.userData.animations.forEach(c => { thiefActions[c.name] = tm.clipAction(c); }); mixers.push(tm);
    const thiefHit = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.4, 1.6), new THREE.MeshBasicMaterial({ visible: false })); thiefHit.position.y = 1.2; thief.add(thiefHit);
    thief.userData.pick = 'thief'; thief.userData.glow = false; thief.userData.disabled = true; S.pickables.push(thief);
    thiefBubble.position.set(0, 2.5, 0); thief.add(thiefBubble);
    tourist = await instance('characters/character-female-f.glb', { size: 1.6 });
    tourist.visible = false; scene.add(tourist);
    const um = new THREE.AnimationMixer(tourist); const tIdle = tourist.userData.animations.find(a => a.name === 'idle'); if (tIdle) um.clipAction(tIdle).play(); mixers.push(um);
    luggage = await instance('characters/item-luggage.glb', { size: 0.8 }); luggage.visible = false; scene.add(luggage);
    touristBubble.position.set(0, 2.5, 0); tourist.add(touristBubble);
    ready = true;
    S.fade(false, 700);
    S.intro({ x: 0, y: 26, z: 30 }, CAM.pos, CAM.target, 2200);
    S.title('🏙️ City Quest', 'Visit every place · mind the traffic · choose your words well');
  })();

  function play(name, fadeMs = 0.2) {
    if (!heroActions[name] || heroCurrent === name) return;
    if (heroActions[heroCurrent]) heroActions[heroCurrent].fadeOut(fadeMs);
    heroActions[name].reset().fadeIn(fadeMs).play();
    heroCurrent = name;
  }

  function doorOf(L) {
    const out = ROAD + ROAD_W + 1.2;
    if (Math.abs(L.x) >= Math.abs(L.z)) return { x: Math.sign(L.x) * out, z: Math.max(-ROAD + 0.5, Math.min(ROAD - 0.5, L.z)) };
    return { x: Math.max(-ROAD + 0.5, Math.min(ROAD - 0.5, L.x)), z: Math.sign(L.z) * out };
  }
  function ringAt(t, out) {
    const s = (t % 1 + 1) % 1 * 4;
    const k = Math.floor(s), f = s - k;
    const R = ROAD;
    if (k === 0) out.set(-R + f * 2 * R, 0, -R);
    else if (k === 1) out.set(R, 0, -R + f * 2 * R);
    else if (k === 2) out.set(R - f * 2 * R, 0, R);
    else out.set(-R, 0, R - f * 2 * R);
    return out;
  }

  let thief = null, tourist = null, luggage = null, thiefMode = 'off', thiefSpeed = 1, thiefCurrent = '';
  const thiefActions = {};
  const thiefBubble = S.emojiSprite('🕵️', 0.9);
  const touristBubble = S.emojiSprite('❓', 0.9);
  const fleeDir = new THREE.Vector3();
  function thiefPlay(name) {
    if (!thiefActions[name] || thiefCurrent === name) return;
    if (thiefActions[thiefCurrent]) thiefActions[thiefCurrent].fadeOut(0.15);
    thiefActions[name].reset().fadeIn(0.15).play();
    thiefCurrent = name;
  }
  function sidePoint(p, dist) {
    const onX = Math.abs(p.x) >= Math.abs(p.z);
    const outerSide = (onX ? Math.abs(p.x) : Math.abs(p.z)) > ROAD;
    const perp = onX ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(1, 0, 0);
    if (outerSide) return p.clone().addScaledVector(perp, dist);
    return new THREE.Vector3(p.x * 0.25, 0, p.z * 0.25).addScaledVector(perp, dist * 0.5);
  }

  const heroVel = new THREE.Vector3();
  let path = [], walkResolve = null, hitCooldown = 0, waiting = false, lastKerb = null, targetId = null, stepT = 0;
  S.onFrame((dt, t) => {
    mixers.forEach(m => m.update(dt));
    if (heroMixer) heroMixer.update(dt);
    if (thief && thief.visible) {
      thiefBubble.position.y = 2.5 + Math.sin(t * 5) * 0.08;
      if (thiefMode === 'sneak' && hero) {
        const d = hero.position.clone().sub(thief.position); d.y = 0;
        const len = d.length();
        if (len > 0.95) { d.normalize(); thief.position.addScaledVector(d, Math.min(len - 0.95, thiefSpeed * dt)); thief.lookAt(hero.position.x, 0, hero.position.z); }
        else thiefPlay('idle');
      } else if (thiefMode === 'flee') {
        thief.position.addScaledVector(fleeDir, 5.5 * dt);
      }
    }
    if (tourist && tourist.visible) touristBubble.position.y = 2.5 + Math.sin(t * 3) * 0.08;
    cars.forEach(c => {
      c.userData.t += dt * c.userData.speed;
      ringAt(c.userData.t, c.position);
      c.position.y = 0;
      const ahead = ringAt(c.userData.t + 0.01, new THREE.Vector3());
      c.lookAt(ahead.x, 0, ahead.z);
    });
    jet.scale.y = 1 + Math.sin(t * 6) * 0.15;
    Object.values(signs).forEach((s, i) => { s.position.y = (s.userData.baseY || (s.userData.baseY = s.position.y)) + Math.sin(t * 2 + i) * 0.12; });
    Object.values(doorNpc).forEach((w, i) => { if (w.userData.bubble) w.userData.bubble.position.y = 2.4 + Math.sin(t * 3 + i) * 0.08; });
    if (arrow.visible) { arrow.position.y = arrow.userData.baseY + Math.sin(t * 5) * 0.25; arrow.rotation.y += dt * 2; arrowRing.scale.setScalar(1 + Math.sin(t * 4) * 0.12); }
    if (hero) { heroMarker.position.x = hero.position.x; heroMarker.position.z = hero.position.z; }

    if (hero && path.length && !waiting) {
      const target = path[0];
      heroVel.set(target.x - hero.position.x, 0, target.z - hero.position.z);
      const dist = heroVel.length();
      const step = (target.crossing ? 3.8 : 2.6) * dt;
      stepT += dt;
      if (stepT > 0.42 && heroCurrent === 'walk') { stepT = 0; LW.sound.footstep(); }
      if (dist <= step) {
        hero.position.set(target.x, 0, target.z);
        path.shift();
        if (target.kerb) {
          waiting = true; lastKerb = target;
          hero.lookAt(path[0].x, 0, path[0].z);
          play('idle');
          S.banner('🚦 Wait for a gap, then cross!', 'good');
          hooks.onKerb && hooks.onKerb();
        } else if (!path.length) {
          play('idle');
          const npc = doorNpc[targetId];
          if (npc) { hero.lookAt(npc.position.x, 0, npc.position.z); npc.lookAt(hero.position.x, 0, hero.position.z); }
          const r = walkResolve; walkResolve = null; r && r();
        }
      } else { heroVel.normalize(); hero.position.addScaledVector(heroVel, step); hero.lookAt(target.x, 0, target.z); }
      hitCooldown -= dt;
      if (target.crossing && hitCooldown <= 0) {
        for (const c of cars) {
          if (c.position.distanceTo(hero.position) < 1.7) {
            hitCooldown = 2;
            S.floatText('−5 ระวังรถ!', hero.position.clone().add(new THREE.Vector3(0, 2.4, 0)), { bg: '#c0392b', height: 0.9 });
            S.burst(hero.position.clone().add(new THREE.Vector3(0, 1, 0)), { color: 0xe8453c, n: 14, speed: 3 });
            S.shake(0.3, 500);
            LW.sound.horn();
            play('fall', 0.05);
            waiting = true;
            const kerb = lastKerb;
            setTimeout(() => {
              if (S.disposed) return;
              if (kerb) hero.position.set(kerb.x, 0, kerb.z);
              play('idle');
              hooks.onKerb && hooks.onKerb();
            }, 900);
            hooks.onHit && hooks.onHit();
            break;
          }
        }
      }
      S.camTarget.lerp(new THREE.Vector3(hero.position.x * 0.4, 0.4, -1.2 + hero.position.z * 0.4), Math.min(1, dt * 2));
    }
  });

  function walkTo(id) {
    const L = lotOf[id] || LOTS.shop;
    const door = doorOf(L);
    targetId = id;
    arrow.visible = true; arrowRing.visible = true;
    arrow.position.set(L.x, 0, L.z); arrow.userData.baseY = L.tree ? 6.4 : 7.4;
    arrowRing.position.set(door.x, 0.04, door.z);
    return new Promise(resolve => {
      const start = () => {
        const inner = ROAD - ROAD_W - 0.6;
        const outer = ROAD + ROAD_W + 0.6;
        const hp = hero.position;
        const side = Math.abs(L.x) >= Math.abs(L.z) ? 'x' : 'z';
        const sgn = side === 'x' ? Math.sign(L.x) : Math.sign(L.z);
        const inside = Math.abs(hp.x) < inner + 0.8 && Math.abs(hp.z) < inner + 0.8;
        const pt = (x, z, flags) => Object.assign(new THREE.Vector3(x, 0, z), flags || {});
        path = [];
        waiting = false;
        if (!inside) {
          const sx = Math.abs(hp.x) >= Math.abs(hp.z) ? 'x' : 'z';
          const sg = sx === 'x' ? Math.sign(hp.x) : Math.sign(hp.z);
          path.push(sx === 'x' ? pt(sg * outer, 0, { kerb: true }) : pt(0, sg * outer, { kerb: true }));
          path.push(sx === 'x' ? pt(sg * inner, 0, { crossing: true }) : pt(0, sg * inner, { crossing: true }));
        }
        path.push(side === 'x' ? pt(sgn * inner, 0, { kerb: true }) : pt(0, sgn * inner, { kerb: true }));
        path.push(side === 'x' ? pt(sgn * outer, 0, { crossing: true }) : pt(0, sgn * outer, { crossing: true }));
        path.push(pt(door.x, door.z));
        walkResolve = resolve;
        play('walk');
      };
      const wait = () => { if (ready) start(); else if (!S.disposed) setTimeout(wait, 100); else resolve(); };
      wait();
    });
  }

  function cross() {
    if (!waiting) return false;
    waiting = false;
    play('sprint', 0.1);
    LW.sound.whoosh();
    return true;
  }

  function react(ok, text) {
    if (!hero) return;
    if (text) S.floatText(text, hero.position.clone().add(new THREE.Vector3(0, 2.4, 0)), { bg: ok ? '#2f8f52' : '#c0392b', height: 0.8 });
    if (ok) S.burst(hero.position.clone().add(new THREE.Vector3(0, 1.4, 0)), { color: 0x7cf29a, n: 12, speed: 2, gravity: 2 });
    play(ok ? 'emote-yes' : 'emote-no', 0.1);
    const npc = doorNpc[targetId];
    if (npc && npc.userData.mixer) {
      const clip = npc.userData.animations.find(a => a.name === (ok ? 'emote-yes' : 'emote-no'));
      if (clip) npc.userData.mixer.clipAction(clip).reset().setLoop(THREE.LoopOnce).play();
    }
    setTimeout(() => { if (!S.disposed) play('idle'); }, 1200);
  }

  function complete(id) {
    const s = signs[id];
    if (!s) return;
    s.material.opacity = 0.45;
    if (s.userData.ring) s.userData.ring.material.opacity = 0;
    const npc = doorNpc[id];
    if (npc && npc.userData.bubble) { npc.remove(npc.userData.bubble); const ok = S.emojiSprite('✅', 0.9); ok.position.set(0, 2.4, 0); npc.add(ok); npc.userData.bubble = ok; }
    arrow.visible = false; arrowRing.visible = false;
    const L = lotOf[id];
    S.floatText('+15 เยี่ยม!', new THREE.Vector3(L.x, 5.2, L.z), { bg: '#2f8f52', height: 1.0, ms: 1800 });
    [0xf7d64a, 0x45b36b, 0x2f8fd8].forEach((c, i) => setTimeout(() => { if (!S.disposed) S.burst(new THREE.Vector3(L.x, 5.6, L.z), { color: c, n: 18, speed: 4, gravity: 4, life: 1.2 }); }, i * 120));
    S.banner('✅ ' + (L.short || 'Done') + ' complete!', 'good');
  }

  function thiefFn(active, stole) {
    if (!thief || !hero) return;
    if (active) {
      const from = sidePoint(hero.position, 3.8);
      thief.position.copy(from);
      thief.visible = true;
      thiefMode = 'sneak';
      thiefSpeed = Math.max(0.8, from.distanceTo(hero.position) / 2.9);
      thief.userData.disabled = false;
      thiefBubble.material.map = S.emojiSprite('🕵️', 0.9).material.map;
      thief.lookAt(hero.position.x, 0, hero.position.z);
      thiefPlay('walk');
      S.banner('🕵️ Pickpocket! Click him to shoo him away');
      return;
    }
    if (!thief.visible) return;
    thief.userData.disabled = true;
    thiefMode = 'flee';
    fleeDir.copy(thief.position).sub(hero.position).setY(0);
    if (fleeDir.lengthSq() < 0.01) fleeDir.set(1, 0, 0);
    fleeDir.normalize();
    thief.lookAt(thief.position.x + fleeDir.x, 0, thief.position.z + fleeDir.z);
    thiefPlay('sprint');
    if (stole) {
      thiefBubble.material.map = S.emojiSprite('💰', 0.9).material.map;
      S.floatText('−5 ล้วงกระเป๋า!', hero.position.clone().add(new THREE.Vector3(0, 2.4, 0)), { bg: '#c0392b', height: 0.9 });
      S.burst(hero.position.clone().add(new THREE.Vector3(0, 1.2, 0)), { color: 0xe8453c, n: 14, speed: 3 });
      S.shake(0.2, 400);
      play('emote-no', 0.1);
      setTimeout(() => { if (!S.disposed && waiting) play('idle'); }, 1200);
    } else {
      S.floatText('👋 shoo!', thief.position.clone().add(new THREE.Vector3(0, 2.2, 0)), { bg: '#2f8f52', height: 0.7, ms: 900 });
      S.burst(thief.position.clone().add(new THREE.Vector3(0, 1.2, 0)), { color: 0x7cf29a, n: 10, speed: 2 });
    }
    setTimeout(() => { if (!S.disposed && thiefMode === 'flee') { thief.visible = false; thiefMode = 'off'; } }, 1500);
  }

  function touristFn(active) {
    if (!tourist || !hero) return;
    if (active) {
      const at = sidePoint(hero.position, 1.9);
      tourist.position.copy(at);
      tourist.visible = true;
      tourist.lookAt(hero.position.x, 0, hero.position.z);
      luggage.position.copy(at).add(new THREE.Vector3(0.5, 0, 0.3)); luggage.visible = true;
      hero.lookAt(at.x, 0, at.z);
      S.floatText('Excuse me! 🧳', at.clone().add(new THREE.Vector3(0, 2.4, 0)), { bg: '#1f6fb5', height: 0.75, ms: 1400 });
    } else {
      tourist.visible = false;
      luggage.visible = false;
    }
  }

  S.onPick(id => {
    if (id === 'thief') { hooks.onThief && hooks.onThief(); return; }
    if (waiting) { if (cross()) hooks.onCross && hooks.onCross(); return; }
    if (id) hooks.onPlace && hooks.onPlace(id);
  });

  return { walkTo, cross, react, complete, thief: thiefFn, tourist: touristFn, stage: S, dispose: S.dispose };
});
