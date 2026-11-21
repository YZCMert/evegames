(function (LW) {
  'use strict';
  var el = function () { return LW.u.el.apply(null, arguments); };

  function vocabQ(pool) {
    var w = LW.wordsFrom(pool, 1)[0];
    if (!w) return null;
    var others = LW.u.sample(pool.filter(function (x) { return x.en !== w.en; }), 3);
    return {
      type: 'vocab', emoji: '📖',
      prompt: 'Which word means: “' + w.hint + '”?',
      speak: 'Which word means ' + w.hint,
      options: LW.u.shuffle([w].concat(others)).map(function (x) { return { text: x.emoji + '  ' + x.en, ok: x.en === w.en }; }),
      explain: w.emoji + ' ' + w.en
    };
  }

  function gapQ(g) {
    return {
      type: 'gap', emoji: '✏️',
      prompt: g.prompt,
      speak: g.prompt.replace(/_+/g, 'blank'),
      options: LW.u.shuffle(g.options.map(function (o, k) { return { text: o, ok: k === g.answer }; })),
      explain: g.rule
    };
  }

  function pairQ(set) {
    var p = LW.u.pick(set.pairs);
    var others = LW.u.sample(set.pairs.filter(function (x) { return x !== p; }), 3).map(function (x) { return x[1]; });
    return {
      type: 'pair', emoji: '🔗',
      prompt: set.title + ' — what goes with “' + p[0] + '”?',
      speak: 'What goes with ' + p[0],
      options: LW.u.shuffle([p[1]].concat(others)).map(function (t) { return { text: t, ok: t === p[1] }; }),
      explain: p[0] + ' + ' + p[1]
    };
  }

  LW.HSQuiz = {
    deck: function (n) {
      var pool = LW.lesson.words();
      var gapBank = LW.lesson.ordered('gaps');
      var gaps = gapBank.slice();
      var sets = LW.lesson.ordered('pairs'), pi = 0;
      var kinds = ['vocab', 'gap', 'pair'];
      var out = [];
      for (var i = 0; out.length < n && i < n * 3; i++) {
        var k = kinds[i % 3], q = null;
        if (k === 'gap' && !gaps.length && gapBank.length) gaps = LW.u.shuffle(gapBank.slice());
        if (k === 'vocab' && pool.length >= 4) q = vocabQ(pool);
        else if (k === 'gap' && gaps.length) q = gapQ(gaps.shift());
        else if (k === 'pair' && sets.length) q = pairQ(sets[pi++ % sets.length]);
        if (q) out.push(q);
      }
      return out;
    },

    render: function (host, q, o) {
      o = o || {};
      LW.u.clear(host);
      var seconds = o.seconds || 12, left = seconds, done = false, timer = null;
      var okText = (q.options.filter(function (x) { return x.ok; })[0] || {}).text;
      var clock = el('span', { class: 'quiz-clock', text: '⏳ ' + left });
      var head = el('div', { class: 'quiz-head' }, [
        o.who ? el('span', { class: 'quiz-who', style: { '--tc': o.who.color }, text: o.who.avatar + ' ' + o.who.name }) : null,
        el('span', { class: 'quiz-kind', text: q.emoji }),
        clock
      ]);
      var prompt = el('p', { class: 'quiz-prompt', text: q.prompt });
      var opts = el('div', { class: 'quiz-opts' });
      function lock(reveal) {
        Array.prototype.forEach.call(opts.children, function (c) { c.disabled = true; if (reveal && c.textContent === okText) c.classList.add('ok'); });
      }
      function stopClock() { if (timer) { clearInterval(timer); timer = null; } }
      q.options.forEach(function (opt) {
        var b = el('button', { class: 'quiz-opt', text: opt.text });
        b.addEventListener('click', function () {
          if (done || b.disabled) return;
          done = true;
          stopClock();
          b.classList.add(opt.ok ? 'ok' : 'bad');
          lock(!opt.ok);
          o.onAnswer && o.onAnswer(!!opt.ok, opt, seconds - left);
        });
        opts.appendChild(b);
      });
      host.appendChild(head);
      host.appendChild(prompt);
      host.appendChild(opts);
      if (q.speak && o.speak !== false) LW.speak(q.speak);
      timer = setInterval(function () {
        left--;
        clock.textContent = '⏳ ' + Math.max(0, left);
        clock.classList.toggle('danger', left <= 3);
        if (left <= 0) {
          stopClock();
          if (done) return;
          done = true;
          lock(true);
          o.onTimeout && o.onTimeout();
        }
      }, 1000);
      return { stop: function () { done = true; stopClock(); } };
    }
  };
})(window.LW);
