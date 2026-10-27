'use strict';
// Arranque: ajustes guardados, eventos globales, bucle de render y ceniza del fondo.

const Settings = {
  get(k, def) { try { return localStorage.getItem('gp.' + k) ?? def; } catch (e) { return def; } },
  set(k, v) { try { localStorage.setItem('gp.' + k, v); } catch (e) { /* sin almacenamiento */ } },
};

function initSettings() {
  I18N.lang = Settings.get('lang', (navigator.language || 'es').startsWith('es') ? 'es' : 'en');
  Game.difficulty = Settings.get('diff', 'normal');
  if (!DIFFICULTY[Game.difficulty]) Game.difficulty = 'normal';
  Sfx.muted = Settings.get('mute', '0') === '1';
}

function toggleSound() {
  Sfx.muted = !Sfx.muted;
  Settings.set('mute', Sfx.muted ? '1' : '0');
  if (!Sfx.muted) Sfx.click();
  UI.renderMenu();
  $('#btn-sound2').classList.toggle('off', Sfx.muted);
}

function bindEvents() {
  document.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => {
    I18N.lang = b.dataset.lang; Settings.set('lang', I18N.lang); Sfx.click(); UI.rerender();
  });
  document.querySelectorAll('[data-diff]').forEach(b => b.onclick = () => {
    Game.difficulty = b.dataset.diff; Settings.set('diff', Game.difficulty); Sfx.click(); UI.renderMenu();
  });
  document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { Sfx.click(); UI.show(b.dataset.go); });
  $('#btn-play').onclick = () => { Sfx.click(); UI.show('missions'); };
  $('#btn-help').onclick = $('#btn-help2').onclick = () => { Sfx.click(); UI.showHelp(); };
  $('#btn-sound').onclick = $('#btn-sound2').onclick = toggleSound;
  $('#btn-random').onclick = () => { Sfx.click(); UI.randomSquad(); };
  $('#btn-clear').onclick = () => { Sfx.click(); UI.squadList = []; UI.renderSquad(); };
  $('#btn-deploy').onclick = () => { if (UI.squadList.length) { Sfx.select(); Game.start(UI.mission, UI.squadList); } };
  $('#btn-end').onclick = () => { if (Game.turn === 'player' && !Game.busy) { Sfx.click(); Game.endTurn(); } };
  $('#btn-quit').onclick = () => {
    if (confirm(t('confirm.leave'))) { Game.over = true; Game.mission = null; UI.show('menu'); }
  };
  $('#modal-x').onclick = () => UI.closeModal();
  $('#modal').onclick = e => { if (e.target.id === 'modal' && !Game.over) UI.closeModal(); };

  const board = $('#board');
  board.addEventListener('mousemove', e => UI.onMove(e));
  board.addEventListener('mouseleave', () => { UI.hover = null; UI.renderTargetPanel(); });
  board.addEventListener('click', e => UI.onClick(e));
  board.addEventListener('contextmenu', e => { e.preventDefault(); if (Game.selected) UI.setMode('move'); });
  window.addEventListener('keydown', e => UI.onKey(e));
  window.addEventListener('resize', () => { UI.fitCanvas(); resizeAsh(); });

  // tooltips para cualquier elemento con data-tip
  const tip = $('#tip');
  document.addEventListener('mouseover', e => {
    const el = e.target.closest('[data-tip]');
    if (!el) { tip.style.display = 'none'; return; }
    tip.textContent = el.dataset.tip;
    tip.style.display = 'block';
    const r = el.getBoundingClientRect();
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    tip.style.left = Math.max(8, Math.min(window.innerWidth - tw - 8, r.left + r.width / 2 - tw / 2)) + 'px';
    tip.style.top = (r.top - th - 8 < 8 ? r.bottom + 8 : r.top - th - 8) + 'px';
  });
}

// ---------------- ceniza de fondo ----------------
const ash = { c: null, g: null, p: [] };
function resizeAsh() {
  ash.c.width = window.innerWidth;
  ash.c.height = window.innerHeight;
}
function initAsh() {
  ash.c = $('#ash');
  ash.g = ash.c.getContext('2d');
  resizeAsh();
  for (let i = 0; i < 90; i++) ash.p.push({ x: Math.random(), y: Math.random(), s: 1 + Math.random() * 2.5, v: 0.01 + Math.random() * 0.03, ember: Math.random() < 0.25, ph: Math.random() * 6 });
}
function drawAsh(dt) {
  const { c, g } = ash;
  g.clearRect(0, 0, c.width, c.height);
  for (const p of ash.p) {
    p.y -= p.v * dt * (p.ember ? 1.5 : 0.6);
    p.ph += dt;
    p.x += Math.sin(p.ph) * 0.0004;
    if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
    g.globalAlpha = p.ember ? 0.5 + Math.sin(p.ph * 3) * 0.3 : 0.25;
    g.fillStyle = p.ember ? '#ff8a3d' : '#8a8170';
    g.fillRect(p.x * c.width, p.y * c.height, p.s, p.s);
  }
  g.globalAlpha = 1;
}

// ---------------- bucle principal ----------------
let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  requestAnimationFrame(loop);
  try {
    if (UI.screen === 'battle' && Game.mission) Render.frame(dt);
    else drawAsh(dt);
  } catch (e) {
    console.error(e);
    Render.ctx && Render.ctx.restore();
  }
}

initSettings();
I18N.apply();
bindEvents();
initAsh();
UI.show('menu');
requestAnimationFrame(loop);
