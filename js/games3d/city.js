(function (LW) {
  'use strict';
  var el = function () { return LW.u.el.apply(null, arguments); };

  LW.registerGame({
    id: 'city',
    mode: 'hs',
    name: 'City Quest',
    emoji: '🏙️',
    color: '#2f8fd8',
    tag: 'speaking · real-life English',
    timeLabel: '6 minutes',
    pointsLabel: '10 per line · 15 per place · tourist quiz +5 · −3 wrong · −5 car or pickpocket · −3 too slow',
    howto: 'Visit every place on your list. Walk there (mind the traffic!), listen to what the person says and choose the best reply. A wrong reply costs points, and nobody waits forever — answer before the countdown ends. Watch out for the pickpocket while you wait at the kerb, and help the lost tourist for bonus points.',

    mount: function (stage, api) {
      var count = LW.diff(3, 4, 5);
      var quests = pickDistinct(LW.lesson.tiers('dialogues'), count);
      if (!quests.length) { api.finish(0, 'No dialogues available.'); return function () {}; }
      count = quests.length;

      var score = 0, wrong = 0, hits = 0, slow = 0, donePlaces = 0, finished = false, robbed = 0, scared = 0, tourists = 0;
      var current = null, step = 0, answered = false, walking = false;
      var stepTimer = null, stepLeft = 0;
      var STEP_SECONDS = LW.diff(30, 25, 20);
      var THIEF_DELAY = LW.diff(9000, 7000, 5500);

      var counter = el('p', { class: 'stage-note' });
      var places = el('div', { class: 'city-places' });
      var host = el('div', { class: 'gl-host sky' });
      var panel = el('div', { class: 'city-panel' });
      var feedback = el('p', { class: 'feedback' });
      stage.appendChild(counter);
      stage.appendChild(places);
      stage.appendChild(host);
      stage.appendChild(panel);
      stage.appendChild(feedback);

      var timer = new LW.u.Timer(LW.diff(420, 360, 300), function (left) {
        api.setTimer('⏱ ' + LW.u.fmtTime(left), left <= 30);
      }, function () { end('Time! ' + donePlaces + ' place(s) visited.'); });

      var scene = LW.hs3d ? LW.hs3d.create('city', host, { onPlace: goTo, onHit: hitByCar, onKerb: atKerb, onCross: crossing, onThief: shooThief }, { places: quests.map(function (q) { return { id: q.id, place: q.place, title: q.title, emoji: q.emoji, npcEmoji: q.npc && q.npc.emoji }; }) }) : null;
      if (!scene) {
        host.classList.add('flat');
        host.appendChild(el('p', { class: 'flat-note', text: 'The 3D town needs WebGL — pick a place from the list above.' }));
      }

      function renderPlaces() {
        LW.u.clear(places);
        quests.forEach(function (q) {
          var b = el('button', { class: 'city-place' + (q.done ? ' done' : current === q ? ' active' : ''), 'data-place': q.id, onclick: function () { goTo(q.id); } }, [
            el('span', { class: 'cp-emoji', text: q.done ? '✅' : q.emoji }),
            el('span', { class: 'cp-name', text: q.title })
          ]);
          places.appendChild(b);
        });
        counter.textContent = 'Places visited: ' + donePlaces + ' / ' + count;
      }

      function goTo(id) {
        if (finished || walking) return;
        var q = quests.filter(function (x) { return x.id === id; })[0];
        if (!q || q.done) return;
        if (current && !current.done && current !== q) { feedback.textContent = 'Finish the conversation first!'; return; }
        if (current === q) return;
        stopStepTimer();
        clearTourist();
        walking = true;
        current = q; step = 0;
        renderPlaces();
        LW.u.clear(panel);
        panel.appendChild(el('p', { class: 'esc-next', text: '🚶 Walking to the ' + q.title.toLowerCase() + '…' }));
        if (!scene) { walking = false; showStep(); return; }
        scene.walkTo(q.id).then(function () { walking = false; cancelThief(); if (!finished) showStep(); });
      }

      function hitByCar() {
        if (finished) return;
        hits++;
        score = Math.max(0, score - 5);
        api.setScore(score);
        LW.sound.timeUp();
        feedback.textContent = '🚗 Ouch! Hit by a car — back to the kerb. −5';
      }

      var thiefTimer = null, thiefStealTimer = null, thiefActive = false;
      function atKerb() {
        if (finished) return;
        LW.u.clear(panel);
        panel.appendChild(el('p', { class: 'esc-next', text: '🚦 Cars do not stop here. Wait for a gap, then cross!' }));
        panel.appendChild(el('div', { class: 'action-bar kerb-bar' }, [
          el('button', { class: 'btn primary cross-btn', html: '🏃 Cross now!', onclick: function () {
            if (scene && scene.cross()) crossing();
          } })
        ]));
        LW.speak('Look left, look right. Cross when it is safe.');
        cancelThief();
        thiefTimer = setTimeout(thiefApproach, THIEF_DELAY);
      }
      function crossing() {
        cancelThief();
        LW.u.clear(panel);
        panel.appendChild(el('p', { class: 'esc-next', text: '🏃 Crossing…' }));
      }

      function thiefApproach() {
        if (finished || thiefActive) return;
        thiefActive = true;
        var bar = panel.querySelector('.kerb-bar');
        if (bar) bar.appendChild(el('button', { class: 'btn warn-btn shoo-btn', html: '👋 Shoo the pickpocket!', onclick: function () { shooThief(); } }));
        feedback.textContent = '🕵️ A pickpocket is sneaking up on you! Shoo him or cross!';
        LW.sound.alarm();
        if (scene) scene.thief(true);
        thiefStealTimer = setTimeout(thiefSteal, 3400);
      }
      function thiefSteal() {
        if (!thiefActive) return;
        thiefActive = false;
        robbed++;
        score = Math.max(0, score - 5);
        api.setScore(score);
        LW.sound.wrong();
        feedback.textContent = '🕵️ Pickpocket! He took 5 points. กระเป๋าหาย!';
        if (scene) scene.thief(false, true);
        var b = panel.querySelector('.shoo-btn'); if (b) b.remove();
      }
      function shooThief() {
        if (!thiefActive) return;
        thiefActive = false;
        if (thiefStealTimer) { clearTimeout(thiefStealTimer); thiefStealTimer = null; }
        scared++;
        LW.sound.whoosh();
        feedback.textContent = '👋 You scared the pickpocket away!';
        if (scene) scene.thief(false);
        var b = panel.querySelector('.shoo-btn'); if (b) b.remove();
      }
      function cancelThief() {
        if (thiefTimer) { clearTimeout(thiefTimer); thiefTimer = null; }
        if (thiefStealTimer) { clearTimeout(thiefStealTimer); thiefStealTimer = null; }
        if (thiefActive) { thiefActive = false; if (scene) scene.thief(false); }
      }

      function showStep() {
        var s = current.steps[step];
        answered = false;
        LW.u.clear(panel);
        var who = el('div', { class: 'npc-line' }, [
          el('span', { class: 'npc-ava', text: current.npc.emoji }),
          el('div', { class: 'npc-bubble' }, [
            el('small', { text: current.npc.name + ' · ' + current.goal }),
            el('p', { text: s.npc }),
            el('button', { class: 'btn ghost-btn small', html: '🔊', onclick: function () { LW.speak(s.npc); } })
          ]),
          el('span', { class: 'npc-clock' })
        ]);
        var clock = who.querySelector('.npc-clock');
        panel.appendChild(who);
        var opts = el('div', { class: 'city-opts' });
        panel.appendChild(opts);
        LW.u.shuffle(s.options.slice()).forEach(function (o) {
          var b = el('button', { class: 'city-opt', text: o.text });
          b.addEventListener('click', function () { choose(o, b, opts); });
          opts.appendChild(b);
        });
        LW.speak(s.npc);
        startStepTimer(clock);
      }

      function choose(o, node, opts) {
        if (finished || node.disabled) return;
        if (o.ok) {
          stopStepTimer();
          node.classList.add('ok');
          Array.prototype.forEach.call(opts.children, function (c) { c.disabled = true; });
          var earned = !answered;
          if (earned) { score += 10; api.setScore(score); }
          answered = true;
          LW.sound.correct();
          LW.speak(o.text);
          feedback.textContent = '✔ ' + o.text;
          if (scene) scene.react(true, earned ? '+10' : '');
          setTimeout(nextStep, 1100);
        } else {
          node.classList.add('bad'); node.disabled = true;
          wrong++;
          answered = true;
          score = Math.max(0, score - 3);
          api.setScore(score);
          LW.sound.wrong();
          LW.u.shake(node);
          feedback.textContent = '✘ ' + (o.why || 'Not the best choice.') + ' (−3)';
          if (scene) scene.react(false, '−3');
        }
      }

      function nextStep() {
        step++;
        if (step >= current.steps.length) {
          current.done = true;
          donePlaces++;
          score += 15;
          api.setScore(score);
          LW.confetti(40);
          if (scene) scene.complete(current.id);
          renderPlaces();
          LW.u.clear(panel);
          if (donePlaces >= count) {
            feedback.textContent = '🎉 Every place visited!';
            setTimeout(function () { end('All ' + count + ' places done, ' + tourists + ' tourist(s) helped, ' + wrong + ' wrong line(s), ' + hits + ' accident(s), ' + robbed + ' pickpocket(s), ' + slow + ' late answer(s).'); }, 900);
          } else {
            feedback.textContent = '✅ ' + current.title + ' done! +15';
            current = null;
            touristQuiz();
          }
          return;
        }
        showStep();
      }

      var touristTimer = null;
      function touristQuiz() {
        var pool = LW.lesson.words();
        if (pool.length < 3) { panel.appendChild(el('p', { class: 'esc-next', text: 'Choose the next place on the map or in the list.' })); return; }
        var word = LW.wordsFrom(pool, 1)[0];
        var others = LW.u.sample(pool.filter(function (w) { return w.en !== word.en; }), 2);
        var opts = LW.u.shuffle([word].concat(others));
        var left = 10;
        var clock = el('span', { class: 'npc-clock', text: '⏳ ' + left });
        var box = el('div', { class: 'tourist' }, [
          el('div', { class: 'npc-line' }, [
            el('span', { class: 'npc-ava', text: '🧳' }),
            el('div', { class: 'npc-bubble' }, [
              el('small', { text: 'A lost tourist · bonus question' }),
              el('p', { text: 'Excuse me! Which word means: “' + word.hint + '”?' })
            ]),
            clock
          ])
        ]);
        var row = el('div', { class: 'city-opts' });
        opts.forEach(function (w) {
          var b = el('button', { class: 'city-opt', text: w.emoji + '  ' + w.en });
          b.addEventListener('click', function () {
            if (b.disabled) return;
            Array.prototype.forEach.call(row.children, function (c) { c.disabled = true; });
            clearTourist();
            if (w.en === word.en) {
              tourists++;
              score += 5;
              api.setScore(score);
              LW.sound.coin();
              b.classList.add('ok');
              feedback.textContent = '🧳 "Thank you!" +5 bonus';
              if (scene) scene.react(true, '+5 🧳');
            } else {
              score = Math.max(0, score - 2);
              api.setScore(score);
              LW.sound.wrong();
              b.classList.add('bad');
              feedback.textContent = '🧳 Hmm, it was "' + word.en + '". (−2)';
              if (scene) scene.react(false, '−2');
            }
            setTimeout(afterTourist, 1200);
          });
          row.appendChild(b);
        });
        box.appendChild(row);
        box.appendChild(el('div', { class: 'action-bar' }, [el('button', { class: 'btn ghost-btn small', text: 'Not now →', onclick: function () { clearTourist(); afterTourist(); } })]));
        panel.appendChild(box);
        if (scene) scene.tourist(true);
        LW.speak('Excuse me! Which word means ' + word.hint);
        touristTimer = setInterval(function () {
          left--;
          clock.textContent = '⏳ ' + left;
          clock.classList.toggle('danger', left <= 3);
          if (left <= 0) { clearTourist(); feedback.textContent = '🧳 The tourist wandered off.'; afterTourist(); }
        }, 1000);
      }
      function clearTourist() {
        if (touristTimer) { clearInterval(touristTimer); touristTimer = null; }
        if (scene) scene.tourist(false);
      }
      function afterTourist() {
        if (finished || current) return;
        LW.u.clear(panel);
        panel.appendChild(el('p', { class: 'esc-next', text: 'Choose the next place on the map or in the list.' }));
      }

      function startStepTimer(clock) {
        stopStepTimer();
        stepLeft = STEP_SECONDS;
        clock.textContent = '⏳ ' + stepLeft;
        stepTimer = setInterval(function () {
          stepLeft--;
          clock.textContent = '⏳ ' + stepLeft;
          clock.classList.toggle('danger', stepLeft <= 5);
          if (stepLeft <= 0) {
            stopStepTimer();
            slow++;
            score = Math.max(0, score - 3);
            api.setScore(score);
            LW.sound.wrong();
            var best = current.steps[step].options.filter(function (o) { return o.ok; })[0];
            feedback.textContent = '⏳ Too slow! The best reply was: "' + best.text + '" (−3)';
            if (scene) scene.react(false, '−3 ช้าไป!');
            setTimeout(nextStep, 1600);
          }
        }, 1000);
      }
      function stopStepTimer() { if (stepTimer) { clearInterval(stepTimer); stepTimer = null; } }

      function end(detail) {
        if (finished) return;
        finished = true;
        timer.stop();
        stopStepTimer();
        clearTourist();
        cancelThief();
        var bonus = donePlaces === count ? Math.floor(timer.left / 4) : 0;
        api.finish(score + bonus, detail + (bonus ? ' +' + bonus + ' time bonus.' : ''));
      }

      api.setScore(0);
      timer.start();
      renderPlaces();
      panel.appendChild(el('p', { class: 'esc-next', text: 'Pick a place on the map (or in the list) to start your quest.' }));

      return function () {
        timer.stop();
        stopStepTimer();
        clearTourist();
        cancelThief();
        if (scene) scene.dispose();
      };
    }
  });

  function pickDistinct(tiers, n) {
    var out = [], used = {};
    tiers.forEach(function (tier) {
      LW.u.shuffle(tier).forEach(function (d) {
        if (out.length >= n || used[d.place]) return;
        used[d.place] = true;
        out.push(Object.assign({}, d, { done: false }));
      });
    });
    return out;
  }
})(window.LW);
