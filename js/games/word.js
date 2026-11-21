/* Games: Spell It  +  Alphabetical Order */
(function (LW) {
  'use strict';
  var el = function () { return LW.u.el.apply(null, arguments); };

  /* ============================================================
   *  SPELL IT — build the word from scrambled letters
   * ========================================================= */
  LW.registerGame({
    id: 'spell',
    name: 'Spell It',
    emoji: '🔤',
    color: '#f0a92c',
    tag: 'spelling',
    timeLabel: '2 minutes',
    pointsLabel: '15 per word · −5 per hint',
    howto: 'Look at the picture and build the English word from the mixed letters. Tap a letter to add it, tap it again to take it back.',
    howtoTh: 'ดูรูปภาพแล้วเรียงตัวอักษรที่สลับอยู่ให้เป็นคำภาษาอังกฤษ แตะตัวอักษรเพื่อใส่ แตะช่องอีกครั้งเพื่อเอาออก',

    mount: function (stage, api) {
      var rounds = LW.diff(4, 5, 6);
      var words = LW.words(rounds, function (w) { return w.en.replace(/[^a-z]/gi, '').length <= 11; });
      rounds = words.length;

      var idx = 0, score = 0, hints = 0, solved = 0;

      var counter = el('p', { class: 'stage-note' });
      var picture = el('div', { class: 'spell-pic' });
      var trLine = el('p', { class: 'spell-tr' });
      var slotRow = el('div', { class: 'spell-slots' });
      var trayRow = el('div', { class: 'spell-tray' });

      stage.appendChild(counter);
      stage.appendChild(picture);
      stage.appendChild(trLine);
      stage.appendChild(slotRow);
      stage.appendChild(trayRow);

      var bar = el('div', { class: 'action-bar' }, [
        el('button', { class: 'btn ghost-btn', html: '🔊 Hear it', onclick: function () { LW.speak(words[idx].en); } }),
        el('button', { class: 'btn ghost-btn', html: '💡 Hint (−5)', onclick: hint }),
        el('button', { class: 'btn warn-btn', html: '⏭ Skip', onclick: function () { LW.sound.wrong(); nextRound(); } })
      ]);
      stage.appendChild(bar);

      var timer = new LW.u.Timer(LW.diff(150, 120, 90), function (left) {
        api.setTimer('⏱ ' + LW.u.fmtTime(left), left <= 15);
      }, function () {
        api.finish(score, solved + ' / ' + rounds + ' words spelled.');
      });
      timer.start();

      var slots = [], tray = [];

      function render() {
        var w = words[idx];
        counter.textContent = 'Word ' + (idx + 1) + ' of ' + rounds;
        LW.u.clear(picture).appendChild(el('span', { class: 'sp-emoji', text: w.emoji }));
        trLine.textContent = LW.state.settings.showNative ? w.th + '  —  ' + w.hint : w.hint;

        var target = w.en.toUpperCase().replace(/[^A-Z]/g, '');
        slots = [];
        LW.u.clear(slotRow);
        for (var i = 0; i < target.length; i++) {
          var s = el('button', { class: 'slot', 'data-i': i });
          (function (i2, node) {
            node.addEventListener('click', function () { removeAt(i2); });
          })(i, s);
          slotRow.appendChild(s);
          slots.push({ node: s, letter: null, from: null });
        }

        var pool = target.split('');
        var extra = LW.diff(0, 2, 3);
        var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        for (var e = 0; e < extra; e++) pool.push(LW.u.pick(alphabet));
        pool = LW.u.shuffle(pool);

        tray = [];
        LW.u.clear(trayRow);
        pool.forEach(function (ch, i) {
          var t = el('button', { class: 'tile', text: ch });
          t.addEventListener('click', function () { addLetter(i); });
          trayRow.appendChild(t);
          tray.push({ node: t, letter: ch, used: false });
        });
      }

      function addLetter(i) {
        var t = tray[i];
        if (t.used) return;
        var slot = null;
        for (var s = 0; s < slots.length; s++) if (!slots[s].letter) { slot = slots[s]; break; }
        if (!slot) return;
        LW.sound.click();
        slot.letter = t.letter;
        slot.from = i;
        slot.node.textContent = t.letter;
        slot.node.classList.add('filled');
        t.used = true;
        t.node.classList.add('used');
        check();
      }

      function removeAt(i) {
        var slot = slots[i];
        if (!slot.letter) return;
        LW.sound.flip();
        var t = tray[slot.from];
        if (t) { t.used = false; t.node.classList.remove('used'); }
        slot.letter = null; slot.from = null;
        slot.node.textContent = '';
        slot.node.classList.remove('filled', 'bad');
      }

      function current() { return slots.map(function (s) { return s.letter || ' '; }).join(''); }

      function check() {
        var target = words[idx].en.toUpperCase().replace(/[^A-Z]/g, '');
        var val = current();
        if (val.indexOf(' ') !== -1) return;
        if (val === target) {
          LW.sound.correct();
          LW.speak(words[idx].en);
          slots.forEach(function (s) { s.node.classList.add('ok'); });
          score += 15; solved++;
          api.setScore(score);
          LW.confetti(30);
          setTimeout(nextRound, 950);
        } else {
          LW.sound.wrong();
          slots.forEach(function (s) { s.node.classList.add('bad'); });
          LW.u.shake(slotRow);
          setTimeout(function () {
            slots.forEach(function (s) { s.node.classList.remove('bad'); });
          }, 600);
        }
      }

      function hint() {
        var target = words[idx].en.toUpperCase().replace(/[^A-Z]/g, '');
        for (var i = 0; i < slots.length; i++) {
          if (slots[i].letter !== target.charAt(i)) {
            if (slots[i].letter) removeAt(i);
            var want = target.charAt(i);
            for (var t = 0; t < tray.length; t++) {
              if (!tray[t].used && tray[t].letter === want) {
                // place it directly into slot i
                var s = slots[i];
                s.letter = want; s.from = t;
                s.node.textContent = want;
                s.node.classList.add('filled', 'hinted');
                tray[t].used = true;
                tray[t].node.classList.add('used');
                hints++;
                score = Math.max(0, score - 5);
                api.setScore(score);
                LW.sound.flip();
                check();
                return;
              }
            }
            return;
          }
        }
      }

      function nextRound() {
        idx++;
        if (idx >= rounds) {
          timer.stop();
          api.finish(score, solved + ' / ' + rounds + ' words spelled, ' + hints + ' hint(s).');
          return;
        }
        render();
      }

      api.setScore(0);
      render();
      return function () { timer.stop(); };
    }
  });

  /* ============================================================
   *  ALPHABETICAL ORDER
   * ========================================================= */
  LW.registerGame({
    id: 'alphabet',
    name: 'ABC Order',
    emoji: '🔡',
    color: '#30b8a0',
    tag: 'dictionary skill',
    timeLabel: '90 seconds',
    pointsLabel: '25 per set · −3 per mistake',
    howto: 'Tap the words in alphabetical order, from A to Z. Watch the second letter when two words start the same!',
    howtoTh: 'แตะคำตามลำดับตัวอักษรจาก A ถึง Z ถ้าสองคำขึ้นต้นด้วยตัวอักษรเดียวกัน ให้ดูตัวอักษรตัวที่สอง!',

    mount: function (stage, api) {
      var perSet = LW.diff(5, 6, 8);
      var sets = 3;
      var setIdx = 0, score = 0, mistakes = 0;

      var counter = el('p', { class: 'stage-note' });
      var track = el('div', { class: 'abc-track' });
      var board = el('div', { class: 'abc-board' });
      stage.appendChild(counter);
      stage.appendChild(track);
      stage.appendChild(board);

      var timer = new LW.u.Timer(LW.diff(120, 90, 70), function (left) {
        api.setTimer('⏱ ' + LW.u.fmtTime(left), left <= 12);
      }, function () { api.finish(score, 'Time! ' + setIdx + ' set(s) completed.'); });
      timer.start();

      var expected = [], nextPos = 0;

      function render() {
        counter.textContent = 'Set ' + (setIdx + 1) + ' of ' + sets + ' — tap A → Z';
        var words = LW.words(perSet);
        expected = words.slice().sort(function (a, b) { return a.en.localeCompare(b.en); });
        nextPos = 0;

        LW.u.clear(track);
        expected.forEach(function (_, i) {
          track.appendChild(el('span', { class: 'abc-slot', text: String(i + 1) }));
        });

        LW.u.clear(board);
        LW.u.shuffle(words).forEach(function (w) {
          var b = el('button', { class: 'abc-card' }, [
            el('span', { class: 'ac-emoji', text: w.emoji }),
            el('span', { class: 'ac-word', text: w.en })
          ]);
          b.addEventListener('click', function () { tap(w, b); });
          board.appendChild(b);
        });
      }

      function tap(w, node) {
        if (node.classList.contains('done')) return;
        if (expected[nextPos] && expected[nextPos].en === w.en) {
          LW.sound.correct();
          LW.speak(w.en);
          node.classList.add('done');
          var slot = track.children[nextPos];
          if (slot) { slot.textContent = w.en; slot.classList.add('filled'); }
          nextPos++;
          if (nextPos === expected.length) {
            score += 25;
            api.setScore(score);
            LW.confetti(40);
            setTimeout(nextSet, 900);
          }
        } else {
          LW.sound.wrong();
          mistakes++;
          score = Math.max(0, score - 3);
          api.setScore(score);
          node.classList.add('bad');
          LW.u.shake(node);
          setTimeout(function () { node.classList.remove('bad'); }, 500);
        }
      }

      function nextSet() {
        setIdx++;
        if (setIdx >= sets) {
          timer.stop();
          var bonus = timer.left;
          api.finish(score + bonus, 'All ' + sets + ' sets done with ' + mistakes + ' mistake(s). +' + bonus + ' time bonus.');
          return;
        }
        render();
      }

      api.setScore(0);
      render();
      return function () { timer.stop(); };
    }
  });
})(window.LW);
