/**
 * HypChat Audio Engine
 * Royalty-free procedural synthesized music tracks & audio preview system.
 * Complies with strict copyright requirements: 100% royalty-free, browser synthesized,
 * with no unauthorized copyrighted downloads.
 */

class HypAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private activeSoundId: string | null = null;
  private timer: number | null = null;
  private step = 0;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playSound(soundKey: string, soundId: string, onStop?: () => void) {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    this.isPlaying = true;
    this.activeSoundId = soundId;
    this.step = 0;

    const bpm = this.getBpm(soundKey);
    const stepInterval = (60 / bpm / 4) * 1000;

    const tick = () => {
      if (!this.isPlaying || !this.ctx) return;
      this.triggerStep(soundKey, this.step);
      this.step = (this.step + 1) % 32;
      this.timer = window.setTimeout(tick, stepInterval);
    };

    tick();
  }

  public stop() {
    this.isPlaying = false;
    this.activeSoundId = null;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  public getActiveSoundId(): string | null {
    return this.activeSoundId;
  }

  public isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  private getBpm(key: string): number {
    switch (key) {
      case 'synthwave_pulse': return 124;
      case 'lofi_midnight': return 82;
      case 'trap_hype_808': return 138;
      case 'cyber_funk': return 118;
      case 'acoustic_breeze': return 95;
      case 'sunset_glitch': return 110;
      default: return 120;
    }
  }

  private triggerStep(key: string, step: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Kick on steps 0, 8, 16, 24
    if (step % 8 === 0) {
      this.playKick(now);
    }

    // Snare on steps 4, 12, 20, 28
    if (step % 8 === 4) {
      this.playSnare(now);
    }

    // Hi-hat on every even step
    if (step % 2 === 0) {
      this.playHiHat(now, step % 4 === 2 ? 0.05 : 0.02);
    }

    // Melodic bass & arpeggio based on track key
    const chordStep = Math.floor(step / 8);
    const chordFreqs = this.getChordFrequencies(key, chordStep);

    if (step % 2 === 0) {
      const freq = chordFreqs[step % chordFreqs.length];
      this.playSynthNote(now, freq, key);
    }
  }

  private getChordFrequencies(key: string, chordIndex: number): number[] {
    // 4 chord loops
    switch (key) {
      case 'synthwave_pulse':
        // Dm - Bb - F - C
        return [
          [146.83, 220.00, 261.63, 349.23],
          [116.54, 174.61, 233.08, 293.66],
          [174.61, 261.63, 349.23, 440.00],
          [130.81, 196.00, 261.63, 329.63]
        ][chordIndex % 4];

      case 'lofi_midnight':
        // Cmaj7 - Am7 - Dm7 - G7
        return [
          [261.63, 329.63, 392.00, 493.88],
          [220.00, 261.63, 329.63, 392.00],
          [146.83, 174.61, 220.00, 261.63],
          [196.00, 246.94, 293.66, 349.23]
        ][chordIndex % 4];

      case 'trap_hype_808':
        // F#m - D - A - E
        return [
          [185.00, 277.18, 369.99, 440.00],
          [146.83, 220.00, 293.66, 369.99],
          [220.00, 277.18, 329.63, 440.00],
          [164.81, 246.94, 329.63, 415.30]
        ][chordIndex % 4];

      default:
        return [
          [220, 261.63, 329.63, 392],
          [174.61, 220, 261.63, 329.63],
          [196, 246.94, 293.66, 369.99],
          [146.83, 174.61, 220, 261.63]
        ][chordIndex % 4];
    }
  }

  private playKick(time: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(35, time + 0.12);

    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.15);
  }

  private playSnare(time: number) {
    if (!this.ctx) return;
    // Tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    oscGain.gain.setValueAtTime(0.2, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.1);

    // Noise burst
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(time);
    noise.stop(time + 0.12);
  }

  private playHiHat(time: number, gainLevel: number) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(gainLevel, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(time);
    noise.stop(time + 0.04);
  }

  private playSynthNote(time: number, freq: number, key: string) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = key === 'lofi_midnight' ? 'sine' : key === 'trap_hype_808' ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(key === 'lofi_midnight' ? 800 : 1800, time);

    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.25);
  }
}

export const audioEngine = new HypAudioEngine();
