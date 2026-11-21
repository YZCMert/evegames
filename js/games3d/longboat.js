(function (LW) {
  'use strict';
  var el = function () { return LW.u.el.apply(null, arguments); };
  var PLACE_BONUS = [40, 25, 15, 10, 10, 10];

  function ordinal(n) {
    var m = n % 100;
    var s = (m > 10 && m < 14) ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th';
    return n + s;
  }

  function pickCells(n, lo, hi, avoid) {
    var cells = [];
    for (var c = lo; c <= hi; c++) cells.push(c);
    var out = [];
    LW.u.shuffle(cells).forEach(function (c) {
      if (out.length >= n || avoid.indexOf(c) !== -1) return;
      var near = out.some(function (t) { return Math.abs(t - c) <= 1; });
      if (near) return;
      out.push(c);
    });
    return out.sort(function (a, b) { return a - b; });
  }

  LW.registerGame({
    id: 'longboat',
    mode: 'hs',
    team: true,
    name: 'Longboat Race',
    emoji: '🛶',
    color: '#1f8fa8',
    tag: 'team race · quick questions',
    timeLabel: '5 minutes',
    pointsLabel: '5 per correct answer · finish bonus 40 / 25 / 15 / 10',
    howto: 'Every team paddles a long-tail boat. Teams take turns: answer before the clock runs out and your boat moves one stretch of river — three right answers in a row and it surges two. A wrong answer drifts you back, a crocodile sends you back a stretch, the current carries you on. First boat home takes the biggest bonus; the race ends once every team has had the same number of questions.',

    mount: function (stage, api) {
      var teams = LW.state.teams.length ? LW.state.teams.slice() : [{ id: 'solo', name: 'Team', avatar: '🛶', color: '#1f8fa8', score: 0 }];
      var COURSE = LW.diff(8, 9, 10);
      var SECONDS = LW.diff(15, 12, 10);
      var deck = LW.HSQuiz.deck(teams.length * COURSE * 2 + 12);
      if (!deck.length) { api.finish(0, 'No questions available.'); return function () {}; }
      var crocs = pickCells(3, 2, COURSE - 2, []);
      var boosts = pickCells(2, 2, COURSE - 2, crocs);
      var boats = teams.map(function (t, i) { return { team: t, lane: i, pos: 0, correct: 0, wrong: 0, streak: 0, asked: 0, finished: false, place: 0, points: 0 }; });
      var turn = 0, qIndex = 0, asked = 0, placed = 0, finished = false, quiz = null, lapTarget = -1, pending = null;

      var counter = el('p', { class: 'stage-note' });
      var lanes = el('div', { class: 'race-lanes' });
      var host = el('div', { class: 'gl-host river' });
      var panel = el('div', { class: 'quiz-panel' });
      var feedback = el('p', { class: 'feedback' });
      stage.appendChild(counter);
      stage.appendChild(lanes);
      stage.appendChild(host);
      stage.appendChild(panel);
      stage.appendChild(feedback);

      var timer = new LW.u.Timer(LW.diff(360, 300, 240), function (left) {
        api.setTimer('⏱ ' + LW.u.fmtTime(left), left <= 30);
      }, function () { end('Time! Places decided by position on the river.'); });

      var scene = LW.hs3d ? LW.hs3d.create('longboat', host, {}, {
        teams: teams.map(function (t) { return { id: t.id, name: t.name, avatar: t.avatar, color: t.color }; }),
        course: COURSE, crocs: crocs, boosts: boosts
      }) : null;
      if (!scene) {
        host.classList.add('flat');
        host.appendChild(el('p', { class: 'flat-note', text: 'The 3D river needs WebGL — follow the race on the lanes above.' }));
      }

      function leader() { return boats.slice().sort(function (a, b) { return b.points - a.points || b.pos - a.pos; })[0]; }
      function hud() { var l = leader(); api.setScore(l.team.avatar + ' ' + l.points); }

      function current() {
        for (var k = 0; k < boats.length; k++) {
          var b = boats[(turn + k) % boats.length];
          if (b.finished) continue;
          if (lapTarget >= 0 && b.asked >= lapTarget) continue;
          return b;
        }
        return null;
      }

      function renderLanes(active) {
        LW.u.clear(lanes);
        boats.forEach(function (b) {
          var row = el('div', { class: 'lane' + (active === b ? ' active' : '') + (b.finished ? ' done' : ''), style: { '--tc': b.team.color } });
          row.appendChild(el('span', { class: 'lane-team', text: b.team.avatar + ' ' + b.team.name }));
          var track = el('div', { class: 'lane-track' });
          for (var c = 0; c <= COURSE; c++) {
            var mark = c === b.pos ? '🛶' : c === COURSE ? '🏁' : crocs.indexOf(c) !== -1 ? '🐊' : boosts.indexOf(c) !== -1 ? '🌊' : '·';
            track.appendChild(el('span', { class: 'lane-cell' + (c === b.pos ? ' here' : ''), text: mark }));
          }
          row.appendChild(track);
          row.appendChild(el('span', { class: 'lane-pts', text: (b.place ? ordinal(b.place) + ' · ' : '') + b.points + ' pts' }));
          lanes.appendChild(row);
        });
      }

      function ask() {
        if (finished) return;
        var b = current();
        if (!b) { end('Race over!'); return; }
        turn = b.lane;
        var q = deck[qIndex++ % deck.length];
        asked++; b.asked++;
        counter.textContent = 'Question ' + asked + ' · ' + b.team.avatar + ' ' + b.team.name + ' paddles';
        renderLanes(b);
        if (scene) scene.spotlight(b.team.id);
        quiz = LW.HSQuiz.render(panel, q, {
          who: b.team, seconds: SECONDS,
          onAnswer: function (ok) { answer(b, ok, q); },
          onTimeout: function () {
            b.streak = 0;
            LW.sound.timeUp();
            feedback.textContent = '⏳ Too slow! It was: ' + q.explain;
            if (scene) scene.react(b.team.id, false, 'ช้าไป!');
            after();
          }
        });
      }

      function answer(b, ok, q) {
        if (ok) {
          b.correct++; b.streak++; b.points += 5;
          var move = b.streak >= 3 ? 2 : 1;
          LW.sound.correct();
          feedback.textContent = '✔ ' + q.explain + (move === 2 ? '  🔥 Rhythm! Two stretches.' : '');
          advance(b, move, move === 2 ? '+2 🔥' : '+1');
        } else {
          b.wrong++; b.streak = 0;
          LW.sound.wrong();
          feedback.textContent = '✘ ' + q.explain + ' — the boat drifts back.';
          advance(b, -1, '−1');
        }
        hud();
        after();
      }

      function advance(b, delta, label) {
        b.pos = Math.max(0, Math.min(COURSE, b.pos + delta));
        var event = '';
        if (delta > 0 && b.pos > 0 && b.pos < COURSE) {
          if (crocs.indexOf(b.pos) !== -1) { b.pos -= 1; event = 'croc'; feedback.textContent += ' 🐊 A crocodile! Back one stretch.'; LW.sound.thud(); }
          else if (boosts.indexOf(b.pos) !== -1) { b.pos = Math.min(COURSE, b.pos + 1); event = 'boost'; feedback.textContent += ' 🌊 The current carries you on!'; LW.sound.whoosh(); }
        }
        if (scene) scene.moveBoat(b.team.id, b.pos, label, event);
        if (b.pos >= COURSE && !b.finished) {
          b.finished = true; placed++; b.place = placed;
          var bonus = PLACE_BONUS[Math.min(placed - 1, PLACE_BONUS.length - 1)];
          b.points += bonus;
          LW.confetti(50);
          LW.sound.coin();
          feedback.textContent = '🏁 ' + b.team.name + ' reaches the finish ' + ordinal(placed) + '! +' + bonus;
          if (scene) scene.finish(b.team.id, placed, bonus);
          if (lapTarget < 0) lapTarget = b.asked;
        }
        renderLanes(null);
      }

      function gust() {
        var behind = boats.filter(function (x) { return !x.finished; }).sort(function (a, b) { return a.pos - b.pos; })[0];
        if (!behind || behind.pos >= COURSE - 1) return;
        behind.pos += 1;
        feedback.textContent += ' 🌬️ A gust pushes ' + behind.team.name + ' forward!';
        if (scene) scene.moveBoat(behind.team.id, behind.pos, '+1 🌬️', 'gust');
        renderLanes(null);
      }

      function after() {
        turn = (turn + 1) % boats.length;
        if (asked % 5 === 0) gust();
        hud();
        if (!current()) { pending = setTimeout(function () { end('Race over!'); }, 1500); return; }
        pending = setTimeout(ask, 1500);
      }

      function end(detail) {
        if (finished) return;
        finished = true;
        timer.stop();
        if (quiz) quiz.stop();
        if (pending) clearTimeout(pending);
        boats.filter(function (x) { return !x.finished; }).sort(function (a, b) { return b.pos - a.pos || b.correct - a.correct; }).forEach(function (b) {
          placed++; b.place = placed;
          b.points += PLACE_BONUS[Math.min(placed - 1, PLACE_BONUS.length - 1)];
        });
        var results = boats.slice().sort(function (a, b) { return a.place - b.place; }).map(function (b) {
          return {
            id: b.team.id, name: b.team.name, avatar: b.team.avatar, color: b.team.color, points: b.points, place: b.place,
            note: ordinal(b.place) + ' · ' + b.correct + ' correct · ' + (b.finished ? 'reached the finish' : b.pos + ' / ' + COURSE + ' stretches')
          };
        });
        renderLanes(null);
        LW.u.clear(panel);
        if (scene) scene.podium(results[0].id);
        if (api.finishTeams) api.finishTeams(results, detail); else api.finish(results[0].points, detail);
      }

      hud();
      timer.start();
      renderLanes(null);
      panel.appendChild(el('p', { class: 'esc-next', text: 'Boats to the start line…' }));
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
