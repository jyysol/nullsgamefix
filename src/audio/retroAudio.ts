// Synthesized nostalgic retro audio engine using Web Audio API

class RetroAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted = false;
  private trainTimer: number | null = null;
  private trainGain: GainNode | null = null;
  private trainNoiseSource: AudioBufferSourceNode | null = null;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock() {
    this.ensureContext();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopTrainAmbience();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Crisp tactile plastic power switch click
  public playPowerSwitchClick() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Short percussive click transient
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.035);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.045);

    // Secondary mechanical latch snap
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(2400, now + 0.045);
    osc2.frequency.exponentialRampToValueAtTime(320, now + 0.07);

    gain2.gain.setValueAtTime(0.12, now + 0.045);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.045);
    osc2.stop(now + 0.08);
  }

  // CRT / LCD warm-up static pop
  public playScreenStaticWarmup() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * 0.22);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.Q.setValueAtTime(1.5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
  }

  // Iconic nostalgic retro handheld startup chime (warm 90s/2000s shimmer + classic dual-note ping)
  public playNullsBootChime() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Warm nostalgic pad chord swell (C5 - G5 - B5 - D6)
    const padFreqs = [261.63, 392.0, 493.88, 587.33];
    padFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 0.45);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.065, now + 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.65);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.7);
    });

    // Iconic bright handheld chime arpeggio ("ba-ding!")
    const notes = [
      { freq: 523.25, delay: 0.08, dur: 0.16, vol: 0.11 }, // C5
      { freq: 659.25, delay: 0.18, dur: 0.16, vol: 0.11 }, // E5
      { freq: 783.99, delay: 0.28, dur: 0.18, vol: 0.12 }, // G5
      { freq: 1046.5, delay: 0.42, dur: 0.68, vol: 0.16 }, // C6
      { freq: 2093.0, delay: 0.42, dur: 0.55, vol: 0.06 }, // C7 harmonic sparkle
    ];

    notes.forEach(({ freq, delay, dur, vol }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + delay);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, now + delay);

      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.linearRampToValueAtTime(vol, now + delay + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + dur + 0.04);
    });
  }

  public playButtonBlip(pitch = 680) {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.25, now + 0.045);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.065);
  }

  public playJumpSfx() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(760, now + 0.11);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playScoreSfx() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [880, 1318.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + i * 0.055);
      gain.gain.setValueAtTime(0.07, now + i * 0.055);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.055 + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.055);
      osc.stop(now + i * 0.055 + 0.1);
    });
  }

  public playGameOverSfx() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [392, 349.23, 311.13, 261.63].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + i * 0.09);
      gain.gain.setValueAtTime(0.06, now + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.13);
    });
  }

  // Subtle low train carriage rumble & rhythmic rail clack
  public startTrainAmbience() {
    if (this.isMuted || this.trainTimer !== null) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(145, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.09, ctx.currentTime);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start();

      this.trainNoiseSource = source;
      this.trainGain = gain;

      // Gentle rhythmic "ka-chunk... ka-chunk" rail joints
      const triggerRailClack = () => {
        if (this.isMuted || !this.ctx) return;
        const t = this.ctx.currentTime;
        [0, 0.16].forEach((offset, idx) => {
          if (!this.ctx) return;
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(idx === 0 ? 78 : 66, t + offset);
          o.frequency.exponentialRampToValueAtTime(34, t + offset + 0.09);
          g.gain.setValueAtTime(0.055, t + offset);
          g.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.1);
          o.connect(g);
          g.connect(this.ctx.destination);
          o.start(t + offset);
          o.stop(t + offset + 0.11);
        });
      };

      this.trainTimer = window.setInterval(triggerRailClack, 2400);
    } catch {
      // Ignore audio errors if blocked by autoplay policy
    }
  }

  public stopTrainAmbience() {
    if (this.trainTimer !== null) {
      clearInterval(this.trainTimer);
      this.trainTimer = null;
    }
    if (this.trainNoiseSource) {
      try {
        this.trainNoiseSource.stop();
        this.trainNoiseSource.disconnect();
      } catch {
        // Ignore
      }
      this.trainNoiseSource = null;
    }
    if (this.trainGain) {
      this.trainGain.disconnect();
      this.trainGain = null;
    }
  }
}

export const retroAudio = new RetroAudioEngine();
