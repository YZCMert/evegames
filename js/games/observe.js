/* Games: What's Missing · Odd One Out · Flash Reveal */
(function (LW) {
  'use strict';
  var el = function () { return LW.u.el.apply(null, arguments); };

  /* ============================================================
   *  WHAT'S MISSING
   * ========================================================= */
  LW.registerGame({
    id: 'missing',
    name: "What's Missing",
    emoji: '🔍',
    color: '#e8453c',
    tag: 'observation',
    timeLabel: 'No limit',
    pointsLabel: '20 per correct answer',
    howto: 'Study the cards carefully. They disappear, one is removed, and the rest come back mixed up. Which word is missing?',
    howtoTh: 'จำการ์ดให้ดี การ์ดจะหายไปทั้งหมด แล้วมีหนึ่งใบถูกเอาออก ที่เหลือจะกลับมาแบบสลับตำแหน่ง คำไหนที่หายไป?',

    mount: function (stage, api) {
      var shown = LW.diff(5, 6, 8);
      var rounds = 4;
      var look = LW.diff(6, 5, 4);
      var r = 0, score = 0, correct = 0;

      var counter = el('p', { class: 'stage-note' });
      var phaseLine = el('h3', { class: 'phase-line' });
      var grid = el('div', { class: 'miss-grid' });
      var choices = el('div', { class: 'choice-row' });
      stage.appendChild(counter);
      stage.appendChild(phaseLine);
      stage.appendChild(grid);
      stage.appendChild(choices);

      var countdownTimer = null;

      function round() {
        LW.u.clear(choices);
        counter.textContent = 'Round ' + (r + 1) + ' of ' + rounds;
        var set = LW.words(shown);
        var missing = LW.u.pick(set);
        var left = set.filter(function (w) { return w.en !== missing.en; });

        var t = look;
        phaseLine.textContent = 'Memorise!  ' + t;
        LW.u.clear(grid);
        set.forEach(function (w) {
          grid.appendChild(el('div', { class: 'miss-card' }, [
            el('span', { class: 'mi-emoji', text: w.emoji }),
            el('span', { class: 'mi-word', text: w.en })
          ]));
        });

        countdownTimer = setInterval(function () {
          t--;
          if (t > 0) { phaseLine.textContent = 'Memorise!  ' + t; LW.sound.tick(); return; }
          clearInterval(countdownTimer); countdownTimer = null;
          reveal(left, missing, set);
        }, 1000);
      }

      function reveal(left, missing, set) {
        phaseLine.textContent = 'Which word disappeared?';
        LW.u.clear(grid);
        LW.u.shuffle(left).forEach(function (w) {
          grid.appendChild(el('div', { class: 'miss-card in' }, [
            el('span', { class: 'mi-emoji', text: w.emoji }),
            el('span', { class: 'mi-word', text: w.en })
          ]));
        });
        LW.sound.flip();

        var opts = LW.u.shuffle([missing].concat(LW.u.sample(left, 3)));
        LW.u.clear(choices);
        opts.forEach(function (w) {
          var b = el('button', { class: 'choice', text: w.en });
          b.addEventListener('click', function () { answer(w, missing, b); });
          choices.appendChild(b);
        });
      }

      function answer(w, missing, node) {
        Array.prototype.forEach.call(choices.children, function (c) { c.disabled = true; });
        if (w.en === missing.en) {
          LW.sound.correct();
          LW.speak(missing.en);
          node.classList.add('ok');
          score += 20; correct++;
          api.setScore(score);
          LW.confetti(26);
        } else {
          LW.sound.wrong();
          node.classList.add('bad');
          Array.prototype.forEach.call(choices.children, function (c) {
            if (c.textContent === missing.en) c.classList.add('ok');
          });
        }
        setTimeout(next, 1400);
      }

      function next() {
        r++;
        if (r >= rounds) { api.finish(score, correct + ' / ' + rounds + ' correct.'); return; }
        round();
      }

      api.setScore(0);
      round();
      return function () { if (countdownTimer) clearInterval(countdownTimer); };
    }
  });

  /* ============================================================
   *  ODD ONE OUT
   * ========================================================= */
  LW.registerGame({
    id: 'odd',
    name: 'Odd One Out',
    emoji: '🧐',
    color: '#b1793a',
    tag: 'categories',
    timeLabel: '90 seconds',
    pointsLabel: '15 correct · −5 wrong',
    howto: 'Three words belong to the same group. One does not. Tap the odd one out as fast as you can!',
    howtoTh: 'สามคำอยู่ในกลุ่มเดียวกัน อีกหนึ่งคำไม่ใช่ แตะคำที่แตกต่างให้เร็วที่สุด!',

    mount: function (stage, api) {
      var rounds = 6;
      var r = 0, score = 0, correct = 0, busy = false;

      var counter = el('p', { class: 'stage-note' });
      var phaseLine = el('h3', { class: 'phase-line', text: 'Which one does not belong?' });
      var grid = el('div', { class: 'odd-grid' });
      var feedback = el('p', { class: 'feedback' });
      stage.appendChild(counter);
      stage.appendChild(phaseLine);
      stage.appendChild(grid);
      stage.appendChild(feedback);

      var timer = new LW.u.Timer(LW.diff(120, 90, 60), function (left) {
        api.setTimer('⏱ ' + LW.u.fmtTime(left), left <= 12);
      }, function () { api.finish(score, correct + ' / ' + rounds + ' before time ran out.'); });
      timer.start();

      function round() {
        busy = false;
        feedback.textContent = '';
        counter.textContent = 'Round ' + (r + 1) + ' of ' + rounds;

        var packs = LW.activePacks();
        var mainPack, oddWord, trio;

        if (packs.length >= 2) {
          var two = LW.u.sample(packs, 2);
          mainPack = two[0];
          trio = LW.wordsFrom(mainPack.words, 3);
          oddWord = Object.assign({}, LW.wordsFrom(two[1].words, 1)[0], { packName: two[1].name });
        } else {
          mainPack = packs[0];
          trio = LW.wordsFrom(mainPack.words, 3);
          oddWord = LW.outsiderWords(1)[0];
        }
        trio = trio.map(function (w) { return Object.assign({}, w, { packName: mainPack.name }); });

        var items = LW.u.shuffle(trio.concat([oddWord]));
        LW.u.clear(grid);
        items.forEach(function (w) {
          var b = el('button', { class: 'odd-card' }, [
            el('span', { class: 'oc-emoji', text: w.emoji }),
            el('span', { class: 'oc-word', text: w.en })
          ]);
          b.addEventListener('click', function () { tap(w, b, oddWord, mainPack); });
          grid.appendChild(b);
        });
      }

      function tap(w, node, oddWord, mainPack) {
        if (busy) return;
        busy = true;
        Array.prototype.forEach.call(grid.children, function (c) { c.disabled = true; });
        if (w.en === oddWord.en) {
          LW.sound.correct();
          LW.speak(w.en);
          node.classList.add('ok');
          score += 15; correct++;
          feedback.textContent = 'Right! The others are all ' + mainPack.name + '.';
        } else {
          LW.sound.wrong();
          node.classList.add('bad');
          Array.prototype.forEach.call(grid.children, function (c) {
            if (c.querySelector('.oc-word').textContent === oddWord.en) c.classList.add('ok');
          });
          score = Math.max(0, score - 5);
          feedback.textContent = '"' + oddWord.en + '" was the odd one — it is ' + (oddWord.packName || 'from another group') + '.';
        }
        api.setScore(score);
        setTimeout(next, 1700);
      }

      function next() {
        r++;
        if (r >= rounds) {
          timer.stop();
          api.finish(score, correct + ' / ' + rounds + ' correct.');
          return;
        }
        round();
      }

      api.setScore(0);
      round();
      return function () { timer.stop(); };
    }
  });

  /* ============================================================
   *  FLASH REVEAL
   * ========================================================= */
  LW.registerGame({
    id: 'flash',
    name: 'Flash Reveal',
    emoji: '⚡',
    color: '#ef6fa0',
    tag: 'speed',
    timeLabel: '8 s per card',
    pointsLabel: 'Faster guess = more points',
    howto: 'The picture starts blurry and slowly becomes clear. Choose the right English word — the sooner you answer, the more points you win.',
    howtoTh: 'ภาพจะเบลอตอนเริ่มแล้วค่อย ๆ ชัดขึ้น เลือกคำภาษาอังกฤษที่ถูกต้อง ยิ่งตอบเร็วยิ่งได้คะแนนมาก!',

    mount: function (stage, api) {
      var rounds = 5;
      var reveal = 8;
      var r = 0, score = 0, correct = 0, busy = false;
      var startedAt = 0, roundTimer = null;

      var counter = el('p', { class: 'stage-note' });
      var card = el('div', { class: 'flash-card' }, [el('span', { class: 'flash-emoji' })]);
      var meter = el('div', { class: 'flash-meter' }, [el('i')]);
      var choices = el('div', { class: 'choice-row grid4' });
      stage.appendChild(counter);
      stage.appendChild(card);
      stage.appendChild(meter);
      stage.appendChild(choices);

      var emojiEl = card.querySelector('.flash-emoji');
      var meterBar = meter.querySelector('i');

      function round() {
        busy = false;
        counter.textContent = 'Card ' + (r + 1) + ' of ' + rounds;
        var set = LW.words(4);
        if (set.length < 4) { api.finish(score, 'Not enough words — add more packs.'); return; }
        var answerW = set[0];

        emojiEl.textContent = answerW.emoji;
        emojiEl.style.transition = 'none';
        emojiEl.style.filter = 'blur(34px)';
        meterBar.style.transition = 'none';
        meterBar.style.width = '100%';
        void emojiEl.offsetWidth;
        emojiEl.style.transition = 'filter ' + reveal + 's linear';
        emojiEl.style.filter = 'blur(0px)';
        meterBar.style.transition = 'width ' + reveal + 's linear';
        meterBar.style.width = '0%';

        startedAt = Date.now();

        LW.u.clear(choices);
        LW.u.shuffle(set).forEach(function (w) {
          var b = el('button', { class: 'choice', text: w.en });
          b.addEventListener('click', function () { answer(w, answerW, b); });
          choices.appendChild(b);
        });

        clearTimeout(roundTimer);
        roundTimer = setTimeout(function () {
          if (!busy) answer(null, answerW, null);
        }, reveal * 1000 + 1200);
      }

      function answer(w, answerW, node) {
        if (busy) return;
        busy = true;
        clearTimeout(roundTimer);
        emojiEl.style.transition = 'filter 0.25s ease';
        emojiEl.style.filter = 'blur(0px)';
        Array.prototype.forEach.call(choices.children, function (c) { c.disabled = true; });

        var elapsed = (Date.now() - startedAt) / 1000;
        if (w && w.en === answerW.en) {
          var pts = Math.max(6, Math.round(26 - elapsed * 2.4));
          score += pts; correct++;
          node.classList.add('ok');
          LW.sound.correct();
          LW.speak(answerW.en);
          LW.confetti(24);
        } else {
          LW.sound.wrong();
          if (node) node.classList.add('bad');
          Array.prototype.forEach.call(choices.children, function (c) {
            if (c.textContent === answerW.en) c.classList.add('ok');
          });
        }
        api.setScore(score);
        setTimeout(next, 1400);
      }

      function next() {
        r++;
        if (r >= rounds) { api.finish(score, correct + ' / ' + rounds + ' cards guessed.'); return; }
        round();
      }

      api.setScore(0);
      round();
      return function () { clearTimeout(roundTimer); };
    }
  });
})(window.LW);
