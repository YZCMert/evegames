import { createStage, ease, instance, preload } from './engine.js';
import * as THREE from 'three';

const LW = window.LW;
const PULLERS = {
  red: ['characters/character-male-a.glb', 'characters/character-female-b.glb', 'characters/character-male-e.glb', 'characters/character-female-f.glb', 'characters/character-worker.glb'],
  blue: ['characters/character-female-a.glb', 'characters/character-male-d.glb', 'characters/character-female-c.glb', 'characters/character-male-g.glb', 'characters/character-male-b.glb']
};
const CROWD = ['characters/character-female-d.glb', 'characters/character-male-c.glb', 'characters/character-female-e.glb', 'characters/character-male-f.glb'];
const LIMIT_X = 3.4;
const CAM = { pos: new THREE.Vector3(0, 5.4, 11.2), target: new THREE.Vector3(0, 1.1, -0.4) };

LW.hs3d.register('tug', function (host, hooks, options) {
  const S = createStage(host, { fov: 40, aspect: 16 / 8.5, shadowBounds: 16, hemi: 1.0, sun: 1.6, fog: 0xd6ecff, fogNear: 30, fogFar: 70, reserve: 470, fullReserve: 380, minHeight: 250 });
  if (!S) return null;
  const { scene, camera } = S;
  const sides = (options && options.sides) || [];
  camera.position.copy(CAM.pos);
  S.lookAt(CAM.target.x, CAM.target.y, CAM.target.z);
  S.fade(true, 0);

  const ground = S.plane(80, 80, 0x8fd47a); ground.rotation.x = -Math.PI / 2; scene.add(ground);
  const mud = new THREE.Mesh(new THREE.CircleGeometry(1.6, 36), S.mat(0x7a5a3a)); mud.rotation.x = -Math.PI / 2; mud.scale.x = 1.5; mud.position.y = 0.012; mud.receiveShadow = true; scene.add(mud);
  const puddle = new THREE.Mesh(new THREE.CircleGeometry(1.0, 28), S.mat(0x5e4430)); puddle.rotation.x = -Math.PI / 2; puddle.scale.x = 1.5; puddle.position.y = 0.018; scene.add(puddle);
  const dirt = S.plane(14, 3.4, 0xb5a07a); dirt.rotation.x = -Math.PI / 2; dirt.position.y = 0.006; scene.add(dirt);
  [[-LIMIT_X, 0xe8453c], [LIMIT_X, 0x2f8fd8], [0, 0xffffff]].forEach(([x, c]) => {
    const line = S.plane(x === 0 ? 0.08 : 0.14, 4.4, c); line.rotation.x = -Math.PI / 2; line.position.set(x, 0.02, 0); scene.add(line);
    if (x !== 0) for (const z of [-2.4, 2.4]) {
      const pole = S.cyl(0.05, 0.06, 1.6, 0xf1ead8, 8); pole.position.set(x, 0.8, z); scene.add(pole);
      const flag = S.box(0.04, 0.3, 0.45, c, { shadow: false }); flag.position.set(x, 1.45, z + 0.25); scene.add(flag);
    }
  });
  for (const x of [-7.6, 7.6]) { const p = S.cyl(0.07, 0.09, 4.2, 0xf1ead8, 8); p.position.set(x, 2.1, -4.6); scene.add(p); }
  const banner = S.label('💪 TUG OF WAR · ชักเย่อ', { height: 0.8, fontPx: 72, color: '#fff', bg: '#2a2440', border: '#ffffff', font: '"Noto Sans Thai", Fredoka, sans-serif' });
  banner.position.set(0, 3.9, -4.6); scene.add(banner);
  const redSign = S.label('RED', { height: 0.5, fontPx: 56, color: '#fff', bg: '#e8453c', border: '#fff' }); redSign.position.set(-6.4, 2.5, -4.55); scene.add(redSign);
  const blueSign = S.label('BLUE', { height: 0.5, fontPx: 56, color: '#fff', bg: '#2f8fd8', border: '#fff' }); blueSign.position.set(6.4, 2.5, -4.55); scene.add(blueSign);

  const rope = new THREE.Group(); scene.add(rope);
  const cord = S.cyl(0.07, 0.07, 15, 0xc9a76a, 10); cord.rotation.z = Math.PI / 2; cord.position.y = 0.95; rope.add(cord);
  for (let i = -7; i <= 7; i++) { const wrap = S.cyl(0.085, 0.085, 0.12, 0x8d6a3a, 10); wrap.rotation.z = Math.PI / 2; wrap.position.set(i, 0.95, 0); rope.add(wrap); }
  const ribbon = S.box(0.06, 0.5, 0.34, 0xe8453c, { shadow: false }); ribbon.position.set(0, 0.62, 0); rope.add(ribbon);
  const marker = S.emojiSprite('🚩', 0.9); marker.position.set(0, 1.7, 0); rope.add(marker);
  const turnMark = S.emojiSprite('👇', 0.9); turnMark.visible = false; scene.add(turnMark);

  const world = new THREE.Group(); scene.add(world);
  const mixers = [];
  const pullers = { red: [], blue: [] };
  const byTeam = {};
  const crowd = [];
  let ready = false;

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
    await preload(PULLERS.red.concat(PULLERS.blue, CROWD, ['nature/tree_oak.glb', 'nature/tree_default.glb', 'nature/tree_palm.glb', 'nature/plant_bush.glb', 'nature/flower_redA.glb', 'nature/flower_yellowA.glb', 'suburban/fence-1x3.glb', 'furniture/bench.glb']));
    if (S.disposed) return;
    for (const side of sides) {
      const sign = side.id === 'red' ? -1 : 1;
      const list = side.teams.length ? side.teams.slice() : [];
      const count = Math.max(3, list.length);
      for (let k = 0; k < count; k++) {
        const team = list[k] || null;
        const p = await instance(PULLERS[side.id][k % PULLERS[side.id].length], { size: 1.65 });
        if (S.disposed) return;
        p.position.x += sign * (1.5 + k * 1.1);
        p.rotation.y = sign > 0 ? -Math.PI / 2 : Math.PI / 2;
        rope.add(p);
        const mixer = new THREE.AnimationMixer(p); mixers.push(mixer);
        const actions = {}; p.userData.animations.forEach(c => { actions[c.name] = mixer.clipAction(c); });
        const entry = { obj: p, mixer, actions, current: '', team };
        playOn(entry, 'idle');
        const px = p.position.x;
        const band = S.box(0.42, 0.08, 0.42, new THREE.Color(side.color).getHex(), { shadow: false }); band.position.set(px, 1.66, 0); rope.add(band);
        if (team) {
          const lift = (k % 2) * 0.55;
          const ava = S.emojiSprite(team.avatar, 0.6); ava.position.set(px, 2.5 + lift, 0); rope.add(ava);
          const tag = S.labelSprite(team.name, { height: 0.3, fontPx: 44, color: '#fff', bg: team.color, border: '#fff' }); tag.position.set(px, 2.08 + lift, 0); rope.add(tag);
          byTeam[team.id] = entry;
        }
        pullers[side.id].push(entry);
      }
    }
    for (const [m, x, z, s] of [['nature/tree_oak.glb', -10, -7, 3.6], ['nature/tree_palm.glb', 10, -7, 3.8], ['nature/tree_default.glb', -12, 2, 3.2], ['nature/tree_oak.glb', 12, 3, 3.4], ['nature/tree_palm.glb', -5, -9, 3.6], ['nature/tree_default.glb', 5, -9.5, 3.4]]) await S.put(world, m, x, z, Math.random() * 360, { size: s });
    for (let i = -4; i <= 4; i++) await S.put(world, 'suburban/fence-1x3.glb', i * 2.3, -6.2, 0, { size: 2.3 });
    for (let i = 0; i < 5; i++) { await S.put(world, i % 2 ? 'nature/flower_redA.glb' : 'nature/flower_yellowA.glb', -8 + i * 4, -5.6, 0, { size: 0.5 }); await S.put(world, 'nature/plant_bush.glb', -9 + i * 4.5, -5.3, 0, { size: 0.7 }); }
    await S.put(world, 'furniture/bench.glb', -3.2, -5.4, 0, { size: 1.5 });
    await S.put(world, 'furniture/bench.glb', 3.2, -5.4, 0, { size: 1.5 });
    for (let i = 0; i < 6; i++) {
      const who = await S.put(world, CROWD[i % CROWD.length], -7 + i * 2.8 + (Math.random() - 0.5), -4.0 - (i % 2) * 0.9, 0, { size: 1.5 });
      if (S.disposed) return;
      who.lookAt(who.position.x * 0.3, 0, 2);
      const mx = new THREE.AnimationMixer(who); const idle = who.userData.animations.find(a => a.name === 'idle'); if (idle) mx.clipAction(idle).play(); mixers.push(mx);
      who.userData.mixer = mx;
      crowd.push(who);
    }
    ready = true;
    S.fade(false, 700);
    S.intro({ x: -8, y: 12, z: 22 }, CAM.pos, CAM.target, 2300);
    S.title('💪 Tug of War', 'Red against Blue · right answers pull, fast answers pull harder');
  })();

  let mudT = 0;
  S.onFrame((dt, t) => {
    mixers.forEach(m => m.update(dt));
    rope.rotation.z = Math.sin(t * 1.3) * 0.008;
    marker.position.y = 1.7 + Math.sin(t * 3) * 0.06;
    if (turnMark.visible) turnMark.position.y = turnMark.userData.baseY + Math.sin(t * 5) * 0.12;
    if (mudT > 0) mudT -= dt;
  });

  function cheer(list, name, once) { list.forEach(p => playOn(p, name, once)); }
  function allIdle() { pullers.red.concat(pullers.blue).forEach(p => playOn(p, 'idle')); }

  function turn(sideId, teamId) {
    const entry = byTeam[teamId] || pullers[sideId][0];
    if (!entry) { turnMark.visible = false; return; }
    const wp = entry.obj.getWorldPosition(new THREE.Vector3());
    turnMark.position.set(wp.x, 3.3, wp.z); turnMark.userData.baseY = 3.3; turnMark.visible = true;
    turnMark.userData.entry = entry;
  }

  function pull(k, sideId, n, label) {
    const x = k * LIMIT_X;
    const team = pullers[sideId];
    cheer(team, n >= 2 ? 'sprint' : 'walk');
    S.tween(rope.position, { x }, { ms: n >= 2 ? 800 : 650, ease: n >= 2 ? ease.outBack : ease.outCubic, onDone: () => {
      if (turnMark.visible && turnMark.userData.entry) { const wp = turnMark.userData.entry.obj.getWorldPosition(new THREE.Vector3()); turnMark.position.x = wp.x; }
    } });
    team.forEach(p => { const wp = p.obj.getWorldPosition(new THREE.Vector3()); S.burst(wp.add(new THREE.Vector3(0, 0.1, 0)), { color: 0xb5a07a, n: 6, speed: 1.4, size: 0.06, gravity: 2, life: 0.6 }); });
    const at = new THREE.Vector3(rope.position.x, 2.4, 0.4);
    S.floatText(label, at, { bg: sideId === 'red' ? '#c0392b' : '#1f6fb5', height: n >= 3 ? 1.0 : 0.8, ms: n >= 3 ? 1800 : 1300 });
    if (n >= 3) { S.shake(0.14, 400); S.banner('💪 MEGA HEAVE!', 'good'); } else if (n === 2) S.shake(0.07, 250);
    LW.sound.whoosh();
    setTimeout(() => { if (!S.disposed) cheer(team, 'idle'); }, n >= 2 ? 900 : 700);
  }

  function roundWon(sideId) {
    const winners = pullers[sideId], losers = pullers[sideId === 'red' ? 'blue' : 'red'];
    cheer(winners, 'emote-yes', true);
    cheer(losers, 'fall', true);
    S.shake(0.22, 600);
    S.burst(new THREE.Vector3(rope.position.x * 0.5, 0.3, 0), { color: 0x7a5a3a, n: 36, speed: 3.2, size: 0.1, gravity: 4, life: 1.1 });
    S.floatText('+25 ชนะ!', new THREE.Vector3(rope.position.x, 2.6, 0.4), { bg: sideId === 'red' ? '#c0392b' : '#1f6fb5', height: 1.0, ms: 2000 });
    S.banner('🏆 ' + (sideId === 'red' ? 'Red' : 'Blue') + ' side wins the round!', 'good');
    crowd.forEach(w => { const yes = w.userData.animations.find(a => a.name === 'emote-yes'); if (yes && w.userData.mixer) w.userData.mixer.clipAction(yes).reset().setLoop(THREE.LoopOnce, 1).play(); });
    LW.sound.crash();
    turnMark.visible = false;
    setTimeout(() => { if (!S.disposed) allIdle(); }, 2200);
  }

  function reset() {
    allIdle();
    S.tween(rope.position, { x: 0 }, { ms: 900, ease: ease.inOutCubic });
  }

  function podium(sideId) {
    if (!sideId) { S.banner('🤝 A draw!'); return; }
    S.banner('🏆 ' + (sideId === 'red' ? 'Red' : 'Blue') + ' side wins the match! ชนะแล้ว!', 'good');
    for (let i = 0; i < 5; i++) setTimeout(() => { if (!S.disposed) S.burst(new THREE.Vector3((Math.random() - 0.5) * 6, 2 + Math.random(), (Math.random() - 0.5) * 2), { color: [0xf7d64a, 0xef6fa0, 0x45b36b, 0x2f8fd8, 0xffffff][i], n: 26, speed: 4.5, gravity: 4, life: 1.4 }); }, i * 180);
    cheer(pullers[sideId], 'emote-yes', true);
  }

  return { turn, pull, roundWon, reset, podium, stage: S, dispose: S.dispose };
});
