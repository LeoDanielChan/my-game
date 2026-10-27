'use strict';
// Reglas de combate: probabilidad de impacto, críticos, daño, estados y sinergias.

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const U = unit => UNITS[unit.type];

const Combat = {
  weapon(u) { const w = U(u).weapon; return w ? WEAPONS[w] : null; },

  rangeMod(w, d) {
    if (w.kind === 'melee') return 0;
    if (w.kind === 'short') return d <= 2 ? 25 : d <= 4 ? 10 : d <= 6 ? -5 : -25;
    let m = d <= 2 ? -20 : d <= 4 ? -5 : d <= 10 ? 5 : 0;
    if (w.scope) m += d <= 4 ? -20 : d > 10 ? 10 : 0;
    return m;
  },

  canAttack(att, tgt) {
    const w = this.weapon(att);
    if (!w || !att.alive || !tgt.alive || tgt.team === att.team) return false;
    const d = Grid.dist(att.x, att.y, tgt.x, tgt.y);
    if (w.kind === 'melee') return d < 1.5;
    if (d > w.range || !Grid.los(att.x, att.y, tgt.x, tgt.y)) return false;
    if (d <= U(att).sight) return true;
    return !!U(att).squadsight && Grid.teamSees(att.team, tgt.x, tgt.y);
  },

  preview(att, tgt, opts = {}) {
    const w = this.weapon(att), A = U(att), T = U(tgt);
    const d = Grid.dist(att.x, att.y, tgt.x, tgt.y);
    const mods = [], critMods = [], combos = [];
    let hit = A.aim;
    mods.push({ k: 'aim', v: A.aim });
    const cov = Grid.cover(tgt, att.x, att.y);
    if (w.kind !== 'melee') {
      const rm = this.rangeMod(w, d);
      if (rm) { mods.push({ k: 'range', v: rm }); hit += rm; }
      if (cov.value) { mods.push({ k: cov.value >= 40 ? 'fullcover' : 'halfcover', v: -cov.value }); hit -= cov.value; }
    }
    if (T.def) { mods.push({ k: 'defense', v: -T.def }); hit -= T.def; }
    if (Grid.tile(tgt.x, tgt.y).smoke) { mods.push({ k: 'smoke', v: -20 }); hit -= 20; }
    if (tgt.status.exposed) { mods.push({ k: 'exposed', v: 10 }); hit += 10; }
    if (att.status.suppressed) { mods.push({ k: 'suppressed', v: -30 }); hit -= 30; }
    if (opts.reaction) { mods.push({ k: 'reaction', v: -15 }); hit -= 15; }
    if (opts.aim) { mods.push({ k: 'ability', v: opts.aim }); hit += opts.aim; }
    if (att.team === 'enemy') {
      const dm = DIFFICULTY[Game.difficulty].aim;
      if (dm) { mods.push({ k: 'difficulty', v: dm }); hit += dm; }
    }
    let guaranteed = false;
    if (tgt.status.stunned && w.kind === 'ranged') { guaranteed = true; combos.push('comboStunned'); }
    hit = guaranteed ? 100 : clamp(hit, 5, 95);

    let crit = w.crit;
    if (cov.flanked) { crit += 40; critMods.push({ k: 'flank', v: 40 }); }
    if (tgt.status.exposed && w.kind === 'short') { crit += 50; critMods.push({ k: 'comboExposed', v: 50 }); combos.push('comboExposed'); }
    if (opts.crit) { crit += opts.crit; critMods.push({ k: 'ability', v: opts.crit }); }
    if (opts.reaction) crit = 0;
    crit = clamp(crit, 0, 100);

    let dm = DMG_MULT[w.dmgType][T.armor];
    if (w.kind === 'melee' && tgt.status.suppressed) { dm *= 1.5; combos.push('comboSuppressed'); }
    return {
      w, hit, crit, mods, critMods, combos, guaranteed, dm, flanked: cov.flanked,
      dmgMin: Math.max(1, Math.round(w.dmg[0] * dm)),
      dmgMax: Math.max(1, Math.round(w.dmg[1] * dm)),
    };
  },

  // Daño esperado (para la IA)
  expected(att, tgt, opts) {
    const p = this.preview(att, tgt, opts);
    const avg = (p.dmgMin + p.dmgMax) / 2 * (1 + p.crit / 200);
    return { p, ev: p.hit / 100 * avg, killChance: p.hit / 100 * (p.dmgMax >= tgt.hp + tgt.shield ? 1 : avg >= tgt.hp + tgt.shield ? 0.5 : 0) };
  },

  async attack(att, tgt, opts = {}) {
    const p = this.preview(att, tgt, opts);
    Game.face(att, tgt.x);
    const st = Game.stats[att.team];
    st.shots++;
    const hit = Math.random() * 100 < p.hit;
    const crit = hit && Math.random() * 100 < p.crit;
    if (p.w.kind === 'melee') await FX.lunge(att, tgt);
    else await FX.projectile(att, tgt, p.w, hit);
    if (!hit) {
      FX.text(tgt.x, tgt.y, t('float.miss'), '#c9c9c9');
      Game.log(t('log.miss', { a: Game.uname(att), t: Game.uname(tgt) }), 'miss');
      return { hit: false };
    }
    st.hits++;
    if (p.combos.length) FX.text(tgt.x, tgt.y - 0.5, t('float.combo'), '#ffcf4a');
    const raw = rnd(p.w.dmg[0], p.w.dmg[1]);
    const dmg = Math.max(1, Math.round(raw * p.dm * (crit ? 1.5 : 1)));
    Game.log(t(crit ? 'log.crit' : 'log.hit', { a: Game.uname(att), t: Game.uname(tgt), d: dmg }), crit ? 'crit' : 'hit');
    await this.damage(tgt, dmg, crit, att);
    if (tgt.alive) this.applyStatus(tgt, KIND_STATUS[p.w.kind]);
    return { hit: true, dmg };
  },

  applyStatus(u, s) {
    if (!u.alive || !s) return;
    u.status[s] = 1;
    if (s === 'suppressed' || s === 'stunned') u.overwatch = false;
    FX.text(u.x, u.y + 0.3, t('status.' + s), s === 'exposed' ? '#ff8a3d' : s === 'suppressed' ? '#b48cff' : '#5ad1ff');
  },

  async damage(u, dmg, crit, src) {
    let d = dmg;
    if (u.shield) { const s = Math.min(u.shield, d); u.shield -= s; d -= s; }
    u.hp -= d;
    u.flash = 0.25;
    Sfx.hit();
    FX.text(u.x, u.y, (crit ? t('float.crit') + ' ' : '') + '-' + dmg, crit ? '#ffcf4a' : '#ff5a4a', crit ? 1.4 : 1);
    FX.blood(u);
    if (u.hp <= 0) this.kill(u, src);
    await wait(120);
  },

  kill(u, src) {
    u.hp = 0;
    u.alive = false;
    u.overwatch = false;
    FX.death(u);
    Sfx.death();
    if (src) Game.stats[src.team].kills++;
    Game.log(t('log.kill', { t: Game.uname(u) }), 'kill');
    if (u.team === 'player') Grid.computeVisibility();
  },

  aoePreview(cx, cy, ab, src) {
    const out = [];
    for (const p of Grid.tilesInRadius(cx, cy, ab.radius)) {
      const u = Grid.unitAt(p.x, p.y);
      if (!u || (ab.target === 'self_aoe' && u === src)) continue;
      if (u.team === 'enemy' && src.team === 'player' && !Grid.isVisible(u.x, u.y)) continue;
      const m = ab.dmg ? DMG_MULT[ab.dmgType][U(u).armor] : 0;
      out.push({ u, min: ab.dmg ? Math.max(1, Math.round(ab.dmg[0] * m)) : 0, max: ab.dmg ? Math.max(1, Math.round(ab.dmg[1] * m)) : 0 });
    }
    return out;
  },

  async explode(cx, cy, ab, src) {
    if (ab.smoke) {
      Sfx.smoke();
      for (const p of Grid.tilesInRadius(cx, cy, ab.radius)) if (!Grid.isWall(p.x, p.y)) Grid.tile(p.x, p.y).smoke = ab.smoke;
      FX.smokeBurst(cx, cy, ab.radius);
      return;
    }
    if (ab.dmgType === 'emp') Sfx.emp(); else Sfx.explosion();
    FX.explosion(cx, cy, ab.radius, ab.dmgType === 'emp' ? '#5ad1ff' : '#ff8a3d');
    Render.shake = ab.dmgType === 'emp' ? 4 : 9;
    await wait(150);
    let destroyed = false;
    const hits = [];
    for (const p of Grid.tilesInRadius(cx, cy, ab.radius)) {
      if (ab.destroy && Grid.destroy(p.x, p.y, ab.destroy)) destroyed = true;
      const u = Grid.unitAt(p.x, p.y);
      if (u && !(ab.target === 'self_aoe' && u === src)) hits.push(u);
    }
    if (destroyed) Game.log(t('log.coverDestroyed'), 'info');
    for (const u of hits) {
      if (!u.alive) continue;
      const dmg = Math.max(1, Math.round(rnd(ab.dmg[0], ab.dmg[1]) * DMG_MULT[ab.dmgType][U(u).armor]));
      Game.log(t('log.hit', { a: Game.uname(src), t: Game.uname(u), d: dmg }), 'hit');
      await this.damage(u, dmg, false, src);
      if (u.alive && (ab.stun || (ab.stunMech && U(u).armor === 'mech'))) this.applyStatus(u, 'stunned');
    }
    Grid.computeVisibility();
  },
};
