window.LW = window.LW || {};

(function (LW) {
  'use strict';

  LW.LESSON_TERM = { name: 'Semester 2 · 2026', start: [2026, 9, 19], weeks: 19 };

  LW.LESSON_LEVELS = [
    { id: 'm1', name: 'M.1', emoji: '🌱', color: '#2e7d4a', brief: 'Basic English · Semester 2' },
    { id: 'm2', name: 'M.2', emoji: '🌿', color: '#1f6fb0', brief: 'Basic English · Semester 2' },
    { id: 'b1', name: 'B1 mix', emoji: '🧊', color: '#9b5de5', brief: 'The original set · word packs' }
  ];

  LW.LESSON_PARTS = LW.LESSON_PARTS || [];
  LW.addLessonPart = function (part) { LW.LESSON_PARTS.push(part); };

  var NEED = { words: 4, sentences: 6, gaps: 3, pairs: 1, forms: 2, dialogues: 5 };

  function store() {
    var L = LW.state.lesson;
    if (!L || typeof L !== 'object') L = LW.state.lesson = { level: 'b1', picks: {} };
    if (!L.picks || typeof L.picks !== 'object') L.picks = {};
    return L;
  }

  function levelById(id) { return LW.LESSON_LEVELS.filter(function (l) { return l.id === id; })[0] || null; }
  function partById(id) { return LW.LESSON_PARTS.filter(function (p) { return p.id === id; })[0] || null; }

  function partsOf(level) {
    return LW.LESSON_PARTS.filter(function (p) { return (p.levels || []).indexOf(level) !== -1; });
  }

  function level() {
    var id = store().level;
    if (id === 'b1' || !levelById(id) || !partsOf(id).length) return 'b1';
    return id;
  }

  function weekOf(date) {
    var s = LW.LESSON_TERM.start;
    var start = new Date(s[0], s[1], s[2]);
    var d = date || new Date();
    var days = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - start) / 86400000);
    if (days < 0) return 0;
    var w = Math.floor(days / 7) + 1;
    return w > LW.LESSON_TERM.weeks ? 0 : w;
  }

  function nowPart(lvl, date) {
    var w = weekOf(date);
    if (!w) return null;
    return partsOf(lvl).filter(function (p) { return p.weeks && w >= p.weeks[0] && w <= p.weeks[1]; })[0] || null;
  }

  function defaultPick(lvl) {
    var p = nowPart(lvl) || partsOf(lvl)[0];
    return p ? [p.id] : [];
  }

  function saved(lvl) {
    var s = store().picks[lvl];
    if (Array.isArray(s)) return { ids: s, week: null };
    return s && Array.isArray(s.ids) ? s : { ids: [], week: null };
  }

  function picked(lvl) {
    lvl = lvl || level();
    if (lvl === 'b1') return [];
    var ids = partsOf(lvl).map(function (p) { return p.id; });
    var s = saved(lvl);
    var mine = s.ids.filter(function (id) { return ids.indexOf(id) !== -1; });
    var now = nowPart(lvl);
    if (mine.length && now && s.week != null && s.week !== weekOf() && mine.indexOf(now.id) === -1) mine = [];
    if (!mine.length) mine = defaultPick(lvl);
    return ids.filter(function (id) { return mine.indexOf(id) !== -1; });
  }

  function active() {
    return picked().map(partById).filter(Boolean);
  }

  function setLevel(id) {
    if (!levelById(id)) return;
    var L = store();
    L.level = id;
    LW.saveState();
  }

  function toggle(partId) {
    var lvl = level();
    if (lvl === 'b1') return;
    var cur = picked(lvl);
    var i = cur.indexOf(partId);
    if (i === -1) {
      if (!partById(partId) || partsOf(lvl).indexOf(partById(partId)) === -1) return;
      cur.push(partId);
    } else if (cur.length > 1) cur.splice(i, 1);
    var order = partsOf(lvl).map(function (p) { return p.id; });
    store().picks[lvl] = { ids: order.filter(function (id) { return cur.indexOf(id) !== -1; }), week: weekOf() };
    LW.saveState();
  }

  function label() {
    var lvl = level();
    var L = levelById(lvl);
    if (lvl === 'b1') return L.name;
    var parts = active();
    if (parts.length === 1) return L.name + ' · ' + parts[0].unit + ' · ' + parts[0].title;
    if (parts.length <= 3) return L.name + ' · ' + parts.map(function (p) { return p.unit; }).join(' + ');
    return L.name + ' · ' + parts.length + ' parts';
  }

  function general(kind) {
    if (kind === 'words') return LW.pool();
    return ((LW.HS || {})[kind] || []).slice();
  }

  function tiers(kind) {
    var lvl = level();
    var chosen = active();
    if (lvl === 'b1' || !chosen.length) return [general(kind)];
    var all = partsOf(lvl);
    var idx = chosen.map(function (p) { return all.indexOf(p); });
    var last = Math.max.apply(null, idx);
    var rest = all.filter(function (p) { return chosen.indexOf(p) === -1; });
    var before = rest.filter(function (p) { return all.indexOf(p) < last; }).reverse();
    var after = rest.filter(function (p) { return all.indexOf(p) > last; });
    var first = [];
    chosen.forEach(function (p) { first = first.concat(p[kind] || []); });
    var out = [first];
    before.concat(after).forEach(function (p) { out.push((p[kind] || []).slice()); });
    if (kind !== 'words') out.push(general(kind));
    return out;
  }

  function ordered(kind, need) {
    if (need == null) need = NEED[kind] || 1;
    var out = [];
    tiers(kind).forEach(function (t, i) {
      if (i > 0 && out.length >= need) return;
      out = out.concat(LW.u.shuffle(t));
    });
    return out;
  }

  function pick(kind, n) {
    return ordered(kind, Math.max(n, NEED[kind] || 1)).slice(0, n);
  }

  function wordTiers(opts) {
    opts = opts || {};
    var seen = {};
    var lvl = level();
    return tiers('words').map(function (t) {
      return t.filter(function (w) {
        if (!w || !w.hint || seen[w.en]) return false;
        if (opts.concrete && w.abstract) return false;
        seen[w.en] = true;
        return true;
      }).map(function (w) { return w.pack ? w : Object.assign({ pack: lvl }, w); });
    });
  }

  function words(opts) {
    opts = opts || {};
    var need = opts.need || NEED.words;
    var out = [];
    wordTiers(opts).forEach(function (t, i) {
      if (i > 0 && out.length >= need) return;
      out = out.concat(t);
    });
    return out;
  }

  function summary(parts) {
    parts = parts || active();
    var n = { words: 0, sentences: 0, gaps: 0, pairs: 0, forms: 0, dialogues: 0 };
    parts.forEach(function (p) { Object.keys(n).forEach(function (k) { n[k] += (p[k] || []).length; }); });
    return n;
  }

  LW.lesson = {
    levels: function () { return LW.LESSON_LEVELS.slice(); },
    levelInfo: levelById,
    part: partById,
    partsOf: partsOf,
    level: level,
    setLevel: setLevel,
    picked: picked,
    toggle: toggle,
    active: active,
    label: label,
    weekOf: weekOf,
    nowPart: nowPart,
    tiers: tiers,
    ordered: ordered,
    pick: pick,
    wordTiers: wordTiers,
    words: words,
    summary: summary
  };
})(window.LW);
