import { createStage, ease, instance, preload } from './engine.js';
import * as THREE from 'three';

const LW = window.LW;
const F = 'furniture/';
const FS = 3.0;
const K = (path, x, z, rot, extra) => [F + path + '.glb', x, z, rot || 0, Object.assign({ scale: FS }, extra || {})];

const ROOMS = [
  {
    name: 'Living room', wall: 0x8c7f99, floor: 0x6e5a48, ceiling: 0x3a3350,
    furniture: [
      K('loungeSofa', -3.6, 1.0),
      K('tableCoffee', -3.6, -0.7),
      K('bookcaseOpen', -5.6, -4.2, 0, { books: true }),
      K('bookcaseOpen', -4.6, -4.2, 0, { books: true }),
      K('cabinetTelevision', 0.3, -4.2),
      K('televisionModern', 0.3, -4.2, 0, { top: true }),
      K('lampRoundFloor', 6.2, -3.9),
      K('pottedPlant', -6.3, 2.9),
      K('desk', 4.4, -3.8),
      K('chairDesk', 4.4, -2.5, 180),
      K('computerScreen', 4.4, -4.0, 0, { top: true }),
      K('computerKeyboard', 4.4, -3.5, 0, { top: true }),
      K('sideTable', 2.4, 1.8),
      K('loungeChair', 4.9, 1.9, -40),
      K('rugRectangle', -3.4, 0.3),
      K('lampSquareCeiling', 0, 0, 0, { y: 4.9 })
    ],
    spots: [[-5.6, -4.1], [-4.6, -4.1], [-4.1, -0.7], [-3.0, -0.7], [-4.6, 1.0], [-2.6, 1.0],
            [2.4, 1.8], [1.1, -4.1], [-0.5, -4.1], [3.7, -4.0], [5.1, -3.8], [1.6, 2.8], [0.2, 0.9], [-1.6, 3.0], [5.0, -0.2], [-6.3, 2.9], [2.8, -2.2], [-1.2, -2.0]],
    patrol: [[-1.2, 2.8], [2.0, -1.0], [-1.0, -2.6], [-5.8, -1.6]]
  },
  {
    name: 'Kitchen', wall: 0xa9b7a3, floor: 0x8f8f93, ceiling: 0x4a524a,
    furniture: [
      K('kitchenCabinet', -6.1, -3.8),
      K('kitchenSink', -4.8, -3.8),
      K('kitchenCabinet', -3.5, -3.8),
      K('kitchenStove', -2.2, -3.8),
      K('kitchenCabinetDrawer', -0.9, -3.8),
      K('kitchenCabinetUpper', -6.1, -4.1, 0, { y: 2.0 }),
      K('kitchenCabinetUpperDouble', -4.15, -4.1, 0, { y: 2.0 }),
      K('hoodLarge', -2.2, -4.1, 0, { y: 2.0 }),
      K('kitchenCabinetUpper', -0.9, -4.1, 0, { y: 2.0 }),
      K('kitchenFridgeLarge', 1.3, -3.8),
      K('kitchenBar', 3.6, -2.8, 90),
      K('kitchenBar', 3.6, -1.5, 90),
      K('kitchenBarEnd', 3.6, -0.2, 90),
      K('stoolBar', 4.9, -2.8),
      K('stoolBar', 4.9, -1.5),
      K('stoolBar', 4.9, -0.2),
      K('kitchenMicrowave', 3.6, -2.8, 90, { top: true }),
      K('kitchenCoffeeMachine', -3.5, -3.9, 0, { top: true }),
      K('tableCross', -3.2, 1.6),
      K('chair', -4.2, 1.6, 90),
      K('chair', -2.2, 1.6, -90),
      K('trashcan', 5.9, -3.9),
      K('pottedPlant', 6.2, 2.9),
      K('rugDoormat', 0.4, 3.6),
      K('lampSquareCeiling', 0, 0, 0, { y: 4.9 })
    ],
    spots: [[-3.5, -3.8], [-0.9, -3.8], [-6.1, -3.8], [3.6, -1.5], [3.6, -0.2], [-3.7, 1.6], [-2.7, 1.6], [-0.6, 2.8], [1.6, 2.4],
            [1.0, -2.4], [-5.6, 1.0], [5.6, 1.6], [-1.6, -1.2], [3.0, 2.8], [-5.2, 3.0], [1.4, 0.4], [6.0, -2.2], [-0.2, -0.4]],
    patrol: [[1.2, 1.6], [-1.0, -2.4], [-5.6, -0.8], [-0.6, 3.0]]
  },
  {
    name: 'Bedroom', wall: 0x7d6f8f, floor: 0x5c4a3d, ceiling: 0x352c45,
    furniture: [
      K('bedDouble', -3.6, -2.0),
      K('cabinetBedDrawer', -6.3, -3.8),
      K('cabinetBedDrawer', -0.9, -3.8),
      K('lampRoundTable', -6.3, -3.8, 0, { top: true }),
      K('bookcaseClosed', 1.6, -4.2, 0, { books: true }),
      K('bookcaseClosedDoors', 5.8, -4.2),
      K('desk', 3.6, -3.8),
      K('chairDesk', 3.6, -2.5, 180),
      K('laptop', 3.5, -3.9, 15, { top: true }),
      K('rugRound', 0.4, 1.0),
      K('coatRackStanding', 6.3, 1.8),
      K('cardboardBoxClosed', -5.8, 2.2, 20),
      K('cardboardBoxOpen', -5.0, 3.0, -15),
      K('loungeChairRelax', 4.6, 2.2, -140),
      K('benchCushionLow', -3.6, 0.6),
      K('lampSquareCeiling', 0, 0, 0, { y: 4.9 })
    ],
    spots: [[-0.9, -3.8], [-4.4, -1.6], [-2.8, -1.6], [-3.6, -3.0], [1.6, -4.1], [4.3, -3.8], [-4.4, 0.6], [-2.8, 0.6],
            [-5.8, 2.2], [0.4, 1.0], [2.2, 0.6], [-1.6, 2.8], [1.4, 2.9], [6.0, 0.0], [-0.8, -1.8], [3.0, 2.6], [0.6, -2.8], [5.0, 0.2]],
    patrol: [[0.8, 2.9], [2.2, -1.6], [-1.0, -0.8], [-5.4, 1.4]]
  }
];

const W = 14, D = 9, H = 5.2;
const TORCH_POWER = 340;
const CAM = { pos: new THREE.Vector3(0, 5.4, 11.6), target: new THREE.Vector3(0, 1.6, -0.6) };

LW.hs3d.register('heist', function (host, hooks) {
  const S = createStage(host, { sun: 0, hemi: 0.05, fov: 40, aspect: 16 / 8.5, shadowBounds: 10, reserve: 250, fullReserve: 175 });
  if (!S) return null;
  const { scene, camera } = S;

  camera.position.copy(CAM.pos);
  S.lookAt(CAM.target.x, CAM.target.y, CAM.target.z);
  S.fade(true, 0);

  const shell = new THREE.Group();
  scene.add(shell);
  const floor = S.plane(W, D, 0x6e5a48); floor.rotation.x = -Math.PI / 2; shell.add(floor);
  const ceiling = S.plane(W, D, 0x3a3350); ceiling.rotation.x = Math.PI / 2; ceiling.position.y = H; shell.add(ceiling);
  const back = S.plane(W, H, 0x8c7f99); back.position.set(0, H / 2, -D / 2); shell.add(back);
  const left = S.plane(D, H, 0x7f7291); left.rotation.y = Math.PI / 2; left.position.set(-W / 2, H / 2, 0); shell.add(left);
  const right = S.plane(D, H, 0x7f7291); right.rotation.y = -Math.PI / 2; right.position.set(W / 2, H / 2, 0); shell.add(right);
  const skirting = S.box(W, 0.18, 0.08, 0x3a3348, { shadow: false }); skirting.position.set(0, 0.09, -D / 2 + 0.04); shell.add(skirting);
  const skirtL = S.box(0.08, 0.18, D, 0x3a3348, { shadow: false }); skirtL.position.set(-W / 2 + 0.04, 0.09, 0); shell.add(skirtL);
  const skirtR = S.box(0.08, 0.18, D, 0x3a3348, { shadow: false }); skirtR.position.set(W / 2 - 0.04, 0.09, 0); shell.add(skirtR);
  const cornice = S.box(W, 0.14, 0.14, 0xd8d0e0, { shadow: false }); cornice.position.set(0, H - 0.07, -D / 2 + 0.07); shell.add(cornice);
  const win = S.box(3.0, 2.0, 0.1, 0x1b2a4a, { shadow: false }); win.position.set(0, 3.5, -D / 2 + 0.05); shell.add(win);
  const frame = S.box(3.3, 2.3, 0.06, 0xf1ead8, { shadow: false }); frame.position.set(0, 3.5, -D / 2 + 0.02); shell.add(frame);
  const bar1 = S.box(3.0, 0.06, 0.04, 0xf1ead8, { shadow: false }); bar1.position.set(0, 3.5, -D / 2 + 0.11); shell.add(bar1);
  const bar2 = S.box(0.06, 2.0, 0.04, 0xf1ead8, { shadow: false }); bar2.position.set(0, 3.5, -D / 2 + 0.11); shell.add(bar2);
  const moon = new THREE.Mesh(new THREE.CircleGeometry(0.38, 24), new THREE.MeshBasicMaterial({ color: 0xf7f2d0 }));
  moon.position.set(0.8, 4.0, -D / 2 + 0.11); shell.add(moon);
  const moonLight = new THREE.PointLight(0x8fb6ff, 7, 13, 2); moonLight.position.set(0, 3.5, -D / 2 + 0.8); scene.add(moonLight);
  const doorL = S.box(0.1, 3.3, 1.6, 0x5a4030, { shadow: false }); doorL.position.set(W / 2 - 0.05, 1.65, 2.6); shell.add(doorL);
  const doorKnob = S.sphere(0.07, 0xf7d64a, 8); doorKnob.position.set(W / 2 - 0.14, 1.6, 2.0); shell.add(doorKnob);

  const poster = S.label('ห้ามเข้า', { height: 0.55, fontPx: 72, color: '#fff', bg: '#c8102e', border: '#ffffff', font: '"Noto Sans Thai", Fredoka, sans-serif' });
  poster.position.set(-4.4, 3.7, -D / 2 + 0.06); shell.add(poster);
  const poster2 = S.label('🐘 สวัสดี', { height: 0.5, fontPx: 64, color: '#2a2440', bg: '#f7d64a', border: '#2a2440', font: '"Noto Sans Thai", Fredoka, sans-serif' });
  poster2.position.set(4.4, 3.7, -D / 2 + 0.06); shell.add(poster2);
  const elephant = S.emojiPlane('🐘', 1.1); elephant.position.set(-3.1, 2.4, -D / 2 + 0.08); shell.add(elephant);
  const eframe = S.box(1.3, 1.3, 0.05, 0xf1ead8, { shadow: false }); eframe.position.set(-3.1, 2.4, -D / 2 + 0.03); shell.add(eframe);

  const torch = new THREE.SpotLight(0xfff1c8, TORCH_POWER, 30, 0.22, 0.35, 1.6);
  torch.position.set(0, 5.6, 9.5);
  torch.castShadow = true;
  torch.shadow.mapSize.set(1024, 1024);
  torch.shadow.bias = -0.0005;
  scene.add(torch); scene.add(torch.target);
  const aim = new THREE.Vector3(0, 0, 3.8);
  torch.target.position.copy(aim);
  let touched = false;
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let solids = [];
  S.canvas.addEventListener('pointermove', ev => {
    const r = S.canvas.getBoundingClientRect();
    ndc.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(solids, true)[0];
    if (hit) { aim.copy(hit.point); touched = true; }
  });
  let blackout = 0;
  S.onFrame(dt => {
    torch.target.position.lerp(aim, Math.min(1, dt * 9));
    if (blackout > 0) { blackout -= dt; torch.intensity = blackout > 0 ? 0 : TORCH_POWER; }
  });

  const furniture = new THREE.Group(); scene.add(furniture);
  const objGroup = new THREE.Group(); scene.add(objGroup);
  const byEn = {};
  let roomIdx = -1;
  let building = Promise.resolve();
  let started = false;

  function clearGroup(g) {
    while (g.children.length) {
      const c = g.children.pop();
      const i = S.pickables.indexOf(c); if (i !== -1) S.pickables.splice(i, 1);
    }
  }

  function refreshSolids() {
    solids = [];
    shell.traverse(o => { if (o.isMesh) solids.push(o); });
    furniture.traverse(o => { if (o.isMesh) solids.push(o); });
  }

  const down = new THREE.Raycaster();
  function surfaceY(x, z) {
    down.set(new THREE.Vector3(x, H - 0.3, z), new THREE.Vector3(0, -1, 0));
    const hit = down.intersectObjects(solids, true).find(hh => hh.object !== ceiling);
    return hit ? hit.point.y : 0;
  }

  async function buildRoom(i) {
    const R = ROOMS[i % ROOMS.length];
    roomIdx = i;
    clearGroup(objGroup); clearGroup(furniture);
    Object.keys(byEn).forEach(k => delete byEn[k]);
    floor.material.color.setHex(R.floor);
    ceiling.material.color.setHex(R.ceiling);
    back.material.color.setHex(R.wall);
    left.material.color.setHex(R.wall).multiplyScalar(0.9);
    right.material.color.setHex(R.wall).multiplyScalar(0.9);
    await preload(R.furniture.map(f => f[0]).concat([F + 'books.glb']));
    if (S.disposed) return;
    const base = R.furniture.filter(f => !f[4].top), tops = R.furniture.filter(f => f[4].top);
    for (const [path, x, z, rot, o] of base) {
      await S.put(furniture, path, x, z, rot, o);
      if (o.books) {
        for (const y of [0.02, 0.8, 1.58]) {
          const b = await instance(F + 'books.glb', { scale: FS * 0.85 });
          b.position.set(x + (Math.random() - 0.5) * 0.3, y, z + 0.1); b.rotation.y = (Math.random() - 0.5) * 0.4; furniture.add(b);
        }
      }
    }
    refreshSolids();
    for (const [path, x, z, rot, o] of tops) {
      const obj = await S.put(furniture, path, x, z, rot, o);
      obj.position.y += surfaceY(x, z);
    }
    refreshSolids();
    return R;
  }

  const eye = new THREE.Raycaster();
  function usableSpots(R) {
    const ok = R.spots.filter(([x, z]) => {
      const p = new THREE.Vector3(x, surfaceY(x, z) + 0.35, z);
      const dir = p.clone().sub(camera.position);
      const dist = dir.length();
      eye.set(camera.position, dir.normalize());
      const hit = eye.intersectObjects(solids, true)[0];
      return !hit || hit.distance > dist - 0.25;
    });
    const raised = shuffle(ok.filter(([x, z]) => surfaceY(x, z) > 0.3));
    const floorSpots = shuffle(ok.filter(([x, z]) => surfaceY(x, z) <= 0.3));
    return raised.concat(floorSpots);
  }

  async function placeObjects(list) {
    const R = ROOMS[roomIdx % ROOMS.length];
    let usable = usableSpots(R);
    if (usable.length < list.length) usable = shuffle(R.spots.slice());
    const spots = usable.slice(0, list.length);
    await preload(list.filter(w => LW.MODELS[w.en]).map(w => LW.MODELS[w.en]));
    if (S.disposed) return;
    for (let i = 0; i < list.length; i++) {
      const w = list[i];
      const [x, z] = spots[i];
      const g = new THREE.Group();
      let visual;
      if (w.gem) {
        visual = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), new THREE.MeshLambertMaterial({ color: 0x7cc6ff, emissive: 0x1f5c99, emissiveIntensity: 0.9, transparent: true, opacity: 0 }));
        visual.position.y = 0.42;
        visual.castShadow = true;
        visual.userData.spin = true;
      } else if (LW.MODELS[w.en]) {
        visual = await instance(LW.MODELS[w.en], { size: sizeFor(w.en) });
        visual.traverse(o => { if (o.isMesh) { o.material.transparent = true; o.material.opacity = 0; } });
      } else {
        visual = S.emojiPlane(w.emoji, 0.8);
        visual.position.y = 0.45;
        visual.material.transparent = true; visual.material.alphaTest = 0; visual.material.opacity = 0;
        visual.userData.billboard = true;
      }
      visual.visible = false;
      g.add(visual);
      const hit = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.0, 0.9), new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.y = 0.45; g.add(hit);
      g.position.set(x, surfaceY(x, z) + 0.01, z);
      g.rotation.y = Math.random() * Math.PI * 2;
      g.userData.pick = w.en;
      g.userData.visual = visual;
      g.userData.fade = 0;
      g.userData.glowColor = w.gem ? 0x3377aa : 0x554a22;
      objGroup.add(g);
      S.pickables.push(g);
      byEn[w.en] = g;
    }
  }

  function sizeFor(en) {
    const p = LW.MODELS[en] || '';
    if (/^food\//.test(p)) return 0.55;
    if (/^characters\//.test(p)) return 0.9;
    if (/^cars\//.test(p)) return 0.9;
    if (/^(commercial|suburban)\//.test(p)) return 0.9;
    if (/^furniture\//.test(p)) return 0.5;
    return 0.6;
  }

  function setRoom(index, list) {
    const R = ROOMS[index % ROOMS.length];
    building = building.then(async () => {
      if (started) await S.fade(true, 450);
      await buildRoom(index);
      await placeObjects(list);
      if (S.disposed) return;
      startGuard(R);
      if (!started) {
        started = true;
        S.fade(false, 700);
        S.intro({ x: 0, y: 9.5, z: 17 }, CAM.pos, CAM.target, 2000);
      } else {
        S.fade(false, 500);
      }
      S.title('🔦 ' + R.name, 'Room ' + (index + 1) + ' · 💎 a gem is hidden here' + (index ? ' · the guard is faster now' : ' · mind the guard'));
    });
    return building;
  }

  const beamDir = new THREE.Vector3();
  const toObj = new THREE.Vector3();
  S.onFrame((dt, t) => {
    beamDir.copy(torch.target.position).sub(torch.position).normalize();
    objGroup.children.forEach(g => {
      const v = g.userData.visual;
      if (!v) return;
      if (v.userData.billboard) v.lookAt(camera.position.x, g.position.y + 0.45, camera.position.z);
      if (g.userData.gone) return;
      if (v.userData.spin) {
        v.rotation.y += dt * 2.2;
        v.position.y = 0.42 + Math.sin(t * 3) * 0.08;
        if (g.userData.fade > 0.3 && Math.random() < dt * 4) S.burst(g.position.clone().add(new THREE.Vector3(0, 0.7, 0)), { color: 0xbfe6ff, n: 2, speed: 0.6, size: 0.05, gravity: -0.4, life: 0.5 });
      }
      toObj.copy(g.position).setY(g.position.y + 0.4).sub(torch.position).normalize();
      const ang = Math.acos(Math.min(1, Math.max(-1, beamDir.dot(toObj))));
      const edge = torch.angle, core = torch.angle * 0.6;
      let k = ang <= core ? 1 : ang >= edge ? 0 : 1 - (ang - core) / (edge - core);
      if (torch.intensity === 0) k = 0;
      const target = k * k;
      g.userData.fade += (target - g.userData.fade) * Math.min(1, dt * 14);
      const o = g.userData.fade;
      v.visible = o > 0.02;
      v.traverse(m => { if (m.isMesh && m.material) m.material.opacity = o; });
      g.userData.disabled = o < 0.35;
    });
  });

  S.onPick(id => { if (id) hooks.onObject && hooks.onObject(id); });
  S.onHover(obj => {
    objGroup.children.forEach(g => { if (!g.userData.gone) g.scale.setScalar(g === obj ? 1.12 : 1); });
  });

  function pop(text, at, bg) {
    S.floatText(text, at.clone().add(new THREE.Vector3(0, 0.9, 0)), { bg, height: 0.75 });
  }

  function collect(en, text) {
    const g = byEn[en];
    if (!g) return;
    const gem = !!(g.userData.visual && g.userData.visual.userData.spin);
    pop(text || '+10 เก่งมาก!', g.position, gem ? '#1f6fb5' : '#2f8f52');
    S.burst(g.position.clone().add(new THREE.Vector3(0, 0.5, 0)), { color: gem ? 0x7cc6ff : 0xf7d64a, n: gem ? 40 : 22, speed: gem ? 4 : 3 });
    if (gem) S.banner('💎 Bonus gem +15', 'good');
    g.userData.gone = true; g.userData.disabled = true;
    const target = camera.position.clone().add(new THREE.Vector3(0, -1.5, -3));
    S.tween(g.position, { x: target.x, y: target.y, z: target.z }, { ms: 700, ease: ease.inOutCubic });
    S.tween(g.rotation, { y: g.rotation.y + Math.PI * 2 }, { ms: 700 });
    S.tween(g.scale, { x: 0.05, y: 0.05, z: 0.05 }, { ms: 700, delay: 250, ease: ease.inQuad, onDone: () => {
      objGroup.remove(g);
      const i = S.pickables.indexOf(g); if (i !== -1) S.pickables.splice(i, 1);
    } });
    flash(0x7cf29a);
  }

  function reject(en) {
    const g = byEn[en];
    if (!g) return;
    const x0 = g.position.x;
    pop('−4 ผิด!', g.position, '#c0392b');
    S.burst(g.position.clone().add(new THREE.Vector3(0, 0.5, 0)), { color: 0xe8453c, n: 10, speed: 2, size: 0.07 });
    S.shake(0.08, 250);
    S.tween(g.position, { x: x0 + 0.2 }, { ms: 70, onDone: () => S.tween(g.position, { x: x0 - 0.2 }, { ms: 70, onDone: () => S.tween(g.position, { x: x0 }, { ms: 90 }) }) });
    flash(0xff5a5a);
  }

  function flash(color) {
    torch.color.setHex(color);
    setTimeout(() => { if (!S.disposed) torch.color.setHex(0xfff1c8); }, 220);
  }

  let guard = null, mixer = null, actions = {}, current = '', route = [], leg = 0, legT = 0, pause = 0, exposure = 0, cooldown = 0, caughtAnim = 0, guardSpeed = 1.1, guardLimit = 0.4;
  const guardLamp = new THREE.SpotLight(0xffd9a0, 14, 7, 0.5, 0.6, 1.4);
  const guardLampTarget = new THREE.Object3D();
  const alertSprite = S.emojiSprite('❗', 0.9);
  const chest = new THREE.Vector3();

  async function startGuard(R) {
    if (!guard) {
      guard = await instance('characters/character-soldier.glb', { size: 1.75 });
      if (S.disposed) return;
      guard.traverse(o => { if (o.isMesh) o.material.color.setHex(0x9fb0ff); });
      guardLamp.position.set(0, 1.4, 0.3);
      guardLampTarget.position.set(0, 0.2, 3.2);
      guard.add(guardLamp); guard.add(guardLampTarget); guardLamp.target = guardLampTarget;
      alertSprite.position.set(0, 2.5, 0); alertSprite.visible = false; guard.add(alertSprite);
      guard.userData.glow = false;
      mixer = new THREE.AnimationMixer(guard);
      guard.userData.animations.forEach(c => { actions[c.name] = mixer.clipAction(c); });
      scene.add(guard);
      S.onFrame(stepGuard);
    }
    route = R.patrol.map(([x, z]) => new THREE.Vector3(x, 0, z));
    guardSpeed = 1.1 + roomIdx * 0.45;
    guardLimit = Math.max(0.22, 0.4 - roomIdx * 0.08);
    leg = 0; legT = 0; pause = 0.6; exposure = 0; cooldown = 2.5; caughtAnim = 0;
    guard.position.copy(route[0]);
    play('idle');
  }

  function play(name, fadeMs = 0.25) {
    if (!actions[name] || current === name) return;
    if (actions[current]) actions[current].fadeOut(fadeMs);
    actions[name].reset().fadeIn(fadeMs).play();
    current = name;
  }

  function stepGuard(dt) {
    if (!guard || !route.length) return;
    mixer.update(dt);
    if (caughtAnim > 0) { caughtAnim -= dt; if (caughtAnim <= 0) alertSprite.visible = false; return; }
    if (pause > 0) { pause -= dt; if (pause <= 0) { legT = 0; play('walk'); } return; }
    const a = route[leg], b = route[(leg + 1) % route.length];
    const len = a.distanceTo(b);
    legT += (dt * guardSpeed) / Math.max(0.01, len);
    guard.position.lerpVectors(a, b, Math.min(1, legT));
    guard.lookAt(b.x, 0, b.z);
    if (legT >= 1) { leg = (leg + 1) % route.length; pause = (0.9 + Math.random() * 1.2) / (1 + roomIdx * 0.4); play('idle'); }

    cooldown -= dt;
    chest.copy(guard.position).setY(1.1);
    toObj.copy(chest).sub(torch.position).normalize();
    const ang = Math.acos(Math.min(1, Math.max(-1, beamDir.dot(toObj))));
    if (touched && torch.intensity > 0 && ang < torch.angle * 0.75) exposure += dt; else exposure = Math.max(0, exposure - dt * 2);
    if (exposure > guardLimit && cooldown <= 0) {
      exposure = 0; cooldown = 5;
      caughtAnim = 1.6;
      blackout = 1.8;
      alertSprite.visible = true;
      guard.lookAt(camera.position.x, 0, camera.position.z);
      play('emote-no', 0.1);
      S.shake(0.22, 500);
      S.banner('🚔 Spotted! −8');
      setTimeout(() => { if (!S.disposed) play('walk'); }, 1500);
      S.floatText('−8 จับได้!', guard.position.clone().add(new THREE.Vector3(0, 2.2, 0)), { bg: '#c0392b', height: 0.9, rise: 1.2, ms: 1800 });
      hooks.onCaught && hooks.onCaught();
    }
  }

  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  return {
    setRoom, collect, reject,
    roomName: i => ROOMS[i % ROOMS.length].name,
    roomCount: ROOMS.length,
    stage: S,
    dispose: S.dispose
  };
});
