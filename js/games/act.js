/* Games: Act It Out (Mime / Draw / Describe / Back Writing) + Hot Seat */
(function (LW) {
  'use strict';
  var el = function () { return LW.u.el.apply(null, arguments); };

  var MODES = [
    { id: 'mime',     emoji: '🎭', name: 'Mime it',
      brief: 'Act the word with your body. No sounds, no words!',
      briefTh: 'แสดงท่าทางของคำนั้นด้วยร่างกาย ห้ามส่งเสียง ห้ามพูด!' },
    { id: 'draw',     emoji: '🖍️', name: 'Draw it',
      brief: 'Draw the word on the board. No letters, no numbers!',
      briefTh: 'วาดคำนั้นลงบนกระดาน ห้ามเขียนตัวอักษรหรือตัวเลข!' },
    { id: 'describe', emoji: '💬', name: 'Describe it',
      brief: 'Describe the word in English — but never say the word itself.',
      briefTh: 'อธิบายคำนั้นเป็นภาษาอังกฤษ แต่ห้ามพูดคำนั้นออกมา' },
    { id: 'back',     emoji: '✍️', name: 'Write on backs',
      brief: 'Write the word with your finger on the next player\'s back. The last player says it.',
      briefTh: 'ใช้นิ้วเขียนคำนั้นบนหลังของเพื่อนคนถัดไป คนสุดท้ายเป็นคนพูดคำนั้น' }
  ];

  LW.registerGame({
    id: 'act',
    name: 'Act It Out',
    emoji: '🎭',
    color: '#e8453c',
    tag: 'speaking',
    timeLabel: '60 seconds',
    pointsLabel: '10 per word guessed',
    howto: 'One player takes the device and sees a secret word. Mime it, draw it or describe it — the team shouts the English word. Tap ✔ for every correct guess.',
    howtoTh: 'ผู้เล่นคนหนึ่งถือเครื่องและดูคำลับ แล้วใบ้ด้วยท่าทาง วาดรูป หรืออธิบาย ให้ทีมตะโกนคำภาษาอังกฤษออกมา แตะ ✔ ทุกครั้งที่ทายถูก',

    mount: function (stage, api) {
      var mode = null;
      chooseMode();

      function chooseMode() {
        LW.u.clear(stage);
        stage.appendChild(el('h3', { class: 'phase-line', text: 'Choose how you will give the clue' }));
        var row = el('div', { class: 'mode-row' });
        stage.appendChild(row);
        MODES.forEach(function (m) {
          var b = el('button', { class: 'mode-card' }, [
            el('span', { class: 'mo-emoji', text: m.emoji }),
            el('span', { class: 'mo-name', text: m.name }),
            el('span', { class: 'mo-brief', text: LW.state.settings.showNative ? m.briefTh : m.brief })
          ]);
          b.addEventListener('click', function () { LW.sound.click(); mode = m; ready(); });
          row.appendChild(b);
        });
        stage.appendChild(el('button', {
          class: 'btn ghost-btn', html: '🎲 Surprise me',
          onclick: function () { LW.sound.click(); mode = LW.u.pick(MODES); ready(); }
        }));
      }

      function ready() {
        LW.u.clear(stage);
        stage.appendChild(el('div', { class: 'card ready-card' }, [
          el('div', { class: 'ready-emoji', text: mode.emoji }),
          el('h2', { text: mode.name }),
          el('p', { class: 'intro-rule', text: mode.brief }),
          LW.state.settings.showNative ? el('p', { class: 'intro-rule native', text: mode.briefTh }) : null,
          el('p', { class: 'warn-line', text: '👀 Only the performer should look at the screen!' }),
          LW.ui.bigButton('Start 60 seconds ▶', play)
        ]));
      }

      function play() {
        LW.u.clear(stage);
        /* Drawn without marking: a 60-second round only reaches a handful,
           so each word counts as practised when it is actually shown. */
        var words = LW.words(24, null, { mark: false });
        var i = 0, score = 0, got = 0, passed = 0;
        var revealed = false;

        var wordEl = el('div', { class: 'act-word' });
        var cover = el('button', { class: 'act-cover', html: '<span>👆 Tap to see your word</span>' });
        var cardBox = el('div', { class: 'act-card' }, [wordEl, cover]);
        stage.appendChild(cardBox);

        var canvasWrap = null, ctx = null, canvas = null;
        if (mode.id === 'draw') {
          canvas = el('canvas', { class: 'draw-canvas' });
          canvasWrap = el('div', { class: 'draw-wrap' }, [
            canvas,
            el('div', { class: 'draw-tools' }, [
              el('button', { class: 'tool', html: '🧽 Clear', onclick: function () { clearCanvas(); } })
            ])
          ]);
          stage.appendChild(canvasWrap);
          setupCanvas();
        }

        var tally = el('p', { class: 'stage-note', text: 'Guessed: 0' });
        stage.appendChild(tally);

        stage.appendChild(el('div', { class: 'action-bar big' }, [
          el('button', { class: 'btn warn-btn', html: '⏭ Pass', onclick: function () { passed++; LW.sound.wrong(); nextWord(); } }),
          el('button', { class: 'btn primary', html: '✔ Got it! +10', onclick: function () {
            got++; score += 10; api.setScore(score); tally.textContent = 'Guessed: ' + got;
            LW.sound.correct(); LW.confetti(18); nextWord();
          } })
        ]));

        cover.addEventListener('click', function () {
          revealed = true;
          cover.classList.add('hidden');
        });

        function nextWord() {
          i++;
          if (i >= words.length) { finish(); return; }
          showWord();
          if (canvas) clearCanvas();
        }

        function showWord() {
          var w = words[i];
          LW.markSeen(w);
          LW.u.clear(wordEl);
          wordEl.appendChild(el('span', { class: 'aw-emoji', text: w.emoji }));
          wordEl.appendChild(el('span', { class: 'aw-text', text: w.en }));
          if (LW.state.settings.showNative) wordEl.appendChild(el('span', { class: 'aw-th', text: w.th }));
          if (!revealed) cover.classList.remove('hidden');
        }

        var timer = new LW.u.Timer(60, function (left) {
          api.setTimer('⏱ ' + LW.u.fmtTime(left), left <= 10);
        }, finish);
        timer.start();

        var done = false;
        function finish() {
          if (done) return;
          done = true;
          timer.stop();
          api.finish(score, got + ' word(s) guessed, ' + passed + ' passed · ' + mode.name);
        }

        /* ---- drawing ---- */
        function setupCanvas() {
          function resize() {
            var rect = canvas.getBoundingClientRect();
            var dpr = window.devicePixelRatio || 1;
            canvas.width = Math.max(300, rect.width) * dpr;
            canvas.height = Math.max(200, rect.height) * dpr;
            ctx = canvas.getContext('2d');
            ctx.scale(dpr, dpr);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = 5;
            ctx.strokeStyle = '#2a2440';
          }
          setTimeout(resize, 30);
          window.addEventListener('resize', resize);

          var drawing = false;
          function pos(e) {
            var rect = canvas.getBoundingClientRect();
            var p = e.touches ? e.touches[0] : e;
            return { x: p.clientX - rect.left, y: p.clientY - rect.top };
          }
          function start(e) { drawing = true; var p = pos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); e.preventDefault(); }
          function moveTo(e) { if (!drawing) return; var p = pos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); e.preventDefault(); }
          function end() { drawing = false; }

          canvas.addEventListener('mousedown', start);
          canvas.addEventListener('mousemove', moveTo);
          window.addEventListener('mouseup', end);
          canvas.addEventListener('touchstart', start, { passive: false });
          canvas.addEventListener('touchmove', moveTo, { passive: false });
          canvas.addEventListener('touchend', end);
        }
        function clearCanvas() { if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height); }

        api.setScore(0);
        showWord();
      }
    }
  });

  /* ============================================================
   *  HOT SEAT — the team describes, one student guesses out loud
   * ========================================================= */
  LW.registerGame({
    id: 'hotseat',
    name: 'Hot Seat',
    emoji: '🔥',
    color: '#f0a92c',
    tag: 'speaking',
    timeLabel: '90 seconds',
    pointsLabel: '12 per word',
    howto: 'One student sits with their back to the board. The team describes the word in English — no translation, no spelling! The student in the hot seat guesses.',
    howtoTh: 'นักเรียนคนหนึ่งนั่งหันหลังให้กระดาน ทีมช่วยกันอธิบายคำเป็นภาษาอังกฤษ ห้ามแปลและห้ามสะกดคำ! คนที่นั่งเก้าอี้ร้อนเป็นคนทาย',

    mount: function (stage, api) {
      var words = LW.words(30, null, { mark: false });
      var i = 0, score = 0, got = 0, skipped = 0;

      var big = el('div', { class: 'hotseat-word' });
      stage.appendChild(el('p', { class: 'warn-line', text: '🙈 The guesser must NOT see the screen.' }));
      stage.appendChild(big);

      var hintLine = el('p', { class: 'hotseat-hint' });
      stage.appendChild(hintLine);

      var tally = el('p', { class: 'stage-note', text: 'Guessed: 0' });
      stage.appendChild(tally);

      stage.appendChild(el('div', { class: 'action-bar big' }, [
        el('button', { class: 'btn warn-btn', html: '⏭ Skip', onclick: function () { skipped++; LW.sound.wrong(); next(); } }),
        el('button', { class: 'btn primary', html: '✔ Correct! +12', onclick: function () {
          got++; score += 12; api.setScore(score); tally.textContent = 'Guessed: ' + got;
          LW.sound.correct(); LW.confetti(18); next();
        } })
      ]));

      var timer = new LW.u.Timer(LW.diff(120, 90, 60), function (left) {
        api.setTimer('⏱ ' + LW.u.fmtTime(left), left <= 10);
      }, finish);
      timer.start();

      function show() {
        var w = words[i];
        LW.markSeen(w);
        LW.u.clear(big);
        big.appendChild(el('span', { class: 'hs-emoji', text: w.emoji }));
        big.appendChild(el('span', { class: 'hs-text', text: w.en.toUpperCase() }));
        hintLine.textContent = 'Clue idea: ' + w.hint;
      }

      function next() {
        i++;
        if (i >= words.length) { finish(); return; }
        show();
      }

      var done = false;
      function finish() {
        if (done) return;
        done = true;
        timer.stop();
        api.finish(score, got + ' guessed, ' + skipped + ' skipped.');
      }

      api.setScore(0);
      show();
      return function () { timer.stop(); };
    }
  });
})(window.LW);
