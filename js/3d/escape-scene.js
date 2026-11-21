import { createStage, ease, instance, preload } from './engine.js';
import * as THREE from 'three';

const LW = window.LW;
const F = 'furniture/';
const FS = 3.0;
const W = 13, D = 9, H = 5.2;
const HOME = { pos: new THREE.Vector3(0, 5.6, 11.5), target: new THREE.Vector3(0, 1.6, -0.5) };
const VIEWS = {
  safe:  { pos: new THREE.Vector3(-3.0, 2.8, 1.8), target: new THREE.Vector3(-5.6, 1.0, -2.6) },
  shelf: { pos: new THREE.Vector3(-0.8, 3.2, 1.4), target: new THREE.Vector3(-1.2, 1.7, -4.1) },
  chest: { pos: new THREE.Vector3(-1.4, 2.8, 5.6), target: new THREE.Vector3(-3.6, 0.6, 2.4) },
  door:  { pos: new THREE.Vector3(2.4, 3.0, 1.0), target: new THREE.Vector3(5.4, 2.0, -4.4) },
  hunt:  { pos: new THREE.Vector3(0.3, 5.4, 10.6), target: new THREE.Vector3(0.3, 1.0, 1.0) }
};
const SPOT_AT = {
  plant: new THREE.Vector3(-6.0, 1.7, 3.2),
  radio: new THREE.Vector3(4.6, 1.7, 3.2),
  lamp:  new THREE.Vector3(0.2, 2.3, 1.6),
  coat:  new THREE.Vector3(6.2, 2.5, -1.2)
};

LW.hs3d.register('escape', function (host, hooks) {
  const S = createStage(host, { fov: 42, aspect: 16 / 8.5, shadowBounds: 10, hemi: 0.85, sun: 1.1, reserve: 360, fullReserve: 285 });
  if (!S) return null;
  const { scene, camera } = S;

  camera.position.copy(HOME.pos);
  S.lookAt(HOME.target.x, HOME.target.y, HOME.target.z);
  S.fade(true, 0);

  const shell = new THREE.Group(); scene.add(shell);
  const floor = S.plane(W, D, 0x9a7b5a); floor.rotation.x = -Math.PI / 2; shell.add(floor);
  const ceiling = S.plane(W, D, 0xe9e2d2); ceiling.rotation.x = Math.PI / 2; ceiling.position.y = H; shell.add(ceiling);
  const back = S.plane(W, H, 0x6d8a6a); back.position.set(0, H / 2, -D / 2); shell.add(back);
  const left = S.plane(D, H, 0x5f7a5d); left.rotation.y = Math.PI / 2; left.position.set(-W / 2, H / 2, 0); shell.add(left);
  const right = S.plane(D, H, 0x5f7a5d); right.rotation.y = -Math.PI / 2; right.position.set(W / 2, H / 2, 0); shell.add(right);
  const dado = S.box(W, 1.3, 0.1, 0x4e3a2a, { shadow: false }); dado.position.set(0, 0.65, -D / 2 + 0.05); shell.add(dado);
  const dadoL = S.box(0.1, 1.3, D, 0x4e3a2a, { shadow: false }); dadoL.position.set(-W / 2 + 0.05, 0.65, 0); shell.add(dadoL);
  const dadoR = S.box(0.1, 1.3, D, 0x4e3a2a, { shadow: false }); dadoR.position.set(W / 2 - 0.05, 0.65, 0); shell.add(dadoR);
  const rail = S.box(W, 0.1, 0.16, 0x3b2b1f, { shadow: false }); rail.position.set(0, 1.32, -D / 2 + 0.08); shell.add(rail);
  const cornice = S.box(W, 0.16, 0.16, 0xf1ead8, { shadow: false }); cornice.position.set(0, H - 0.08, -D / 2 + 0.08); shell.add(cornice);
  const win = S.box(2.6, 1.8, 0.1, 0x9fd0ff, { shadow: false }); win.position.set(-3.2, 3.3, -D / 2 + 0.05); shell.add(win);
  const wframe = S.box(2.9, 2.1, 0.06, 0xf1ead8, { shadow: false }); wframe.position.set(-3.2, 3.3, -D / 2 + 0.02); shell.add(wframe);
  const wbar = S.box(0.06, 1.8, 0.04, 0xf1ead8, { shadow: false }); wbar.position.set(-3.2, 3.3, -D / 2 + 0.11); shell.add(wbar);
  const wbar2 = S.box(2.6, 0.06, 0.04, 0xf1ead8, { shadow: false }); wbar2.position.set(-3.2, 3.3, -D / 2 + 0.11); shell.add(wbar2);
  const sunlight = new THREE.SpotLight(0xfff2d0, 60, 20, 0.6, 0.6, 1.2); sunlight.position.set(-3.2, 3.3, -D / 2 - 2); sunlight.target.position.set(-1.5, 0, 1); scene.add(sunlight); scene.add(sunlight.target);
  const lamp = new THREE.PointLight(0xffe2b0, 16, 16, 2); lamp.position.set(0, 4.5, 0); scene.add(lamp);
  const poster = S.label('ทางออก →', { height: 0.5, fontPx: 64, color: '#fff', bg: '#2f8f52', border: '#ffffff', font: '"Noto Sans Thai", Fredoka, sans-serif' });
  poster.position.set(3.0, 4.3, -D / 2 + 0.06); shell.add(poster);
  const clockFace = S.label('⏰', { height: 0.8, fontPx: 72, bg: '#fffdf6', border: '#2a2440' }); clockFace.position.set(0.4, 3.9, -D / 2 + 0.06); shell.add(clockFace);
  const map = S.emojiPlane('🗺️', 1.4); map.position.set(-0.9, 3.0, -D / 2 + 0.08); shell.add(map);
  const mapFrame = S.box(1.6, 1.6, 0.05, 0x3b2b1f, { shadow: false }); mapFrame.position.set(-0.9, 3.0, -D / 2 + 0.03); shell.add(mapFrame);

  const beacon = new THREE.Group(); beacon.position.set(0, H - 0.25, 0); scene.add(beacon);
  const beaconBase = S.cyl(0.25, 0.3, 0.2, 0x3a3348, 16); beacon.add(beaconBase);
  const beaconDome = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x661111 }));
  beaconDome.position.y = -0.1; beacon.add(beaconDome);
  const beaconLight = new THREE.SpotLight(0xff2020, 0, 14, 0.7, 0.5, 1.0); beaconLight.position.set(0, -0.2, 0); beacon.add(beaconLight);
  const beaconTarget = new THREE.Object3D(); beaconTarget.position.set(3, -5, 0); beacon.add(beaconTarget); beaconLight.target = beaconTarget;

  const doorGroup = new THREE.Group();
  doorGroup.position.set(4.4, 0, -D / 2 + 0.12);
  const doorFrame = S.box(2.4, 4.0, 0.2, 0x3b2b1f); doorFrame.position.set(5.4, 2.0, -D / 2 + 0.06); shell.add(doorFrame);
  const leaf = S.box(2.0, 3.7, 0.16, 0xb0703a); leaf.position.set(1.0, 1.85, 0); doorGroup.add(leaf);
  const panelA = S.box(1.5, 1.3, 0.04, 0x9a5f30, { shadow: false }); panelA.position.set(1.0, 2.7, 0.1); doorGroup.add(panelA);
  const panelB = S.box(1.5, 1.1, 0.04, 0x9a5f30, { shadow: false }); panelB.position.set(1.0, 0.75, 0.1); doorGroup.add(panelB);
  const knob = S.sphere(0.1, 0xf7d64a, 10); knob.position.set(1.8, 1.9, 0.14); doorGroup.add(knob);
  const keyholes = [];
  [1.4, 1.1, 0.8].forEach(y => {
    const k = S.box(0.2, 0.2, 0.05, 0x2a2440, { shadow: false }); k.position.set(1.0, y + 0.7, 0.13); doorGroup.add(k); keyholes.push(k);
  });
  shell.add(doorGroup);
  const beyond = S.plane(6, 6, 0xffffff); beyond.position.set(5.4, 2, -D / 2 - 0.3); shell.add(beyond);
  const beyondLight = new THREE.PointLight(0xffffff, 0, 8, 1.5); beyondLight.position.set(5.4, 2, -D / 2 - 1); scene.add(beyondLight);
  const doorHit = new THREE.Mesh(new THREE.BoxGeometry(2.4, 4.0, 0.6), new THREE.MeshBasicMaterial({ visible: false }));
  doorHit.position.set(5.4, 2.0, -D / 2 + 0.3); doorHit.userData.pick = 'door'; doorHit.userData.glow = false; scene.add(doorHit); S.pickables.push(doorHit);

  const safe = new THREE.Group(); safe.position.set(-5.6, 0, -2.6);
  [[1.3, 1.5, 0.1, 0, 0.75, -0.55], [0.1, 1.5, 1.2, -0.6, 0.75, 0], [0.1, 1.5, 1.2, 0.6, 0.75, 0], [1.3, 0.1, 1.2, 0, 1.45, 0], [1.3, 0.1, 1.2, 0, 0.05, 0]].forEach(([w, hh, d, x, y, z]) => { const part = S.box(w, hh, d, 0x4a4f63); part.position.set(x, y, z); safe.add(part); });
  const sInside = S.box(1.1, 1.3, 0.05, 0x2a2e3e, { shadow: false }); sInside.position.set(0, 0.75, -0.49); safe.add(sInside);
  const safeLight = new THREE.PointLight(0xffe9a0, 0, 2.5, 2); safeLight.position.set(0, 1.1, 0.2); safe.add(safeLight);
  [[1.36, 0.1, 0, 1.5], [1.36, 0.1, 0, 0.0], [0.1, 1.56, -0.63, 0.75], [0.1, 1.56, 0.63, 0.75]].forEach(([w, hh, x, y]) => { const strip = S.box(w, hh, 0.08, 0x3a3f52); strip.position.set(x, y, 0.6); safe.add(strip); });
  const sdoorPivot = new THREE.Group(); sdoorPivot.position.set(-0.6, 0.75, 0.64); safe.add(sdoorPivot);
  const sdoor = S.box(1.16, 1.34, 0.1, 0x5c6280); sdoor.position.set(0.6, 0, 0.05); sdoorPivot.add(sdoor);
  const sInner = S.box(0.9, 1.0, 0.04, 0x6b7190, { shadow: false }); sInner.position.set(0.6, 0, 0.11); sdoorPivot.add(sInner);
  const dial = S.cyl(0.18, 0.18, 0.08, 0xf7d64a, 16); dial.rotation.x = Math.PI / 2; dial.position.set(0.82, -0.1, 0.14); sdoorPivot.add(dial);
  const handle = S.box(0.08, 0.5, 0.08, 0xf7d64a); handle.position.set(1.0, 0, 0.16); sdoorPivot.add(handle);
  const sdisplay = S.label('• • •', { height: 0.22, fontPx: 48, color: '#7cf29a', bg: '#1b1b2b', border: '#111' }); sdisplay.position.set(0.45, 0.42, 0.14); sdoorPivot.add(sdisplay);
  const gold = new THREE.Group(); gold.visible = false; safe.add(gold);
  [[-0.3, 0.17], [0.0, 0.17], [0.3, 0.17], [-0.15, 0.31], [0.15, 0.31], [0, 0.45]].forEach(([x, y]) => { const bar = S.box(0.26, 0.14, 0.5, 0xf7d64a); bar.position.set(x, y, 0.0); gold.add(bar); });
  const pearl = S.sphere(0.12, 0xef6fa0, 12); pearl.position.set(-0.35, 0.95, 0.1); gold.add(pearl);
  const gem = S.sphere(0.14, 0x7cc6ff, 10); gem.position.set(0.3, 0.95, 0.1); gold.add(gem);
  safe.userData.pick = 'safe'; scene.add(safe); S.pickables.push(safe);

  const chest = new THREE.Group(); chest.position.set(-3.6, 0, 2.4);
  const cbody = S.box(1.5, 0.8, 1.0, 0x8d5f33); cbody.position.y = 0.4; chest.add(cbody);
  [[-0.55], [0.55]].forEach(([x]) => { const band = S.box(0.12, 0.84, 1.04, 0x3a3348, { shadow: false }); band.position.set(x, 0.4, 0); chest.add(band); });
  const lidPivot = new THREE.Group(); lidPivot.position.set(0, 0.8, -0.5); chest.add(lidPivot);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.5, 16, 1, false, 0, Math.PI), S.mat(0xa5703b));
  lid.rotation.z = Math.PI / 2; lid.rotation.y = Math.PI / 2; lid.position.set(0, 0, 0.5); lid.castShadow = true; lidPivot.add(lid);
  const lidCap = new THREE.Mesh(new THREE.CircleGeometry(0.5, 16, 0, Math.PI), S.mat(0x8d5f33)); lidCap.position.set(0.75, 0, 0.5); lidCap.rotation.y = Math.PI / 2; lidPivot.add(lidCap);
  const lidCap2 = lidCap.clone(); lidCap2.position.x = -0.75; lidCap2.rotation.y = -Math.PI / 2; lidPivot.add(lidCap2);
  [[-0.55], [0.55]].forEach(([x]) => { const band = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.12, 16, 1, false, 0, Math.PI), S.mat(0x3a3348)); band.rotation.z = Math.PI / 2; band.rotation.y = Math.PI / 2; band.position.set(x, 0, 0.5); lidPivot.add(band); });
  const lock = S.box(0.3, 0.42, 0.14, 0xf7d64a); lock.position.set(0, 0.62, 0.56); chest.add(lock);
  const shackle = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.04, 8, 16, Math.PI), S.mat(0x8a8a8a)); shackle.position.set(0, 0.84, 0.56); chest.add(shackle);
  const treasure = new THREE.Group(); treasure.visible = false; treasure.position.y = 0.8; chest.add(treasure);
  for (let i = 0; i < 9; i++) { const coin = S.cyl(0.12, 0.12, 0.04, 0xf7d64a, 12); coin.position.set((Math.random() - 0.5) * 1.1, Math.random() * 0.1, (Math.random() - 0.5) * 0.7); coin.rotation.x = Math.random(); treasure.add(coin); }
  chest.userData.pick = 'chest'; scene.add(chest); S.pickables.push(chest);

  const shadowFig = S.emojiSprite('👤', 1.7); shadowFig.material.opacity = 0.4; shadowFig.material.color.setHex(0x111111);
  shadowFig.position.set(5.4, 1.5, -D / 2 + 0.55); shadowFig.visible = false; scene.add(shadowFig);

  const furniture = new THREE.Group(); scene.add(furniture);
  const parts = {};
  const rings = {};
  const spots = {};
  const qmarks = {};
  let mixer = null, npc = null, doorOpen = false, hunting = false;
  (async () => {
    await preload([F + 'bookcaseClosed.glb', F + 'bookcaseOpen.glb', F + 'books.glb', F + 'desk.glb', F + 'chairDesk.glb', F + 'lampRoundTable.glb', F + 'rugRounded.glb', F + 'pottedPlant.glb', F + 'loungeChair.glb', F + 'sideTable.glb', F + 'radio.glb', F + 'lampSquareCeiling.glb', F + 'coatRackStanding.glb', F + 'plantSmall2.glb', 'characters/character-female-c.glb']);
    if (S.disposed) return;
    const K = (p, x, z, r, o) => S.put(furniture, F + p + '.glb', x, z, r || 0, Object.assign({ scale: FS }, o || {}));
    parts.shelf = await K('bookcaseOpen', -1.6, -4.1);
    await K('bookcaseClosed', -0.2, -4.1);
    await K('bookcaseClosed', 1.2, -4.1);
    for (const x of [-1.6, -0.2, 1.2]) {
      for (const y of [0.02, 0.8, 1.58]) {
        for (const dx of [-0.3, 0.3]) {
          const b = await instance(F + 'books.glb', { scale: FS * 0.8 });
          b.position.set(x + dx, y, -4.05); b.rotation.y = (Math.random() - 0.5) * 0.3;
          if (x === -1.6) { parts.shelf.attach(b); } else furniture.add(b);
        }
      }
    }
    parts.shelf.userData.pick = 'shelf'; S.pickables.push(parts.shelf);
    await K('desk', 1.0, 1.4, 180);
    await K('chairDesk', 1.0, 0.1, 0);
    spots.lamp = await K('lampRoundTable', 0.2, 1.6); spots.lamp.position.y += 1.15;
    const books = await K('books', 1.6, 1.3, 20); books.position.y += 1.15;
    await K('rugRounded', 0, 0.5);
    spots.plant = await K('pottedPlant', -6.0, 3.2);
    await K('plantSmall2', 6.0, -3.6);
    await K('loungeChair', 5.6, 1.6, -120);
    await K('sideTable', 4.6, 3.2);
    spots.radio = await K('radio', 4.6, 3.2); spots.radio.position.y += 0.8;
    spots.coat = await K('coatRackStanding', 6.2, -1.2);
    Object.keys(spots).forEach(id => {
      const o = spots[id];
      o.userData.pick = id; o.userData.disabled = !hunting; o.userData.glowColor = 0x6a5a10;
      S.pickables.push(o);
      const q = S.emojiSprite('❓', 0.75); q.position.copy(SPOT_AT[id]).add(new THREE.Vector3(0, 0.5, 0)); q.userData.baseY = q.position.y; q.visible = hunting; scene.add(q); qmarks[id] = q;
    });
    const ceilLamp = await K('lampSquareCeiling', -2.6, 0.2, 0, { y: H - 0.3 });
    npc = await S.put(furniture, 'characters/character-female-c.glb', 3.4, 2.6, -150, { size: 1.75 });
    npc.userData.glow = false;
    mixer = new THREE.AnimationMixer(npc);
    const idle = npc.userData.animations.find(a => a.name === 'idle'); if (idle) mixer.clipAction(idle).play();
    [['safe', -5.6, -2.6], ['shelf', -1.6, -3.3], ['chest', -3.6, 2.4], ['door', 5.4, -3.7]].forEach(([id, x, z]) => {
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.7, 0.95, 32), new THREE.MeshBasicMaterial({ color: 0xf7d64a, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.02, z); scene.add(ring); rings[id] = ring;
      const icon = S.emojiSprite({ safe: '🔐', shelf: '📚', chest: '🧰', door: '🚪' }[id], 0.8);
      icon.position.set(x, id === 'door' ? 4.4 : id === 'shelf' ? 3.1 : 2.0, z); scene.add(icon); ring.userData.icon = icon;
    });
    S.fade(false, 700);
    S.intro({ x: 0, y: 9, z: 18 }, HOME.pos, HOME.target, 2000);
    S.title('🔐 Escape Room', 'Three keys, one door · every wrong answer feeds the alarm');
  })();

  let alarmT = 0, alarmLevel = 0;
  S.onFrame((dt, t) => {
    if (mixer) mixer.update(dt);
    Object.values(rings).forEach((r, i) => {
      r.material.opacity = r.userData.off ? 0 : 0.35 + Math.sin(t * 3 + i) * 0.2;
      if (r.userData.icon) { r.userData.icon.visible = !r.userData.off; r.userData.icon.position.y += Math.sin(t * 2.5 + i) * 0.003; }
    });
    Object.values(qmarks).forEach((q, i) => { if (q.visible) q.position.y = q.userData.baseY + Math.sin(t * 3 + i) * 0.1; });
    if (shadowFig.visible) shadowFig.position.x = 5.4 + Math.sin(t * 1.5) * 0.15;
    const hot = alarmLevel >= 3 || alarmT > 0;
    beacon.rotation.y += dt * (hot ? 6 : 0.5);
    beaconLight.intensity = alarmT > 0 ? 90 : alarmLevel >= 3 ? 18 + alarmLevel * 6 : 0;
    beaconDome.material.color.setHex(hot ? 0xff3030 : 0x661111);
    if (alarmT > 0) { alarmT -= dt; lamp.color.setHex(Math.floor(alarmT * 8) % 2 ? 0xff3b3b : 0xffe2b0); if (alarmT <= 0) lamp.color.setHex(0xffe2b0); }
  });

  S.onPick(id => {
    if (!id) return;
    if (spots[id]) { hooks.onSpot && hooks.onSpot(id); return; }
    hooks.onHotspot && hooks.onHotspot(id);
  });
  S.onHover(obj => {
    Object.keys(rings).forEach(id => { rings[id].scale.setScalar(obj && obj.userData.pick === id ? 1.25 : 1); });
  });

  function focus(id) {
    const v = VIEWS[id] || HOME;
    S.moveCamera({ x: v.pos.x, y: v.pos.y, z: v.pos.z }, { x: v.target.x, y: v.target.y, z: v.target.z }, 900);
  }

  function alarm() {
    alarmT = 2.6;
    S.shake(0.3, 900);
    S.banner('🚨 LOCKDOWN −15');
    S.floatText('−15 ล็อกดาวน์!', new THREE.Vector3(0, 3.2, 0), { bg: '#c0392b', height: 1.1, ms: 2000 });
  }

  function setAlarm(level) { alarmLevel = level; }

  function huntMode(on) {
    hunting = !!on;
    Object.keys(spots).forEach(id => { spots[id].userData.disabled = !hunting; if (qmarks[id]) qmarks[id].visible = hunting; });
    if (hunting) { focus('hunt'); S.banner('🔑 The chest needs a key — search the room!', 'good'); }
  }

  function keyFound(id) {
    const at = SPOT_AT[id] || new THREE.Vector3(0, 1.5, 0);
    const key = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.05, 8, 16), S.mat(0xf7d64a)); key.add(ring);
    const shaft = S.box(0.5, 0.08, 0.08, 0xf7d64a); shaft.position.set(0.4, 0, 0); key.add(shaft);
    const tooth = S.box(0.08, 0.16, 0.08, 0xf7d64a); tooth.position.set(0.55, -0.1, 0); key.add(tooth);
    key.position.copy(at); scene.add(key);
    S.burst(at, { color: 0xf7d64a, n: 26, speed: 3 });
    S.floatText('+10 🔑 เจอแล้ว!', at.clone().add(new THREE.Vector3(0, 0.8, 0)), { bg: '#2f8f52', height: 0.9, ms: 1600 });
    S.tween(key.rotation, { y: Math.PI * 4 }, { ms: 1500 });
    S.tween(key.position, { y: at.y + 1.1 }, { ms: 500, ease: ease.outCubic, onDone: () => {
      S.tween(key.position, { x: -3.6, y: 1.3, z: 2.4 }, { ms: 900, ease: ease.inOutCubic, onDone: () => {
        scene.remove(key);
        S.burst(new THREE.Vector3(-3.6, 1.2, 2.4), { color: 0xf7d64a, n: 14, speed: 2 });
        lock.material.color.setHex(0x7cf29a);
      } });
    } });
    huntMode(false);
    setTimeout(() => { if (!S.disposed) focus('chest'); }, 700);
  }

  function spotWrong(id) {
    const o = spots[id], at = SPOT_AT[id];
    if (at) { S.floatText('−3 ไม่มี', at, { bg: '#c0392b', height: 0.7, ms: 1000 }); S.burst(at, { color: 0xb5a07a, n: 10, speed: 1.5, size: 0.06 }); }
    if (o) {
      const r0 = o.rotation.y;
      S.tween(o.rotation, { y: r0 + 0.25 }, { ms: 80, onDone: () => S.tween(o.rotation, { y: r0 - 0.25 }, { ms: 80, onDone: () => S.tween(o.rotation, { y: r0 }, { ms: 100 }) }) });
    }
    S.shake(0.06, 200);
  }

  function rattle(amount, ms) {
    if (doorOpen) return;
    S.tween(doorGroup.rotation, { y: -amount }, { ms: ms, onDone: () => { if (!doorOpen) S.tween(doorGroup.rotation, { y: 0 }, { ms: ms * 1.4 }); } });
  }

  function knock(on) {
    if (on) {
      if (doorOpen) return;
      S.banner('🤫 Someone is at the door — freeze!');
      lamp.intensity = 5;
      shadowFig.visible = true;
      [0, 220, 440, 1500, 1720].forEach(ms => setTimeout(() => { if (!S.disposed) rattle(0.03, 80); }, ms));
      if (npc && mixer) { const no = npc.userData.animations.find(a => a.name === 'emote-no'); if (no) mixer.clipAction(no).reset().setLoop(THREE.LoopOnce).play(); }
    } else {
      lamp.intensity = 16;
      shadowFig.visible = false;
    }
  }

  function heard() {
    S.shake(0.12, 300);
    LW.sound.thud();
    S.floatText('−3 ได้ยินแล้ว!', new THREE.Vector3(5.4, 3.4, -3.6), { bg: '#c0392b', height: 0.8, ms: 1200 });
    rattle(0.07, 70);
  }

  function miss(id) {
    const at = { safe: new THREE.Vector3(-5.6, 1.9, -2.6), shelf: new THREE.Vector3(-1.6, 2.9, -3.8), chest: new THREE.Vector3(-3.6, 1.4, 2.4), door: new THREE.Vector3(5.4, 3.6, -4.0) }[id];
    if (at) { S.floatText('−3', at, { bg: '#c0392b', height: 0.7, ms: 1000 }); S.burst(at, { color: 0xe8453c, n: 8, speed: 1.6, size: 0.06 }); }
    S.shake(0.06, 200);
  }

  function unlock(id) {
    if (rings[id]) rings[id].userData.off = true;
    LW.sound.unlock();
    if (id === 'safe') {
      sdisplay.material.map = S.label('OPEN', { height: 0.22, fontPx: 48, color: '#7cf29a', bg: '#1b1b2b', border: '#111' }).material.map;
      gold.visible = true;
      safeLight.intensity = 6;
      S.tween(sdoorPivot.rotation, { y: -2.0 }, { ms: 900, ease: ease.outBack });
      S.burst(new THREE.Vector3(-5.6, 1.2, -2.0), { color: 0xf7d64a, n: 26, speed: 3 });
      S.floatText('+25 🔑', new THREE.Vector3(-5.6, 2.2, -2.6), { bg: '#2f8f52', height: 0.9 });
      keyholes[0].material.color.setHex(0x7cf29a);
    } else if (id === 'shelf' && parts.shelf) {
      S.tween(parts.shelf.position, { x: parts.shelf.position.x - 1.3 }, { ms: 1100, ease: ease.inOutCubic });
      S.burst(new THREE.Vector3(-1.6, 1.6, -3.4), { color: 0xf7d64a, n: 26, speed: 3 });
      S.floatText('+25 🔑', new THREE.Vector3(-1.6, 3.2, -3.6), { bg: '#2f8f52', height: 0.9 });
      keyholes[1].material.color.setHex(0x7cf29a);
    } else if (id === 'chest') {
      S.tween(shackle.position, { y: shackle.position.y + 0.25 }, { ms: 300, onDone: () => {
        S.tween(lock.position, { y: -1 }, { ms: 500, ease: ease.inQuad });
        S.tween(shackle.position, { y: -1 }, { ms: 500, ease: ease.inQuad });
        S.tween(lidPivot.rotation, { x: -1.9 }, { ms: 800, ease: ease.outBack, onDone: () => { treasure.visible = true; } });
      } });
      S.burst(new THREE.Vector3(-3.6, 1.2, 2.4), { color: 0xf7d64a, n: 26, speed: 3 });
      S.floatText('+25 🔑', new THREE.Vector3(-3.6, 1.8, 2.4), { bg: '#2f8f52', height: 0.9 });
      keyholes[2].material.color.setHex(0x7cf29a);
    } else if (id === 'door') {
      doorOpen = true;
      knock(false);
      beyondLight.intensity = 40;
      S.tween(doorGroup.rotation, { y: -1.9 }, { ms: 1200, ease: ease.inOutCubic });
      S.burst(new THREE.Vector3(5.4, 2.4, -3.6), { color: 0xffffff, n: 30, speed: 3, gravity: 1 });
      S.floatText('+25 ESCAPED! หนีได้แล้ว', new THREE.Vector3(5.4, 4.4, -3.5), { bg: '#2f8f52', height: 1.0, ms: 2200 });
      S.banner('🚪 You escaped!', 'good');
      if (npc && mixer) { const yes = npc.userData.animations.find(a => a.name === 'emote-yes'); if (yes) { mixer.clipAction(yes).reset().setLoop(THREE.LoopOnce).play(); } }
      setTimeout(() => { if (!S.disposed) S.moveCamera({ x: 5.4, y: 2.0, z: -1.6 }, { x: 5.4, y: 2.0, z: -9 }, 1800); }, 700);
      setTimeout(() => { if (!S.disposed) S.fade(true, 900); }, 1900);
    }
    setTimeout(() => { if (!S.disposed && id !== 'door') focus('home'); }, 1400);
  }

  return { focus, unlock, alarm, setAlarm, miss, huntMode, keyFound, spotWrong, knock, heard, stage: S, dispose: S.dispose };
});
