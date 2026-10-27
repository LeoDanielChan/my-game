'use strict';
// Pixel art procedural, dibujado del tablero y efectos visuales.

const wait = ms => new Promise(r => setTimeout(r, ms));

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// k contorno · a armadura · b armadura oscura · c adorno · v visor · w arma oscura
// g arma clara · r tela/sello · e energía
const SPRITES = {
  rifleman: [
    '................', '......kkkk......', '.....kaaaak.....', '.....kvvvak.....',
    '.....kbaabk.....', '....kkkbbkkk....', '...kccaaaacck...', '...kaaraaaaak...',
    '...kabkkkkwwwggk', '...kabaaaakkkkk.', '....kbaaaabk....', '....kbbkkbbk....',
    '....kaak.kaak...', '....kaak.kaak...', '...kbbbk.kbbbk..', '...kkkk...kkkk..',
  ],
  assault: [
    '.......rr.......', '......kkkk......', '.....kaaaak.....', '.....kvvvak.....',
    '.....kaaaak.....', '...kkkbbbbkkk...', '..kcaaaaaaaack..', '..kaabaaaabaak..',
    '..kabkkkkwwwwk..', '..kabaaaakgggk..', '...kbaaaabkkk...', '....kbbkkbbk....',
    '....kaak.kaak...', '...kaaak.kaaak..', '...kbbbk.kbbbk..', '...kkkk...kkkk..',
  ],
  ronin: [
    '................', '......kkkk...e..', '.....kaaaak..e..', '.....kvvvvk..e..',
    '......kaak...e..', '....kkcaackk.e..', '...krraaaaarke..', '...krraaaaaakc..',
    '...krbaaaabkkk..', '...krbaaaabk....', '...krbbaabbk....', '...krrbkkbbk....',
    '....kaak.kaak...', '....kaak.kaak...', '...kbbbk.kbbbk..', '...kkkk...kkkk..',
  ],
  medic: [
    '................', '......kkkk......', '.....kaaaak.....', '.....kvvvak.....',
    '.....kaaaak.....', '...kkkbbbbkk....', '..kcrcaaaaak....', '..krrraaaaak....',
    '..kcrcaakkwwk...', '..kkkkaaaakgk...', '....kbaaaabk....', '....kbbkkbbk....',
    '....kaak.kaak...', '....kaak.kaak...', '...kbbbk.kbbbk..', '...kkkk...kkkk..',
  ],
  engineer: [
    '..g.............', '..g...kkkk......', '..g..kaaaak.....', '.kgk.kvvvak.....',
    '.kck.kaaaak.....', '.kcckkbbbbkk....', '.kccaaaaaaak....', '.kccabaaaabk....',
    '.kkkabaakkeek...', '....kbaaaakwk...', '....kbaaaabk....', '....kbbkkbbk....',
    '....kaak.kaak...', '....kaak.kaak...', '...kbbbk.kbbbk..', '...kkkk...kkkk..',
  ],
  sniper: [
    '................', '.....kkkkk......', '....kbbbbbk.....', '....kbvvvbk.....',
    '....kbbaabk.....', '...kbbbaabbk....', '...kbbaaaabk....', '...kbbaaaabk....',
    '..kbbakkkkwwwwgg', '..kbbaaaakkkkkk.', '..kbbbaaaabk....', '..kbbbbkkbbk....',
    '...kbak.kaak....', '....kaak.kaak...', '...kbbbk.kbbbk..', '...kkkk...kkkk..',
  ],
  exo: [
    '................', '.....kkkkkk.....', '....kaaaaaak....', '....kavvvvak....',
    '..kkkaaaaaakkk..', '.kccakbbbbkacck.', '.kaaaaaaaaaaaak.', '.kabaaraaraabak.',
    '.kabakkkkwwwwwgk', '.kbbaaaaakgwgwk.', '..kbaaaaaabk....', '..kbbbkkkbbbk...',
    '..kaaak.kaaak...', '..kaaak.kaaak...', '.kbbbbk.kbbbbk..', '.kkkkkk.kkkkkk..',
  ],
  mech: [
    '....kkkkkkk.....', '...kaaaaaaak....', '...kavvvvvak....', '..kkaaaaaaakk...',
    '.kccbbbbbbbcck..', 'kaacaaaaaaacaak.', 'kaabaaaraaabaak.', 'kaakbaaaaabkaak.',
    'kccbbaaaaabbkggk', 'kccbkaaaaakkggg.', '.kk.kbbbbbk.kk..', '...kbak.kabk....',
    '..kbaak.kaabk...', '..kaaak.kaaak...', '.kbbbbk.kbbbbk..', '.kkkkkk.kkkkkk..',
  ],
  apc: [
    '................', '................', '......kkkkk.....', '.....kaaaaakkkkk',
    '.....kavvaakwwwg', '...kkkaaaaakkkkk', '..kccccccccccck.', '.kaaaaaaaaaaaaak',
    '.kaarraaaaaaaabk', '.kbbbbbbbbbbbbbk', '.kkkkkkkkkkkkkk.', '.kgkgkgkgkgkgkk.',
    '.kwgwgwgwgwgwgk.', '..kkkkkkkkkkkk..', '................', '................',
  ],
  drone: [
    '................', '................', '.gg..........gg.', '..gk........kg..',
    '...kkkkkkkkkk...', '...kaaaaaaaak...', '..kaabbbbbbaak..', '..kabkvvvvkbak..',
    '..kabkvvvvkbak..', '..kaabbbbbbaak..', '...kaaaaaaaak...', '...kkkkwwkkkk...',
    '......kegk......', '..gk...ee...kg..', '.gg..........gg.', '................',
  ],
  turret: [
    '................', '................', '................', '................',
    '................', '......kkkk......', '.....kaaaakkkkk.', '.....kavvakwwwg.',
    '.....kaaaakkkkk.', '......kbbk......', '.....kkbbkk.....', '....kbk..kbk....',
    '...kbk....kbk...', '..kkk......kkk..', '................', '................',
  ],
  vip: [
    '......kkkk......', '.....kbbbbk.....', '.....kbvvbk.....', '.....kbbbbk.....',
    '....kkcbbckk....', '...krrcaacrrk...', '...krraaaarrk...', '...kraaaaaark...',
    '...krakcckark...', '...krakcckark...', '...kraaaaaark...', '..krraaaaaarrk..',
    '..krraaaaaarrk..', '..krrraaaarrrk..', '..kkkkkkkkkkkk..', '................',
  ],
};

const PALETTES = {
  player: { k: '#0b0b0f', a: '#5d6f8a', b: '#38435a', c: '#c9a23f', v: '#7fe9ff', w: '#26262c', g: '#7a7a83', r: '#9e2b25', e: '#9ff6ff' },
  enemy:  { k: '#0b0b0f', a: '#a39c84', b: '#5a554a', c: '#2f3a2a', v: '#8dff5a', w: '#1f2420', g: '#5d6b55', r: '#3f6e2a', e: '#b8ff80' },
};
const TEAM_COLOR = { player: '#5ad1ff', enemy: '#8dff5a' };

const Render = {
  canvas: null, ctx: null, mapCanvas: null, mapDirty: true,
  shake: 0, time: 0, cache: {},

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    canvas.width = Grid.W * TS;
    canvas.height = Grid.H * TS;
    this.ctx.imageSmoothingEnabled = false;
    this.mapDirty = true;
  },

  sprite(type, team, white) {
    const key = type + team + (white ? 'w' : '');
    if (this.cache[key]) return this.cache[key];
    const c = document.createElement('canvas');
    c.width = c.height = SPRITE;
    const g = c.getContext('2d');
    const pal = PALETTES[team] || PALETTES.player;
    const rows = SPRITES[type];
    for (let y = 0; y < SPRITE; y++) for (let x = 0; x < SPRITE; x++) {
      const ch = (rows[y] || '')[x];
      if (!ch || ch === '.') continue;
      g.fillStyle = white ? '#ffffff' : pal[ch] || '#f0f';
      g.fillRect(x, y, 1, 1);
    }
    return (this.cache[key] = c);
  },

  spriteCanvas(type, team, scale = 4) {
    const c = document.createElement('canvas');
    c.width = c.height = SPRITE * scale;
    c.className = 'sprite';
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(this.sprite(type, team), 0, 0, c.width, c.height);
    return c;
  },

  // ---------------- tiles ----------------
  buildMap() {
    if (!this.mapCanvas) this.mapCanvas = document.createElement('canvas');
    const m = this.mapCanvas;
    m.width = Grid.W * TS; m.height = Grid.H * TS;
    const g = m.getContext('2d');
    for (let y = 0; y < Grid.H; y++) for (let x = 0; x < Grid.W; x++) this.drawTile(g, x, y, Grid.tile(x, y));
    this.mapDirty = false;
  },

  drawTile(g, x, y, tile) {
    const P = 3, x0 = x * TS, y0 = y * TS;
    const R = mulberry32(tile.seed);
    const px = (i, j, col) => { g.fillStyle = col; g.fillRect(x0 + i * P, y0 + j * P, P, P); };
    // suelo base: ceniza y óxido
    const floors = ['#2a2622', '#2e2a25', '#26221f', '#312b25'];
    g.fillStyle = floors[0];
    g.fillRect(x0, y0, TS, TS);
    for (let n = 0; n < 40; n++) px(R() * 16 | 0, R() * 16 | 0, floors[(R() * 4) | 0]);
    g.fillStyle = 'rgba(0,0,0,0.25)';
    g.fillRect(x0, y0 + TS - 1, TS, 1);
    g.fillRect(x0 + TS - 1, y0, 1, TS);
    if (R() < 0.18) { // grieta
      let i = R() * 16 | 0, j = R() * 16 | 0;
      for (let k = 0; k < 6; k++) { px(i, j, '#1a1714'); i += R() < 0.5 ? 1 : 0; j += R() < 0.5 ? 1 : -1; i = clamp(i, 0, 15); j = clamp(j, 0, 15); }
    }
    if (R() < 0.05) { // cráneo
      const i = 4 + (R() * 8 | 0), j = 4 + (R() * 8 | 0);
      const b = '#b8ad94';
      px(i, j, b); px(i + 1, j, b); px(i + 2, j, b); px(i, j + 1, '#111'); px(i + 1, j + 1, b); px(i + 2, j + 1, '#111'); px(i + 1, j + 2, b);
    }
    if (R() < 0.08) { for (let n = 0; n < 8; n++) px(6 + (R() * 5 | 0), 6 + (R() * 5 | 0), '#4a2a1c'); }
    const tt = tile.t;
    if (tt === ',') {
      for (let n = 0; n < 7; n++) {
        const i = R() * 14 | 0, j = R() * 14 | 0;
        px(i, j + 1, '#1a1714'); px(i, j, '#5c554b'); px(i + 1, j, '#4a443c'); if (R() < 0.5) px(i + 1, j + 1, '#3a352f');
      }
    } else if (tt === '#') {
      g.fillStyle = '#3b3732'; g.fillRect(x0, y0, TS, TS);
      g.fillStyle = '#57524a'; g.fillRect(x0, y0, TS, TS - 4 * P);
      for (let j = 0; j < 12; j += 3) for (let i = (j % 6 ? 0 : 2); i < 16; i += 5) { px(i, j, '#46423b'); px(i, j + 1, '#46423b'); }
      for (let n = 0; n < 25; n++) px(R() * 16 | 0, R() * 12 | 0, R() < 0.5 ? '#625c53' : '#4c4740');
      for (let i = 0; i < 16; i++) if (R() < 0.3) px(i, 0, floors[0]);
      g.fillStyle = '#25221f'; g.fillRect(x0, y0 + TS - 4 * P, TS, P);
      if (R() < 0.4) { const i = 2 + (R() * 12 | 0); px(i, 0, '#8a4a2a'); px(i, 1, '#8a4a2a'); px(i + 1, 2, '#6a3a22'); }
    } else if (tt === 'W') {
      g.fillStyle = '#2c2732'; g.fillRect(x0, y0, TS, TS);
      g.fillStyle = '#3a3440'; g.fillRect(x0 + P, y0, TS - 2 * P, TS - 3 * P);
      for (let j = 3; j < 12; j++) for (let i = 6; i < 10; i++) px(i, j, j < 5 && (i === 6 || i === 9) ? '#3a3440' : '#4a1418');
      for (let j = 4; j < 12; j += 2) px(7 + (j % 4 ? 1 : 0), j, '#7a2a24');
      for (let i = 5; i < 11; i++) px(i, 2, '#8a7030');
      px(5, 3, '#8a7030'); px(10, 3, '#8a7030');
      for (let j = 3; j < 13; j++) { px(5, j, '#6a5628'); px(10, j, '#6a5628'); }
      g.fillStyle = '#1a171d'; g.fillRect(x0, y0 + TS - 3 * P, TS, 3 * P);
    } else if (tt === '=') {
      if (tile.seed % 3) { // sacos terreros
        for (let r = 0; r < 2; r++) for (let s = 0; s < 3; s++) {
          const i = 1 + s * 5 + (r ? 2 : 0), j = 6 + r * 4;
          if (i > 12) continue;
          for (let a = 0; a < 5; a++) for (let b = 0; b < 3; b++) px(i + a, j + b, b === 0 ? '#8a7a58' : '#6b5d43');
          px(i, j + 3, '#1a1714'); px(i + 4, j + 3, '#1a1714');
        }
        for (let i = 1; i < 15; i++) px(i, 14, '#14110f');
      } else { // trampa antitanque
        for (let k = 0; k < 9; k++) { px(3 + k, 4 + k, '#6a6a72'); px(12 - k, 4 + k, '#55555c'); }
        for (let k = 0; k < 9; k++) { px(3 + k, 5 + k, '#2a2a2e'); }
        for (let i = 0; i < 16; i += 3) px(i, 14, '#14110f');
      }
    } else if (tt === 'T') {
      for (let i = 2; i < 14; i++) for (let j = 3; j < 14; j++) px(i, j, j > 11 ? '#22261f' : '#3a3f3a');
      for (let i = 4; i < 12; i++) for (let j = 5; j < 10; j++) px(i, j, '#0b2a14');
      for (let j = 6; j < 9; j++) for (let i = 5; i < 11; i++) if (R() < 0.5) px(i, j, '#3cff7a');
      px(3, 4, '#c9a23f'); px(12, 4, '#c9a23f');
    }
  },

  // ---------------- frame ----------------
  frame(dt) {
    this.time += dt;
    if (this.mapDirty) this.buildMap();
    const g = this.ctx;
    g.save();
    g.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.shake > 0) {
      g.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
      this.shake = Math.max(0, this.shake - dt * 30);
    }
    g.drawImage(this.mapCanvas, 0, 0);
    this.drawZones(g);
    UI.drawOverlays(g);
    this.drawFog(g);
    this.drawSmoke(g);
    const units = Game.units.filter(u => u.alive && (u.team === 'player' || Grid.isVisible(u.x, u.y)))
      .sort((a, b) => a.ry - b.ry);
    for (const u of units) this.drawUnit(g, u, dt);
    FX.draw(g, dt);
    UI.drawTopOverlays(g);
    g.restore();
  },

  drawZones(g) {
    const owners = Game.zoneOwners || {};
    for (let y = 0; y < Grid.H; y++) for (let x = 0; x < Grid.W; x++) {
      const z = Grid.tile(x, y).zone;
      if (!z) continue;
      let col = 'rgba(201,162,63,0.16)';
      if (z === 'X') col = 'rgba(141,255,90,' + (0.12 + Math.sin(this.time * 3) * 0.05) + ')';
      else if (owners[z] === 'player') col = 'rgba(90,209,255,0.22)';
      else if (owners[z] === 'enemy') col = 'rgba(255,90,74,0.22)';
      g.fillStyle = col;
      g.fillRect(x * TS, y * TS, TS, TS);
      g.strokeStyle = col.replace(/[\d.]+\)$/, '0.5)');
      g.setLineDash([4, 4]);
      g.strokeRect(x * TS + 2, y * TS + 2, TS - 4, TS - 4);
      g.setLineDash([]);
    }
    for (const z of ['A', 'B', 'C']) {
      const tiles = Grid.tiles.map((t, i) => t.zone === z ? i : -1).filter(i => i >= 0);
      if (!tiles.length) continue;
      const cx = tiles.reduce((s, i) => s + i % Grid.W, 0) / tiles.length;
      const cy = tiles.reduce((s, i) => s + (i / Grid.W | 0), 0) / tiles.length;
      g.font = 'bold 28px monospace';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = 'rgba(232,220,190,0.25)';
      g.fillText(z, (cx + 0.5) * TS, (cy + 0.5) * TS);
    }
    // parpadeo de terminales
    for (let y = 0; y < Grid.H; y++) for (let x = 0; x < Grid.W; x++) if (Grid.tile(x, y).t === 'T') {
      g.fillStyle = `rgba(60,255,122,${0.15 + Math.abs(Math.sin(this.time * 4)) * 0.25})`;
      g.fillRect(x * TS + 12, y * TS + 15, 24, 15);
    }
  },

  drawFog(g) {
    for (let y = 0; y < Grid.H; y++) for (let x = 0; x < Grid.W; x++) {
      const i = Grid.idx(x, y);
      if (Grid.vis[i]) continue;
      g.fillStyle = Grid.explored[i] ? 'rgba(8,6,10,0.55)' : 'rgba(8,6,10,0.88)';
      g.fillRect(x * TS, y * TS, TS, TS);
    }
  },

  drawSmoke(g) {
    for (let y = 0; y < Grid.H; y++) for (let x = 0; x < Grid.W; x++) {
      if (!Grid.tile(x, y).smoke) continue;
      for (let k = 0; k < 3; k++) {
        const a = this.time * 0.8 + k * 2.1 + x * 1.3 + y * 0.7;
        g.fillStyle = 'rgba(150,145,135,0.22)';
        g.beginPath();
        g.arc(x * TS + 24 + Math.cos(a) * 10, y * TS + 24 + Math.sin(a) * 8, 16, 0, Math.PI * 2);
        g.fill();
      }
    }
  },

  drawUnit(g, u, dt) {
    const bob = U(u).flying ? Math.sin(this.time * 4 + u.id) * 3 : (Math.sin(this.time * 2 + u.id) > 0.6 ? -1 : 0);
    const cx = u.rx * TS + u.ox * TS, cy = u.ry * TS + u.oy * TS;
    // sombra con color de equipo
    g.fillStyle = 'rgba(0,0,0,0.45)';
    g.beginPath(); g.ellipse(cx + 24, cy + 43, 15, 4, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = TEAM_COLOR[u.team]; g.globalAlpha = 0.6; g.lineWidth = 1.5;
    g.beginPath(); g.ellipse(cx + 24, cy + 43, 16, 5, 0, 0, Math.PI * 2); g.stroke();
    g.globalAlpha = 1;
    if (Game.selected === u) {
      const p = 2 + Math.sin(this.time * 6) * 2;
      g.strokeStyle = '#ffcf4a'; g.lineWidth = 2;
      const s = 10;
      for (const [sx, sy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
        const bx = cx + (sx ? TS - p : p), by = cy + (sy ? TS - p : p);
        g.beginPath();
        g.moveTo(bx + (sx ? -s : s), by); g.lineTo(bx, by); g.lineTo(bx, by + (sy ? -s : s));
        g.stroke();
      }
    }
    const done = u.team === Game.turn && u.ap <= 0 && u.team === 'player';
    g.save();
    g.globalAlpha = done ? 0.6 : 1;
    const flip = u.facing < 0;
    g.translate(cx + (flip ? TS : 0), cy + bob);
    if (flip) g.scale(-1, 1);
    g.drawImage(this.sprite(u.type, u.team), 0, 0, TS, TS);
    if (u.flash > 0) { g.globalAlpha = Math.min(1, u.flash * 4); g.drawImage(this.sprite(u.type, u.team, true), 0, 0, TS, TS); u.flash -= dt; }
    g.restore();
    this.drawBars(g, u, cx, cy);
  },

  drawBars(g, u, cx, cy) {
    const max = u.maxHp, w = 40, x = cx + 4, y = cy - 6;
    g.fillStyle = '#0b0b0f'; g.fillRect(x - 1, y - 1, w + 2, 6);
    const seg = w / max;
    for (let i = 0; i < max; i++) {
      g.fillStyle = i < u.hp ? (u.team === 'player' ? '#5ad1ff' : '#ff5a4a') : '#2a2a2e';
      g.fillRect(x + i * seg, y, Math.max(1, seg - (max <= 12 ? 1 : 0)), 4);
    }
    if (u.shield) {
      g.fillStyle = '#e8e2c8';
      for (let i = 0; i < u.shield; i++) g.fillRect(x + i * 6, y - 5, 5, 3);
    }
    let ix = cx + 2;
    const icon = (txt, col) => {
      g.fillStyle = '#0b0b0f'; g.fillRect(ix, cy + 36, 12, 11);
      g.fillStyle = col; g.fillRect(ix + 1, cy + 37, 10, 9);
      g.fillStyle = '#0b0b0f'; g.font = 'bold 9px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(txt, ix + 6, cy + 42);
      ix += 13;
    };
    if (u.status.exposed) icon(t('icon.exposed'), '#ff8a3d');
    if (u.status.suppressed) icon(t('icon.suppressed'), '#b48cff');
    if (u.status.stunned) icon(t('icon.stunned'), '#5ad1ff');
    if (u.overwatch) {
      const ex = cx + 40, ey = cy + 8;
      g.fillStyle = '#0b0b0f'; g.beginPath(); g.ellipse(ex, ey, 8, 5, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#ffcf4a'; g.beginPath(); g.ellipse(ex, ey, 6, 3.5, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#0b0b0f'; g.beginPath(); g.arc(ex, ey, 2, 0, Math.PI * 2); g.fill();
    }
  },

  shield(g, x, y, dx, dy, full) {
    const cx = x * TS + 24 + dx * 19, cy = y * TS + 24 + dy * 19;
    g.save();
    g.translate(cx, cy);
    g.fillStyle = '#0b0b0f';
    g.beginPath(); g.moveTo(-7, -8); g.lineTo(7, -8); g.lineTo(7, 1); g.lineTo(0, 9); g.lineTo(-7, 1); g.closePath(); g.fill();
    g.fillStyle = full ? '#5ad1ff' : 'rgba(90,209,255,0.35)';
    g.beginPath(); g.moveTo(-5, -6); g.lineTo(5, -6); g.lineTo(5, 0); g.lineTo(0, 6); g.lineTo(-5, 0); g.closePath(); g.fill();
    if (!full) { g.fillStyle = '#5ad1ff'; g.fillRect(-5, -6, 5, 6); }
    g.restore();
  },
};

// ---------------- efectos ----------------
const FX = {
  list: [],

  clear() { this.list = []; },

  add(e) { e.t = 0; this.list.push(e); return e; },

  draw(g, dt) {
    for (const e of this.list) {
      e.t += dt;
      if (e.delay) { e.delay -= dt; e.t = 0; if (e.delay > 0) continue; e.delay = 0; }
      this['draw_' + e.type](g, e, dt);
      if (e.t >= e.life && e.done) { e.done(); e.done = null; }
    }
    this.list = this.list.filter(e => e.t < e.life || e.delay > 0);
  },

  text(x, y, str, color, scale = 1) { this.add({ type: 'text', x: x + 0.5, y: y + 0.2, str, color, scale, life: 1.3 }); },

  particles(x, y, n, colors, speed, life, grav = 6, size = 3) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = speed * (0.3 + Math.random());
      this.add({ type: 'part', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - speed * 0.4, grav, color: colors[(Math.random() * colors.length) | 0], size, life: life * (0.5 + Math.random() * 0.7) });
    }
  },

  blood(u) {
    const mech = U(u).armor === 'mech';
    this.particles(u.x + 0.5, u.y + 0.5, 10, mech ? ['#ffcf4a', '#ff8a3d', '#fff'] : u.team === 'enemy' ? ['#8dff5a', '#3f6e2a', '#d8d0b8'] : ['#7a1414', '#a8322d', '#3a0a0a'], 4, 0.6);
  },

  death(u) {
    if (u.team === 'enemy' && !Grid.isVisible(u.x, u.y)) return;
    this.add({ type: 'ghost', u: { ...u }, life: 1.2 });
    this.particles(u.x + 0.5, u.y + 0.5, 26, ['#ff8a3d', '#ffcf4a', '#3a352f', '#5c554b'], 5, 1);
  },

  debris(x, y) { this.particles(x + 0.5, y + 0.5, 14, ['#5c554b', '#8a7a58', '#3a352f'], 5, 0.8, 10, 4); },

  explosion(cx, cy, r, color) {
    this.add({ type: 'boom', x: cx + 0.5, y: cy + 0.5, r, color, life: 0.5 });
    this.particles(cx + 0.5, cy + 0.5, 40, [color, '#ffcf4a', '#ffffff', '#3a352f'], 7, 0.9);
  },

  smokeBurst(cx, cy, r) { this.particles(cx + 0.5, cy + 0.5, 30, ['#9a958a', '#6a665e', '#c8c2b4'], 3, 1.4, -1, 6); },

  draw_text(g, e) {
    const k = Math.min(1, e.t / e.life);
    g.globalAlpha = 1 - k * k;
    g.font = `bold ${Math.round(15 * e.scale)}px monospace`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const x = e.x * TS, y = (e.y - k * 0.8) * TS;
    g.fillStyle = '#0b0b0f'; g.fillText(e.str, x + 2, y + 2);
    g.fillStyle = e.color; g.fillText(e.str, x, y);
    g.globalAlpha = 1;
  },

  draw_part(g, e, dt) {
    e.vy += e.grav * dt; e.x += e.vx * dt; e.y += e.vy * dt;
    g.globalAlpha = Math.max(0, 1 - e.t / e.life);
    g.fillStyle = e.color;
    g.fillRect(Math.round(e.x * TS), Math.round(e.y * TS), e.size, e.size);
    g.globalAlpha = 1;
  },

  draw_ghost(g, e) {
    const u = e.u;
    g.globalAlpha = Math.max(0, 1 - e.t / e.life);
    g.save();
    g.translate(u.x * TS + 24, u.y * TS + 40);
    g.rotate((u.facing < 0 ? -1 : 1) * Math.min(1, e.t * 3) * Math.PI / 2);
    g.drawImage(Render.sprite(u.type, u.team), -24, -40, TS, TS);
    g.restore();
    g.globalAlpha = 1;
  },

  draw_boom(g, e) {
    const k = Math.min(1, e.t / e.life);
    g.globalAlpha = 1 - k;
    g.fillStyle = e.color;
    g.beginPath(); g.arc(e.x * TS, e.y * TS, (0.3 + k) * e.r * TS, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff4c8';
    g.beginPath(); g.arc(e.x * TS, e.y * TS, (1 - k) * 0.5 * TS, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 1;
  },

  draw_proj(g, e) {
    const k = Math.min(1, e.t / e.life);
    const x = e.x0 + (e.x1 - e.x0) * k, y = e.y0 + (e.y1 - e.y0) * k;
    if (e.style === 'shell') {
      g.fillStyle = '#ffcf4a'; g.fillRect(x * TS - 3, y * TS - 3, 6, 6);
      g.fillStyle = '#ff8a3d'; g.fillRect(x * TS - 2, y * TS - 2, 4, 4);
      return;
    }
    const tl = 0.6, len = Math.hypot(e.x1 - e.x0, e.y1 - e.y0) || 1;
    const bx = x - (e.x1 - e.x0) / len * tl, by = y - (e.y1 - e.y0) / len * tl;
    g.strokeStyle = e.color; g.lineWidth = 2;
    g.beginPath(); g.moveTo(bx * TS, by * TS); g.lineTo(x * TS, y * TS); g.stroke();
  },

  draw_beam(g, e) {
    const a = Math.max(0, 1 - e.t / e.life);
    g.globalAlpha = a;
    g.strokeStyle = e.color; g.lineWidth = e.width * a + 1;
    g.beginPath();
    if (e.zig) {
      const n = 8;
      g.moveTo(e.x0 * TS, e.y0 * TS);
      for (let i = 1; i < n; i++) {
        const k = i / n;
        g.lineTo((e.x0 + (e.x1 - e.x0) * k) * TS + (Math.random() - 0.5) * 14, (e.y0 + (e.y1 - e.y0) * k) * TS + (Math.random() - 0.5) * 14);
      }
      g.lineTo(e.x1 * TS, e.y1 * TS);
    } else {
      g.moveTo(e.x0 * TS, e.y0 * TS); g.lineTo(e.x1 * TS, e.y1 * TS);
    }
    g.stroke();
    g.strokeStyle = '#ffffff'; g.lineWidth = Math.max(1, e.width * a * 0.3);
    g.beginPath(); g.moveTo(e.x0 * TS, e.y0 * TS); g.lineTo(e.x1 * TS, e.y1 * TS); g.stroke();
    g.globalAlpha = 1;
  },

  draw_flash(g, e) {
    g.globalAlpha = Math.max(0, 1 - e.t / e.life);
    g.fillStyle = e.color;
    g.beginPath(); g.arc(e.x * TS, e.y * TS, 7, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 1;
  },

  draw_slash(g, e) {
    const k = Math.min(1, e.t / e.life);
    g.globalAlpha = 1 - k;
    g.strokeStyle = e.color; g.lineWidth = 4;
    g.beginPath();
    g.arc(e.x * TS, e.y * TS, 20, e.a - 1.2 + k * 0.6, e.a + 1.2 + k * 0.6);
    g.stroke();
    g.globalAlpha = 1;
  },

  projectile(att, tgt, w, hit) {
    const x0 = att.x + 0.5 + (att.facing < 0 ? -0.3 : 0.3), y0 = att.y + 0.5;
    let x1 = tgt.x + 0.5, y1 = tgt.y + 0.45;
    if (!hit) {
      const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1;
      const off = (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 0.4);
      x1 += -dy / l * off + dx / l * 0.8; y1 += dx / l * off + dy / l * 0.8;
    }
    const d = Math.hypot(x1 - x0, y1 - y0);
    Sfx.shot(w);
    this.add({ type: 'flash', x: x0, y: y0, color: '#ffe9a0', life: 0.12 });
    return new Promise(res => {
      if (w.dmgType === 'energy' || w === WEAPONS.railgun) {
        const col = w === WEAPONS.railgun ? '#e0fbff' : att.team === 'player' ? '#7fe9ff' : '#8dff5a';
        this.add({ type: 'beam', x0, y0, x1, y1, color: col, width: w === WEAPONS.railgun ? 6 : 3, life: 0.35 });
        setTimeout(res, 180);
      } else if (w.dmgType === 'emp') {
        this.add({ type: 'beam', x0, y0, x1, y1, color: '#5ad1ff', width: 3, zig: true, life: 0.35 });
        setTimeout(res, 200);
      } else if (w.dmgType === 'explosive') {
        this.add({ type: 'proj', style: 'shell', x0, y0, x1, y1, life: d / 14, done: () => {
          this.add({ type: 'boom', x: x1, y: y1, r: 0.6, color: '#ff8a3d', life: 0.35 });
          Sfx.explosion(0.4);
          res();
        } });
      } else {
        const n = w.kind === 'short' && w.dmg[1] <= 5 ? 4 : w.kind === 'short' ? 3 : 1;
        for (let i = 0; i < n; i++) {
          const spread = n > 1 ? (Math.random() - 0.5) * 0.4 : 0;
          this.add({ type: 'proj', x0, y0, x1: x1 + spread, y1: y1 + spread, color: '#ffe27a', delay: i * 0.06, life: d / 28,
            done: i === n - 1 ? res : null });
        }
      }
    });
  },

  async lunge(att, tgt) {
    const dx = tgt.x - att.x, dy = tgt.y - att.y;
    Sfx.slash();
    for (let k = 0; k <= 1; k += 0.2) { att.ox = dx * 0.45 * k; att.oy = dy * 0.45 * k; await wait(16); }
    this.add({ type: 'slash', x: tgt.x + 0.5, y: tgt.y + 0.5, a: Math.atan2(dy, dx), color: att.team === 'player' ? '#9ff6ff' : '#b8ff80', life: 0.3 });
    await wait(90);
    for (let k = 1; k >= 0; k -= 0.25) { att.ox = dx * 0.45 * k; att.oy = dy * 0.45 * k; await wait(16); }
    att.ox = att.oy = 0;
  },
};
