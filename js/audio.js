'use strict';
// Efectos de sonido sintetizados con Web Audio (sin archivos externos).

const Sfx = {
  ctx: null,
  muted: false,

  ac() {
    if (this.muted) return null;
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  noise(dur, { vol = 0.3, freq = 1000, type = 'lowpass', decay = dur, q = 1 } = {}) {
    const ac = this.ac(); if (!ac) return;
    const len = Math.floor(ac.sampleRate * dur);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource(); src.buffer = buf;
    const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ac.createGain();
    g.gain.setValueAtTime(vol, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + decay);
    src.connect(f); f.connect(g); g.connect(ac.destination);
    src.start();
  },

  tone(f0, f1, dur, { vol = 0.15, type = 'square', delay = 0 } = {}) {
    const ac = this.ac(); if (!ac) return;
    const t0 = ac.currentTime + delay;
    const o = ac.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f0, t0);
    o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g); g.connect(ac.destination);
    o.start(t0); o.stop(t0 + dur + 0.02);
  },

  shot(w) {
    if (!w) return;
    if (w === WEAPONS.railgun) { this.tone(1800, 80, 0.4, { vol: 0.12, type: 'sawtooth' }); this.noise(0.3, { vol: 0.25, freq: 3000 }); return; }
    switch (w.dmgType) {
      case 'energy': this.tone(900, 200, 0.18, { vol: 0.1, type: 'sawtooth' }); break;
      case 'emp': this.tone(120, 900, 0.2, { vol: 0.1, type: 'square' }); this.noise(0.2, { vol: 0.1, freq: 4000, type: 'highpass' }); break;
      case 'explosive': this.noise(0.25, { vol: 0.35, freq: 400 }); this.tone(150, 50, 0.2, { vol: 0.15 }); break;
      default: {
        const n = w.kind === 'short' ? 3 : 1;
        for (let i = 0; i < n; i++) setTimeout(() => this.noise(0.12, { vol: 0.3, freq: 1800 }), i * 60);
      }
    }
  },

  explosion(scale = 1) { this.noise(0.9 * scale, { vol: 0.5 * scale, freq: 300 }); this.tone(90, 30, 0.6 * scale, { vol: 0.25 * scale, type: 'sine' }); },
  emp() { this.tone(60, 1200, 0.4, { vol: 0.12, type: 'sawtooth' }); this.noise(0.4, { vol: 0.15, freq: 5000, type: 'highpass' }); },
  smoke() { this.noise(0.8, { vol: 0.2, freq: 900, type: 'bandpass' }); },
  slash() { this.noise(0.18, { vol: 0.3, freq: 3500, type: 'highpass' }); this.tone(600, 1400, 0.12, { vol: 0.06, type: 'sine' }); },
  hit() { this.noise(0.08, { vol: 0.25, freq: 800 }); },
  death() { this.tone(300, 40, 0.5, { vol: 0.15, type: 'square' }); this.noise(0.4, { vol: 0.2, freq: 600 }); },
  step() { this.noise(0.04, { vol: 0.05, freq: 600 }); },
  click() { this.tone(700, 500, 0.05, { vol: 0.06 }); },
  select() { this.tone(500, 900, 0.08, { vol: 0.07 }); },
  heal() { this.tone(400, 800, 0.2, { vol: 0.08, type: 'sine' }); this.tone(600, 1200, 0.25, { vol: 0.08, type: 'sine', delay: 0.1 }); },
  alert() { this.tone(220, 220, 0.15, { vol: 0.1 }); this.tone(330, 330, 0.2, { vol: 0.1, delay: 0.15 }); },
  hack() { for (let i = 0; i < 6; i++) this.tone(400 + Math.random() * 1200, 300, 0.05, { vol: 0.05, delay: i * 0.05 }); },
  win() { [262, 330, 392, 523].forEach((f, i) => this.tone(f, f, 0.3, { vol: 0.1, delay: i * 0.15, type: 'triangle' })); },
  lose() { [392, 330, 262, 196].forEach((f, i) => this.tone(f, f * 0.98, 0.4, { vol: 0.1, delay: i * 0.2, type: 'sawtooth' })); },
};
