/* EveGames — game state, teams, scoring, persistence */
window.LW = window.LW || {};

(function (LW) {
  'use strict';

  var KEY = 'evegames.v1';

  var defaults = {
    teams: [],
    packIds: ['farm'],
    turn: 0,            // index of current team
    roundsPlayed: 0,    // total games played
    roundsTarget: 9,    // game ends after this many turns
    history: [],        // { team, game, points }
    gameBag: [],        // game ids not yet played in this cycle
    lastGameId: null,   // so a refilled bag cannot repeat across the seam
    wordSeen: {},       // en -> how many times the class has met this word
    mode: 'classic',    // 'classic' (11 word games) or 'hs' (High School 3D)
    lesson: { level: 'b1', picks: {} },
    settings: { sound: true, speech: true, showNative: true, difficulty: 'normal', voice: '' }
  };

  LW.state = JSON.parse(JSON.stringify(defaults));

  LW.saveState = function () {
    try { localStorage.setItem(KEY, JSON.stringify(LW.state)); } catch (e) {}
  };

  LW.loadState = function () {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return false;
      var saved = JSON.parse(raw);
      LW.state = Object.assign(JSON.parse(JSON.stringify(defaults)), saved);
      LW.state.settings = Object.assign({}, defaults.settings, saved.settings || {});
      return Array.isArray(LW.state.teams) && LW.state.teams.length > 0;
    } catch (e) { return false; }
  };

  LW.resetMatch = function () {
    LW.state.turn = 0;
    LW.state.roundsPlayed = 0;
    LW.state.history = [];
    LW.state.gameBag = [];
    LW.state.lastGameId = null;
    LW.state.teams.forEach(function (t) { t.score = 0; t.played = 0; });
    LW.saveState();
  };

  /* ---------- Modes ----------
   * Two game sets live in one app: the classic word games for ages 13-16 and
   * the 3D High School games (B1). Only the games of the current mode go on
   * the wheel, in the menu and in the rotation bag.
   */

  LW.MODES = [
    { id: 'classic', name: 'Classic', emoji: '🎡', brief: '11 word games · ages 13–16' },
    { id: 'hs',      name: 'High School 3D', emoji: '🧊', brief: '6 3D games incl. 2 team games · M.1 / M.2 lessons or the B1 mix' }
  ];

  LW.activeGames = function () {
    var mode = LW.state.mode || 'classic';
    return LW.games.filter(function (g) { return (g.mode || 'classic') === mode; });
  };

  LW.setMode = function (mode) {
    if (!LW.MODES.some(function (m) { return m.id === mode; })) return;
    if (LW.state.mode === mode) return;
    LW.state.mode = mode;
    LW.state.gameBag = [];
    LW.state.lastGameId = null;
    LW.saveState();
  };

  LW.resetAll = function () {
    LW.state = JSON.parse(JSON.stringify(defaults));
    try { localStorage.removeItem(KEY); } catch (e) {}
  };

  /* ---------- Teams ---------- */

  LW.addTeam = function (name) {
    var i = LW.state.teams.length;
    if (i >= 6) return null;
    var team = {
      id: 't' + Date.now() + '_' + i,
      name: name || ('Team ' + (i + 1)),
      avatar: LW.TEAM_AVATARS[i % LW.TEAM_AVATARS.length],
      color: LW.TEAM_COLORS[i % LW.TEAM_COLORS.length],
      score: 0,
      played: 0
    };
    LW.state.teams.push(team);
    return team;
  };

  LW.currentTeam = function () {
    if (!LW.state.teams.length) return null;
    return LW.state.teams[LW.state.turn % LW.state.teams.length];
  };

  LW.awardPoints = function (points, gameName) {
    var team = LW.currentTeam();
    if (!team) return;
    team.score += points;
    team.played += 1;
    LW.state.history.push({ team: team.name, game: gameName, points: points });
    LW.saveState();
  };

  LW.awardTeams = function (results, gameName) {
    (results || []).forEach(function (r) {
      var team = LW.state.teams.filter(function (t) { return t.id === r.id; })[0];
      if (!team) return;
      var pts = Math.max(0, Math.round(r.points || 0));
      team.score += pts;
      team.played += 1;
      LW.state.history.push({ team: team.name, game: gameName, points: pts });
    });
    LW.saveState();
  };

  LW.nextTurn = function () {
    LW.state.turn = (LW.state.turn + 1) % Math.max(1, LW.state.teams.length);
    LW.state.roundsPlayed += 1;
    LW.saveState();
  };

  LW.matchFinished = function () {
    return LW.state.roundsPlayed >= LW.state.roundsTarget;
  };

  LW.ranking = function () {
    return LW.state.teams.slice().sort(function (a, b) { return b.score - a.score; });
  };

  /* ---------- Word pool ---------- */

  LW.activePacks = function () {
    var ids = LW.state.packIds;
    var packs = LW.PACKS.filter(function (p) { return ids.indexOf(p.id) !== -1; });
    return packs.length ? packs : [LW.PACKS[0]];
  };

  /* All words from the selected packs, de-duplicated by English word. */
  LW.pool = function () {
    var seen = {}, out = [];
    LW.activePacks().forEach(function (p) {
      p.words.forEach(function (w) {
        if (seen[w.en]) return;
        seen[w.en] = true;
        out.push(Object.assign({ pack: p.id, packName: p.name }, w));
      });
    });
    return out;
  };

  /* ---------- word coverage ----------
   * Sampling uniformly at random meant that with one 16-word pack the class
   * met the same handful all lesson while other words never appeared at all.
   * Words are therefore drawn least-seen-first: every word in the pack is
   * used once before any word is used twice. Inside a tier the order is
   * shuffled, so a set still feels unpredictable.
   */

  LW.markSeen = function (w) {
    var en = typeof w === 'string' ? w : w.en;
    if (!en) return;
    LW.state.wordSeen[en] = (LW.state.wordSeen[en] || 0) + 1;
  };

  function draw(candidates, n, mark) {
    var seen = LW.state.wordSeen || (LW.state.wordSeen = {});
    var tiers = {};
    candidates.forEach(function (w) {
      var c = seen[w.en] || 0;
      (tiers[c] = tiers[c] || []).push(w);
    });
    var counts = Object.keys(tiers).map(Number).sort(function (a, b) { return a - b; });
    var out = [];
    for (var i = 0; i < counts.length && out.length < n; i++) {
      out = out.concat(LW.u.shuffle(tiers[counts[i]]).slice(0, n - out.length));
    }
    out = LW.u.shuffle(out);
    if (mark) { out.forEach(LW.markSeen); LW.saveState(); }
    return out;
  }

  function wantsMark(opts) { return !(opts && opts.mark === false); }

  /* n words from the pool, preferring ones the class has not met yet. */
  LW.words = function (n, filterFn, opts) {
    var p = LW.pool();
    if (filterFn) p = p.filter(filterFn);
    return draw(p, Math.min(n, p.length), wantsMark(opts));
  };

  /* Same rule, but over an explicit list (one pack, say). */
  LW.wordsFrom = function (list, n, opts) {
    return draw(list, Math.min(n, list.length), wantsMark(opts));
  };

  /* How much of the selected vocabulary the class has actually practised. */
  LW.coverage = function () {
    var pool = LW.pool();
    var seen = LW.state.wordSeen || {};
    return {
      seen: pool.filter(function (w) { return seen[w.en]; }).length,
      total: pool.length
    };
  };

  LW.resetCoverage = function () {
    LW.state.wordSeen = {};
    LW.saveState();
  };

  /* ---------- game rotation ----------
   * The wheel used to avoid only the previous game, so over nine turns the
   * same game could still come up three times. Games are now drawn from a
   * bag: every game is played once before any game repeats.
   */

  function allGameIds() { return LW.activeGames().map(function (g) { return g.id; }); }

  LW.remainingGames = function () {
    if (!LW.state.gameBag || !LW.state.gameBag.length) LW.state.gameBag = allGameIds();
    var bag = LW.state.gameBag;
    var pool = LW.activeGames().filter(function (g) { return bag.indexOf(g.id) !== -1; });
    if (pool.length > 1 && LW.state.lastGameId) {
      var fresh = pool.filter(function (g) { return g.id !== LW.state.lastGameId; });
      if (fresh.length) pool = fresh;
    }
    return pool;
  };

  /* Games already used up in this cycle — the wheel greys these out. */
  LW.playedGameIds = function () {
    var bag = LW.state.gameBag || [];
    if (!bag.length) return [];
    return allGameIds().filter(function (id) { return bag.indexOf(id) === -1; });
  };

  /* The wheel stopped on a game but nobody has played it yet: block an
     immediate repeat without spending it from the bag. */
  LW.landedOn = function (id) {
    LW.state.lastGameId = id;
    LW.saveState();
  };

  /* The game was actually played — spend it. */
  LW.consumeGame = function (id) {
    if (!LW.state.gameBag || !LW.state.gameBag.length) LW.state.gameBag = allGameIds();
    var i = LW.state.gameBag.indexOf(id);
    if (i !== -1) LW.state.gameBag.splice(i, 1);
    LW.state.lastGameId = id;
    LW.saveState();
  };

  /* Words that are NOT in the selected packs — used for Odd One Out distractors. */
  LW.outsiderWords = function (n) {
    var ids = LW.state.packIds;
    var others = LW.PACKS.filter(function (p) { return ids.indexOf(p.id) === -1; });
    if (!others.length) others = LW.PACKS;
    var flat = [];
    others.forEach(function (p) {
      p.words.forEach(function (w) { flat.push(Object.assign({ pack: p.id, packName: p.name }, w)); });
    });
    return LW.u.sample(flat, n);
  };

  /* Difficulty helpers — scale sizes and timers. */
  LW.diff = function (easy, normal, hard) {
    var d = LW.state.settings.difficulty;
    if (d === 'easy') return easy;
    if (d === 'hard') return hard;
    return normal;
  };

  /* True when a game may show a give-away prop (the Thai gloss, or the
     English word printed under a picture). On Normal and Hard the student has
     to do the mapping themselves, otherwise the game answers itself. */
  LW.scaffold = function () {
    return LW.state.settings.difficulty === 'easy' && LW.state.settings.showNative !== false;
  };
})(window.LW);
