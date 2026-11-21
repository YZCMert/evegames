/* Game: BINGO — listen to the word, find the picture */
(function (LW) {
  'use strict';
  var el = function () { return LW.u.el.apply(null, arguments); };

  LW.registerGame({
    id: 'bingo',
    name: 'Bingo',
    emoji: '🅱️',
    color: '#2f8fd8',
    tag: 'listening',
    timeLabel: 'No limit',
    pointsLabel: '8 per hit · +40 for a line',
    howto: 'A word is called out. Find the matching picture on your card and tap it. Complete a full line — across, down or diagonal — to shout BINGO!',
    howtoTh: 'จะมีการอ่านคำออกเสียง หารูปภาพที่ตรงกันบนการ์ดแล้วแตะ ทำให้ครบหนึ่งแถว แนวนอน แนวตั้ง หรือแนวทแยง แล้วตะโกนว่า BINGO!',

    mount: function (stage, api) {
      var pool = LW.pool();
      var want = LW.diff(3, 4, 5);
      var size = Math.min(want, Math.floor(Math.sqrt(pool.length)));
      if (size < 3) size = 3;
      var total = size * size;

      var cells = LW.words(total);
      if (cells.length < total) { api.finish(0, 'Not enough words — select more vocabulary packs.'); return; }

      var showLabels = LW.state.settings.difficulty === 'easy';

      var marked = [];
      for (var i = 0; i < total; i++) marked.push(false);

      var score = 0, hits = 0, misses = 0;
      var queue = LW.u.shuffle(cells.map(function (_, i) { return i; }));
      var current = null;
      var finished = false;

      /* ---- caller banner ---- */
      var callWord = el('span', { class: 'call-word', text: '—' });
      var callTr = el('span', { class: 'call-tr', text: '' });
      var banner = el('div', { class: 'bingo-caller' }, [
        el('div', { class: 'caller-left' }, [
          el('small', { text: 'The caller says…' }),
          callWord,
          callTr
        ]),
        el('button', {
          class: 'repeat-btn', html: '🔊', title: 'Say it again',
          onclick: function () { if (current !== null) LW.speak(cells[current].en); }
        })
      ]);
      stage.appendChild(banner);

      /* ---- card ---- */
      var card = el('div', { class: 'bingo-card', style: { '--n': size } });
      stage.appendChild(card);

      cells.forEach(function (w, idx) {
        var b = el('button', { class: 'bingo-cell' }, [
          el('span', { class: 'bc-emoji', text: w.emoji }),
          /* On Normal and Hard the card shows pictures only, so the students
             really have to understand the word they just heard. */
          showLabels ? el('span', { class: 'bc-word', text: w.en }) : null,
          el('span', { class: 'bc-stamp', text: '✔' })
        ]);
        b.addEventListener('click', function () { tap(idx, b); });
        card.appendChild(b);
      });

      var note = el('p', { class: 'stage-note', text: 'Marked 0 / ' + total });
      stage.appendChild(note);

      var unfit = LW.u.fitGrid(card, size, size, 1, 72);

      function nextCall() {
        if (finished) return;
        if (!queue.length) { endGame('All words called.'); return; }
        current = queue.shift();
        while (marked[current] && queue.length) current = queue.shift();
        if (marked[current]) { endGame('All words called.'); return; }
        callWord.textContent = cells[current].en.toUpperCase();
        callTr.textContent = LW.scaffold() ? cells[current].th : '';
        banner.classList.remove('pop'); void banner.offsetWidth; banner.classList.add('pop');
        LW.speak(cells[current].en);
      }

      function tap(idx, node) {
        if (finished || current === null || marked[idx]) return;
        if (idx === current) {
          LW.sound.correct();
          marked[idx] = true;
          node.classList.add('marked');
          hits++; score += 8;
          api.setScore(score);
          note.textContent = 'Marked ' + hits + ' / ' + total;
          var line = findLine();
          if (line) { bingo(line); return; }
          if (hits === total) { endGame('Full house! Every square marked.'); return; }
          setTimeout(nextCall, 450);
        } else {
          LW.sound.wrong();
          misses++;
          score = Math.max(0, score - 3);
          api.setScore(score);
          node.classList.add('bad');
          LW.u.shake(node);
          setTimeout(function () { node.classList.remove('bad'); }, 500);
        }
      }

      function idx(r, c) { return r * size + c; }

      function findLine() {
        var r, c, ok, line;
        for (r = 0; r < size; r++) {
          ok = true; line = [];
          for (c = 0; c < size; c++) { line.push(idx(r, c)); if (!marked[idx(r, c)]) ok = false; }
          if (ok) return line;
        }
        for (c = 0; c < size; c++) {
          ok = true; line = [];
          for (r = 0; r < size; r++) { line.push(idx(r, c)); if (!marked[idx(r, c)]) ok = false; }
          if (ok) return line;
        }
        ok = true; line = [];
        for (r = 0; r < size; r++) { line.push(idx(r, r)); if (!marked[idx(r, r)]) ok = false; }
        if (ok) return line;
        ok = true; line = [];
        for (r = 0; r < size; r++) { line.push(idx(r, size - 1 - r)); if (!marked[idx(r, size - 1 - r)]) ok = false; }
        if (ok) return line;
        return null;
      }

      function bingo(line) {
        finished = true;
        score += 40;
        api.setScore(score);
        line.forEach(function (i) { card.children[i].classList.add('line'); });
        callWord.textContent = 'B I N G O !';
        callTr.textContent = '';
        LW.sound.win();
        LW.confetti(120);
        setTimeout(function () {
          api.finish(score, 'BINGO with ' + hits + ' hits and ' + misses + ' miss(es).');
        }, 1600);
      }

      function endGame(msg) {
        if (finished) return;
        finished = true;
        setTimeout(function () { api.finish(score, msg); }, 500);
      }

      api.setScore(0);
      setTimeout(nextCall, 600);

      return unfit;
    }
  });
})(window.LW);
