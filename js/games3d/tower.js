(function (LW) {
  'use strict';
  var el = function () { return LW.u.el.apply(null, arguments); };

  LW.registerGame({
    id: 'tower',
    mode: 'hs',
    name: 'Sentence Tower',
    emoji: '🧱',
    color: '#f0a92c',
    tag: 'grammar · word order',
    timeLabel: '2½ minutes',
    pointsLabel: '4 per block · ✨ golden word 12 · 20 per sentence · −3 wrong · −6 wrecking ball or crow',
    howto: 'Build the sentence block by block: tap the words in the right order. The golden word is worth triple. A wrong tap shakes the tower, five wrong taps and it falls. The wrecking ball punishes a tower that stops growing, and a hungry crow tries to steal your top block — shoo it before it lands!',

    mount: function (stage, api) {
      var count = LW.diff(4, 5, 6);
      var LIVES = 5;
      var list = LW.lesson.pick('sentences', count);
      if (!list.length) { api.finish(0, 'No sentences available.'); return function () {}; }
      count = list.length;

      var idx = 0, score = 0, built = 0, strikes = 0, wrongTotal = 0, pos = 0, busy = false, knocked = 0, golden = 0, shooed = 0;
      var chipsByIndex = [], goldIdx = -1;
      var swingEvery = LW.diff(14, 11, 9);
      var crowEvery = LW.diff(27, 21, 16);
      var sinceGrowth = 0, swingTimer = null, crowTimer = null, crowActive = false;

      var counter = el('p', { class: 'stage-note' });
      var topic = el('div', { class: 'tower-topic' }, [
        el('span', { class: 'tt-pill' }),
        el('span', { class: 'tt-ball', title: 'Wrecking ball' }),
        el('span', { class: 'tt-lives' })
      ]);
      var topicPill = topic.querySelector('.tt-pill');
      var ballMeter = topic.querySelector('.tt-ball');
      var lives = topic.querySelector('.tt-lives');
      var host = el('div', { class: 'gl-host sky' });
      var alertBox = el('div', { class: 'tower-alert' });
      var builtLine = el('p', { class: 'tower-built' });
      var tray = el('div', { class: 'tower-tray' });
      var feedback = el('p', { class: 'feedback' });

      stage.appendChild(counter);
      stage.appendChild(topic);
      stage.appendChild(host);
      stage.appendChild(alertBox);
      stage.appendChild(builtLine);
      stage.appendChild(tray);
      stage.appendChild(feedback);

      var timer = new LW.u.Timer(LW.diff(180, 150, 120), function (left) {
        api.setTimer('⏱ ' + LW.u.fmtTime(left), left <= 15);
      }, function () { end('Time! ' + built + ' sentence(s) built.'); });

      var scene = LW.hs3d ? LW.hs3d.create('tower', host, { onCrow: shoo }) : null;
      if (!scene) {
        host.classList.add('flat');
        host.appendChild(el('p', { class: 'flat-note', text: 'The 3D tower needs WebGL — the sentence still builds below.' }));
      }

      function current() { return list[idx]; }

      function render() {
        var s = current();
        pos = 0; strikes = 0; busy = false; sinceGrowth = 0;
        goldIdx = 1 + Math.floor(Math.random() * (s.words.length - 1));
        counter.textContent = 'Sentence ' + (idx + 1) + ' of ' + count;
        topicPill.textContent = LW.u.titleCase(s.topic);
        drawLives();
        builtLine.textContent = '…';
        feedback.textContent = '';
        LW.u.clear(tray);
        chipsByIndex = [];
        var order = LW.u.shuffle(s.words.map(function (w, i) { return { w: w, i: i }; }));
        order.forEach(function (o) {
          var b = el('button', { class: 'chip' + (o.i === goldIdx ? ' gold' : ''), text: o.w, 'data-i': o.i, title: o.i === goldIdx ? 'Golden word: triple points' : null });
          b.addEventListener('click', function () { tap(o.i, b); });
          tray.appendChild(b);
          chipsByIndex[o.i] = b;
        });
        if (scene) scene.newSentence(s.words);
      }

      function drawLives() {
        var out = '';
        for (var i = 0; i < LIVES; i++) out += i < LIVES - strikes ? '❤️' : '🖤';
        lives.textContent = out;
      }

      function tap(i, node) {
        if (busy || node.disabled) return;
        var s = current();
        if (i === pos) {
          node.disabled = true;
          node.classList.add('done');
          var gold = i === goldIdx;
          var gain = gold ? 12 : 4;
          if (gold) golden++;
          LW.sound.correct();
          if (gold) LW.sound.coin();
          score += gain;
          api.setScore(score);
          sinceGrowth = 0;
          if (scene) scene.stack(s.words[i], pos, gold);
          pos++;
          builtLine.textContent = s.words.slice(0, pos).join(' ');
          feedback.textContent = gold ? '✨ Golden word! +12' : '';
          if (pos === s.words.length) {
            busy = true;
            built++;
            score += 20;
            api.setScore(score);
            feedback.textContent = '🏗️ Built! ' + s.words.join(' ');
            LW.speak(s.words.join(' '));
            LW.confetti(50);
            if (scene) scene.celebrate();
            shoo(true);
            setTimeout(next, 1600);
          }
        } else {
          strikes++; wrongTotal++;
          score = Math.max(0, score - 3);
          api.setScore(score);
          LW.sound.wrong();
          LW.u.shake(node);
          drawLives();
          if (scene) scene.wobble(strikes);
          if (strikes >= LIVES) collapse('💥 The tower fell! It was: ' + s.words.join(' '));
          else feedback.textContent = 'Not that one — which word comes next?';
        }
      }

      function loseTopBlock(reason) {
        var s = current();
        pos--;
        knocked++;
        score = Math.max(0, score - 6);
        api.setScore(score);
        LW.sound.timeUp();
        var chip = chipsByIndex[pos];
        if (chip) { chip.disabled = false; chip.classList.remove('done'); }
        builtLine.textContent = pos ? s.words.slice(0, pos).join(' ') : '…';
        feedback.textContent = reason + ' "' + s.words[pos] + '" is gone! Keep building.';
      }

      function swing() {
        if (busy) return;
        sinceGrowth += swingEvery;
        ballMeter.textContent = '';
        if (sinceGrowth < swingEvery * 1.5 || pos === 0) { if (scene) scene.swing(false); return; }
        loseTopBlock('🏗️ The wrecking ball knocked off');
        if (scene) scene.swing(true);
      }

      function crowArrive() {
        if (busy || finished || crowActive || pos === 0) return;
        crowActive = true;
        LW.u.clear(alertBox);
        var left = 4;
        var count = el('b', { text: String(left) });
        alertBox.appendChild(el('span', { class: 'ta-text' }, [document.createTextNode('🐦 A crow wants your top block! Shoo it in '), count, document.createTextNode(' s')]));
        var btn = el('button', { class: 'btn warn-btn small shoo-btn', html: '👋 Shoo!', onclick: function () { shoo(); } });
        alertBox.appendChild(btn);
        alertBox.classList.add('on');
        if (scene) scene.crow(true);
        LW.sound.alarm();
        crowCountdown = setInterval(function () {
          left--;
          count.textContent = String(Math.max(0, left));
          if (left <= 0) { clearInterval(crowCountdown); crowCountdown = null; crowSteal(); }
        }, 1000);
      }
      var crowCountdown = null;

      function crowSteal() {
        if (!crowActive) return;
        crowActive = false;
        LW.u.clear(alertBox); alertBox.classList.remove('on');
        if (pos > 0 && !busy) { loseTopBlock('🐦 The crow flew off with'); if (scene) scene.crowSteal(); }
        else if (scene) scene.crow(false);
      }

      function shoo(silent) {
        if (!crowActive) return;
        crowActive = false;
        if (crowCountdown) { clearInterval(crowCountdown); crowCountdown = null; }
        LW.u.clear(alertBox); alertBox.classList.remove('on');
        if (scene) scene.crow(false);
        if (!silent) { shooed++; LW.sound.whoosh(); feedback.textContent = '👋 Shooed the crow away!'; }
      }

      function collapse(msg) {
        busy = true;
        shoo(true);
        feedback.textContent = msg;
        LW.speak(current().words.join(' '));
        if (scene) scene.collapse();
        Array.prototype.forEach.call(tray.children, function (c) { c.disabled = true; });
        setTimeout(next, 2200);
      }

      function next() {
        idx++;
        if (idx >= count) {
          end(built + ' / ' + count + ' sentences built, ' + golden + ' golden word(s), ' + wrongTotal + ' wrong tap(s), ' + knocked + ' block(s) lost, ' + shooed + ' crow(s) shooed.');
          return;
        }
        render();
      }

      var finished = false;
      function end(detail) {
        if (finished) return;
        finished = true;
        timer.stop();
        if (swingTimer) clearInterval(swingTimer);
        if (crowTimer) clearInterval(crowTimer);
        if (crowCountdown) clearInterval(crowCountdown);
        var bonus = built === count ? Math.floor(timer.left / 3) : 0;
        api.finish(score + bonus, detail + (bonus ? ' +' + bonus + ' time bonus.' : ''));
      }

      var tick = 0;
      swingTimer = setInterval(function () {
        tick = (tick + 1) % swingEvery;
        if (tick === 0) swing();
        else ballMeter.textContent = swingEvery - tick <= 3 ? '🏗️ ' + (swingEvery - tick) : '';
      }, 1000);
      var ctick = Math.floor(crowEvery / 2);
      crowTimer = setInterval(function () {
        ctick = (ctick + 1) % crowEvery;
        if (ctick === 0) crowArrive();
      }, 1000);

      api.setScore(0);
      timer.start();
      render();

      return function () {
        timer.stop();
        if (swingTimer) clearInterval(swingTimer);
        if (crowTimer) clearInterval(crowTimer);
        if (crowCountdown) clearInterval(crowCountdown);
        if (scene) scene.dispose();
      };
    }
  });
})(window.LW);
