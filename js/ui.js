'use strict';
// Pantallas, HUD e interacción con el ratón y el teclado.

const $ = sel => document.querySelector(sel);
const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const KIND_COLOR = { ranged: '#5ad1ff', short: '#ff8a3d', melee: '#e05a8a' };

const UI = {
  screen: 'menu',
  mode: 'move',
  abilityId: null,
  hover: null,
  reach: null,
  valid: new Set(),
  mission: null,
  squadList: [],

  // ---------------- navegación ----------------
  show(id) {
    this.screen = id;
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === 'screen-' + id));
    if (id === 'menu') this.renderMenu();
    if (id === 'missions') this.renderMissions();
    if (id === 'squad') this.renderSquad();
  },

  rerender() {
    I18N.apply();
    if (this.screen === 'battle') { this.buildActions(); this.refresh(); }
    else this.show(this.screen);
  },

  // ---------------- menú ----------------
  renderMenu() {
    document.querySelectorAll('[data-lang]').forEach(b => b.classList.toggle('on', b.dataset.lang === I18N.lang));
    document.querySelectorAll('[data-diff]').forEach(b => b.classList.toggle('on', b.dataset.diff === Game.difficulty));
    $('#diff-desc').textContent = t('diff.' + Game.difficulty + '.desc');
    $('#btn-sound').textContent = Sfx.muted ? t('menu.soundOff') : t('menu.soundOn');
  },

  // ---------------- misiones ----------------
  renderMissions() {
    const box = $('#mission-list');
    box.innerHTML = '';
    for (const m of MISSIONS) {
      const card = h('button', 'mission-card');
      card.appendChild(this.miniMap(m));
      const eb = Math.round(m.budget * DIFFICULTY[Game.difficulty].budget);
      card.appendChild(h('div', 'mc-body', `
        <h3>${t('mission.' + m.id + '.name')}</h3>
        <p class="mc-obj">${t('mission.' + m.id + '.obj')}</p>
        <p>${t('mission.' + m.id + '.desc')}</p>
        <div class="mc-tags">
          <span>${t('mission.budget')}: <b>${m.budget}</b></span>
          <span>${t('mission.enemyBudget')}: <b>${eb}</b></span>
          <span>${m.turnLimit ? t('mission.turns', { n: m.turnLimit }) : t('mission.noLimit')}</span>
        </div>`));
      card.onclick = () => { Sfx.click(); this.mission = m; this.squadList = []; this.show('squad'); };
      box.appendChild(card);
    }
  },

  miniMap(m) {
    const c = document.createElement('canvas');
    const s = 8, W = 20, H = m.map.length;
    c.width = W * s; c.height = H * s;
    c.className = 'minimap';
    const g = c.getContext('2d');
    const col = { '#': '#57524a', W: '#4a3f55', '=': '#8a7a58', T: '#3cff7a', P: '#2c6f8a', E: '#4a6e2a', A: '#6b5a2a', B: '#6b5a2a', C: '#6b5a2a', X: '#3f8a2a', ',': '#2e2a25' };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      g.fillStyle = col[m.map[y][x]] || '#26221f';
      g.fillRect(x * s, y * s, s - 1, s - 1);
    }
    return c;
  },

  // ---------------- escuadrón ----------------
  squadCost() { return this.squadList.reduce((s, tp) => s + UNITS[tp].cost, 0); },

  renderSquad() {
    const m = this.mission;
    $('#squad-mission').textContent = t('mission.' + m.id + '.name') + ' — ' + t('mission.' + m.id + '.obj');
    const cat = $('#unit-catalog');
    cat.innerHTML = '';
    const left = m.budget - this.squadCost();
    for (const tp of DEPLOYABLE) {
      const d = UNITS[tp], w = WEAPONS[d.weapon];
      const can = d.cost <= left && this.squadList.length < MAX_UNITS;
      const card = h('div', 'ucard' + (can ? '' : ' disabled'));
      const head = h('div', 'ucard-top');
      head.appendChild(Render.spriteCanvas(tp, 'player', 4));
      head.appendChild(h('div', 'ucard-title', `<b>${t('unit.' + tp)}</b><small>${t('cls.' + d.cls)} · ${t('armor.' + d.armor)}</small><small class="enemy-name">${t('vs')} ${t('unitE.' + tp)}</small>`));
      head.appendChild(h('div', 'cost', d.cost));
      card.appendChild(head);
      card.appendChild(h('p', 'role', t('role.' + tp)));
      card.appendChild(this.statsHtml(tp));
      card.appendChild(this.weaponHtml(w, d.weapon));
      const ab = h('div', 'abil');
      for (const id of d.abilities) ab.appendChild(this.abilityChip(id));
      card.appendChild(ab);
      card.onclick = () => {
        if (!can) return;
        Sfx.select();
        this.squadList.push(tp);
        this.renderSquad();
      };
      cat.appendChild(card);
    }
    // panel derecho
    const cost = this.squadCost();
    $('#budget-text').textContent = t('squad.budget', { n: cost, m: m.budget });
    $('#budget-fill').style.width = Math.min(100, cost / m.budget * 100) + '%';
    $('#units-text').textContent = t('squad.units', { n: this.squadList.length, m: MAX_UNITS });
    const list = $('#squad-list');
    list.innerHTML = '';
    if (!this.squadList.length) list.appendChild(h('p', 'muted', t('squad.empty')));
    if (m.objective === 'extract') {
      const row = h('div', 'srow vip');
      row.appendChild(Render.spriteCanvas('vip', 'player', 2));
      row.appendChild(h('span', '', t('unit.vip') + ' <small>(' + t('squad.free') + ')</small>'));
      list.appendChild(row);
    }
    this.squadList.forEach((tp, i) => {
      const row = h('div', 'srow');
      row.appendChild(Render.spriteCanvas(tp, 'player', 2));
      row.appendChild(h('span', '', t('unit.' + tp)));
      row.appendChild(h('b', 'cost-s', UNITS[tp].cost));
      const x = h('button', 'x', '✕');
      x.title = t('squad.remove');
      x.onclick = () => { Sfx.click(); this.squadList.splice(i, 1); this.renderSquad(); };
      row.appendChild(x);
      list.appendChild(row);
    });
    this.renderSynergy($('#synergy'));
    $('#btn-deploy').disabled = !this.squadList.length;
  },

  renderSynergy(el) {
    const kinds = new Set(this.squadList.map(tp => WEAPONS[UNITS[tp].weapon].kind));
    const node = k => `<span class="sy-node ${kinds.has(k) ? 'on' : ''}" style="--c:${KIND_COLOR[k]}">${t('kind.' + k)}</span>`;
    const combo = (a, b, key) => `<li class="${kinds.has(a) && kinds.has(b) ? 'on' : ''}">${t(key)}</li>`;
    el.innerHTML = `<h4>${t('squad.synergy')}</h4>
      <div class="sy-tri">${node('ranged')}${node('short')}${node('melee')}</div>
      <ul class="sy-list">
        ${combo('ranged', 'short', 'synergy.rs')}
        ${combo('short', 'melee', 'synergy.sm')}
        ${combo('melee', 'ranged', 'synergy.mr')}
      </ul>`;
  },

  statsHtml(tp) {
    const d = UNITS[tp];
    return h('div', 'stats', ['hp', 'mob', 'aim', 'def', 'sight'].map(k => `<span><small>${t('stat.' + k)}</small><b>${d[k]}</b></span>`).join(''));
  },

  weaponHtml(w, id) {
    if (!w) return h('div', 'weapon', '—');
    return h('div', 'weapon', `<b>${t('weapon.' + id)}</b>
      <span class="tag" style="--c:${KIND_COLOR[w.kind]}">${t('kind.' + w.kind)}</span>
      <span class="tag dt-${w.dmgType}">${t('dmg.' + w.dmgType)}</span>
      <span>${t('stat.dmg')} ${w.dmg[0]}-${w.dmg[1]}</span>
      <span>${t('stat.range')} ${w.kind === 'melee' ? 1 : w.range}</span>`);
  },

  abilityChip(id) {
    const c = h('span', 'chip', t('ability.' + id));
    c.dataset.tip = t('ability.' + id + '.desc') + ' · ' + t('hud.cooldown', { n: ABILITIES[id].cd });
    return c;
  },

  randomSquad() {
    this.squadList = [];
    let rem = this.mission.budget;
    while (this.squadList.length < MAX_UNITS) {
      const c = DEPLOYABLE.filter(tp => UNITS[tp].cost <= rem);
      if (!c.length) break;
      const tp = c[(Math.random() * c.length) | 0];
      this.squadList.push(tp); rem -= UNITS[tp].cost;
    }
    this.renderSquad();
  },

  // ---------------- batalla ----------------
  battleStart() {
    this.show('battle');
    $('#log').innerHTML = '';
    $('#mission-name').textContent = t('mission.' + Game.mission.id + '.name');
    this.mode = 'move';
    this.fitCanvas();
  },

  fitCanvas() {
    const wrap = $('#board-wrap'), c = $('#board');
    if (!wrap || !c.width) return;
    const r = Math.min(wrap.clientWidth / c.width, wrap.clientHeight / c.height);
    c.style.width = Math.floor(c.width * r) + 'px';
    c.style.height = Math.floor(c.height * r) + 'px';
  },

  select(u) {
    Game.selected = u;
    this.mode = 'move';
    this.abilityId = null;
    this.reach = u && u.team === 'player' && u.ap > 0 && U(u).mob > 0 ? Grid.reach(u, U(u).mob * u.ap) : null;
    this.computeValid();
    this.buildActions();
    this.refresh();
  },

  setMode(mode, id) {
    const u = Game.selected;
    if (!u) return;
    this.mode = mode;
    this.abilityId = id || null;
    this.computeValid();
    this.buildActions();
    this.refresh();
  },

  computeValid() {
    this.valid = new Set();
    const u = Game.selected;
    if (!u || u.team !== 'player') return;
    if (this.mode === 'attack') {
      for (const e of Game.alive('enemy')) if (Combat.canAttack(u, e)) this.valid.add(e.x + ',' + e.y);
    } else if (this.mode === 'ability') {
      for (let y = 0; y < Grid.H; y++) for (let x = 0; x < Grid.W; x++)
        if (Game.abilityTargetValid(u, this.abilityId, x, y)) this.valid.add(x + ',' + y);
    }
  },

  buildActions() {
    const bar = $('#actions');
    bar.innerHTML = '';
    const u = Game.selected;
    if (!u || u.team !== 'player' || Game.over) return;
    const myTurn = Game.turn === 'player' && !Game.busy;
    const w = Combat.weapon(u);
    const add = (label, key, tip, enabled, active, fn, extra) => {
      const b = h('button', 'act' + (active ? ' active' : ''), `<kbd>${key}</kbd>${label}${extra || ''}`);
      b.dataset.tip = tip;
      b.disabled = !enabled || !myTurn;
      b.onclick = () => { Sfx.click(); fn(); };
      bar.appendChild(b);
    };
    add(t('hud.move'), '1', t('tip.move'), U(u).mob > 0 && u.ap > 0, this.mode === 'move', () => this.setMode('move'));
    if (w) {
      add(t('hud.attack'), '2', t('tip.attack'), u.ap > 0 && Game.alive('enemy').some(e => Combat.canAttack(u, e)), this.mode === 'attack', () => this.setMode('attack'));
      if (w.kind !== 'melee') add(t('hud.overwatch'), '3', t('tip.overwatch'), u.ap > 0, false, () => Game.setOverwatch(u));
    }
    U(u).abilities.forEach((id, i) => {
      const ab = ABILITIES[id];
      const cd = u.cd[id] || 0;
      add(t('ability.' + id), String(4 + i), t('ability.' + id + '.desc') + ' · ' + t('hud.cooldown', { n: ab.cd }),
        Game.abilityReady(u, id), this.mode === 'ability' && this.abilityId === id, () => {
          if (ab.target === 'self' || ab.target === 'self_aoe') Game.useAbility(u, id);
          else this.setMode('ability', id);
        }, cd ? `<span class="cd">${cd}</span>` : '');
    });
    if (Game.mission.objective === 'hack') add(t('hud.hack'), 'H', t('tip.hack'), Game.canHack(u), false, () => Game.doHack(u));
  },

  refresh() {
    if (this.screen !== 'battle' || !Game.mission) return;
    const myTurn = Game.turn === 'player' && !Game.busy && !Game.over;
    $('#btn-end').disabled = !myTurn;
    $('#round-text').textContent = t('hud.round', { n: Game.round }) + (Game.mission.turnLimit ? ' / ' + Game.mission.turnLimit : '');
    $('#turn-text').textContent = Game.turn === 'player' ? t('hud.yourTurn') : t('hud.enemyTurn');
    $('#turn-text').className = 'turn-' + Game.turn;
    $('#obj-text').innerHTML = this.objectiveText();
    this.renderRoster();
    this.renderUnitPanel();
    this.renderTargetPanel();
    document.querySelectorAll('#actions button').forEach(b => { if (!myTurn) b.disabled = true; });
  },

  objectiveText() {
    const m = Game.mission;
    switch (m.objective) {
      case 'capture': {
        const z = ['A', 'B', 'C'].map(k => `<span class="zone z-${Game.zoneOwners[k] || 'none'}">${k}</span>`).join('');
        return t('objtext.capture') + ' ' + z + ` <small>${t('objtext.hold', { p: Game.hold.player, e: Game.hold.enemy, n: m.holdTurns })}</small>`;
      }
      case 'hack': return t('objtext.hack', { p: Game.hack, n: m.hackNeeded });
      case 'extract': return t('objtext.extract');
      default: return t('objtext.elim');
    }
  },

  renderRoster() {
    const r = $('#roster');
    r.innerHTML = '';
    for (const u of Game.units.filter(u => u.team === 'player' && !(U(u).summon && !u.alive))) {
      const b = h('button', 'ros' + (u === Game.selected ? ' sel' : '') + (u.alive ? '' : ' dead') + (u.alive && u.ap <= 0 ? ' spent' : ''));
      b.appendChild(Render.spriteCanvas(u.type, 'player', 2));
      b.appendChild(h('span', 'ros-hp', `<i style="width:${u.hp / u.maxHp * 100}%"></i>`));
      b.appendChild(h('span', 'ros-ap', '●'.repeat(Math.max(0, u.ap))));
      b.title = Game.uname(u);
      b.onclick = () => { if (u.alive) { Sfx.select(); this.select(u); } };
      r.appendChild(b);
    }
  },

  unitInfo(u) {
    const d = U(u), w = Combat.weapon(u);
    const el = h('div', 'uinfo');
    const top = h('div', 'ui-top');
    top.appendChild(Render.spriteCanvas(u.type, u.team, 3));
    top.appendChild(h('div', '', `<b class="t-${u.team}">${Game.uname(u)}</b><small>${t('cls.' + d.cls)} · ${t('armor.' + d.armor)}</small>`));
    el.appendChild(top);
    el.appendChild(h('div', 'hpbar', `<i style="width:${u.hp / u.maxHp * 100}%" class="t-${u.team}"></i><span>${u.hp}/${u.maxHp}${u.shield ? ' +' + u.shield + '🛡' : ''}</span>`));
    if (w) el.appendChild(this.weaponHtml(w, d.weapon));
    const st = ['exposed', 'suppressed', 'stunned'].filter(s => u.status[s]).map(s => `<span class="st st-${s}" data-tip="${t('status.' + s + '.desc')}">${t('status.' + s)}</span>`);
    if (u.overwatch) st.push(`<span class="st st-ow">${t('hud.overwatch')}</span>`);
    if (st.length) el.appendChild(h('div', 'statuses', st.join('')));
    return el;
  },

  renderUnitPanel() {
    const p = $('#unit-panel');
    p.innerHTML = '';
    const u = Game.selected;
    if (!u) { p.appendChild(h('p', 'muted', Game.turn === 'enemy' ? t('hud.enemyTurn') + '…' : t('hud.noSelection'))); return; }
    p.appendChild(this.unitInfo(u));
    p.appendChild(h('div', 'ap', `${t('hud.ap')}: ${'<i class="on"></i>'.repeat(Math.max(0, u.ap))}${'<i></i>'.repeat(Math.max(0, 2 - u.ap))}`));
  },

  renderTargetPanel() {
    const p = $('#target-panel');
    p.innerHTML = '';
    const hv = this.hover, u = Game.selected;
    if (!hv) return;
    const o = Grid.unitAt(hv.x, hv.y);
    const key = hv.x + ',' + hv.y;
    if (u && u.team === 'player' && this.mode === 'ability' && this.valid.has(key)) {
      const ab = ABILITIES[this.abilityId];
      if (ab.target === 'attack' && o) return this.renderPreview(p, Combat.preview(u, o, { aim: ab.aim, crit: ab.crit }), o);
      if (ab.radius && ab.dmg) {
        const hits = Combat.aoePreview(hv.x, hv.y, ab, u);
        p.appendChild(h('div', 'pv-title', t('ability.' + this.abilityId)));
        p.appendChild(h('div', 'pv-list', hits.length ? hits.map(x => `<div class="${x.u.team === 'player' ? 'warn' : ''}">${Game.uname(x.u)}: <b>${x.min}-${x.max}</b></div>`).join('') : `<div class="muted">${t('hud.noTargets')}</div>`));
        if (ab.destroy) p.appendChild(h('p', 'muted', t('hud.destroysCover')));
        return;
      }
    }
    if (!o || (o.team === 'enemy' && !Grid.isVisible(o.x, o.y))) return;
    if (u && u.team === 'player' && o.team === 'enemy' && (this.mode === 'attack' || this.mode === 'move') && Combat.canAttack(u, o))
      return this.renderPreview(p, Combat.preview(u, o), o);
    p.appendChild(this.unitInfo(o));
  },

  renderPreview(p, pv, tgt) {
    p.appendChild(h('div', 'pv-title', `${t('hud.target')}: <b class="t-enemy">${Game.uname(tgt)}</b> <small>${tgt.hp}/${tgt.maxHp}${tgt.shield ? ' +' + tgt.shield : ''}</small>`));
    p.appendChild(h('div', 'pv-big', `
      <div><small>${t('hud.hit')}</small><b>${pv.hit}%</b></div>
      <div><small>${t('hud.crit')}</small><b class="crit">${pv.crit}%</b></div>
      <div><small>${t('hud.damage')}</small><b>${pv.dmgMin}-${pv.dmgMax}</b></div>`));
    const lines = pv.mods.map(m => `<div><span>${t('mod.' + m.k)}</span><b class="${m.v >= 0 ? 'pos' : 'neg'}">${m.v > 0 && m.k !== 'aim' ? '+' : ''}${m.v}</b></div>`)
      .concat(pv.critMods.map(m => `<div><span>${t('hud.crit')}: ${t('mod.' + m.k)}</span><b class="pos">+${m.v}</b></div>`));
    if (pv.dm !== 1) lines.push(`<div><span>${t('hud.armorMult')} (${t('dmg.' + pv.w.dmgType)} → ${t('armor.' + U(tgt).armor)})</span><b class="${pv.dm >= 1 ? 'pos' : 'neg'}">×${+pv.dm.toFixed(2)}</b></div>`);
    p.appendChild(h('div', 'pv-list', lines.join('')));
    if (pv.combos.length) p.appendChild(h('div', 'pv-combo', pv.combos.map(c => '⚡ ' + t('mod.' + c)).join('<br>')));
  },

  log(msg, cls) {
    const l = $('#log');
    const e = h('div', 'log-' + (cls || 'info'), msg);
    l.prepend(e);
    while (l.children.length > 60) l.lastChild.remove();
  },

  banner(text, team) {
    const b = $('#banner');
    b.textContent = text;
    b.className = 'banner show b-' + team;
    clearTimeout(this.bannerT);
    this.bannerT = setTimeout(() => { b.className = 'banner'; }, 1300);
  },

  // ---------------- dibujo de ayudas en el tablero ----------------
  drawOverlays(g) {
    const u = Game.selected;
    if (!u || Game.turn !== 'player' || Game.busy || Game.over || u.team !== 'player') return;
    const pulse = 0.5 + Math.sin(Render.time * 5) * 0.2;
    if (this.mode === 'move' && this.reach && u.ap > 0) {
      const mob = U(u).mob;
      for (let y = 0; y < Grid.H; y++) for (let x = 0; x < Grid.W; x++) {
        if (!this.reach.canStop(x, y)) continue;
        g.fillStyle = this.reach.cost(x, y) <= mob ? 'rgba(90,209,255,0.18)' : 'rgba(255,207,74,0.14)';
        g.fillRect(x * TS + 1, y * TS + 1, TS - 2, TS - 2);
      }
      const hv = this.hover;
      if (hv && this.reach.canStop(hv.x, hv.y)) {
        const path = this.reach.path(hv.x, hv.y);
        const dash = this.reach.cost(hv.x, hv.y) > mob;
        g.strokeStyle = dash ? '#ffcf4a' : '#5ad1ff';
        g.lineWidth = 3; g.setLineDash([6, 5]);
        g.beginPath(); g.moveTo(u.x * TS + 24, u.y * TS + 24);
        for (const s of path) g.lineTo(s.x * TS + 24, s.y * TS + 24);
        g.stroke(); g.setLineDash([]);
        for (const s of Grid.coverSides(hv.x, hv.y)) Render.shield(g, hv.x, hv.y, s.dx, s.dy, s.v >= 40);
      }
    } else if (this.mode === 'attack' || this.mode === 'ability') {
      const ab = this.abilityId && ABILITIES[this.abilityId];
      const tileMode = ab && (ab.target === 'tile' || ab.target === 'tile_empty');
      for (const k of this.valid) {
        const [x, y] = k.split(',').map(Number);
        if (tileMode) { g.fillStyle = 'rgba(255,138,61,0.10)'; g.fillRect(x * TS, y * TS, TS, TS); continue; }
        const o = Grid.unitAt(x, y);
        g.strokeStyle = o && o.team === 'player' ? `rgba(141,255,90,${pulse})` : `rgba(255,90,74,${pulse})`;
        g.lineWidth = 3;
        g.strokeRect(x * TS + 2, y * TS + 2, TS - 4, TS - 4);
      }
      const hv = this.hover;
      if (ab && ab.radius && hv && this.valid.has(hv.x + ',' + hv.y)) {
        for (const p of Grid.tilesInRadius(hv.x, hv.y, ab.radius)) {
          g.fillStyle = ab.smoke ? 'rgba(200,195,180,0.25)' : ab.dmgType === 'emp' ? 'rgba(90,209,255,0.3)' : 'rgba(255,90,74,0.3)';
          g.fillRect(p.x * TS, p.y * TS, TS, TS);
        }
      }
    }
  },

  drawTopOverlays(g) {
    const hv = this.hover;
    if (hv && this.screen === 'battle') {
      g.strokeStyle = 'rgba(232,226,200,0.7)'; g.lineWidth = 2;
      g.strokeRect(hv.x * TS + 1, hv.y * TS + 1, TS - 2, TS - 2);
    }
    const u = Game.selected;
    if (!u || Game.turn !== 'player' || Game.busy || u.team !== 'player') return;
    const ab = this.abilityId && ABILITIES[this.abilityId];
    if (this.mode === 'attack' || (ab && ab.target === 'attack')) {
      for (const k of this.valid) {
        const [x, y] = k.split(',').map(Number);
        const o = Grid.unitAt(x, y);
        if (!o) continue;
        const pv = Combat.preview(u, o, ab ? { aim: ab.aim, crit: ab.crit } : {});
        const txt = pv.hit + '%';
        g.font = 'bold 13px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
        const bx = x * TS + 24, by = y * TS - 12;
        g.fillStyle = '#0b0b0f'; g.fillRect(bx - 20, by - 9, 40, 18);
        g.fillStyle = pv.combos.length ? '#ffcf4a' : '#ff5a4a'; g.fillRect(bx - 19, by - 8, 38, 16);
        g.fillStyle = '#0b0b0f'; g.fillText(txt, bx, by + 1);
      }
    }
  },

  // ---------------- entrada ----------------
  tileFromEvent(e) {
    const c = $('#board'), r = c.getBoundingClientRect();
    const x = Math.floor((e.clientX - r.left) / r.width * Grid.W);
    const y = Math.floor((e.clientY - r.top) / r.height * Grid.H);
    return Grid.inb(x, y) ? { x, y } : null;
  },

  onMove(e) {
    const tl = this.tileFromEvent(e);
    if ((tl && this.hover && tl.x === this.hover.x && tl.y === this.hover.y) || (!tl && !this.hover)) return;
    this.hover = tl;
    this.renderTargetPanel();
  },

  onClick(e) {
    const tl = this.tileFromEvent(e);
    if (!tl || Game.turn !== 'player' || Game.busy || Game.over) return;
    const { x, y } = tl;
    const u = Game.selected, o = Grid.unitAt(x, y), key = x + ',' + y;
    if (this.mode === 'ability' && u) {
      if (this.valid.has(key)) { Game.useAbility(u, this.abilityId, x, y); return; }
      if (o && o.team === 'player' && o !== u) { Sfx.select(); this.select(o); return; }
      this.setMode('move');
      return;
    }
    if (o && o.team === 'player') { if (o !== u) Sfx.select(); this.select(o); return; }
    if (!u || u.team !== 'player') return;
    if (this.mode === 'attack') {
      if (this.valid.has(key)) Game.attack(u, o);
      else this.setMode('move');
      return;
    }
    if (o && o.team === 'enemy' && Grid.isVisible(x, y)) {
      if (u.ap > 0 && Combat.canAttack(u, o)) this.setMode('attack');
      return;
    }
    if (this.reach && u.ap > 0 && this.reach.canStop(x, y)) Game.moveTo(u, x, y);
  },

  onKey(e) {
    if (this.screen !== 'battle' || Game.over) return;
    if (e.key === 'Escape') { if ($('#modal').classList.contains('hidden')) this.setMode('move'); else this.closeModal(); return; }
    if (Game.turn !== 'player' || Game.busy) return;
    if (e.key === 'Enter') { Game.endTurn(); return; }
    if (e.key === 'Tab') {
      e.preventDefault();
      const list = Game.alive('player');
      const i = list.indexOf(Game.selected);
      const next = list.slice(i + 1).concat(list.slice(0, i + 1)).find(u => u.ap > 0) || list[(i + 1) % list.length];
      if (next) { Sfx.select(); this.select(next); }
      return;
    }
    const k = e.key.toLowerCase();
    const btns = [...document.querySelectorAll('#actions button')];
    const b = btns.find(b => b.querySelector('kbd').textContent.toLowerCase() === k);
    if (b && !b.disabled) b.click();
  },

  // ---------------- modales ----------------
  openModal(html) {
    $('#modal-body').innerHTML = html;
    $('#modal').classList.remove('hidden');
  },

  closeModal() { $('#modal').classList.add('hidden'); },

  showHelp() {
    const armors = ['light', 'heavy', 'mech'];
    const table = `<table class="armor-table"><tr><th></th>${armors.map(a => `<th>${t('armor.' + a)}</th>`).join('')}</tr>
      ${Object.keys(DMG_MULT).map(d => `<tr><th class="dt-${d}">${t('dmg.' + d)}</th>${armors.map(a => {
        const v = DMG_MULT[d][a];
        return `<td class="${v > 1 ? 'pos' : v < 1 ? 'neg' : ''}">×${v}</td>`;
      }).join('')}</tr>`).join('')}</table>`;
    this.openModal(t('help.html').replace('{armorTable}', table));
  },

  showResult(win, reason) {
    const st = Game.stats.player;
    const lost = Game.units.filter(u => u.team === 'player' && !u.alive && !U(u).summon).length;
    const acc = st.shots ? Math.round(st.hits / st.shots * 100) : 0;
    this.openModal(`
      <h2 class="${win ? 'win' : 'lose'}">${t(win ? 'result.victory' : 'result.defeat')}</h2>
      <p class="reason">${t('reason.' + reason)}</p>
      <div class="res-stats">
        <div><small>${t('result.rounds')}</small><b>${Game.round}</b></div>
        <div><small>${t('result.kills')}</small><b>${st.kills}</b></div>
        <div><small>${t('result.losses')}</small><b>${lost}</b></div>
        <div><small>${t('result.accuracy')}</small><b>${acc}%</b></div>
      </div>
      <p class="quote">${t(win ? 'quote.win' : 'quote.lose')}</p>
      <div class="res-btns">
        <button class="btn" id="res-retry">${t('result.retry')}</button>
        <button class="btn" id="res-squad">${t('result.squad')}</button>
        <button class="btn ghost" id="res-menu">${t('result.menu')}</button>
      </div>`);
    $('#res-retry').onclick = () => { this.closeModal(); Game.start(Game.mission, Game.squad); };
    $('#res-squad').onclick = () => { this.closeModal(); this.squadList = Game.squad.slice(); this.show('squad'); };
    $('#res-menu').onclick = () => { this.closeModal(); this.show('menu'); };
  },
};
