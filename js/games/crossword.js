/* Game: CROSSWORD — auto-generated from the selected vocabulary packs */
(function (LW) {
  'use strict';
  var el = function () { return LW.u.el.apply(null, arguments); };

  /* ---------- generator ---------- */

  /* Length window for a word to be usable in a grid. The upper bound has to
     cover the longest word in data.js ("photography", "firefighter"),
     otherwise those two silently never appear in a puzzle. */
  var CW_MIN = 3, CW_MAX = 12;

  function buildLayout(candidates, maxWords) {
    var grid = {};
    var placed = [];

    function get(r, c) { return grid[r + ',' + c]; }
    function set(r, c, ch) { grid[r + ',' + c] = ch; }

    function canPlace(text, r, c, dir) {
      var dr = dir === 'down' ? 1 : 0, dc = dir === 'across' ? 1 : 0;
      if (get(r - dr, c - dc)) return -1;
      if (get(r + dr * text.length, c + dc * text.length)) return -1;
      var cross = 0;
      for (var i = 0; i < text.length; i++) {
        var rr = r + dr * i, cc = c + dc * i;
        var cur = get(rr, cc);
        if (cur) {
          if (cur !== text.charAt(i)) return -1;
          cross++;
        } else if (dir === 'across') {
          if (get(rr - 1, cc) || get(rr + 1, cc)) return -1;
        } else {
          if (get(rr, cc - 1) || get(rr, cc + 1)) return -1;
        }
      }
      return cross;
    }

    function place(entry, r, c, dir) {
      for (var i = 0; i < entry.text.length; i++) {
        set(r + (dir === 'down' ? i : 0), c + (dir === 'across' ? i : 0), entry.text.charAt(i));
      }
      placed.push({ entry: entry, r: r, c: c, dir: dir });
    }

    function bounds() {
      var r0 = Infinity, c0 = Infinity, r1 = -Infinity, c1 = -Infinity;
      Object.keys(grid).forEach(function (k) {
        var p = k.split(','), r = +p[0], c = +p[1];
        if (r < r0) r0 = r; if (r > r1) r1 = r;
        if (c < c0) c0 = c; if (c > c1) c1 = c;
      });
      return { r0: r0, c0: c0, r1: r1, c1: c1, h: r1 - r0 + 1, w: c1 - c0 + 1 };
    }

    place(candidates[0], 0, 0, 'across');

    for (var k = 1; k < candidates.length && placed.length < maxWords; k++) {
      var e = candidates[k];
      var best = null;
      for (var p = 0; p < placed.length; p++) {
        var pl = placed[p];
        var pdir = pl.dir === 'across' ? 'down' : 'across';
        for (var i = 0; i < pl.entry.text.length; i++) {
          var ch = pl.entry.text.charAt(i);
          var pr = pl.r + (pl.dir === 'down' ? i : 0);
          var pc = pl.c + (pl.dir === 'across' ? i : 0);
          for (var j = 0; j < e.text.length; j++) {
            if (e.text.charAt(j) !== ch) continue;
            var r = pdir === 'down' ? pr - j : pr;
            var c = pdir === 'across' ? pc - j : pc;
            var cross = canPlace(e.text, r, c, pdir);
            if (cross < 1) continue;
            var b = bounds();
            var nr0 = Math.min(b.r0, r), nc0 = Math.min(b.c0, c);
            var nr1 = Math.max(b.r1, r + (pdir === 'down' ? e.text.length - 1 : 0));
            var nc1 = Math.max(b.c1, c + (pdir === 'across' ? e.text.length - 1 : 0));
            var w = nc1 - nc0 + 1, h = nr1 - nr0 + 1;
            var sq = Math.abs(w - h);
            var score = cross * 14 - (w + h) - sq * 2;
            if (!best || score > best.score) best = { r: r, c: c, dir: pdir, score: score };
          }
        }
      }
      if (best) place(e, best.r, best.c, best.dir);
    }

    var b = bounds();
    placed.forEach(function (p) { p.r -= b.r0; p.c -= b.c0; });
    return { placed: placed, w: b.w, h: b.h };
  }

  function generate(pool, target) {
    var cleaned = [];
    var seen = {};
    pool.forEach(function (w) {
      var t = w.en.toUpperCase().replace(/[^A-Z]/g, '');
      if (t.length < CW_MIN || t.length > CW_MAX || seen[t]) return;
      seen[t] = true;
      cleaned.push({ text: t, hint: w.hint, emoji: w.emoji, th: w.th, en: w.en });
    });
    if (cleaned.length < 4) return null;

    var best = null;
    for (var attempt = 0; attempt < 40; attempt++) {
      var picked = LW.u.sample(cleaned, Math.min(target + 4, cleaned.length));
      picked.sort(function (a, b) { return b.text.length - a.text.length; });
      var layout = buildLayout(picked, target);
      var fit = layout.placed.length;
      /* Reward words placed, punish a sprawling grid — a compact square
         keeps the cells big enough to tap on a phone. */
      var span = Math.max(layout.w, layout.h);
      var score = fit * 40 - span * 6 - Math.abs(layout.w - layout.h) * 2;
      if (fit >= 4 && (!best || score > best.score)) best = { layout: layout, score: score };
      if (best && best.layout.placed.length >= target && Math.max(best.layout.w, best.layout.h) <= target + 3) break;
    }
    return best ? best.layout : null;
  }

  /* ---------- game ---------- */

  LW.registerGame({
    id: 'crossword',
    name: 'Crossword',
    emoji: '🧩',
    color: '#45b36b',
    tag: 'spelling',
    timeLabel: 'No limit',
    pointsLabel: '14 per word · −4 per hint',
    howto: 'Read the clue, then type the English word into the squares. Tap a clue to jump to it. Press CHECK when you are ready.',
    howtoTh: 'อ่านคำใบ้ แล้วพิมพ์คำภาษาอังกฤษลงในช่อง แตะที่คำใบ้เพื่อข้ามไปยังข้อนั้น เมื่อพร้อมแล้วกด CHECK',

    mount: function (stage, api) {
      var target = LW.diff(5, 7, 9);
      var layout = generate(LW.pool(), target);
      if (!layout) { api.finish(0, 'Could not build a crossword from these words — try more packs.'); return; }

      var W = layout.w, H = layout.h;
      var letters = {};     // "r,c" -> correct letter
      var cellRefs = {};    // "r,c" -> { input, across, down }
      layout.placed.forEach(function (p) {
        for (var i = 0; i < p.entry.text.length; i++) {
          var r = p.r + (p.dir === 'down' ? i : 0);
          var c = p.c + (p.dir === 'across' ? i : 0);
          letters[r + ',' + c] = p.entry.text.charAt(i);
        }
      });

      /* numbering */
      var starts = [];
      layout.placed.forEach(function (p) { starts.push(p); });
      starts.sort(function (a, b) { return (a.r - b.r) || (a.c - b.c); });
      var numberAt = {}, next = 1;
      starts.forEach(function (p) {
        var k = p.r + ',' + p.c;
        if (!numberAt[k]) numberAt[k] = next++;
        p.num = numberAt[k];
      });

      var solvedWords = {};
      var hintsUsed = 0;
      var activeDir = 'across';
      var activeWord = null;

      /* ---------- DOM ---------- */
      var wrap = el('div', { class: 'cw-wrap' });
      stage.appendChild(wrap);

      var gridEl = el('div', { class: 'cw-grid', style: { '--w': W, '--h': H } });
      wrap.appendChild(gridEl);

      for (var r = 0; r < H; r++) {
        for (var c = 0; c < W; c++) {
          var key = r + ',' + c;
          if (!letters[key]) { gridEl.appendChild(el('div', { class: 'cw-cell blank' })); continue; }
          var cell = el('div', { class: 'cw-cell' });
          if (numberAt[key]) cell.appendChild(el('span', { class: 'cw-num', text: String(numberAt[key]) }));
          var input = el('input', {
            class: 'cw-input', maxlength: 1, autocomplete: 'off', autocapitalize: 'characters',
            spellcheck: 'false', 'data-key': key
          });
          cell.appendChild(input);
          gridEl.appendChild(cell);
          cellRefs[key] = { input: input, cell: cell, across: null, down: null };
        }
      }

      layout.placed.forEach(function (p) {
        for (var i = 0; i < p.entry.text.length; i++) {
          var rr = p.r + (p.dir === 'down' ? i : 0);
          var cc = p.c + (p.dir === 'across' ? i : 0);
          cellRefs[rr + ',' + cc][p.dir] = p;
        }
      });

      /* clue lists */
      var across = layout.placed.filter(function (p) { return p.dir === 'across'; })
        .sort(function (a, b) { return a.num - b.num; });
      var down = layout.placed.filter(function (p) { return p.dir === 'down'; })
        .sort(function (a, b) { return a.num - b.num; });

      var cluesEl = el('div', { class: 'cw-clues' });
      wrap.appendChild(cluesEl);
      cluesEl.appendChild(clueList('Across  ⟶', across));
      cluesEl.appendChild(clueList('Down  ⟱', down));

      function clueList(title, list) {
        var box = el('div', { class: 'cw-cluebox' }, [el('h4', { text: title })]);
        list.forEach(function (p) {
          /* The picture and the translation give the answer away instantly,
             so they are an Easy-mode scaffold only. */
          var row = el('button', { class: 'cw-clue', 'data-id': p.dir + p.num }, [
            el('b', { text: p.num + '.' }),
            LW.scaffold() ? el('span', { class: 'cw-emoji', text: p.entry.emoji }) : null,
            el('span', { class: 'cw-text', text: p.entry.hint +
              (LW.scaffold() ? '  (' + p.entry.th + ')' : '') +
              '  [' + p.entry.text.length + ']' })
          ]);
          row.addEventListener('click', function () { focusWord(p); });
          p.clueNode = row;
          box.appendChild(row);
        });
        return box;
      }

      function focusWord(p) {
        activeDir = p.dir;
        activeWord = p;
        highlight();
        var ref = cellRefs[p.r + ',' + p.c];
        if (ref) ref.input.focus();
      }

      function highlight() {
        Object.keys(cellRefs).forEach(function (k) { cellRefs[k].cell.classList.remove('active'); });
        layout.placed.forEach(function (p) { if (p.clueNode) p.clueNode.classList.remove('active'); });
        if (!activeWord) return;
        if (activeWord.clueNode) activeWord.clueNode.classList.add('active');
        for (var i = 0; i < activeWord.entry.text.length; i++) {
          var rr = activeWord.r + (activeWord.dir === 'down' ? i : 0);
          var cc = activeWord.c + (activeWord.dir === 'across' ? i : 0);
          var ref = cellRefs[rr + ',' + cc];
          if (ref) ref.cell.classList.add('active');
        }
      }

      function move(key, delta) {
        var p = key.split(','), r = +p[0], c = +p[1];
        var rr = r + (activeDir === 'down' ? delta : 0);
        var cc = c + (activeDir === 'across' ? delta : 0);
        var ref = cellRefs[rr + ',' + cc];
        if (ref) { ref.input.focus(); ref.input.select(); }
      }

      Object.keys(cellRefs).forEach(function (key) {
        var ref = cellRefs[key];
        ref.input.addEventListener('focus', function () {
          var w = ref[activeDir] || ref.across || ref.down;
          if (w) { activeDir = w.dir; activeWord = w; highlight(); }
        });
        ref.input.addEventListener('click', function () {
          if (ref.across && ref.down) {
            activeDir = activeDir === 'across' ? 'down' : 'across';
            activeWord = ref[activeDir];
            highlight();
          }
        });
        ref.input.addEventListener('input', function () {
          var v = ref.input.value.toUpperCase().replace(/[^A-Z]/g, '');
          ref.input.value = v.slice(-1);
          ref.cell.classList.remove('wrong');
          if (ref.input.value) { LW.sound.click(); move(key, 1); }
          autoCheck();
        });
        ref.input.addEventListener('keydown', function (e) {
          if (e.key === 'Backspace' && !ref.input.value) { move(key, -1); e.preventDefault(); }
          else if (e.key === 'ArrowRight') { activeDir = 'across'; move(key, 1); e.preventDefault(); }
          else if (e.key === 'ArrowLeft') { activeDir = 'across'; move(key, -1); e.preventDefault(); }
          else if (e.key === 'ArrowDown') { activeDir = 'down'; move(key, 1); e.preventDefault(); }
          else if (e.key === 'ArrowUp') { activeDir = 'down'; move(key, -1); e.preventDefault(); }
          else if (e.key === ' ') {
            if (ref.across && ref.down) { activeDir = activeDir === 'across' ? 'down' : 'across'; activeWord = ref[activeDir]; highlight(); }
            e.preventDefault();
          }
        });
      });

      function readWord(p) {
        var out = '';
        for (var i = 0; i < p.entry.text.length; i++) {
          var rr = p.r + (p.dir === 'down' ? i : 0);
          var cc = p.c + (p.dir === 'across' ? i : 0);
          out += cellRefs[rr + ',' + cc].input.value || ' ';
        }
        return out;
      }

      function markSolved(p) {
        solvedWords[p.dir + p.num] = true;
        if (p.clueNode) p.clueNode.classList.add('solved');
        for (var i = 0; i < p.entry.text.length; i++) {
          var rr = p.r + (p.dir === 'down' ? i : 0);
          var cc = p.c + (p.dir === 'across' ? i : 0);
          var ref = cellRefs[rr + ',' + cc];
          ref.cell.classList.add('ok');
          ref.input.readOnly = true;
        }
      }

      function scoreNow() {
        return Math.max(0, Object.keys(solvedWords).length * 14 - hintsUsed * 4);
      }

      function autoCheck() {
        var changed = false;
        layout.placed.forEach(function (p) {
          if (solvedWords[p.dir + p.num]) return;
          if (readWord(p) === p.entry.text) { markSolved(p); LW.sound.correct(); LW.speak(p.entry.en); changed = true; }
        });
        if (changed) {
          api.setScore(scoreNow());
          progress.textContent = Object.keys(solvedWords).length + ' / ' + layout.placed.length + ' words solved';
          if (Object.keys(solvedWords).length === layout.placed.length) {
            LW.confetti(120);
            setTimeout(function () { api.finish(scoreNow() + 20, 'Whole crossword completed! +20 bonus.'); }, 900);
          }
        }
      }

      var progress = el('p', { class: 'stage-note', text: '0 / ' + layout.placed.length + ' words solved' });
      stage.appendChild(progress);

      var bar = el('div', { class: 'action-bar' }, [
        el('button', {
          class: 'btn ghost-btn', html: '💡 Hint letter (−4)',
          onclick: function () {
            /* Fall through to the next unsolved word — otherwise pressing
               Hint while a finished word is focused silently does nothing. */
            var unsolved = layout.placed.filter(function (p) { return !solvedWords[p.dir + p.num]; });
            var w = (activeWord && !solvedWords[activeWord.dir + activeWord.num]) ? activeWord : unsolved[0];
            if (!w) return;
            for (var i = 0; i < w.entry.text.length; i++) {
              var rr = w.r + (w.dir === 'down' ? i : 0);
              var cc = w.c + (w.dir === 'across' ? i : 0);
              var ref = cellRefs[rr + ',' + cc];
              if (ref.input.value !== w.entry.text.charAt(i)) {
                ref.input.value = w.entry.text.charAt(i);
                ref.cell.classList.add('hinted');
                hintsUsed++;
                LW.sound.flip();
                api.setScore(scoreNow());
                autoCheck();
                return;
              }
            }
          }
        }),
        el('button', {
          class: 'btn primary', html: '✓ Check',
          onclick: function () {
            var wrong = 0;
            layout.placed.forEach(function (p) {
              if (solvedWords[p.dir + p.num]) return;
              var val = readWord(p);
              if (val.indexOf(' ') !== -1) return;
              wrong++;
              for (var i = 0; i < p.entry.text.length; i++) {
                var rr = p.r + (p.dir === 'down' ? i : 0);
                var cc = p.c + (p.dir === 'across' ? i : 0);
                var ref = cellRefs[rr + ',' + cc];
                if (ref.input.value !== p.entry.text.charAt(i)) ref.cell.classList.add('wrong');
              }
            });
            if (wrong) LW.sound.wrong(); else LW.sound.click();
          }
        }),
        el('button', {
          class: 'btn warn-btn', html: '🏁 Finish',
          onclick: function () {
            api.finish(scoreNow(), Object.keys(solvedWords).length + ' of ' + layout.placed.length +
              ' words solved, ' + hintsUsed + ' hint(s) used.');
          }
        })
      ]);
      stage.appendChild(bar);

      api.setScore(0);
      if (layout.placed.length) focusWord(across[0] || down[0]);
    }
  });
})(window.LW);
