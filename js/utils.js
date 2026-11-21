/* EveGames — shared helpers: DOM, random, timer, sound, speech, confetti */
window.LW = window.LW || {};

(function (LW) {
  'use strict';

  /* ---------- DOM ---------- */

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k === 'style' && typeof v === 'object') setStyle(node, v);
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v === true ? '' : v);
      });
    }
    (children || []).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  /* Custom properties (--tc, --cols, …) are invisible to plain assignment on a
     CSSStyleDeclaration — they have to go through setProperty. */
  function setStyle(node, styles) {
    Object.keys(styles).forEach(function (prop) {
      var val = styles[prop];
      if (val === null || val === undefined) return;
      if (prop.slice(0, 2) === '--') node.style.setProperty(prop, String(val));
      else node.style[prop] = val;
    });
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); return node; }
  function qs(sel, root) { return (root || document).querySelector(sel); }

  /* ---------- Random ---------- */

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function sample(arr, n) { return shuffle(arr).slice(0, n); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* ---------- Text ---------- */

  function normalize(s) {
    return String(s || '').toLowerCase().replace(/[^a-z]/g, '');
  }

  function titleCase(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ---------- Countdown timer ---------- */

  function Timer(seconds, onTick, onEnd) {
    this.total = seconds;
    this.left = seconds;
    this.onTick = onTick;
    this.onEnd = onEnd;
    this._id = null;
    this.running = false;
  }
  Timer.prototype.start = function () {
    var self = this;
    if (self.running) return;
    self.running = true;
    self.onTick && self.onTick(self.left, self.total);
    self._id = setInterval(function () {
      self.left--;
      self.onTick && self.onTick(self.left, self.total);
      if (self.left <= 3 && self.left > 0) LW.sound.tick();
      if (self.left <= 0) { self.stop(); LW.sound.timeUp(); self.onEnd && self.onEnd(); }
    }, 1000);
  };
  Timer.prototype.stop = function () {
    this.running = false;
    if (this._id) { clearInterval(this._id); this._id = null; }
  };
  Timer.prototype.add = function (s) { this.left = Math.max(0, this.left + s); };

  /* ---------- Sound (Web Audio, no files) ---------- */

  var audioCtx = null;
  function ctx() {
    if (!LW.state || LW.state.settings.sound === false) return null;
    if (!audioCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function beep(freq, duration, type, gainValue, delay) {
    var c = ctx();
    if (!c) return;
    var t0 = c.currentTime + (delay || 0);
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(gainValue || 0.18, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  LW.sound = {
    correct: function () { beep(660, 0.12, 'triangle', 0.2, 0); beep(990, 0.18, 'triangle', 0.18, 0.1); },
    wrong:   function () { beep(200, 0.22, 'sawtooth', 0.12, 0); },
    click:   function () { beep(520, 0.05, 'square', 0.07, 0); },
    flip:    function () { beep(420, 0.06, 'sine', 0.09, 0); },
    tick:    function () { beep(880, 0.05, 'square', 0.08, 0); },
    timeUp:  function () { beep(330, 0.3, 'sawtooth', 0.14, 0); beep(220, 0.4, 'sawtooth', 0.12, 0.18); },
    spin:    function () { beep(300, 0.08, 'square', 0.06, 0); },
    win:     function () {
      [523, 659, 784, 1047].forEach(function (f, i) { beep(f, 0.22, 'triangle', 0.18, i * 0.11); });
    },
    coin:    function () { beep(988, 0.07, 'square', 0.1, 0); beep(1319, 0.25, 'square', 0.1, 0.07); },
    siren:   function () {
      for (var i = 0; i < 4; i++) { beep(880, 0.16, 'square', 0.1, i * 0.34); beep(660, 0.16, 'square', 0.1, i * 0.34 + 0.17); }
    },
    whoosh:  function () { sweep(900, 180, 0.28, 'sawtooth', 0.06); },
    crash:   function () { noise(0.45, 0.22); beep(90, 0.5, 'sawtooth', 0.16, 0); beep(60, 0.6, 'triangle', 0.14, 0.05); },
    thud:    function () { beep(110, 0.14, 'sine', 0.22, 0); noise(0.08, 0.1); },
    horn:    function () { beep(440, 0.28, 'sawtooth', 0.12, 0); beep(554, 0.28, 'sawtooth', 0.12, 0); },
    unlock:  function () { beep(392, 0.1, 'square', 0.1, 0); beep(523, 0.1, 'square', 0.1, 0.1); beep(784, 0.3, 'triangle', 0.16, 0.2); },
    alarm:   function () { for (var i = 0; i < 6; i++) beep(i % 2 ? 1200 : 900, 0.12, 'square', 0.09, i * 0.14); },
    footstep: function () { beep(180, 0.04, 'triangle', 0.05, 0); }
  };

  function sweep(f0, f1, duration, type, gainValue) {
    var c = ctx();
    if (!c) return;
    var t0 = c.currentTime;
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(f0, t0);
    osc.frequency.exponentialRampToValueAtTime(f1, t0 + duration);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(gainValue || 0.1, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  function noise(duration, gainValue) {
    var c = ctx();
    if (!c) return;
    var frames = Math.floor(c.sampleRate * duration);
    var buffer = c.createBuffer(1, frames, c.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    var src = c.createBufferSource();
    src.buffer = buffer;
    var gain = c.createGain();
    gain.gain.value = gainValue || 0.1;
    var filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    src.connect(filter).connect(gain).connect(c.destination);
    src.start();
  }

  /* ---------- Speech (pronunciation) ---------- */

  /* The browser's default voice is often the old robotic one. Every English
     voice is scored — neural/"Natural"/Google online voices first — and the
     teacher can pin a specific voice in Settings (settings.voice = voiceURI). */
  function voiceScore(v) {
    var s = 0;
    var n = v.name || '';
    if (/natural|neural|premium|enhanced|wavenet|online/i.test(n)) s += 5;
    if (/google/i.test(n)) s += 3;
    if (v.localService === false) s += 2;          // cloud voices sound far better
    if (/en[-_](GB|US)/i.test(v.lang)) s += 1;
    if (/desktop|espeak|compact/i.test(n)) s -= 3;  // the robotic legacy ones
    return s;
  }

  LW.voices = function () {
    if (!('speechSynthesis' in window)) return [];
    var list = window.speechSynthesis.getVoices().filter(function (v) { return /^en/i.test(v.lang); });
    return list.sort(function (a, b) { return voiceScore(b) - voiceScore(a) || a.name.localeCompare(b.name); });
  };

  LW.pickVoice = function () {
    var list = LW.voices();
    var want = LW.state && LW.state.settings.voice;
    if (want) {
      var pinned = list.filter(function (v) { return v.voiceURI === want || v.name === want; })[0];
      if (pinned) return pinned;
    }
    return list[0] || null;
  };

  LW.speak = function (text, opts) {
    if (!LW.state || LW.state.settings.speech === false) return;
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(String(text));
      var v = LW.pickVoice();
      u.lang = v ? v.lang : 'en-GB';
      u.rate = (opts && opts.rate) || 0.95;
      u.pitch = 1.0;
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    } catch (e) { /* ignore */ }
  };
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
    if (window.speechSynthesis.addEventListener) window.speechSynthesis.addEventListener('voiceschanged', function () { LW.voices(); });
  }

  /* ---------- Confetti ---------- */

  LW.confetti = function (count) {
    var layer = document.getElementById('confetti-layer');
    if (!layer) return;
    var colors = ['#e8453c', '#2f8fd8', '#45b36b', '#f0a92c', '#9b5de5', '#ef6fa0', '#ffffff'];
    var n = count || 70;
    for (var i = 0; i < n; i++) {
      var p = el('i', { class: 'confetti-piece' });
      p.style.left = Math.random() * 100 + '%';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random() * 0.4) + 's';
      p.style.animationDuration = (1.6 + Math.random() * 1.4) + 's';
      p.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
      if (Math.random() > 0.6) p.style.borderRadius = '50%';
      layer.appendChild(p);
      (function (node) { setTimeout(function () { node.remove(); }, 3400); })(p);
    }
  };

  /* ---------- Misc ---------- */

  function shake(node) {
    node.classList.remove('shake');
    void node.offsetWidth;
    node.classList.add('shake');
  }

  /* Grid games used to run off the bottom of the screen: sixteen memory
     cards or a 5x5 bingo card are simply taller than a phone. This caps the
     grid's WIDTH so that the height its cells derive from the aspect ratio
     fits whatever room is left under the HUD. Re-runs on rotate/resize. */
  function fitGrid(grid, cols, rows, aspect, reserve) {
    function apply() {
      var cs = window.getComputedStyle ? window.getComputedStyle(grid) : null;
      var gap = (cs && parseFloat(cs.gap)) || 8;
      var top = grid.getBoundingClientRect().top;
      var viewport = window.innerHeight || 800;
      var availH = viewport - top - (reserve || 96);
      if (availH < 170) availH = 170;
      var cellH = (availH - gap * (rows - 1)) / rows;
      var width = cellH * (aspect || 1) * cols + gap * (cols - 1);
      grid.style.maxWidth = Math.max(240, Math.round(width)) + 'px';
      grid.style.marginLeft = 'auto';
      grid.style.marginRight = 'auto';
    }
    apply();
    var settle = setTimeout(apply, 60);     // again once fonts have loaded
    window.addEventListener('resize', apply);
    return function () {
      clearTimeout(settle);
      window.removeEventListener('resize', apply);
    };
  }

  function fmtTime(s) {
    var m = Math.floor(s / 60), r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  LW.u = {
    el: el, clear: clear, qs: qs,
    shuffle: shuffle, sample: sample, pick: pick,
    normalize: normalize, titleCase: titleCase,
    Timer: Timer, shake: shake, fmtTime: fmtTime, fitGrid: fitGrid
  };
})(window.LW);
