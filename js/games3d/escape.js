(function (LW) {
  'use strict';
  var el = function () { return LW.u.el.apply(null, arguments); };

  var LOCKS = [
    { id: 'safe',  name: 'Safe',      emoji: '🔐', brief: 'Crack the 3-digit code' },
    { id: 'shelf', name: 'Bookshelf', emoji: '📚', brief: 'Match the five pairs' },
    { id: 'chest', name: 'Chest',     emoji: '🧰', brief: 'Find the key, spell the words' },
    { id: 'door',  name: 'Door',      emoji: '🚪', brief: 'Order the sentence (needs 3 keys)' }
  ];

  LW.registerGame({
    id: 'escape',
    mode: 'hs',
    name: 'Escape Room',
    emoji: '🔐',
    color: '#9b5de5',
    tag: 'grammar · vocabulary · teamwork',
    timeLabel: '6 minutes',
    pointsLabel: '25 per lock · key found +10 · −3 wrong · −5 hint · lockdown −15 & −20 s',
    howto: 'You are locked in. Open the safe and the bookshelf, find the hidden key for the chest, then unlock the door by putting a sentence in order. Every wrong answer feeds the alarm — five wrongs and the room goes into lockdown. When someone knocks at the door, freeze: touching anything gives you away.',

    mount: function (stage, api) {
      var H = LW.HS || {};
      var gaps = LW.lesson.pick('gaps', 3);
      var pairSet = LW.lesson.pick('pairs', 1)[0] || null;
      var forms = LW.lesson.pick('forms', 2);
      var sentence = LW.lesson.pick('sentences', 1)[0] || null;
      if (gaps.length < 3 || !pairSet || forms.length < 2 || !sentence) { api.finish(0, 'No puzzles available.'); return function () {}; }

      var SPOTS = H.keySpots || [];
      var keySpot = SPOTS.length ? LW.u.pick(SPOTS) : null;
      var score = 0, wrong = 0, hints = 0, alarm = 0, lockdowns = 0, finished = false, keyFound = !keySpot, frozen = false, caughtMoving = 0;
      var open = { safe: false, shelf: false, chest: false, door: false };
      var active = null;
      var knockEvery = LW.diff(95, 75, 60);

      var counter = el('p', { class: 'stage-note' });
      var lockRow = el('div', { class: 'esc-locks' });
      var alarmBox = el('div', { class: 'esc-alarm' }, [el('span', { class: 'ea-label', text: '🚨 Alarm' }), el('span', { class: 'ea-meter' })]);
      var meter = alarmBox.querySelector('.ea-meter');
      var host = el('div', { class: 'gl-host study' });
      var freezeBox = el('div', { class: 'esc-freeze' });
      var panel = el('div', { class: 'esc-panel' });
      var feedback = el('p', { class: 'feedback' });

      stage.appendChild(counter);
      stage.appendChild(lockRow);
      stage.appendChild(alarmBox);
      stage.appendChild(host);
      stage.appendChild(freezeBox);
      stage.appendChild(panel);
      stage.appendChild(feedback);

      panel.addEventListener('click', function (e) {
        if (!frozen) return;
        if (e.target && e.target.tagName === 'BUTTON') { heard(); e.stopPropagation(); e.preventDefault(); }
      }, true);

      var timer = new LW.u.Timer(LW.diff(480, 360, 300), function (left) {
        api.setTimer('⏱ ' + LW.u.fmtTime(left), left <= 30);
      }, function () { end('Time is up — still locked in.'); });

      var scene = LW.hs3d ? LW.hs3d.create('escape', host, { onHotspot: select, onSpot: searchSpot }) : null;
      if (!scene) {
        host.classList.add('flat');
        host.appendChild(el('p', { class: 'flat-note', text: 'The 3D room needs WebGL — use the lock buttons above.' }));
      }

      function keys() { return ['safe', 'shelf', 'chest'].filter(function (k) { return open[k]; }).length; }

      function renderLocks() {
        LW.u.clear(lockRow);
        LOCKS.forEach(function (L) {
          var state = open[L.id] ? 'open' : (active === L.id ? 'active' : 'locked');
          var b = el('button', { class: 'esc-lock ' + state, 'data-lock': L.id, onclick: function () { select(L.id); } }, [
            el('span', { class: 'el-emoji', text: open[L.id] ? '✅' : L.emoji }),
            el('span', { class: 'el-name', text: L.name })
          ]);
          lockRow.appendChild(b);
        });
        counter.textContent = 'Keys: ' + keys() + ' / 3' + (open.door ? ' · Door open!' : '');
        drawAlarm();
      }

      function drawAlarm() {
        var s = '';
        for (var i = 0; i < 5; i++) s += i < alarm ? '🔴' : '⚪';
        meter.textContent = s;
        alarmBox.classList.toggle('hot', alarm >= 4);
      }

      function select(id) {
        if (finished) return;
        if (frozen) { heard(); return; }
        if (open[id]) { feedback.textContent = 'Already open.'; return; }
        active = id;
        renderLocks();
        if (scene) { scene.focus(id); scene.huntMode(id === 'chest' && !keyFound); }
        LW.u.clear(panel);
        if (id === 'safe') safePanel();
        else if (id === 'shelf') shelfPanel();
        else if (id === 'chest') { if (keyFound) chestPanel(); else keyPanel(); }
        else doorPanel();
      }

      function miss(node, why, quiet) {
        wrong++;
        alarm++;
        score = Math.max(0, score - 3);
        api.setScore(score);
        LW.sound.wrong();
        if (node) LW.u.shake(node);
        feedback.textContent = (why ? why + ' ' : '') + '(−3)';
        if (scene) { if (!quiet) scene.miss(active); scene.setAlarm(alarm); }
        if (alarm >= 5) lockdown();
        drawAlarm();
      }

      function lockdown() {
        lockdowns++;
        alarm = 0;
        score = Math.max(0, score - 15);
        api.setScore(score);
        timer.add(-20);
        LW.sound.timeUp();
        feedback.textContent = '🚨 LOCKDOWN! −15 points and −20 seconds. Calm down and think.';
        if (scene) { scene.alarm(); scene.setAlarm(0); }
        panel.classList.add('locked');
        setTimeout(function () { panel.classList.remove('locked'); }, 2500);
      }

      function hint(cost) {
        hints++;
        score = Math.max(0, score - (cost || 5));
        api.setScore(score);
        LW.sound.flip();
      }

      var knockTimer = null, freezeTimer = null;
      function knock() {
        if (finished || frozen) return;
        frozen = true;
        var left = 4;
        LW.u.clear(freezeBox);
        var num = el('b', { text: String(left) });
        freezeBox.appendChild(el('span', {}, [document.createTextNode('🤫 Someone is at the door! Do not touch anything for '), num, document.createTextNode(' s')]));
        freezeBox.classList.add('on');
        panel.classList.add('frozen');
        LW.sound.thud();
        setTimeout(function () { LW.sound.thud(); }, 350);
        if (scene) scene.knock(true);
        freezeTimer = setInterval(function () {
          left--;
          num.textContent = String(Math.max(0, left));
          if (left <= 0) {
            clearInterval(freezeTimer); freezeTimer = null;
            frozen = false;
            freezeBox.classList.remove('on'); LW.u.clear(freezeBox);
            panel.classList.remove('frozen');
            if (scene) scene.knock(false);
            feedback.textContent = '😮‍💨 They are gone. Carry on.';
          }
        }, 1000);
      }

      function heard() {
        caughtMoving++;
        alarm++;
        score = Math.max(0, score - 3);
        api.setScore(score);
        LW.sound.wrong();
        feedback.textContent = '😬 They heard you move! (−3)';
        if (scene) { scene.setAlarm(alarm); scene.heard(); }
        if (alarm >= 5) lockdown();
        drawAlarm();
      }

      function unlock(id) {
        open[id] = true;
        score += 25;
        api.setScore(score);
        LW.sound.correct();
        LW.confetti(40);
        if (scene) scene.unlock(id);
        active = null;
        renderLocks();
        LW.u.clear(panel);
        if (id === 'door') {
          feedback.textContent = '🚪 You escaped!';
          setTimeout(function () { end('Escaped with ' + wrong + ' wrong answer(s), ' + hints + ' hint(s), ' + lockdowns + ' lockdown(s), heard ' + caughtMoving + ' time(s).'); }, scene ? 2200 : 600);
        } else {
          feedback.textContent = '🔑 Key ' + keys() + ' of 3 collected!';
          panel.appendChild(el('p', { class: 'esc-next', text: keys() === 3 ? 'All three keys — now the door!' : 'Choose the next lock.' }));
        }
      }

      function keyPanel() {
        panel.appendChild(el('h3', { class: 'esc-title', text: '🧰 The chest is locked — find the hidden key' }));
        panel.appendChild(el('p', { class: 'esc-prompt', text: '“' + keySpot.riddle + '” — search that object in the room.' }));
        var row = el('div', { class: 'esc-spots' });
        SPOTS.forEach(function (sp) {
          var b = el('button', { class: 'spot-btn', 'data-spot': sp.id }, [el('span', { class: 'sb-emoji', text: sp.emoji }), el('span', { text: sp.name })]);
          b.addEventListener('click', function () { searchSpot(sp.id, b); });
          row.appendChild(b);
        });
        panel.appendChild(row);
      }

      function searchSpot(id, node) {
        if (finished || keyFound || active !== 'chest') return;
        if (frozen) { heard(); return; }
        if (id === keySpot.id) {
          keyFound = true;
          score += 10;
          api.setScore(score);
          LW.sound.coin();
          feedback.textContent = '🔑 Found the key in the ' + keySpot.name.toLowerCase() + '! +10';
          if (scene) { scene.keyFound(id); scene.huntMode(false); }
          LW.u.clear(panel);
          chestPanel();
        } else {
          var sp = SPOTS.filter(function (s) { return s.id === id; })[0];
          if (scene) scene.spotWrong(id);
          miss(node, 'Nothing in the ' + (sp ? sp.name.toLowerCase() : 'there') + '.', true);
        }
      }

      function safePanel() {
        var i = 0, code = [];
        var head = el('h3', { class: 'esc-title', text: '🔐 The safe — find the 3-digit code' });
        var codeLine = el('div', { class: 'esc-code' });
        var prompt = el('p', { class: 'esc-prompt' });
        var opts = el('div', { class: 'esc-opts' });
        var bar = el('div', { class: 'action-bar' }, [
          el('button', { class: 'btn ghost-btn small', html: '💡 Hint (−5)', onclick: function () { hint(5); feedback.textContent = '💡 ' + gaps[i].rule; } })
        ]);
        panel.appendChild(head); panel.appendChild(codeLine); panel.appendChild(prompt); panel.appendChild(opts); panel.appendChild(bar);

        function drawCode() {
          LW.u.clear(codeLine);
          for (var k = 0; k < 3; k++) codeLine.appendChild(el('span', { class: 'ec-digit' + (code[k] !== undefined ? ' on' : ''), text: code[k] !== undefined ? String(code[k]) : '•' }));
        }
        function show() {
          var g = gaps[i];
          drawCode();
          prompt.textContent = 'Question ' + (i + 1) + ' of 3:  ' + g.prompt;
          LW.u.clear(opts);
          LW.u.shuffle(g.options.map(function (o, k) { return { o: o, k: k }; })).forEach(function (x) {
            var b = el('button', { class: 'choice', text: x.o });
            b.addEventListener('click', function () {
              if (x.k === g.answer) {
                b.classList.add('ok');
                LW.sound.correct();
                code.push(Math.floor(Math.random() * 10));
                i++;
                feedback.textContent = '✔ ' + g.rule;
                if (i >= 3) { drawCode(); setTimeout(function () { unlock('safe'); }, 700); }
                else setTimeout(show, 600);
              } else {
                b.classList.add('bad'); b.disabled = true;
                miss(b, 'Not quite.');
              }
            });
            opts.appendChild(b);
          });
        }
        show();
      }

      function shelfPanel() {
        var pairs = pairSet.pairs;
        var left = LW.u.shuffle(pairs.map(function (p) { return p[0]; }));
        var right = LW.u.shuffle(pairs.map(function (p) { return p[1]; }));
        var picked = null, done = 0, leftBtn = {};
        var head = el('h3', { class: 'esc-title', text: '📚 The bookshelf — ' + pairSet.title });
        var board = el('div', { class: 'esc-pairs' });
        var colL = el('div', { class: 'ep-col' }), colR = el('div', { class: 'ep-col' });
        board.appendChild(colL); board.appendChild(colR);
        panel.appendChild(head); panel.appendChild(board);
        panel.appendChild(el('div', { class: 'action-bar' }, [
          el('button', { class: 'btn ghost-btn small', html: '💡 Hint (−5)', onclick: function () {
            var p = pairs.filter(function (pp) { return !leftBtn[pp[0]].classList.contains('done'); })[0];
            if (!p) return;
            hint(5);
            feedback.textContent = '💡 "' + p[0] + '" goes with "' + p[1] + '".';
          } })
        ]));

        function matchOf(a) { return (pairs.filter(function (p) { return p[0] === a; })[0] || [])[1]; }

        left.forEach(function (v) {
          var b = el('button', { class: 'pair-btn', text: v, 'data-v': v });
          leftBtn[v] = b;
          b.addEventListener('click', function () {
            if (b.classList.contains('done')) return;
            Array.prototype.forEach.call(colL.children, function (c) { c.classList.remove('sel'); });
            b.classList.add('sel'); picked = v;
          });
          colL.appendChild(b);
        });
        right.forEach(function (v) {
          var b = el('button', { class: 'pair-btn', text: v, 'data-v': v });
          b.addEventListener('click', function () {
            if (b.classList.contains('done') || !picked) { if (!picked) feedback.textContent = 'Pick a word on the left first.'; return; }
            var l = leftBtn[picked];
            if (matchOf(picked) === v) {
              b.classList.add('done'); l.classList.add('done'); l.classList.remove('sel');
              LW.sound.correct();
              done++;
              picked = null;
              feedback.textContent = '✔ ' + l.textContent + ' = ' + v;
              if (done === pairs.length) setTimeout(function () { unlock('shelf'); }, 600);
            } else {
              miss(b, '"' + picked + '" does not go with "' + v + '".');
            }
          });
          colR.appendChild(b);
        });
      }

      function chestPanel() {
        var i = 0;
        var head = el('h3', { class: 'esc-title', text: '🧰 The chest — spell the missing word' });
        var prompt = el('p', { class: 'esc-prompt' });
        var slotRow = el('div', { class: 'spell-slots' });
        var trayRow = el('div', { class: 'spell-tray' });
        panel.appendChild(head); panel.appendChild(prompt); panel.appendChild(slotRow); panel.appendChild(trayRow);
        panel.appendChild(el('div', { class: 'action-bar' }, [
          el('button', { class: 'btn ghost-btn small', html: '↺ Clear', onclick: function () { slots.forEach(function (s, k) { removeAt(k); }); } }),
          el('button', { class: 'btn ghost-btn small', html: '💡 Letter (−5)', onclick: hintLetter })
        ]));
        var slots = [], tray = [];

        function show() {
          var f = forms[i];
          prompt.textContent = 'Word ' + (i + 1) + ' of 2:  ' + f.prompt;
          var target = f.answer.toUpperCase();
          slots = []; LW.u.clear(slotRow);
          for (var k = 0; k < target.length; k++) {
            var s = el('button', { class: 'slot' });
            (function (k2, node) { node.addEventListener('click', function () { removeAt(k2); }); })(k, s);
            slotRow.appendChild(s); slots.push({ node: s, letter: null, from: null });
          }
          var pool = LW.u.shuffle(target.split('').concat(LW.u.sample('AEIOURSTLN'.split(''), LW.diff(0, 2, 3))));
          tray = []; LW.u.clear(trayRow);
          pool.forEach(function (ch, k) {
            var t = el('button', { class: 'tile', text: ch });
            t.addEventListener('click', function () { addLetter(k); });
            trayRow.appendChild(t); tray.push({ node: t, letter: ch, used: false });
          });
        }
        function addLetter(k) {
          var t = tray[k]; if (t.used) return;
          var slot = slots.filter(function (s) { return !s.letter; })[0]; if (!slot) return;
          LW.sound.click();
          slot.letter = t.letter; slot.from = k; slot.node.textContent = t.letter; slot.node.classList.add('filled');
          t.used = true; t.node.classList.add('used');
          check();
        }
        function removeAt(k) {
          var s = slots[k]; if (!s || !s.letter) return;
          var t = tray[s.from]; if (t) { t.used = false; t.node.classList.remove('used'); }
          s.letter = null; s.from = null; s.node.textContent = ''; s.node.classList.remove('filled', 'bad');
        }
        function check() {
          var val = slots.map(function (s) { return s.letter || ' '; }).join('');
          if (val.indexOf(' ') !== -1) return;
          if (val === forms[i].answer.toUpperCase()) {
            LW.sound.correct();
            slots.forEach(function (s) { s.node.classList.add('ok'); });
            LW.speak(forms[i].answer);
            feedback.textContent = '✔ ' + LW.u.titleCase(forms[i].answer);
            i++;
            if (i >= 2) setTimeout(function () { unlock('chest'); }, 700);
            else setTimeout(show, 700);
          } else {
            slots.forEach(function (s) { s.node.classList.add('bad'); });
            miss(slotRow, 'That is not the word.');
            setTimeout(function () { slots.forEach(function (s, k) { removeAt(k); }); }, 600);
          }
        }
        function hintLetter() {
          var target = forms[i].answer.toUpperCase();
          for (var k = 0; k < slots.length; k++) {
            if (slots[k].letter !== target.charAt(k)) {
              if (slots[k].letter) removeAt(k);
              for (var t = 0; t < tray.length; t++) {
                if (!tray[t].used && tray[t].letter === target.charAt(k)) {
                  hint(5);
                  slots[k].letter = target.charAt(k); slots[k].from = t;
                  slots[k].node.textContent = target.charAt(k); slots[k].node.classList.add('filled', 'hinted');
                  tray[t].used = true; tray[t].node.classList.add('used');
                  check();
                  return;
                }
              }
              return;
            }
          }
        }
        show();
      }

      function doorPanel() {
        var head = el('h3', { class: 'esc-title', text: '🚪 The door — put the sentence in order' });
        panel.appendChild(head);
        if (keys() < 3) {
          panel.appendChild(el('p', { class: 'esc-prompt', text: 'The door has three keyholes. You have ' + keys() + ' key(s). Open the safe, the bookshelf and the chest first.' }));
          return;
        }
        var pos = 0;
        var built = el('p', { class: 'tower-built', text: '…' });
        var tray = el('div', { class: 'tower-tray' });
        panel.appendChild(el('p', { class: 'esc-prompt', text: LW.u.titleCase(sentence.topic) }));
        panel.appendChild(built); panel.appendChild(tray);
        LW.u.shuffle(sentence.words.map(function (w, i) { return { w: w, i: i }; })).forEach(function (o) {
          var b = el('button', { class: 'chip', text: o.w, 'data-i': o.i });
          b.addEventListener('click', function () {
            if (b.disabled) return;
            if (o.i === pos) {
              b.disabled = true; b.classList.add('done');
              LW.sound.correct();
              pos++;
              built.textContent = sentence.words.slice(0, pos).join(' ');
              if (pos === sentence.words.length) { LW.speak(sentence.words.join(' ')); setTimeout(function () { unlock('door'); }, 500); }
            } else {
              miss(b, 'Not the next word.');
            }
          });
          tray.appendChild(b);
        });
      }

      function end(detail) {
        if (finished) return;
        finished = true;
        timer.stop();
        if (knockTimer) clearInterval(knockTimer);
        if (freezeTimer) clearInterval(freezeTimer);
        var bonus = open.door ? Math.floor(timer.left / 4) : 0;
        api.finish(score + bonus, detail + (bonus ? ' +' + bonus + ' time bonus.' : ''));
      }

      var ktick = 0;
      knockTimer = setInterval(function () {
        ktick = (ktick + 1) % knockEvery;
        if (ktick === 0) knock();
      }, 1000);

      api.setScore(0);
      timer.start();
      renderLocks();
      panel.appendChild(el('p', { class: 'esc-next', text: 'Click a lock in the room (or above) to start.' }));

      return function () {
        timer.stop();
        if (knockTimer) clearInterval(knockTimer);
        if (freezeTimer) clearInterval(freezeTimer);
        if (scene) scene.dispose();
      };
    }
  });
})(window.LW);
