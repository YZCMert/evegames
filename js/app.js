/* EveGames — app shell, screens and router */
window.LW = window.LW || {};

(function (LW) {
  'use strict';

  var el, clear;

  LW.games = [];
  LW.registerGame = function (g) { LW.games.push(g); };

  var app;                 // root container
  var activeCleanup = null;

  function mountScreen(builder) {
    if (activeCleanup) { try { activeCleanup(); } catch (e) {} activeCleanup = null; }
    closeMenu();
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
    app.classList.remove('wide');
    clear(app);
    var result = builder(app);
    if (typeof result === 'function') activeCleanup = result;
    window.scrollTo(0, 0);
  }

  /* ============================================================
   *  Reusable bits
   * ========================================================= */

  function topBar(title, subtitle, onBack) {
    return el('div', { class: 'topbar' }, [
      onBack ? el('button', { class: 'icon-btn', title: 'Back', onclick: onBack, html: '&larr;' }) : el('span', { class: 'icon-btn ghost' }),
      el('div', { class: 'topbar-title' }, [
        el('h2', { text: title }),
        subtitle ? el('p', { text: subtitle }) : null
      ]),
      menuButton()
    ]);
  }

  /* ============================================================
   *  Menu drawer — reachable from every screen, so the teacher can
   *  jump straight to another game without finishing this one.
   * ========================================================= */

  function menuButton() {
    return el('button', { class: 'icon-btn menu-btn', title: 'Menu', html: '☰', onclick: openMenu });
  }

  var menuNode = null;

  function closeMenu() {
    if (!menuNode) return;
    menuNode.remove();
    menuNode = null;
  }

  function go(fn) {
    return function () { LW.sound.click(); closeMenu(); fn(); };
  }

  function openMenu() {
    if (menuNode) { closeMenu(); return; }
    LW.sound.click();

    var team = LW.currentTeam();
    var panel = el('aside', { class: 'menu-panel' });

    var overlay = el('div', { class: 'menu-overlay' }, [panel]);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeMenu(); });

    panel.appendChild(el('div', { class: 'menu-head' }, [
      el('span', { class: 'menu-logo', text: '🎡' }),
      el('div', {}, [
        el('strong', { text: 'EveGames' }),
        team ? el('small', { text: team.avatar + ' ' + team.name + ' · ' + team.score + ' pts' }) : null
      ]),
      el('button', { class: 'menu-close', html: '✕', title: 'Close', onclick: closeMenu })
    ]));

    var nav = el('div', { class: 'menu-nav' }, [
      menuRow('🎡', 'Spin the wheel', 'Let the wheel pick the next game', go(function () { LW.screens.wheel(); })),
      menuRow('🏆', 'Scoreboard', 'Standings and recent rounds', go(function () { LW.screens.scoreboard(); })),
      menuRow('⚙️', 'Teams & words', LW.state.mode === 'hs' ? 'Edit teams and choose the lesson (' + LW.lesson.label() + ')' : 'Edit teams and vocabulary packs', go(function () { LW.screens.setup(); })),
      menuRow('🔁', 'Restart match', 'Clear every score and start again', function () {
        if (!confirm('Reset all scores and start a new match?')) return;
        LW.resetMatch(); closeMenu(); LW.screens.wheel();
      })
    ]);
    panel.appendChild(nav);

    panel.appendChild(el('h4', { class: 'menu-title', html: 'Jump to a game' }));
    var grid = el('div', { class: 'menu-games' });
    LW.activeGames().forEach(function (g) {
      grid.appendChild(el('button', {
        class: 'menu-game', style: { '--gc': g.color },
        onclick: go(function () { LW.screens.intro(g); })
      }, [
        el('span', { class: 'mg-emoji', text: g.emoji }),
        el('span', { class: 'mg-name', text: g.name })
      ]));
    });
    panel.appendChild(grid);

    panel.appendChild(el('h4', { class: 'menu-title', html: 'Quick settings' }));
    var quick = el('div', { class: 'menu-quick' });
    quick.appendChild(segmented('Difficulty', [
      { v: 'easy', l: 'Easy' }, { v: 'normal', l: 'Normal' }, { v: 'hard', l: 'Hard' }
    ], LW.state.settings.difficulty, function (v) { LW.state.settings.difficulty = v; LW.saveState(); }));
    quick.appendChild(toggle('🔊 Sound effects', LW.state.settings.sound, function (v) { LW.state.settings.sound = v; LW.saveState(); }));
    quick.appendChild(toggle('🗣️ Read words aloud', LW.state.settings.speech, function (v) { LW.state.settings.speech = v; LW.saveState(); }));
    quick.appendChild(toggle('🇹🇭 Show Thai help', LW.state.settings.showNative, function (v) { LW.state.settings.showNative = v; LW.saveState(); }));
    panel.appendChild(quick);

    menuNode = overlay;
    document.body.appendChild(overlay);
  }

  function menuRow(icon, label, sub, onClick) {
    return el('button', { class: 'menu-row', onclick: onClick }, [
      el('span', { class: 'mr-icon', text: icon }),
      el('span', { class: 'mr-text' }, [
        el('strong', { text: label }),
        el('small', { text: sub })
      ])
    ]);
  }

  function teamStrip() {
    var cur = LW.currentTeam();
    var wrap = el('div', { class: 'team-strip' });
    LW.state.teams.forEach(function (t) {
      wrap.appendChild(el('div', {
        class: 'team-chip' + (cur && t.id === cur.id ? ' active' : ''),
        style: { '--tc': t.color }
      }, [
        el('span', { class: 'ava', text: t.avatar }),
        el('span', { class: 'nm', text: t.name }),
        el('span', { class: 'sc', text: String(t.score) })
      ]));
    });
    return wrap;
  }

  function bigButton(label, onClick, variant) {
    return el('button', { class: 'btn ' + (variant || 'primary'), onclick: function (e) { LW.sound.click(); onClick(e); } }, [
      typeof label === 'string' ? document.createTextNode(label) : label
    ]);
  }

  /* ============================================================
   *  Screen: Setup
   * ========================================================= */

  function setupScreen() {
    mountScreen(function (root) {
      var s = LW.state;
      if (!s.teams.length) { LW.addTeam('Team 1'); LW.addTeam('Team 2'); }

      var heroSub = el('p', { class: 'hero-sub' });
      root.appendChild(el('div', { class: 'hero school' }, [
        el('img', { class: 'hero-crest', src: 'assets/maryvit-crest.png', alt: 'Maryvit School crest', width: 96, height: 94 }),
        el('h1', { class: 'hero-title', text: 'EveGames' }),
        el('p', { class: 'hero-by', html: 'by <b>T. Eve</b> · Maryvit Affiliated Schools' }),
        heroSub
      ]));

      var card = el('section', { class: 'card' });
      root.appendChild(card);

      /* ---- Mode ---- */
      card.appendChild(el('h3', { class: 'sec-title', html: '🎮 Game set' }));
      var modeRow = el('div', { class: 'mode-switch' });
      card.appendChild(modeRow);
      function renderModes() {
        clear(modeRow);
        LW.MODES.forEach(function (m) {
          var n = LW.games.filter(function (g) { return (g.mode || 'classic') === m.id; }).length;
          modeRow.appendChild(el('button', {
            class: 'mode-opt' + (s.mode === m.id ? ' on' : ''),
            onclick: function () { LW.sound.click(); LW.setMode(m.id); renderModes(); }
          }, [
            el('span', { class: 'mo-emoji', text: m.emoji }),
            el('span', { class: 'mo-text' }, [
              el('strong', { text: m.name }),
              el('small', { text: m.brief })
            ]),
            el('span', { class: 'mo-count', text: n + ' games' })
          ]));
        });
        var active = LW.activeGames().length;
        heroSub.textContent = s.mode === 'hs'
          ? 'High School 3D · ' + active + ' games · ' + LW.lesson.label()
          : 'Spin the wheel · ' + active + ' English games · one classroom';
        if (wordsBox) renderWords();
      }
      var wordsBox = null;
      renderModes();

      /* ---- Teams ---- */
      card.appendChild(el('h3', { class: 'sec-title', html: '👥 Teams' }));
      var teamList = el('div', { class: 'team-editor' });
      card.appendChild(teamList);

      function renderTeams() {
        clear(teamList);
        s.teams.forEach(function (t, i) {
          var row = el('div', { class: 'team-row', style: { '--tc': t.color } }, [
            el('button', {
              class: 'ava-btn', text: t.avatar, title: 'Change avatar',
              onclick: function () {
                var idx = LW.TEAM_AVATARS.indexOf(t.avatar);
                t.avatar = LW.TEAM_AVATARS[(idx + 1) % LW.TEAM_AVATARS.length];
                LW.sound.click(); renderTeams(); LW.saveState();
              }
            }),
            el('input', {
              class: 'team-name', value: t.name, maxlength: 16,
              oninput: function (e) { t.name = e.target.value || ('Team ' + (i + 1)); LW.saveState(); }
            }),
            s.teams.length > 1 ? el('button', {
              class: 'del-btn', html: '✕', title: 'Remove team',
              onclick: function () { s.teams.splice(i, 1); LW.sound.click(); renderTeams(); LW.saveState(); }
            }) : null
          ]);
          teamList.appendChild(row);
        });
        if (s.teams.length < 6) {
          teamList.appendChild(el('button', {
            class: 'add-team', html: '＋ Add team',
            onclick: function () { LW.addTeam(); LW.sound.click(); renderTeams(); LW.saveState(); }
          }));
        }
      }
      renderTeams();

      wordsBox = el('div', { class: 'words-box' });
      card.appendChild(wordsBox);

      function renderWords() {
        clear(wordsBox);
        var lessonOn = s.mode === 'hs';
        if (lessonOn) renderLesson();
        if (!lessonOn || LW.lesson.level() === 'b1') renderPacks(lessonOn);
      }

      function renderLesson() {
        wordsBox.appendChild(el('h3', { class: 'sec-title', html: '<span class="sec-name">📘 Lesson</span> <small>— the questions in every 3D game come from here</small>' }));
        var levelRow = el('div', { class: 'level-switch' });
        wordsBox.appendChild(levelRow);
        var current = LW.lesson.level();
        LW.lesson.levels().forEach(function (L) {
          if (L.id !== 'b1' && !LW.lesson.partsOf(L.id).length) return;
          levelRow.appendChild(el('button', {
            class: 'level-opt' + (current === L.id ? ' on' : ''),
            'aria-pressed': current === L.id ? 'true' : 'false',
            style: { '--lc': L.color },
            onclick: function () { LW.sound.click(); LW.lesson.setLevel(L.id); renderModes(); }
          }, [
            el('span', { class: 'lv-emoji', text: L.emoji }),
            el('span', { class: 'lv-text' }, [el('strong', { text: L.name }), el('small', { text: L.brief })])
          ]));
        });
        if (current === 'b1') return;
        var L = LW.lesson.levelInfo(current);
        var picked = LW.lesson.picked();
        var now = LW.lesson.nowPart(current);
        wordsBox.appendChild(el('p', { class: 'note lesson-tip', text: 'Tap the part you are teaching. Choose several parts for a mixed review.' }));
        var grid = el('div', { class: 'pack-grid lesson-grid' });
        wordsBox.appendChild(grid);
        LW.lesson.partsOf(current).forEach(function (p) {
          grid.appendChild(el('button', {
            class: 'pack lesson-part' + (picked.indexOf(p.id) !== -1 ? ' on' : ''),
            'aria-pressed': picked.indexOf(p.id) !== -1 ? 'true' : 'false',
            style: { '--pc': L.color },
            'data-part': p.id,
            onclick: function () { LW.sound.click(); LW.lesson.toggle(p.id); renderModes(); }
          }, [
            now === p ? el('span', { class: 'lesson-now', text: '📅 this week' }) : null,
            el('span', { class: 'pack-emoji', text: p.emoji }),
            el('span', { class: 'pack-name', text: p.unit + ' · ' + p.title }),
            el('span', { class: 'lesson-focus', text: p.focus.join(' · ') })
          ]));
        });
        var n = LW.lesson.summary();
        wordsBox.appendChild(el('p', { class: 'note lesson-count', text:
          picked.length + ' part(s) · ' + n.words + ' words · ' + n.sentences + ' sentences · ' + n.gaps + ' gap-fills · ' +
          n.pairs + ' matching sets · ' + n.forms + ' spelling words · ' + n.dialogues + ' dialogues' }));
      }

      function renderPacks(underLesson) {
        wordsBox.appendChild(el('h3', { class: 'sec-title', html: underLesson ? '<span class="sec-name">📚 Word packs</span> <small>— for Word Heist and the quick questions</small>' : '📚 Vocabulary' }));
        var packGrid = el('div', { class: 'pack-grid' });
        wordsBox.appendChild(packGrid);
        LW.PACKS.forEach(function (p) {
          var on = s.packIds.indexOf(p.id) !== -1;
          var btn = el('button', {
            class: 'pack' + (on ? ' on' : ''),
            style: { '--pc': p.color },
            onclick: function () {
              var i = s.packIds.indexOf(p.id);
              if (i === -1) s.packIds.push(p.id);
              else if (s.packIds.length > 1) s.packIds.splice(i, 1);
              LW.sound.click();
              btn.classList.toggle('on', s.packIds.indexOf(p.id) !== -1);
              LW.saveState();
              updateCount();
            }
          }, [
            el('span', { class: 'pack-emoji', text: p.emoji }),
            el('span', { class: 'pack-name', text: p.name }),
            el('span', { class: 'pack-th', text: p.th })
          ]);
          packGrid.appendChild(btn);
        });
        var countNote = el('p', { class: 'note' });
        wordsBox.appendChild(countNote);
        function updateCount() {
          var c = LW.coverage();
          clear(countNote);
          countNote.appendChild(document.createTextNode(
            c.total + ' words · ' + LW.state.packIds.length + ' pack(s) · ' +
            c.seen + ' practised so far'));
          if (c.seen) {
            countNote.appendChild(el('button', {
              class: 'link-btn inline', text: 'start the word cycle again',
              onclick: function () { LW.resetCoverage(); updateCount(); }
            }));
          }
        }
        updateCount();
      }
      renderWords();

      /* ---- Options ---- */
      card.appendChild(el('h3', { class: 'sec-title', html: '⚙️ Options' }));
      var opts = el('div', { class: 'opts' });
      card.appendChild(opts);

      opts.appendChild(segmented('Difficulty', [
        { v: 'easy', l: 'Easy' }, { v: 'normal', l: 'Normal' }, { v: 'hard', l: 'Hard' }
      ], s.settings.difficulty, function (v) { s.settings.difficulty = v; LW.saveState(); }));

      opts.appendChild(segmented('Turns in a match', [
        { v: 6, l: '6' }, { v: 9, l: '9' }, { v: 12, l: '12' }, { v: 99, l: '∞' }
      ], s.roundsTarget, function (v) { s.roundsTarget = v; LW.saveState(); }));

      var toggles = el('div', { class: 'toggles' });
      card.appendChild(toggles);
      toggles.appendChild(toggle('🔊 Sound effects', s.settings.sound, function (v) { s.settings.sound = v; LW.saveState(); }));
      toggles.appendChild(toggle('🗣️ Read words aloud', s.settings.speech, function (v) { s.settings.speech = v; LW.saveState(); }));
      toggles.appendChild(toggle('🇹🇭 Show Thai help', s.settings.showNative, function (v) { s.settings.showNative = v; LW.saveState(); }));
      card.appendChild(voicePicker());

      /* ---- Start ---- */
      var midMatch = s.roundsPlayed > 0 || s.teams.some(function (t) { return t.score > 0; });
      var actions = el('div', { class: 'setup-actions' }, [
        midMatch ? bigButton('▶  Continue the match', function () { LW.screens.wheel(); }) : null,
        bigButton(midMatch ? '🎡  Start a new match' : '🎡  Start the match', function () {
          LW.resetMatch();
          LW.screens.wheel();
        }, midMatch ? 'ghost-btn' : undefined),
        bigButton('Browse all games', function () { LW.screens.gamePicker(); }, 'ghost-btn')
      ]);
      root.appendChild(actions);

      root.appendChild(el('p', { class: 'footnote', html: 'Tip: give the tablet / board to the team whose turn it is. Press <b>🏆</b> any time to see the scoreboard.' }));
      root.appendChild(el('p', { class: 'school-credit' }, [
        el('img', { src: 'assets/maryvit-crest-64.png', alt: '', width: 22, height: 22 }),
        el('span', { html: 'Made by <b>T. Eve</b> for Maryvit School · <i>Sedes Sapientiae</i>' })
      ]));
    });
  }

  function segmented(label, options, value, onChange) {
    var wrap = el('div', { class: 'seg-wrap' }, [el('span', { class: 'seg-label', text: label })]);
    var row = el('div', { class: 'seg' });
    options.forEach(function (o) {
      var b = el('button', {
        class: 'seg-btn' + (o.v === value ? ' on' : ''), text: o.l,
        onclick: function () {
          LW.sound.click();
          Array.prototype.forEach.call(row.children, function (c) { c.classList.remove('on'); });
          b.classList.add('on');
          onChange(o.v);
        }
      });
      row.appendChild(b);
    });
    wrap.appendChild(row);
    return wrap;
  }

  /* Voice chooser: the best English voice is pre-selected, the teacher can
     pick another and hear a sample. Voices arrive asynchronously in Chrome,
     so the list is rebuilt on voiceschanged. */
  function voicePicker() {
    var wrap = el('div', { class: 'voice-row' });
    if (!('speechSynthesis' in window)) return wrap;
    var select = el('select', { class: 'voice-select', title: 'Voice for reading aloud' });
    function fill() {
      clear(select);
      var list = LW.voices();
      if (!list.length) { select.appendChild(el('option', { text: 'No English voice found', value: '' })); return; }
      var current = LW.pickVoice();
      list.forEach(function (v) {
        var o = el('option', { value: v.voiceURI, text: v.name + ' (' + v.lang + ')' + (v.localService === false ? ' ☁' : '') });
        if (current && v.voiceURI === current.voiceURI) o.selected = true;
        select.appendChild(o);
      });
    }
    fill();
    if (window.speechSynthesis.addEventListener) window.speechSynthesis.addEventListener('voiceschanged', fill);
    select.addEventListener('change', function () {
      LW.state.settings.voice = select.value;
      LW.saveState();
      LW.speak('Hello class! Let us play.');
    });
    wrap.appendChild(el('span', { class: 'seg-label', text: '🎙️ Voice' }));
    wrap.appendChild(select);
    wrap.appendChild(el('button', { class: 'btn ghost-btn small', text: '▶ Test', onclick: function () { LW.speak('The weather is lovely today, isn\'t it?'); } }));
    return wrap;
  }

  function toggle(label, value, onChange) {
    var input = el('input', { type: 'checkbox', checked: value ? true : null });
    input.addEventListener('change', function () { onChange(input.checked); });
    return el('label', { class: 'toggle' }, [input, el('span', { class: 'track' }), el('span', { class: 'tl', text: label })]);
  }

  /* ============================================================
   *  Screen: Wheel (hub)
   * ========================================================= */

  function wheelScreen() {
    mountScreen(function (root) {
      if (LW.matchFinished()) { LW.screens.final(); return; }
      var team = LW.currentTeam();

      root.appendChild(topBar('Spin the wheel', 'Round ' + (LW.state.roundsPlayed + 1) +
        (LW.state.roundsTarget < 99 ? ' / ' + LW.state.roundsTarget : ''), function () { LW.screens.setup(); }));
      root.appendChild(teamStrip());

      root.appendChild(el('div', { class: 'turn-banner', style: { '--tc': team.color } }, [
        el('span', { class: 'ava', text: team.avatar }),
        el('div', {}, [
          el('strong', { text: team.name + "'s turn" }),
          el('small', { text: 'Spin the wheel to get your game.' })
        ])
      ]));

      var wheelHost = el('div', { class: 'wheel-host' });
      root.appendChild(wheelHost);

      LW.buildWheel(wheelHost, function (game) {
        LW.screens.intro(game);
      });

      root.appendChild(el('div', { class: 'wheel-foot' }, [
        el('button', { class: 'link-btn', text: 'or choose a game yourself →', onclick: function () { LW.screens.gamePicker(); } })
      ]));
    });
  }

  /* ============================================================
   *  Screen: Game picker
   * ========================================================= */

  function gamePickerScreen() {
    mountScreen(function (root) {
      root.appendChild(topBar('All games', 'Pick any game directly', function () {
        LW.state.teams.length ? LW.screens.wheel() : LW.screens.setup();
      }));
      var grid = el('div', { class: 'game-grid' });
      root.appendChild(grid);
      LW.activeGames().forEach(function (g) {
        grid.appendChild(el('button', {
          class: 'game-card', style: { '--gc': g.color },
          onclick: function () { LW.sound.click(); LW.screens.intro(g); }
        }, [
          el('span', { class: 'gc-emoji', text: g.emoji }),
          el('span', { class: 'gc-name', text: g.name }),
          el('span', { class: 'gc-tag', text: g.tag || '' })
        ]));
      });
    });
  }

  /* ============================================================
   *  Screen: Game intro (rules)
   * ========================================================= */

  function introScreen(game) {
    mountScreen(function (root) {
      var team = LW.currentTeam();
      root.appendChild(topBar(game.name, game.tag || null, function () { LW.screens.wheel(); }));

      var card = el('section', { class: 'card intro-card', style: { '--gc': game.color } }, [
        el('div', { class: 'intro-emoji', text: game.emoji }),
        el('h2', { class: 'intro-title', text: game.name }),
        el('p', { class: 'intro-rule', text: game.howto }),
        LW.state.settings.showNative && game.howtoTh ? el('p', { class: 'intro-rule native', text: game.howtoTh }) : null,
        el('div', { class: 'intro-meta' }, [
          el('span', { class: 'pill', text: '⏱ ' + (game.timeLabel || 'No limit') }),
          el('span', { class: 'pill', text: '🎯 ' + (game.pointsLabel || 'Points per answer') }),
          game.team ? el('span', { class: 'pill', text: '👥 All teams play together' }) : team ? el('span', { class: 'pill', style: { '--tc': team.color }, text: team.avatar + ' ' + team.name }) : null,
          game.mode === 'hs' ? el('span', { class: 'pill lesson-pill', text: '📘 ' + LW.lesson.label() }) : null
        ]),
        bigButton('▶  Play', function () { LW.screens.play(game); })
      ]);
      root.appendChild(card);
    });
  }

  /* ============================================================
   *  Screen: Play
   * ========================================================= */

  function playScreen(game) {
    mountScreen(function (root) {
      var team = LW.currentTeam();
      var finished = false;
      LW.consumeGame(game.id);   // spend it from the rotation bag

      var scoreEl = el('span', { class: 'hud-score', text: '0' });
      var timerEl = el('span', { class: 'hud-timer', text: '' });

      var is3d = game.mode === 'hs';
      app.classList.toggle('wide', is3d);
      var stage = el('div', { class: 'stage' + (is3d ? ' stage-3d' : '') });
      var fullBtn = is3d && document.documentElement && document.documentElement.requestFullscreen ? el('button', { class: 'icon-btn', html: '⛶', title: 'Fullscreen', onclick: function () {
        if (document.fullscreenElement) document.exitFullscreen();
        else stage.requestFullscreen().catch(function () {});
      } }) : null;

      root.appendChild(el('div', { class: 'hud', style: { '--gc': game.color } }, [
        el('button', { class: 'icon-btn', html: '&larr;', title: 'Quit game', onclick: function () {
          if (confirm('Quit this game? No points will be given.')) LW.screens.wheel();
        } }),
        menuButton(),
        el('div', { class: 'hud-mid' }, [
          el('span', { class: 'hud-game', text: game.emoji + ' ' + game.name }),
          game.team ? el('span', { class: 'hud-team', text: '👥 All teams play' }) : team ? el('span', { class: 'hud-team', style: { '--tc': team.color }, text: team.avatar + ' ' + team.name }) : null
        ]),
        el('div', { class: 'hud-right' }, [timerEl, el('span', { class: 'hud-score-wrap' }, [el('span', { class: 'hud-star', text: '⭐' }), scoreEl]), fullBtn])
      ]));

      root.appendChild(stage);

      var api = {
        stage: stage,
        team: team,
        setScore: function (n) { scoreEl.textContent = String(n); scoreEl.classList.remove('bump'); void scoreEl.offsetWidth; scoreEl.classList.add('bump'); },
        setTimer: function (txt, danger) {
          timerEl.textContent = txt || '';
          timerEl.classList.toggle('danger', !!danger);
        },
        finish: function (points, detail) {
          if (finished) return;
          finished = true;
          LW.screens.result(game, Math.max(0, Math.round(points)), detail);
        },
        finishTeams: function (results, detail) {
          if (finished) return;
          finished = true;
          LW.screens.resultTeams(game, results, detail);
        }
      };

      var cleanup = game.mount(stage, api);
      return function () { if (typeof cleanup === 'function') cleanup(); };
    });
  }

  /* ============================================================
   *  Screen: Result
   * ========================================================= */

  function resultScreen(game, points, detail) {
    LW.awardPoints(points, game.name);
    var team = LW.currentTeam();

    mountScreen(function (root) {
      if (points > 0) { LW.sound.win(); LW.confetti(points >= 60 ? 110 : 60); }

      root.appendChild(el('section', { class: 'card result-card', style: { '--tc': team.color } }, [
        el('div', { class: 'res-emoji', text: points >= 60 ? '🏅' : points > 0 ? '👏' : '💪' }),
        el('h2', { class: 'res-title', text: points >= 60 ? 'Excellent!' : points > 0 ? 'Well played!' : 'Good try!' }),
        el('div', { class: 'res-points' }, [
          el('span', { class: 'rp-num', text: '+' + points }),
          el('span', { class: 'rp-lbl', text: 'points' })
        ]),
        el('p', { class: 'res-team', text: team.avatar + '  ' + team.name + ' — total ' + team.score }),
        detail ? el('p', { class: 'res-detail', text: detail }) : null,
        el('div', { class: 'res-actions' }, [
          bigButton('Next team ▶', function () {
            LW.nextTurn();
            if (LW.matchFinished()) LW.screens.final();
            else LW.screens.wheel();
          }),
          bigButton('Play again', function () { LW.screens.play(game); }, 'ghost-btn')
        ])
      ]));

      root.appendChild(teamStrip());
    });
  }

  function resultTeamsScreen(game, results, detail) {
    LW.awardTeams(results, game.name);
    var best = results[0];

    mountScreen(function (root) {
      LW.sound.win();
      LW.confetti(120);
      var card = el('section', { class: 'card result-card', style: { '--tc': best ? best.color : '#2a2440' } }, [
        el('div', { class: 'res-emoji', text: '🏆' }),
        el('h2', { class: 'res-title', text: game.emoji + ' ' + game.name }),
        best ? el('p', { class: 'res-team', text: best.avatar + '  ' + best.name + ' takes the round!' }) : null,
        detail ? el('p', { class: 'res-detail', text: detail }) : null
      ]);
      var list = el('div', { class: 'team-results' });
      results.forEach(function (r, i) {
        var t = LW.state.teams.filter(function (x) { return x.id === r.id; })[0];
        list.appendChild(el('div', { class: 'rank-row' + (i === 0 ? ' champ' : ''), style: { '--tc': r.color } }, [
          el('span', { class: 'rk', text: ['🥇', '🥈', '🥉'][i] || (i + 1) + '.' }),
          el('span', { class: 'ava', text: r.avatar }),
          el('span', { class: 'nm', text: r.name }),
          el('span', { class: 'tr-note', text: r.note || '' }),
          el('b', { class: 'sc', text: '+' + r.points + (t ? ' → ' + t.score : '') })
        ]));
      });
      card.appendChild(list);
      card.appendChild(el('div', { class: 'res-actions' }, [
        bigButton('Continue ▶', function () {
          LW.nextTurn();
          if (LW.matchFinished()) LW.screens.final();
          else LW.screens.wheel();
        }),
        bigButton('Play again', function () { LW.screens.play(game); }, 'ghost-btn')
      ]));
      root.appendChild(card);
      root.appendChild(teamStrip());
    });
  }

  /* ============================================================
   *  Screen: Scoreboard / Final
   * ========================================================= */

  function scoreboardScreen() {
    mountScreen(function (root) {
      root.appendChild(topBar('Scoreboard', 'Standings and recent rounds', function () { LW.screens.wheel(); }));
      root.appendChild(rankingCard(false));
      var hist = LW.state.history.slice().reverse().slice(0, 12);
      if (hist.length) {
        var list = el('section', { class: 'card' }, [el('h3', { class: 'sec-title', text: 'Recent rounds' })]);
        hist.forEach(function (h) {
          list.appendChild(el('div', { class: 'hist-row' }, [
            el('span', { text: h.team }),
            el('span', { class: 'hist-game', text: h.game }),
            el('b', { text: '+' + h.points })
          ]));
        });
        root.appendChild(list);
      }
      root.appendChild(el('div', { class: 'setup-actions' }, [
        bigButton('Back to the wheel', function () { LW.screens.wheel(); })
      ]));
    });
  }

  function rankingCard(podium) {
    var rank = LW.ranking();
    var card = el('section', { class: 'card' });
    rank.forEach(function (t, i) {
      var medal = ['🥇', '🥈', '🥉'][i] || (i + 1) + '.';
      var max = Math.max(1, rank[0].score);
      card.appendChild(el('div', { class: 'rank-row' + (podium && i === 0 ? ' champ' : ''), style: { '--tc': t.color } }, [
        el('span', { class: 'rk', text: medal }),
        el('span', { class: 'ava', text: t.avatar }),
        el('span', { class: 'nm', text: t.name }),
        el('span', { class: 'bar' }, [el('i', { style: { width: Math.round((t.score / max) * 100) + '%' } })]),
        el('b', { class: 'sc', text: String(t.score) })
      ]));
    });
    return card;
  }

  function finalScreen() {
    mountScreen(function (root) {
      LW.sound.win();
      LW.confetti(160);
      var winner = LW.ranking()[0];
      root.appendChild(el('div', { class: 'hero' }, [
        el('div', { class: 'hero-logo', text: '🏆' }),
        el('h1', { class: 'hero-title', text: 'Game over!' }),
        el('p', { class: 'hero-sub', text: winner ? winner.avatar + '  ' + winner.name + ' wins with ' + winner.score + ' points!' : '' })
      ]));
      root.appendChild(rankingCard(true));
      root.appendChild(el('div', { class: 'setup-actions' }, [
        bigButton('🔁  New match (same teams)', function () { LW.resetMatch(); LW.screens.wheel(); }),
        bigButton('⚙️  Change teams & words', function () { LW.screens.setup(); }, 'ghost-btn')
      ]));
    });
  }

  /* ============================================================
   *  Boot
   * ========================================================= */

  LW.screens = {
    setup: setupScreen,
    wheel: wheelScreen,
    gamePicker: gamePickerScreen,
    intro: introScreen,
    play: playScreen,
    result: resultScreen,
    resultTeams: resultTeamsScreen,
    scoreboard: scoreboardScreen,
    final: finalScreen
  };

  LW.ui = { el: null, topBar: topBar, teamStrip: teamStrip, bigButton: bigButton };

  LW.boot = function () {
    el = LW.u.el; clear = LW.u.clear;
    LW.ui.el = el;
    LW.ui.bigButton = bigButton;
    app = document.getElementById('app');
    LW.loadState();
    setupScreen();
  };
})(window.LW);
