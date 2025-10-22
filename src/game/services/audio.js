export class AudioBus {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.gain = 0.5;
    this.buffers = new Map();
    this.active = new Set();
  }

  async init() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.gain;
    this.master.connect(this.ctx.destination);

    // Create simple oscillators as placeholders
    // We'll synthesize blips for collect and noise for engine/siren
  }

  playEngine() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 80;
    gain.gain.value = 0.02;
    osc.connect(gain).connect(this.master);
    osc.start();
    const node = { osc, gain };
    this.active.add(node);
    return () => {
      try { osc.stop(); } catch {}
      gain.disconnect();
      this.active.delete(node);
    };
  }

  playSiren() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    gain.gain.value = 0.03;
    osc.connect(gain).connect(this.master);
    let t = 0;
    const interval = setInterval(() => {
      t += 0.1;
      osc.frequency.value = 600 + 400 * Math.sin(t * 2);
    }, 50);
    osc.start();
    const node = { osc, gain, interval };
    this.active.add(node);
    return () => {
      clearInterval(interval);
      try { osc.stop(); } catch {}
      gain.disconnect();
      this.active.delete(node);
    };
  }

  playCollect() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 800;
    gain.gain.value = 0.06;
    osc.connect(gain).connect(this.master);
    osc.start();
    setTimeout(() => { try { osc.stop(); } catch {}; gain.disconnect(); }, 100);
  }

  playCrash() {
    if (!this.ctx) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const white = this.ctx.createBufferSource();
    white.buffer = noiseBuffer;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.2;
    white.connect(gain).connect(this.master);
    white.start();
    setTimeout(() => { try { white.stop(); } catch {}; gain.disconnect(); }, 200);
  }
}
