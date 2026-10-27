'use strict';
// Estado de la partida, flujo de turnos, acciones y objetivos.

const Game = {
  units: [],
  turn: 'player',
  round: 1,
  selected: null,
  busy: false,
  over: false,
  mission: null,
  difficulty: 'normal',
  squad: [],
  stats: null,
  hack: 0,
  hold: { player: 0, enemy: 0 },
  zoneOwners: {},
  lastKnown: new Map(),
  nextId: 1,
  autoEndTimer: null,

  start(mission, squad) {
    this.mission = mission;
    this.squad = squad.slice();
    Grid.load(mission.map);
    FX.clear();
    Object.assign(this, {
      units: [], nextId: 1, over: false, busy: false, round: 1, hack: 0, selected: null,
      hold: { player: 0, enemy: 0 }, zoneOwners: {}, lastKnown: new Map(),
      stats: { player: { shots: 0, hits: 0, kills: 0 }, enemy: { shots: 0, hits: 0, kills: 0 } },
    });
    const mine = mission.objective === 'extract' ? ['vip', ...squad] : squad.slice();
    this.deploy(mine, 'player');
    this.enemyBudget = Math.round(mission.budget * DIFFICULTY[this.difficulty].budget);
    this.deploy(AI.buildSquad(this.enemyBudget), 'enemy');
    Render.init(document.getElementById('board'));
    Grid.computeVisibility();
    this.updateZones();
    UI.battleStart();
    this.startTurn('player');
  },

  deploy(types, team) {
    const free = (x, y) => Grid.passable(x, y, { type: 'rifleman' }) && !Grid.unitAt(x, y);
    const spots = [];
    for (let y = 0; y < Grid.H; y++) for (let x = 0; x < Grid.W; x++)
      if (Grid.tile(x, y).deploy === team) spots.push({ x, y });
    // si faltan casillas, expande alrededor de la zona de despliegue
    const seen = new Set(spots.map(p => p.x + ',' + p.y));
    for (let i = 0; spots.length < types.length * 2 && i < spots.length; i++) {
      for (const [dx, dy] of DIRS4) {
        const nx = spots[i].x + dx, ny = spots[i].y + dy, k = nx + ',' + ny;
        if (!seen.has(k) && Grid.inb(nx, ny) && Grid.passable(nx, ny, { type: 'rifleman' })) { seen.add(k); spots.push({ x: nx, y: ny }); }
      }
    }
    for (const type of types) {
      const s = spots.find(p => free(p.x, p.y));
      if (s) this.spawn(type, team, s.x, s.y);
    }
  },

  spawn(type, team, x, y) {
    const d = UNITS[type];
    const u = {
      id: this.nextId++, type, team, x, y, rx: x, ry: y, ox: 0, oy: 0,
      hp: d.hp, maxHp: d.hp, shield: 0, ap: 0, cd: {},
      status: { exposed: 0, suppressed: 0, stunned: 0 },
      overwatch: false, alive: true, facing: team === 'player' ? 1 : -1, flash: 0,
    };
    this.units.push(u);
    return u;
  },

  uname(u) { return t((u.team === 'enemy' ? 'unitE.' : 'unit.') + u.type); },
  face(u, x) { if (x > u.x) u.facing = 1; else if (x < u.x) u.facing = -1; },
  log(msg, cls) { UI.log(msg, cls); },
  alive(team) { return this.units.filter(u => u.alive && u.team === team); },

  // ---------------- turnos ----------------
  startTurn(team) {
    this.turn = team;
    for (const u of this.alive(team)) {
      u.overwatch = false;
      for (const k in u.cd) if (u.cd[k] > 0) u.cd[k]--;
      u.ap = u.status.stunned ? 1 : 2;
      u.status.stunned = 0;
    }
    UI.banner(team === 'player' ? t('hud.yourTurn') : t('hud.enemyTurn'), team);
    UI.refresh();
    if (team === 'player') {
      UI.select(this.alive('player').find(u => u.ap > 0 && U(u).mob + (U(u).weapon ? 1 : 0) > 0) || null);
    } else {
      this.selected = null;
      setTimeout(async () => {
        this.busy = true;
        await AI.takeTurn();
        this.busy = false;
        if (!this.over) this.endTurn();
      }, 900);
    }
  },

  endTurn() {
    if (this.over) return;
    clearTimeout(this.autoEndTimer);
    const team = this.turn;
    for (const u of this.alive(team)) {
      if (U(u).autoWatch && u.ap > 0) u.overwatch = true;
      u.status.exposed = 0;
      u.status.suppressed = 0;
    }
    if (team === 'player') { this.startTurn('enemy'); return; }
    this.roundEnd();
    if (this.over) return;
    this.round++;
    this.startTurn('player');
  },

  roundEnd() {
    for (const tl of Grid.tiles) if (tl.smoke > 0) tl.smoke--;
    const m = this.mission;
    if (m.objective === 'capture') {
      this.updateZones();
      const held = team => Object.values(this.zoneOwners).filter(o => o === team).length;
      this.hold.player = held('player') >= 2 ? this.hold.player + 1 : 0;
      this.hold.enemy = held('enemy') >= 2 ? this.hold.enemy + 1 : 0;
      if (this.hold.player >= m.holdTurns) return this.finish(true, 'capture');
      if (this.hold.enemy >= m.holdTurns) return this.finish(false, 'captureLost');
    }
    if (m.turnLimit && this.round >= m.turnLimit) return this.finish(false, 'time');
    UI.refresh();
  },

  updateZones() {
    const owners = {};
    for (const z of ['A', 'B', 'C']) {
      const inZone = this.units.filter(u => u.alive && Grid.tile(u.x, u.y).zone === z);
      const p = inZone.some(u => u.team === 'player'), e = inZone.some(u => u.team === 'enemy');
      owners[z] = p && !e ? 'player' : e && !p ? 'enemy' : null;
    }
    this.zoneOwners = owners;
  },

  checkEnd() {
    if (this.over) return true;
    const core = team => this.alive(team).filter(u => !U(u).summon);
    if (this.mission.objective === 'extract') {
      const vip = this.units.find(u => u.type === 'vip');
      if (!vip.alive) { this.finish(false, 'vip'); return true; }
      if (Grid.tile(vip.x, vip.y).zone === 'X') { this.finish(true, 'extract'); return true; }
    }
    if (!core('player').length) { this.finish(false, 'wiped'); return true; }
    if (!core('enemy').length) { this.finish(true, 'elim'); return true; }
    if (this.mission.objective === 'hack' && this.hack >= this.mission.hackNeeded) { this.finish(true, 'hack'); return true; }
    return false;
  },

  finish(win, reason) {
    if (this.over) return;
    this.over = true;
    clearTimeout(this.autoEndTimer);
    setTimeout(() => { win ? Sfx.win() : Sfx.lose(); UI.showResult(win, reason); }, 700);
  },

  // Tras cada acción del jugador
  afterAction() {
    Grid.computeVisibility();
    this.updateZones();
    if (this.checkEnd()) { UI.refresh(); return; }
    const sel = this.selected;
    if (this.turn === 'player') {
      if (sel && (!sel.alive || sel.ap <= 0)) {
        const next = this.alive('player').find(u => u.ap > 0 && this.canDoSomething(u));
        UI.select(next || sel.alive && sel || null);
      } else UI.select(sel);
      if (!this.alive('player').some(u => u.ap > 0 && this.canDoSomething(u))) {
        this.autoEndTimer = setTimeout(() => { if (this.turn === 'player' && !this.busy) this.endTurn(); }, 900);
      }
    }
    UI.refresh();
  },

  canDoSomething(u) { return U(u).mob > 0 || !!U(u).weapon; },

  // ---------------- acciones ----------------
  async run(fn) {
    this.busy = true;
    UI.refresh();
    try { await fn(); } finally { this.busy = false; }
    if (this.turn === 'player') this.afterAction();
    else { Grid.computeVisibility(); this.updateZones(); this.checkEnd(); UI.refresh(); }
  },

  moveTo(u, x, y) {
    return this.run(async () => {
      const r = Grid.reach(u, U(u).mob * u.ap);
      if (!r.canStop(x, y)) return;
      const cost = r.cost(x, y);
      u.ap -= cost <= U(u).mob ? 1 : 2;
      await this.walk(u, r.path(x, y));
    });
  },

  async walk(u, path, noReaction) {
    const seen = u.team === 'player' || Grid.isVisible(u.x, u.y);
    for (const s of path) {
      if (!u.alive || this.over) return;
      this.face(u, s.x);
      const fast = !(u.team === 'player' || Grid.isVisible(s.x, s.y) || seen);
      const steps = fast ? 2 : U(u).vehicle ? 8 : 6;
      const sx = u.rx, sy = u.ry;
      for (let i = 1; i <= steps; i++) {
        u.rx = sx + (s.x - sx) * i / steps;
        u.ry = sy + (s.y - sy) * i / steps;
        await wait(16);
      }
      u.x = s.x; u.y = s.y; u.rx = s.x; u.ry = s.y;
      if (!fast) Sfx.step();
      if (U(u).vehicle && Grid.tile(s.x, s.y).t === '=') Grid.destroy(s.x, s.y, 1);
      if (u.team === 'player') {
        const before = this.alive('enemy').filter(e => Grid.isVisible(e.x, e.y)).length;
        Grid.computeVisibility();
        const after = this.alive('enemy').filter(e => Grid.isVisible(e.x, e.y));
        if (after.length > before) { Sfx.alert(); this.log(t('log.spotted'), 'info'); }
      }
      this.updateZones();
      if (!noReaction) await this.reactions(u);
      if (this.mission.objective === 'extract' && u.type === 'vip' && Grid.tile(u.x, u.y).zone === 'X') return;
    }
  },

  async reactions(mover) {
    for (const o of this.units) {
      if (!mover.alive) return;
      if (!o.alive || o.team === mover.team || !o.overwatch || o.status.suppressed) continue;
      if (!Combat.canAttack(o, mover)) continue;
      o.overwatch = false;
      FX.text(o.x, o.y - 0.4, t('float.overwatch'), '#ffcf4a');
      this.log(t('log.reaction', { a: this.uname(o) }), 'info');
      await wait(200);
      await Combat.attack(o, mover, { reaction: true });
    }
  },

  attack(u, tgt) {
    return this.run(async () => {
      u.ap = 0;
      await Combat.attack(u, tgt);
    });
  },

  setOverwatch(u) {
    return this.run(async () => {
      u.ap = 0;
      u.overwatch = true;
      FX.text(u.x, u.y - 0.4, t('float.overwatch'), '#ffcf4a');
      this.log(t('log.overwatch', { a: this.uname(u) }), 'info');
      await wait(250);
    });
  },

  canHack(u) {
    if (this.mission.objective !== 'hack' || u.team !== 'player' || u.ap <= 0) return false;
    return DIRS8.some(([dx, dy]) => { const tl = Grid.tile(u.x + dx, u.y + dy); return tl && tl.t === 'T'; });
  },

  doHack(u) {
    return this.run(async () => {
      u.ap = 0;
      this.hack++;
      Sfx.hack();
      FX.text(u.x, u.y - 0.4, t('float.hack'), '#3cff7a');
      this.log(t('log.hack', { n: this.hack, m: this.mission.hackNeeded }), 'info');
      await wait(400);
    });
  },

  // ---------------- habilidades ----------------
  abilityReady(u, id) {
    const ab = ABILITIES[id];
    return u.ap >= Math.max(1, ab.ap) && !(u.cd[id] > 0);
  },

  // Casilla adyacente al objetivo a la que la unidad puede llegar cargando
  chargeTile(u, tgt) {
    const r = Grid.reach(u, U(u).mob + ABILITIES.charge.extraMove);
    let best = null;
    for (const [dx, dy] of DIRS8) {
      const x = tgt.x + dx, y = tgt.y + dy;
      if (x === u.x && y === u.y) return { x, y, path: [] };
      if (!r.canStop(x, y)) continue;
      const c = r.cost(x, y);
      if (!best || c < best.c) best = { x, y, c, path: r.path(x, y) };
    }
    return best;
  },

  // Validación de objetivo para la interfaz y la IA
  abilityTargetValid(u, id, x, y) {
    const ab = ABILITIES[id];
    const o = Grid.unitAt(x, y);
    const d = Grid.dist(u.x, u.y, x, y);
    const seen = (tx, ty) => u.team === 'player' ? Grid.isVisible(tx, ty) : Grid.teamSees(u.team, tx, ty);
    switch (ab.target) {
      case 'enemy': return !!o && o.team !== u.team && d <= ab.range && Grid.canSee(u, x, y);
      case 'ally': return !!o && o.team === u.team && d <= ab.range && !U(o).summon && U(o).armor !== 'mech';
      case 'attack': return !!o && Combat.canAttack(u, o);
      case 'charge': return !!o && o.team !== u.team && seen(x, y) && !!this.chargeTile(u, o);
      case 'tile': return Grid.inb(x, y) && d <= ab.range && seen(x, y) && !Grid.isWall(x, y);
      case 'tile_empty': return Grid.inb(x, y) && d <= ab.range && d > 0 && !o && Grid.passable(x, y, { type: 'rifleman' });
      default: return true;
    }
  },

  useAbility(u, id, x, y) {
    const ab = ABILITIES[id];
    return this.run(async () => {
      u.cd[id] = ab.cd;
      u.ap -= ab.ap;
      const tgt = x != null ? Grid.unitAt(x, y) : null;
      if (x != null) this.face(u, x);
      this.log(t('log.ability', { a: this.uname(u), ab: t('ability.' + id) }), 'ability');
      switch (id) {
        case 'mark':
          FX.add({ type: 'beam', x0: u.x + 0.5, y0: u.y + 0.5, x1: x + 0.5, y1: y + 0.5, color: '#ff8a3d', width: 2, life: 0.5 });
          Sfx.alert();
          await wait(250);
          Combat.applyStatus(tgt, 'exposed');
          break;
        case 'adrenaline':
          u.ap += 1;
          Sfx.heal();
          FX.text(u.x, u.y - 0.4, t('float.ap'), '#ffcf4a');
          break;
        case 'heal':
          tgt.hp = Math.min(tgt.maxHp, tgt.hp + ab.heal);
          tgt.shield = Math.min(4, tgt.shield + ab.shield);
          Sfx.heal();
          FX.particles(x + 0.5, y + 0.5, 16, ['#8dff5a', '#e8e2c8', '#ffffff'], 2, 0.9, -3);
          FX.text(x, y, '+' + ab.heal, '#8dff5a');
          await wait(300);
          break;
        case 'charge': {
          const ct = this.chargeTile(u, tgt);
          if (ct) await this.walk(u, ct.path, true);
          if (u.alive && tgt.alive) await Combat.attack(u, tgt);
          break;
        }
        case 'headshot':
          await Combat.attack(u, tgt, { aim: ab.aim, crit: ab.crit });
          break;
        case 'suppress':
          await FX.projectile(u, tgt, WEAPONS.minigun, false);
          Combat.applyStatus(tgt, 'suppressed');
          await wait(200);
          break;
        case 'turret': {
          const tu = this.spawn('turret', u.team, x, y);
          tu.ap = 0;
          tu.facing = u.facing;
          FX.particles(x + 0.5, y + 0.5, 14, ['#ffcf4a', '#7a7a83'], 3, 0.6);
          Sfx.hack();
          await wait(300);
          break;
        }
        case 'stomp':
          await Combat.explode(u.x, u.y, ab, u);
          break;
        default: { // granadas, cohete, EMP, humo
          const shell = { x: u.x, y: u.y };
          await new Promise(res => FX.add({ type: 'proj', style: 'shell', x0: shell.x + 0.5, y0: shell.y + 0.4, x1: x + 0.5, y1: y + 0.5, life: Grid.dist(u.x, u.y, x, y) / 12 + 0.1, done: res }));
          await Combat.explode(x, y, ab, u);
        }
      }
      if (ab.ends) u.ap = 0;
    });
  },
};
