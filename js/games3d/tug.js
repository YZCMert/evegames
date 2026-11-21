(function (LW) {
  'use strict';
  var el = function () { return LW.u.el.apply(null, arguments); };

  LW.registerGame({
    id: 'tug',
    mode: 'hs',
    team: true,
    name: 'Tug of War',
    emoji: '💪',
    color: '#c0392b',
    tag: 'two sides · grammar & vocabulary',
    timeLabel: '5 minutes',
    pointsLabel: '5 per correct answer · 25 to every team on the side that wins a round · best of three',
    howto: 'The class splits into two sides, Red and Blue. Sides take turns answering. A right answer pulls the rope one step your way — answer fast and it pulls two, and three right answers in a row for your side is a mega heave. A wrong or slow answer hands the other side a free pull. Drag the flag past your line to win the round. Best of three.',

    mount: function (stage, api) {
      var teams = LW.state.teams.length ? LW.state.teams.slice() : [{ id: 'solo', name: 'Team', avatar: '💪', color: '#e8453c', score: 0 }];
      var sides = [
        { id: 'red', name: 'Red', emoji: '🔴', color: '#e8453c', teams: [], next: 0, streak: 0, rounds: 0 },
        { id: 'blue', name: 'Blue', emoji: '🔵', color: '#2f8fd8', teams: [], next: 0, streak: 0, rounds: 0 }
      ];
      teams.forEach(function (t, i) { sides[i % 2].teams.push(t); });
      var cpu = !sides[1].teams.length;
      var LIMIT = LW.diff(3, 4, 5);
      var SECONDS = LW.diff(15, 12, 10);
      var MAX_Q = LW.diff(12, 14, 16);
      var FAST = Math.ceil(SECONDS * 0.4);
      var deck = LW.HSQuiz.deck(70);
      if (!deck.length) { api.finish(0, 'No questions available.'); return function () {}; }
      var rec = {};
      teams.forEach(function (t) { rec[t.id] = { team: t, points: 0, correct: 0, wrong: 0 }; });
      var rope = 0, side = 0, round = 1, qInRound = 0, qIndex = 0, finished = false, quiz = null, pending = null;

      var counter = el('p', { class: 'stage-note' });
      var sidesRow = el('div', { class: 'sides-row' });
      var ropeBar = el('div', { class: 'rope-bar' });
      var host = el('div', { class: 'gl-host sky' });
      var panel = el('div', { class: 'quiz-panel' });
      var feedback = el('p', { class: 'feedback' });
      stage.appendChild(counter);
      stage.appendChild(sidesRow);
      stage.appendChild(ropeBar);
      stage.appendChild(host);
      stage.appendChild(panel);
      stage.appendChild(feedback);

      var timer = new LW.u.Timer(LW.diff(360, 300, 240), function (left) {
        api.setTimer('⏱ ' + LW.u.fmtTime(left), left <= 30);
      }, function () {
        if (sides[0].rounds === sides[1].rounds && rope !== 0) {
          var w = sides[rope < 0 ? 0 : 1];
          w.rounds++;
          w.teams.forEach(function (t) { rec[t.id].points += 25; });
        }
        end('Time!');
      });

      var scene = LW.hs3d ? LW.hs3d.create('tug', host, {}, {
        sides: sides.map(function (s) { return { id: s.id, name: s.name, color: s.color, teams: s.teams.map(function (t) { return { id: t.id, name: t.name, avatar: t.avatar, color: t.color }; }) }; }),
        limit: LIMIT
      }) : null;
      if (!scene) {
        host.classList.add('flat');
        host.appendChild(el('p', { class: 'flat-note', text: 'The 3D field needs WebGL — watch the rope above.' }));
      }

      function hud() { api.setScore(sides[0].emoji + ' ' + sides[0].rounds + ' – ' + sides[1].rounds + ' ' + sides[1].emoji); }

      function drawSides(active) {
        LW.u.clear(sidesRow);
        sides.forEach(function (s, i) {
          var card = el('div', { class: 'side-card ' + s.id + (active === i ? ' active' : ''), style: { '--tc': s.color } });
          card.appendChild(el('div', { class: 'side-head' }, [
            el('span', { class: 'side-name', text: s.emoji + ' ' + s.name + ' side' }),
            el('span', { class: 'side-rounds', text: '🏆'.repeat(s.rounds) || '–' })
          ]));
          var list = el('div', { class: 'side-teams' });
          if (!s.teams.length) list.appendChild(el('span', { class: 'side-team', text: '🌊 The river' }));
          s.teams.forEach(function (t) {
            list.appendChild(el('span', { class: 'side-team', style: { '--tc': t.color }, text: t.avatar + ' ' + t.name + ' · ' + rec[t.id].points }));
          });
          card.appendChild(list);
          sidesRow.appendChild(card);
        });
      }

      function drawRope() {
        LW.u.clear(ropeBar);
        ropeBar.appendChild(el('span', { class: 'rope-end red', text: '🔴' }));
        for (var i = -LIMIT; i <= LIMIT; i++) {
          var cls = 'rope-cell' + (i === rope ? ' here' : '') + (Math.abs(i) === LIMIT ? ' line' : '') + (i === 0 ? ' mid' : '');
          ropeBar.appendChild(el('span', { class: cls, text: i === rope ? '🚩' : Math.abs(i) === LIMIT ? '|' : '━' }));
        }
        ropeBar.appendChild(el('span', { class: 'rope-end blue', text: '🔵' }));
      }

      function other() { return sides[1 - side]; }

      function ask() {
        if (finished) return;
        var s = sides[side];
        if (cpu && side === 1) { riverTurn(); return; }
        var t = s.teams[s.next % s.teams.length];
        s.next++;
        var q = deck[qIndex++ % deck.length];
        counter.textContent = 'Round ' + round + ' · question ' + (qInRound + 1) + ' of ' + MAX_Q + ' · ' + s.name + ' side pulls';
        drawSides(side);
        drawRope();
        if (scene) scene.turn(s.id, t.id);
        quiz = LW.HSQuiz.render(panel, q, {
          who: t, seconds: SECONDS,
          onAnswer: function (ok, opt, elapsed) { answer(s, t, ok, q, elapsed); },
          onTimeout: function () {
            s.streak = 0;
            LW.sound.timeUp();
            feedback.textContent = '⏳ Too slow! It was: ' + q.explain + ' — free pull for ' + other().name + '!';
            pull(1 - side, 1, 'free pull');
            after();
          }
        });
      }

      function riverTurn() {
        counter.textContent = 'Round ' + round + ' · the river pulls back';
        drawSides(1);
        LW.u.clear(panel);
        panel.appendChild(el('p', { class: 'esc-next', text: '🌊 The river heaves…' }));
        var pulled = Math.random() < 0.5;
        feedback.textContent = pulled ? '🌊 The river pulls one step!' : '🌊 The river rests this turn.';
        if (pulled) pull(1, 1, '🌊');
        after();
      }

      function answer(s, t, ok, q, elapsed) {
        var r = rec[t.id];
        if (ok) {
          r.correct++; r.points += 5; s.streak++;
          var fast = elapsed <= FAST;
          var power = 1 + (fast ? 1 : 0) + (s.streak >= 3 ? 1 : 0);
          var label = power >= 3 ? 'MEGA HEAVE! +' + power : power === 2 ? (fast ? 'Fast heave! +2' : 'Heave! +2') : '+1';
          LW.sound.correct();
          feedback.textContent = '✔ ' + q.explain + ' — ' + s.name + ' pulls ' + power + (power >= 3 ? '! 💪 Mega heave!' : fast ? '! ⚡ Fast!' : '.');
          pull(side, power, label);
        } else {
          r.wrong++; s.streak = 0;
          LW.sound.wrong();
          feedback.textContent = '✘ ' + q.explain + ' — free pull for ' + other().name + '!';
          pull(1 - side, 1, 'free pull');
        }
        drawSides(side);
        after();
      }

      function pull(toSide, n, label) {
        rope = Math.max(-LIMIT, Math.min(LIMIT, rope + (toSide === 0 ? -n : n)));
        drawRope();
        if (scene) scene.pull(rope / LIMIT, sides[toSide].id, n, label);
      }

      function after() {
        qInRound++;
        if (Math.abs(rope) >= LIMIT) { roundWon(rope < 0 ? 0 : 1); return; }
        if (qInRound >= MAX_Q) {
          if (rope === 0) {
            feedback.textContent = '🤝 Round ' + round + ' is a draw — nobody scores.';
            nextRound(side);
          } else roundWon(rope < 0 ? 0 : 1);
          return;
        }
        side = 1 - side;
        pending = setTimeout(ask, 1400);
      }

      function roundWon(w) {
        var s = sides[w];
        s.rounds++;
        s.teams.forEach(function (t) { rec[t.id].points += 25; });
        hud();
        drawSides(-1);
        feedback.textContent = '🏆 ' + s.name + ' side wins round ' + round + '! +25 to ' + (s.teams.length ? s.teams.map(function (t) { return t.name; }).join(' and ') : 'the river') + '.';
        LW.confetti(70);
        if (scene) scene.roundWon(s.id);
        if (s.rounds >= 2) { pending = setTimeout(function () { end(s.name + ' side wins the match!'); }, 2200); return; }
        nextRound(1 - w);
      }

      function nextRound(starter) {
        round++;
        qInRound = 0;
        rope = 0;
        sides.forEach(function (x) { x.streak = 0; });
        side = starter;
        LW.u.clear(panel);
        panel.appendChild(el('p', { class: 'esc-next', text: 'Round ' + round + ' — back to the middle!' }));
        pending = setTimeout(function () { drawRope(); if (scene) scene.reset(); ask(); }, 2600);
      }

      function end(detail) {
        if (finished) return;
        finished = true;
        timer.stop();
        if (quiz) quiz.stop();
        if (pending) clearTimeout(pending);
        var winner = sides[0].rounds > sides[1].rounds ? sides[0] : sides[1].rounds > sides[0].rounds ? sides[1] : null;
        if (winner) winner.teams.forEach(function (t) { rec[t.id].points += 20; });
        var results = teams.map(function (t) {
          var r = rec[t.id];
          var s = sides[sides[0].teams.indexOf(t) !== -1 ? 0 : 1];
          return { id: t.id, name: t.name, avatar: t.avatar, color: t.color, points: r.points, note: s.emoji + ' ' + s.name + ' side · ' + r.correct + ' correct' + (winner === s ? ' · match won' : '') };
        }).sort(function (a, b) { return b.points - a.points; });
        drawSides(-1);
        LW.u.clear(panel);
        if (scene) scene.podium(winner ? winner.id : null);
        if (api.finishTeams) api.finishTeams(results, detail + ' ' + sides[0].emoji + ' ' + sides[0].rounds + ' – ' + sides[1].rounds + ' ' + sides[1].emoji); else api.finish(results[0].points, detail);
      }

      hud();
      timer.start();
      drawSides(-1);
      drawRope();
      panel.appendChild(el('p', { class: 'esc-next', text: 'Take the rope…' }));
      pending = setTimeout(ask, scene ? 2800 : 400);

      return function () {
        timer.stop();
        if (quiz) quiz.stop();
        if (pending) clearTimeout(pending);
        if (scene) scene.dispose();
      };
    }
  });
})(window.LW);
