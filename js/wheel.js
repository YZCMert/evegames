/* EveGames — the spinning game-picker wheel */
window.LW = window.LW || {};

(function (LW) {
  'use strict';

  var SVG = 'http://www.w3.org/2000/svg';

  function svgEl(tag, attrs) {
    var n = document.createElementNS(SVG, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }

  /* point on circle, angle measured clockwise from 12 o'clock */
  function pt(cx, cy, r, aDeg) {
    var a = (aDeg * Math.PI) / 180;
    return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  }

  function wedgePath(cx, cy, r, a0, a1) {
    var p0 = pt(cx, cy, r, a0);
    var p1 = pt(cx, cy, r, a1);
    var large = (a1 - a0) > 180 ? 1 : 0;
    return 'M ' + cx + ' ' + cy + ' L ' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) +
           ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2) + ' Z';
  }

  LW.buildWheel = function (host, onLand) {
    var el = LW.u.el;
    var games = LW.activeGames();
    var n = games.length;
    var seg = 360 / n;
    var CX = 200, CY = 200, R = 190;

    var wrap = el('div', { class: 'wheel-wrap' });
    host.appendChild(wrap);

    var svg = svgEl('svg', { viewBox: '0 0 400 400', class: 'wheel-svg' });
    var rotor = svgEl('g', { class: 'wheel-rotor' });

    svg.appendChild(svgEl('circle', { cx: CX, cy: CY, r: R + 8, fill: '#2a2440' }));
    svg.appendChild(rotor);

    /* Games already played in this cycle are greyed out, so the class can
       see the pool shrinking and knows a new game is guaranteed. */
    var played = LW.playedGameIds();

    games.forEach(function (g, i) {
      var a0 = i * seg, a1 = (i + 1) * seg, mid = a0 + seg / 2;
      var spent = played.indexOf(g.id) !== -1;

      rotor.appendChild(svgEl('path', {
        d: wedgePath(CX, CY, R, a0, a1),
        fill: g.color,
        'fill-opacity': spent ? 0.22 : 1,
        stroke: '#ffffff',
        'stroke-width': 2.5,
        'stroke-linejoin': 'round'
      }));

      var flip = mid > 180;
      var theta = flip ? mid + 90 : mid - 90;

      var tp = pt(CX, CY, R * 0.56, mid);
      var label = svgEl('text', {
        x: tp[0].toFixed(1), y: tp[1].toFixed(1),
        'text-anchor': 'middle', 'dominant-baseline': 'central',
        transform: 'rotate(' + theta.toFixed(1) + ' ' + tp[0].toFixed(1) + ' ' + tp[1].toFixed(1) + ')',
        class: 'wedge-label' + (spent ? ' spent' : '')
      });
      label.textContent = g.name;
      if (g.name.length > 11) label.setAttribute('style', 'font-size:' + (g.name.length > 13 ? 11.5 : 13) + 'px');
      rotor.appendChild(label);

      var ep = pt(CX, CY, R * 0.84, mid);
      var icon = svgEl('text', {
        x: ep[0].toFixed(1), y: ep[1].toFixed(1),
        'text-anchor': 'middle', 'dominant-baseline': 'central',
        transform: 'rotate(' + theta.toFixed(1) + ' ' + ep[0].toFixed(1) + ' ' + ep[1].toFixed(1) + ')',
        class: 'wedge-icon' + (spent ? ' spent' : '')
      });
      icon.textContent = spent ? '✓' : g.emoji;
      rotor.appendChild(icon);
    });

    svg.appendChild(svgEl('circle', { cx: CX, cy: CY, r: 40, fill: '#fffdf6', stroke: '#2a2440', 'stroke-width': 5 }));
    wrap.appendChild(svg);

    var pointer = el('div', { class: 'wheel-pointer', html: '▼' });
    wrap.appendChild(pointer);

    var spinBtn = el('button', { class: 'spin-btn', html: '<span>SPIN</span>' });
    wrap.appendChild(spinBtn);

    var left = LW.remainingGames().length;
    var caption = el('p', { class: 'wheel-caption', text: left === games.length
      ? 'All ' + games.length + ' games are up for grabs'
      : left + ' of ' + games.length + ' games left before any one repeats' });
    host.appendChild(caption);

    var rotation = 0;
    var spinning = false;
    var tickTimer = null;

    function spin() {
      if (spinning) return;
      spinning = true;
      spinBtn.disabled = true;
      spinBtn.classList.add('spinning');

      /* Draw from the bag of games not yet played this cycle. */
      var pool = LW.remainingGames();
      var target = games.indexOf(pool[Math.floor(Math.random() * pool.length)]);

      var turns = 5 + Math.floor(Math.random() * 3);
      var jitter = (Math.random() - 0.5) * (seg * 0.55);
      var final = 360 * turns - (target * seg + seg / 2) + jitter;
      rotation += final;

      rotor.style.transition = 'transform 4.6s cubic-bezier(0.13, 0.82, 0.14, 1)';
      rotor.style.transform = 'rotate(' + rotation + 'deg)';

      var ticks = 0;
      tickTimer = setInterval(function () {
        ticks++;
        LW.sound.spin();
        if (ticks > 26) { clearInterval(tickTimer); tickTimer = null; }
      }, 150);

      setTimeout(function () {
        if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
        spinning = false;
        spinBtn.disabled = false;
        spinBtn.classList.remove('spinning');
        var g = games[target];
        LW.landedOn(g.id);
        pointer.classList.add('hit');
        LW.sound.win();
        LW.confetti(36);
        setTimeout(function () { onLand(g); }, 650);
      }, 4750);
    }

    spinBtn.addEventListener('click', spin);
    svg.addEventListener('click', spin);

    return { spin: spin };
  };
})(window.LW);
