'use strict';
// Mapa, línea de visión, cobertura, niebla de guerra y búsqueda de caminos.

const DIRS4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const DIRS8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

const Grid = {
  W: 20, H: 14,
  tiles: [],
  vis: [],        // visible para el jugador
  explored: [],

  load(rows) {
    this.H = rows.length;
    this.W = Math.max(...rows.map(r => r.length));
    this.tiles = [];
    for (let y = 0; y < this.H; y++) {
      for (let x = 0; x < this.W; x++) {
        const c = rows[y][x] || '.';
        const tile = { t: '.', zone: null, deploy: null, smoke: 0, seed: (x * 73856093 ^ y * 19349663) >>> 0 };
        if (c === 'P' || c === 'E') tile.deploy = c === 'P' ? 'player' : 'enemy';
        else if (c === 'A' || c === 'B' || c === 'C') tile.zone = c;
        else if (c === 'X') tile.zone = 'X';
        else tile.t = c;
        this.tiles.push(tile);
      }
    }
    this.vis = new Array(this.W * this.H).fill(false);
    this.explored = new Array(this.W * this.H).fill(false);
  },

  inb(x, y) { return x >= 0 && y >= 0 && x < this.W && y < this.H; },
  idx(x, y) { return y * this.W + x; },
  tile(x, y) { return this.inb(x, y) ? this.tiles[this.idx(x, y)] : null; },
  isWall(x, y) { const t = this.tile(x, y); return !t || t.t === '#' || t.t === 'W'; },
  isHalf(x, y) { const t = this.tile(x, y); return !!t && (t.t === '=' || t.t === 'T'); },
  dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); },

  unitAt(x, y) {
    return Game.units.find(u => u.alive && u.x === x && u.y === y) || null;
  },

  // ¿puede la unidad atravesar la casilla? (sin contar otras unidades)
  passable(x, y, unit) {
    const t = this.tile(x, y);
    if (!t || t.t === '#' || t.t === 'W') return false;
    if (t.t === 'T') return !!U(unit).flying;
    if (t.t === '=') return !!(U(unit).flying || U(unit).vehicle);
    return true;
  },

  // Línea de visión muestreando el segmento entre centros de casilla
  rawLos(ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay;
    const steps = Math.ceil(Math.hypot(dx, dy) * 4);
    for (let i = 1; i < steps; i++) {
      const px = Math.floor(ax + 0.5 + dx * i / steps);
      const py = Math.floor(ay + 0.5 + dy * i / steps);
      if ((px === ax && py === ay) || (px === bx && py === by)) continue;
      if (this.isWall(px, py)) return false;
    }
    return true;
  },

  // Con "asomarse": una unidad junto a cobertura puede mirar desde la casilla lateral
  los(ax, ay, bx, by) {
    if (this.rawLos(ax, ay, bx, by)) return true;
    let nearCover = false;
    for (const [dx, dy] of DIRS4) if (this.isWall(ax + dx, ay + dy) || this.isHalf(ax + dx, ay + dy)) nearCover = true;
    if (!nearCover) return false;
    for (const [dx, dy] of DIRS4) {
      const nx = ax + dx, ny = ay + dy;
      if (!this.inb(nx, ny) || this.isWall(nx, ny) || this.isHalf(nx, ny)) continue;
      if (this.rawLos(nx, ny, bx, by)) return true;
    }
    return false;
  },

  canSee(unit, x, y) {
    if (unit.x === x && unit.y === y) return true;
    return this.dist(unit.x, unit.y, x, y) <= U(unit).sight && this.los(unit.x, unit.y, x, y);
  },

  teamSees(team, x, y) {
    return Game.units.some(u => u.alive && u.team === team && this.canSee(u, x, y));
  },

  computeVisibility() {
    const mine = Game.units.filter(u => u.alive && u.team === 'player');
    for (let y = 0; y < this.H; y++) for (let x = 0; x < this.W; x++) {
      const i = this.idx(x, y);
      const v = mine.some(u => this.canSee(u, x, y));
      this.vis[i] = v;
      if (v) this.explored[i] = true;
    }
  },

  isVisible(x, y) { return this.vis[this.idx(x, y)]; },

  // Cobertura del objetivo frente a un atacante en (ax, ay)
  // devuelve { value: 0|20|40, flanked, any }
  cover(target, ax, ay) {
    const def = U(target);
    if (def.flying || def.vehicle) return { value: 0, flanked: false, any: false };
    let value = 0, any = false;
    for (const [dx, dy] of DIRS4) {
      const nx = target.x + dx, ny = target.y + dy;
      let c = 0;
      if (this.isWall(nx, ny) && this.inb(nx, ny)) c = 40;
      else if (this.isHalf(nx, ny)) c = 20;
      else {
        const o = this.unitAt(nx, ny);
        if (o && U(o).vehicle && o !== target) c = 20;   // cobertura móvil
      }
      if (!c) continue;
      any = true;
      if ((ax - target.x) * dx + (ay - target.y) * dy > 0) value = Math.max(value, c);
    }
    return { value, flanked: value === 0, any };
  },

  // Lados con cobertura de una casilla (para dibujar escudos)
  coverSides(x, y) {
    const out = [];
    for (const [dx, dy] of DIRS4) {
      const nx = x + dx, ny = y + dy;
      if (!this.inb(nx, ny)) continue;
      if (this.isWall(nx, ny)) out.push({ dx, dy, v: 40 });
      else if (this.isHalf(nx, ny)) out.push({ dx, dy, v: 20 });
      else {
        const o = this.unitAt(nx, ny);
        if (o && U(o).vehicle) out.push({ dx, dy, v: 20 });
      }
    }
    return out;
  },

  // Dijkstra 8 direcciones (diagonal 1.5). Las unidades aliadas se pueden
  // atravesar pero no ocupar; las enemigas bloquean.
  reach(unit, maxCost) {
    const N = this.W * this.H;
    const dist = new Float32Array(N).fill(Infinity);
    const prev = new Int32Array(N).fill(-1);
    const start = this.idx(unit.x, unit.y);
    dist[start] = 0;
    const open = [start];
    const occ = new Map();
    for (const u of Game.units) if (u.alive && u !== unit) occ.set(this.idx(u.x, u.y), u);
    while (open.length) {
      let bi = 0;
      for (let i = 1; i < open.length; i++) if (dist[open[i]] < dist[open[bi]]) bi = i;
      const cur = open.splice(bi, 1)[0];
      const cx = cur % this.W, cy = (cur / this.W) | 0;
      for (const [dx, dy] of DIRS8) {
        const nx = cx + dx, ny = cy + dy;
        if (!this.passable(nx, ny, unit)) continue;
        if (dx && dy && (!this.passable(cx + dx, cy, unit) || !this.passable(cx, cy + dy, unit))) continue;
        const ni = this.idx(nx, ny);
        const o = occ.get(ni);
        if (o && o.team !== unit.team) continue;
        let cost = dx && dy ? 1.5 : 1;
        if (this.tiles[ni].t === '=' && U(unit).vehicle) cost += 1;
        const nd = dist[cur] + cost;
        if (nd > maxCost || nd >= dist[ni]) continue;
        dist[ni] = nd; prev[ni] = cur;
        open.push(ni);
      }
    }
    return {
      dist, prev,
      canStop: (x, y) => this.inb(x, y) && dist[this.idx(x, y)] < Infinity && !occ.has(this.idx(x, y)),
      cost: (x, y) => dist[this.idx(x, y)],
      path: (x, y) => {
        const p = [];
        let i = this.idx(x, y);
        while (i !== start && i !== -1) { p.unshift({ x: i % this.W, y: (i / this.W) | 0 }); i = prev[i]; }
        return p;
      },
    };
  },

  // Destruye la cobertura de una casilla. level 1: barricadas, 2: también muros
  destroy(x, y, level) {
    const t = this.tile(x, y);
    if (!t) return false;
    if (t.t === '=' || (level >= 2 && t.t === '#')) {
      t.t = ',';
      Render.mapDirty = true;
      FX.debris(x, y);
      return true;
    }
    return false;
  },

  tilesInRadius(cx, cy, r) {
    const out = [];
    const R = Math.ceil(r);
    for (let y = cy - R; y <= cy + R; y++) for (let x = cx - R; x <= cx + R; x++)
      if (this.inb(x, y) && this.dist(cx, cy, x, y) <= r) out.push({ x, y });
    return out;
  },
};
