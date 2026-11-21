(function (LW) {
  'use strict';
  var el = function () { return LW.u.el.apply(null, arguments); };

  var ROOM_NAMES = ['Living room', 'Kitchen', 'Bedroom'];
  var GEM = '__gem';

  LW.registerGame({
    id: 'heist',
    mode: 'hs',
    name: 'Word Heist',
    emoji: '🔦',
    color: '#5b4bd6',
    tag: 'vocabulary · definitions',
    timeLabel: '2 minutes',
    pointsLabel: '10 per object · 🔥 streak +5 · 💎 gem +15 · −4 wrong grab · −8 if the guard sees you',
    howto: 'The lights are out and you can only see what your torch is pointing at. Read the definition, search the room and click the object it describes. Three in a row starts a streak bonus, and a gem is hidden in every room. Do not shine the light on the guard — he raises the alarm, and he gets faster in every room.',

    mount: function (stage, api) {
      var perRound = LW.diff(8, 10, 12);
      var rounds = LW.diff(2, 3, 3);
      var words = pickWords(perRound * rounds, perRound);
      rounds = Math.max(1, Math.ceil(words.length / perRound));
      perRound = Math.ceil(words.length / rounds);

      var round = 0, score = 0, found = 0, wrong = 0, caught = 0, streak = 0, best = 0, gems = 0, gemLeft = false;
      var objects = [], queue = [], target = null, busy = false, finished = false;

      var counter = el('p', { class: 'stage-note' });
      var streakBadge = el('span', { class: 'heist-streak' });
      var defBox = el('div', { class: 'heist-def' }, [
        el('span', { class: 'hd-icon', text: '🕵️' }),
        el('p', { class: 'hd-text', text: 'Loading the room…' }),
        streakBadge,
        el('button', { class: 'btn ghost-btn small', html: '🔊', title: 'Read the clue', onclick: function () { if (target) LW.speak(target.hint); } })
      ]);
      var defText = defBox.querySelector('.hd-text');
      var host = el('div', { class: 'gl-host dark' });
      var chips = el('div', { class: 'heist-chips' });
      var feedback = el('p', { class: 'feedback' });

      stage.appendChild(counter);
      stage.appendChild(defBox);
      stage.appendChild(host);
      stage.appendChild(chips);
      stage.appendChild(feedback);

      var timer = new LW.u.Timer(LW.diff(150, 120, 100), function (left) {
        api.setTimer('⏱ ' + LW.u.fmtTime(left), left <= 15);
      }, function () { end('Time! ' + found + ' object(s) found.'); });

      var scene = LW.hs3d ? LW.hs3d.create('heist', host, { onObject: grab, onCaught: spotted }) : null;
      if (!scene) {
        host.classList.add('flat');
        host.appendChild(el('p', { class: 'flat-note', text: 'Torch mode needs WebGL — pick the object from the shelf below instead.' }));
      }

      function startRound() {
        objects = words.slice(round * perRound, (round + 1) * perRound);
        queue = LW.u.shuffle(objects);
        target = null;
        gemLeft = true;
        var name = scene ? scene.roomName(round) : ROOM_NAMES[round % ROOM_NAMES.length];
        counter.textContent = 'Room ' + (round + 1) + ' of ' + rounds + ' · ' + name;
        defText.textContent = 'Loading the ' + name.toLowerCase() + '…';
        renderChips();
        if (scene) {
          var ready = scene.setRoom(round, objects.concat([{ en: GEM, emoji: '💎', gem: true }]));
          var guard = setTimeout(nextTarget, 6000);
          ready.then(function () { clearTimeout(guard); if (!timer.running && !finished) timer.start(); nextTarget(); });
        } else {
          if (!timer.running) timer.start();
          nextTarget();
        }
      }

      var chipOf = {};
      function renderChips() {
        LW.u.clear(chips);
        chipOf = {};
        if (scene) return;
        objects.concat([{ en: GEM, emoji: '💎' }]).forEach(function (w) {
          var b = el('button', { class: 'heist-chip' + (w.en === GEM ? ' gem' : ''), title: 'object', 'data-en': w.en }, [el('span', { text: w.emoji })]);
          b.addEventListener('click', function () { grab(w.en); });
          chips.appendChild(b);
          chipOf[w.en] = b;
        });
      }

      function drawStreak() {
        if (streak >= 2) { streakBadge.textContent = '🔥 ×' + streak; streakBadge.classList.add('on'); }
        else { streakBadge.textContent = ''; streakBadge.classList.remove('on'); }
      }

      function nextTarget() {
        if (finished || target) return;
        target = queue.shift() || null;
        if (!target) {
          round++;
          if (round >= rounds) { end(found + ' / ' + words.length + ' objects found, ' + gems + ' gem(s), best streak ' + best + ', ' + wrong + ' wrong grab(s), spotted ' + caught + ' time(s).'); return; }
          feedback.textContent = 'Room cleared! Moving to the next room…';
          LW.confetti(40);
          setTimeout(startRound, 1200);
          return;
        }
        var name = scene ? scene.roomName(round) : ROOM_NAMES[round % ROOM_NAMES.length];
        counter.textContent = 'Room ' + (round + 1) + ' of ' + rounds + ' · ' + name + ' · object ' + (objects.length - queue.length) + ' of ' + objects.length;
        defText.textContent = target.hint;
        LW.speak(target.hint);
        if (!timer.running && !finished) timer.start();
      }

      function grab(en) {
        if (busy || finished) return;
        if (en === GEM) {
          if (!gemLeft) return;
          gemLeft = false;
          gems++;
          score += 15;
          api.setScore(score);
          LW.sound.coin();
          feedback.textContent = '💎 Bonus gem! +15 โบนัส!';
          if (scene) scene.collect(GEM, '+15 💎');
          var gchip = chipOf[GEM];
          if (gchip) { gchip.classList.add('done'); gchip.disabled = true; }
          return;
        }
        if (!target) return;
        var w = objects.filter(function (o) { return o.en === en; })[0];
        if (!w) return;
        if (en === target.en) {
          busy = true;
          streak++;
          if (streak > best) best = streak;
          var bonus = streak >= 3 ? 5 : 0;
          score += 10 + bonus; found++;
          api.setScore(score);
          LW.sound.coin();
          LW.speak(target.en);
          feedback.textContent = '✔ ' + LW.u.titleCase(target.en) + (bonus ? '  🔥 streak ×' + streak + ' +5' : '');
          drawStreak();
          if (scene) scene.collect(en, bonus ? '+15 🔥×' + streak : '+10 เก่งมาก!');
          var chip = chipOf[en];
          if (chip) { chip.classList.add('done'); chip.disabled = true; }
          setTimeout(function () { busy = false; target = null; nextTarget(); }, scene ? 900 : 500);
        } else {
          wrong++;
          streak = 0;
          drawStreak();
          score = Math.max(0, score - 4);
          api.setScore(score);
          LW.sound.wrong();
          feedback.textContent = '🚨 That is a ' + w.en + '. Keep looking!';
          if (scene) scene.reject(en);
          var bad = chipOf[en];
          if (bad) LW.u.shake(bad);
        }
      }

      function spotted() {
        if (finished) return;
        caught++;
        streak = 0;
        drawStreak();
        score = Math.max(0, score - 8);
        api.setScore(score);
        LW.sound.siren();
        feedback.textContent = '🚔 The guard saw your light! −8 — torch off for a moment.';
      }

      function end(detail) {
        if (finished) return;
        finished = true;
        timer.stop();
        var bonus = found === words.length ? Math.floor(timer.left / 2) : 0;
        api.finish(score + bonus, detail + (bonus ? ' +' + bonus + ' time bonus.' : ''));
      }

      api.setScore(0);
      api.setTimer('⏱ ' + LW.u.fmtTime(timer.left), false);
      startRound();

      return function () {
        timer.stop();
        if (scene) scene.dispose();
      };
    }
  });

  function pickWords(n, enough) {
    var out = [];
    var looks = {};
    LW.lesson.wordTiers({ concrete: true }).forEach(function (tier, i) {
      if (out.length >= n || (i > 0 && out.length >= enough)) return;
      out.forEach(function (w) { looks[w.emoji] = true; });
      tier = LW.u.shuffle(tier).filter(function (w) {
        if (looks[w.emoji]) return false;
        looks[w.emoji] = true;
        return true;
      });
      var modelled = tier.filter(function (w) { return LW.hasModel && LW.hasModel(w); });
      var rest = tier.filter(function (w) { return !(LW.hasModel && LW.hasModel(w)); });
      out = out.concat(LW.wordsFrom(modelled, Math.min(n - out.length, modelled.length)));
      if (out.length < n) out = out.concat(LW.wordsFrom(rest, Math.min(n - out.length, rest.length)));
    });
    return LW.u.shuffle(out);
  }
})(window.LW);
