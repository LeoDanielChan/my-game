'use strict';
// IA del Enjambre Sintético: arma su escuadrón con el mismo sistema de
// presupuesto y elige acciones puntuando posición, cobertura y daño esperado.

const AI = {
  STRATEGIES: {
    swarm:    { drone: 2, rifleman: 4, assault: 4, medic: 2, engineer: 2, ronin: 2, sniper: 1, exo: 0.5 },
    elite:    { ronin: 3, sniper: 3, exo: 3, medic: 2, engineer: 1, assault: 1, rifleman: 1, drone: 1 },
    armored:  { mech: 3, apc: 3, engineer: 2, rifleman: 2, medic: 2, assault: 1, drone: 1 },
    balanced: { drone: 1, rifleman: 2, assault: 2, ronin: 2, medic: 2, engineer: 2, sniper: 2, exo: 2, mech: 1, apc: 1 },
  },

  buildSquad(budget) {
    const names = Object.keys(this.STRATEGIES);
    const w = this.STRATEGIES[names[(Math.random() * names.length) | 0]];
    const list = [];
    let rem = budget;
    if (w.mech && rem >= 12) {
      const v = Math.random() < 0.5 && rem >= 14 ? 'apc' : 'mech';
      list.push(v); rem -= UNITS[v].cost;
    }
    while (list.length < MAX_UNITS) {
      const cands = DEPLOYABLE.filter(tp => UNITS[tp].cost <= rem && w[tp]);
      if (!cands.length) break;
      const total = cands.reduce((s, tp) => s + w[tp], 0);
      let r = Math.random() * total, pick = cands[0];
      for (const tp of cands) { r -= w[tp]; if (r <= 0) { pick = tp; break; } }
      list.push(pick); rem -= UNITS[pick].cost;
    }
    // mejora unidades si sobra presupuesto
    let changed = true;
    while (rem > 0 && changed) {
      changed = false;
      for (let i = 0; i < list.length && !changed; i++) {
        const cur = UNITS[list[i]].cost;
        const up = DEPLOYABLE.filter(tp => UNITS[tp].cost > cur && UNITS[tp].cost - cur <= rem && w[tp])
          .sort((a, b) => UNITS[b].cost - UNITS[a].cost)[0];
        if (up) { rem -= UNITS[up].cost - cur; list[i] = up; changed = true; }
      }
    }
    return list;
  },

  async takeTurn() {
    const order = ['drone', 'medic', 'sniper', 'rifleman', 'engineer', 'exo', 'apc', 'assault', 'ronin', 'mech', 'turret'];
    const list = Game.alive('enemy').sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
    for (const u of list) {
      if (Game.over) return;
      let guard = 6;
      while (u.alive && u.ap > 0 && !Game.over && guard--) {
        const acted = await this.step(u);
        if (!acted) break;
        await wait(Grid.isVisible(u.x, u.y) ? 250 : 40);
      }
    }
  },

  knownTargets() {
    const out = Game.alive('player').filter(p => Grid.teamSees('enemy', p.x, p.y));
    for (const p of out) Game.lastKnown.set(p.id, { x: p.x, y: p.y });
    for (const id of [...Game.lastKnown.keys()]) if (!Game.units.find(u => u.id === id && u.alive)) Game.lastKnown.delete(id);
    return out;
  },

  goal(u, targets) {
    const m = Game.mission, D = U(u), w = Combat.weapon(u);
    const nearest = pts => pts.reduce((b, p) => !b || Grid.dist(u.x, u.y, p.x, p.y) < Grid.dist(u.x, u.y, b.x, b.y) ? p : b, null);
    if (targets.length && w && (w.kind !== 'ranged' || D.vehicle)) return nearest(targets);
    if (m.objective === 'extract') {
      const vip = targets.find(p => p.type === 'vip');
      if (vip) return vip;
      return nearest(this.tilesWhere(t => t.zone === 'X'));
    }
    if (m.objective === 'hack') {
      const term = this.tilesWhere(t => t.t === 'T')[0];
      if (term && Grid.dist(u.x, u.y, term.x, term.y) > 4) return term;
    }
    if (m.objective === 'capture') {
      const want = ['A', 'B', 'C'].filter(z => Game.zoneOwners[z] !== 'enemy');
      const tiles = this.tilesWhere(t => want.includes(t.zone));
      if (tiles.length) return nearest(tiles);
    }
    if (targets.length) return null;
    const known = [...Game.lastKnown.values()];
    if (known.length) return nearest(known);
    return nearest(this.tilesWhere(t => t.deploy === 'player'));
  },

  tilesWhere(fn) {
    const out = [];
    Grid.tiles.forEach((t, i) => { if (fn(t)) out.push({ x: i % Grid.W, y: (i / Grid.W) | 0 }); });
    return out;
  },

  posScore(u, targets, goal) {
    const D = U(u);
    let s = 0;
    for (const p of targets) {
      const pw = Combat.weapon(p);
      if (!pw) continue;
      const d = Grid.dist(u.x, u.y, p.x, p.y);
      if (d > pw.range + (pw.kind === 'melee' ? U(p).mob + 1 : 2)) continue;
      if (pw.kind !== 'melee' && !Grid.los(p.x, p.y, u.x, u.y)) { s += 1; continue; }
      const cov = Grid.cover(u, p.x, p.y);
      s += cov.value / 10;
      if (cov.flanked && !D.vehicle && !D.flying) s -= 3;
    }
    const tl = Grid.tile(u.x, u.y);
    if (tl.smoke) s += 1.5;
    if (Game.mission.objective === 'capture' && tl.zone && tl.zone !== 'X') s += 3;
    if (goal) s -= Grid.dist(u.x, u.y, goal.x, goal.y) * 0.3;
    return s;
  },

  attackScore(u, tg, opts) {
    const { p, ev, killChance } = Combat.expected(u, tg, opts);
    let s = ev * 1.5 + killChance * 5 + p.combos.length * 1.5;
    if (tg.type === 'vip') s *= 1.6;
    return s;
  },

  bestAttackFrom(u, targets) {
    let best = 0;
    const hs = U(u).abilities.includes('headshot') && !(u.cd.headshot > 0) ? ABILITIES.headshot : null;
    for (const tg of targets) {
      if (!Combat.canAttack(u, tg)) continue;
      best = Math.max(best, this.attackScore(u, tg), hs ? this.attackScore(u, tg, { aim: hs.aim, crit: hs.crit }) : 0);
    }
    return best;
  },

  bestMove(u, targets) {
    const D = U(u);
    const r = Grid.reach(u, D.mob);
    const ox = u.x, oy = u.y;
    const goal = this.goal(u, targets);
    const base = this.posScore(u, targets, goal);
    let best = null;
    for (let y = 0; y < Grid.H; y++) for (let x = 0; x < Grid.W; x++) {
      if ((x === ox && y === oy) || !r.canStop(x, y)) continue;
      u.x = x; u.y = y;
      let s = this.posScore(u, targets, goal);
      if (u.ap >= 2) s += this.bestAttackFrom(u, targets) * 0.9;
      s += Math.random() * 0.2;
      if (!best || s > best.score) best = { x, y, score: s };
    }
    u.x = ox; u.y = oy;
    if (!best || best.score < base + 0.3) return null;
    return best;
  },

  async step(u) {
    const D = U(u), w = Combat.weapon(u);
    const targets = this.knownTargets();
    const here = this.posScore(u, targets, this.goal(u, targets));
    let best = { score: 0, run: null };
    const consider = (score, run) => { if (score > best.score) best = { score, run }; };

    for (const id of D.abilities) if (Game.abilityReady(u, id)) this.evalAbility(u, id, targets, (s, run) => consider(s + here, run));
    if (w) for (const tg of targets) if (Combat.canAttack(u, tg)) consider(this.attackScore(u, tg) + here, () => Game.attack(u, tg));
    if (D.mob > 0) {
      const mv = this.bestMove(u, targets);
      if (mv) consider(mv.score, () => Game.moveTo(u, mv.x, mv.y));
    }
    if (w && w.kind !== 'melee') consider((targets.length ? 1.5 : 0.8) + here, () => Game.setOverwatch(u));
    if (!best.run) return false;
    await best.run();
    return true;
  },

  evalAbility(u, id, targets, consider) {
    const ab = ABILITIES[id];
    switch (id) {
      case 'mark': {
        const shorts = Game.alive('enemy').filter(a => a !== u && Combat.weapon(a) && Combat.weapon(a).kind === 'short').length;
        for (const tg of targets) if (!tg.status.exposed && Game.abilityTargetValid(u, id, tg.x, tg.y))
          consider(1.5 + shorts * 0.8 + Math.random() * 0.2, () => Game.useAbility(u, id, tg.x, tg.y));
        break;
      }
      case 'adrenaline':
        if (targets.length) consider(3, () => Game.useAbility(u, id));
        break;
      case 'heal':
        for (const a of Game.alive('enemy')) {
          const miss = a.maxHp - a.hp;
          if (miss >= 2 && Game.abilityTargetValid(u, id, a.x, a.y)) consider(miss * 1.2, () => Game.useAbility(u, id, a.x, a.y));
        }
        break;
      case 'headshot':
        for (const tg of targets) if (Combat.canAttack(u, tg))
          consider(this.attackScore(u, tg, { aim: ab.aim, crit: ab.crit }) + 0.3, () => Game.useAbility(u, id, tg.x, tg.y));
        break;
      case 'charge':
        for (const tg of targets) {
          if (Grid.dist(u.x, u.y, tg.x, tg.y) < 1.5 || !Game.abilityTargetValid(u, id, tg.x, tg.y)) continue;
          const ct = Game.chargeTile(u, tg);
          const ox = u.x, oy = u.y;
          u.x = ct.x; u.y = ct.y;
          const s = this.attackScore(u, tg) + 1;
          u.x = ox; u.y = oy;
          consider(s, () => Game.useAbility(u, id, tg.x, tg.y));
        }
        break;
      case 'suppress':
        for (const tg of targets) {
          if (tg.status.suppressed || !Game.abilityTargetValid(u, id, tg.x, tg.y)) continue;
          const tw = Combat.weapon(tg);
          const threat = tw ? (tw.dmg[0] + tw.dmg[1]) / 2 : 0;
          const melee = Game.alive('enemy').some(a => Combat.weapon(a) && Combat.weapon(a).kind === 'melee' && Grid.dist(a.x, a.y, tg.x, tg.y) <= U(a).mob + 1);
          consider(1.5 + threat * 0.4 + (melee ? 1.5 : 0), () => Game.useAbility(u, id, tg.x, tg.y));
        }
        break;
      case 'turret': {
        if (!targets.length || Game.alive('enemy').some(a => a.type === 'turret')) break;
        for (const [dx, dy] of DIRS8) if (Game.abilityTargetValid(u, id, u.x + dx, u.y + dy)) { consider(3.5, () => Game.useAbility(u, id, u.x + dx, u.y + dy)); break; }
        break;
      }
      case 'stomp': {
        const s = this.aoeScore(u, u.x, u.y, ab);
        if (s > 0) consider(s, () => Game.useAbility(u, id));
        break;
      }
      case 'smoke': {
        if (!targets.length || Grid.tile(u.x, u.y).smoke) break;
        const allies = Game.alive('enemy').filter(a => Grid.dist(a.x, a.y, u.x, u.y) <= ab.radius).length;
        if (allies >= 2) consider(allies * 1.2, () => Game.useAbility(u, id, u.x, u.y));
        break;
      }
      default: { // granada, cohete, EMP
        const cands = new Map();
        for (const tg of targets) for (const [dx, dy] of [[0, 0], ...DIRS8]) cands.set((tg.x + dx) + ',' + (tg.y + dy), { x: tg.x + dx, y: tg.y + dy });
        for (const c of cands.values()) {
          if (!Game.abilityTargetValid(u, id, c.x, c.y)) continue;
          const s = this.aoeScore(u, c.x, c.y, ab);
          if (s > 0) consider(s, () => Game.useAbility(u, id, c.x, c.y));
        }
      }
    }
  },

  aoeScore(u, cx, cy, ab) {
    let s = 0, foes = 0;
    for (const h of Combat.aoePreview(cx, cy, ab, u)) {
      const avg = (h.min + h.max) / 2;
      const kill = h.max >= h.u.hp + h.u.shield;
      if (h.u.team === u.team) s -= avg * 2 + (kill ? 6 : 0);
      else {
        foes++;
        s += avg * 1.2 + (kill ? 4 : 0);
        if (ab.destroy && Grid.cover(h.u, u.x, u.y).value) s += 1;
        if (ab.stun || (ab.stunMech && U(h.u).armor === 'mech')) s += 1.5;
      }
    }
    return foes ? s - 1 : 0;
  },
};
