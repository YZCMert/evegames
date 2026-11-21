/* Games: Mix & Match  +  Memory Test */
(function (LW) {
  'use strict';
  var el = function () { return LW.u.el.apply(null, arguments); };

  /* ============================================================
   *  1. MIX & MATCH — picture column ↔ word column
   * ========================================================= */
  LW.registerGame({
    id: 'match',
    name: 'Mix & Match',
    emoji: '🔀',
    color: '#4a90d9',
    tag: 'vocabulary',
    timeLabel: '75 seconds',
    pointsLabel: '10 per pair + time bonus',
    howto: 'Tap a picture, then tap the English word that goes with it. Clear the board before the timer runs out!',
    howtoTh: 'แตะที่รูปภาพ แล้วแตะคำภาษาอังกฤษที่ตรงกัน จับคู่ให้ครบทุกคู่ก่อนหมดเวลา!',

    mount: function (stage, api) {
      var count = LW.diff(5, 6, 8);
      var words = LW.words(count);
      count = words.length;

      var score = 0, solved = 0;
      var leftSel = null, rightSel = null, lock = false;

      var board = el('div', { class: 'match-board' });
      var leftCol = el('div', { class: 'match-col' });
      var rightCol = el('div', { class: 'match-col' });
      board.appendChild(leftCol);
      board.appendChild(rightCol);
      stage.appendChild(board);

      var leftItems = LW.u.shuffle(words);
      var rightItems = LW.u.shuffle(words);

      leftItems.forEach(function (w) {
        var b = el('button', { class: 'match-card pic', 'data-en': w.en }, [
          el('span', { class: 'mc-emoji', text: w.emoji }),
          LW.scaffold() ? el('span', { class: 'mc-th', text: w.th }) : null
        ]);
        b.addEventListener('click', function () { choose('left', b, w); });
        leftCol.appendChild(b);
      });

      rightItems.forEach(function (w) {
        var b = el('button', { class: 'match-card word', 'data-en': w.en }, [
          el('span', { class: 'mc-word', text: w.en })
        ]);
        b.addEventListener('click', function () { choose('right', b, w); });
        rightCol.appendChild(b);
      });

      function clearSel(side) {
        var s = side === 'left' ? leftSel : rightSel;
        if (s) s.node.classList.remove('sel');
        if (side === 'left') leftSel = null; else rightSel = null;
      }

      function choose(side, node, w) {
        if (lock || node.classList.contains('done')) return;
        LW.sound.click();
        var cur = side === 'left' ? leftSel : rightSel;
        if (cur && cur.node === node) { clearSel(side); return; }
        clearSel(side);
        node.classList.add('sel');
        if (side === 'left') { leftSel = { node: node, w: w }; LW.speak(w.en); }
        else { rightSel = { node: node, w: w }; LW.speak(w.en); }
        if (leftSel && rightSel) evaluate();
      }

      function evaluate() {
        lock = true;
        var a = leftSel, b = rightSel;
        if (a.w.en === b.w.en) {
          LW.sound.correct();
          a.node.classList.add('done'); b.node.classList.add('done');
          a.node.classList.remove('sel'); b.node.classList.remove('sel');
          leftSel = rightSel = null;
          solved++; score += 10;
          api.setScore(score);
          lock = false;
          if (solved === count) win();
        } else {
          LW.sound.wrong();
          a.node.classList.add('bad'); b.node.classList.add('bad');
          LW.u.shake(a.node); LW.u.shake(b.node);
          setTimeout(function () {
            a.node.classList.remove('bad', 'sel');
            b.node.classList.remove('bad', 'sel');
            leftSel = rightSel = null;
            lock = false;
          }, 620);
        }
      }

      var seconds = LW.diff(95, 75, 55);
      var timer = new LW.u.Timer(seconds, function (left) {
        api.setTimer('⏱ ' + LW.u.fmtTime(left), left <= 10);
      }, function () {
        api.finish(score, solved + ' / ' + count + ' pairs matched before time ran out.');
      });
      timer.start();

      function win() {
        timer.stop();
        var bonus = timer.left * 2;
        LW.confetti(80);
        api.setTimer('⏱ ' + LW.u.fmtTime(timer.left), false);
        setTimeout(function () {
          api.finish(score + bonus, 'All ' + count + ' pairs! +' + bonus + ' time bonus.');
        }, 700);
      }

      return function () { timer.stop(); };
    }
  });

  /* ============================================================
   *  2. MEMORY TEST — flip cards, match picture with word
   * ========================================================= */
  LW.registerGame({
    id: 'memory',
    name: 'Memory Test',
    emoji: '🧠',
    color: '#9b5de5',
    tag: 'memory',
    timeLabel: 'No limit',
    pointsLabel: '100 − 4 per mistake',
    howto: 'All cards are face down. Turn two cards over and try to find a picture and its English word. Remember what you saw!',
    howtoTh: 'การ์ดทุกใบคว่ำอยู่ พลิกทีละสองใบเพื่อจับคู่รูปภาพกับคำภาษาอังกฤษ จำให้ดีว่าเห็นอะไรตรงไหน!',

    mount: function (stage, api) {
      var pairs = LW.diff(5, 6, 8);
      var words = LW.words(pairs);
      pairs = words.length;

      var deck = [];
      words.forEach(function (w) {
        deck.push({ key: w.en, face: w.emoji, kind: 'pic', w: w });
        deck.push({ key: w.en, face: w.en, kind: 'word', w: w });
      });
      deck = LW.u.shuffle(deck);

      var mistakes = 0, found = 0, lock = false;
      var first = null;
      var cols = pairs > 6 ? 4 : (pairs > 4 ? 4 : 3);

      var grid = el('div', { class: 'memory-grid', style: { '--cols': cols } });
      stage.appendChild(grid);

      var statusLine = el('p', { class: 'stage-note', text: 'Pairs found: 0 / ' + pairs });
      stage.appendChild(statusLine);

      var unfit = LW.u.fitGrid(grid, cols, Math.ceil(deck.length / cols), 0.75, 72);

      deck.forEach(function (c) {
        var inner = el('span', { class: 'mem-inner' }, [
          el('span', { class: 'mem-back', text: '?' }),
          el('span', { class: 'mem-front ' + c.kind, text: c.face })
        ]);
        var card = el('button', { class: 'mem-card' }, [inner]);
        c.node = card;
        card.addEventListener('click', function () { flip(c); });
        grid.appendChild(card);
      });

      api.setScore(100);

      function flip(c) {
        if (lock || c.node.classList.contains('open') || c.node.classList.contains('done')) return;
        LW.sound.flip();
        c.node.classList.add('open');
        if (c.kind === 'word') LW.speak(c.w.en);

        if (!first) { first = c; return; }

        lock = true;
        if (first.key === c.key && first !== c) {
          LW.sound.correct();
          LW.speak(c.w.en);
          first.node.classList.add('done');
          c.node.classList.add('done');
          found++;
          statusLine.textContent = 'Pairs found: ' + found + ' / ' + pairs;
          first = null; lock = false;
          if (found === pairs) finish();
        } else {
          LW.sound.wrong();
          mistakes++;
          api.setScore(Math.max(20, 100 - mistakes * 4));
          var a = first, b = c;
          setTimeout(function () {
            a.node.classList.remove('open');
            b.node.classList.remove('open');
            first = null; lock = false;
          }, 820);
        }
      }

      function finish() {
        LW.confetti(90);
        setTimeout(function () {
          api.finish(Math.max(20, 100 - mistakes * 4), 'Finished with ' + mistakes + ' wrong turn(s).');
        }, 800);
      }

      return unfit;
    }
  });
})(window.LW);
