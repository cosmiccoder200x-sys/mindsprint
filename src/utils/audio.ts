/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private volume: number = 0.5;
  private isMuted: boolean = false;
  private ambientOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private isAmbientPlaying: boolean = false;

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  public getVolume() {
    return this.volume;
  }

  // Play a simple crisp UI feedback sound
  public playClick(pitch: number = 800, type: OscillatorType = 'triangle') {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
      // Fast pitch drop to make it clicky
      osc.frequency.exponentialRampToValueAtTime(pitch / 2, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // Soft low tap for movement
  public playTap() {
    this.playClick(440, 'sine');
  }

  // Error/Failure buzz
  public playFailure() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(130, this.ctx.currentTime);
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(127, this.ctx.currentTime); // detuned

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 0.26);
      osc2.stop(this.ctx.currentTime + 0.26);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // Puzzle success sound sweep / Chord resolution
  public playSuccess() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C major pentatonic sweep

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        osc.frequency.exponentialRampToValueAtTime(freq * 2, now + idx * 0.06 + 0.3);

        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(0.1, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.4);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.45);
      });
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // Combo chime arpeggio
  public playCombo(comboCount: number) {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      // High-pitched sweet chime
      const baseFreq = 523.25; // C5
      const mults = [1, 1.125, 1.25, 1.5, 1.667, 1.875, 2, 2.25];
      const factor = mults[Math.min(comboCount, mults.length - 1)];
      const freq = baseFreq * factor;

      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 1.5, now);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc2.start();
      osc.stop(now + 0.31);
      osc2.stop(now + 0.31);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // Rank up cosmic fanfare
  public playRankUp() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const chords = [
        [196.00, 246.94, 293.66], // G Maj
        [220.00, 277.18, 329.63], // A Maj
        [261.63, 329.63, 392.00, 523.25] // C Maj7 / C High
      ];

      chords.forEach((chord, chordIdx) => {
        const chordTime = now + chordIdx * 0.25;
        chord.forEach((freq) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, chordTime);
          
          gain.gain.setValueAtTime(0, now);
          gain.gain.setValueAtTime(0.08, chordTime);
          gain.gain.exponentialRampToValueAtTime(0.001, chordTime + 0.5);

          osc.connect(gain);
          gain.connect(this.masterGain!);

          osc.start(chordTime);
          osc.stop(chordTime + 0.55);
        });
      });
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // Sparkle / Achievement sound
  public playAchievement() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      for (let i = 0; i < 8; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const randomFreq = 1000 + Math.random() * 1500;
        const triggerTime = now + i * 0.05;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(randomFreq, triggerTime);

        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(0.05, triggerTime);
        gain.gain.exponentialRampToValueAtTime(0.001, triggerTime + 0.15);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(triggerTime);
        osc.stop(triggerTime + 0.16);
      }
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // Play an ambient soothing pad sound in background (loopable oscillator chord)
  public startAmbient() {
    if (this.isAmbientPlaying) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      this.isAmbientPlaying = true;
      const rootFreq = 110.00; // A2
      // Soothing chord frequencies: A2, E3, A3, C#4, E4
      const freqs = [rootFreq, rootFreq * 1.5, rootFreq * 2, rootFreq * 2.5, rootFreq * 3];

      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

        // Slow subtle LFO (volume pulsing) for each note to make it organic
        gain.gain.setValueAtTime(0, this.ctx!.currentTime);
        // Fade-in ambient gently over 2 seconds
        gain.gain.linearRampToValueAtTime(0.015, this.ctx!.currentTime + 2);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start();

        this.ambientOscillators.push({ osc, gain });
      });
    } catch (e) {
      console.warn('Ambient play failed', e);
    }
  }

  public stopAmbient() {
    if (!this.isAmbientPlaying) return;
    this.isAmbientPlaying = false;
    if (this.ctx) {
      const now = this.ctx.currentTime;
      this.ambientOscillators.forEach(({ osc, gain }) => {
        try {
          gain.gain.setValueAtTime(gain.gain.value, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
          osc.stop(now + 1.6);
        } catch (e) {}
      });
    }
    this.ambientOscillators = [];
  }

  public toggleAmbient() {
    if (this.isAmbientPlaying) {
      this.stopAmbient();
    } else {
      this.startAmbient();
    }
    return this.isAmbientPlaying;
  }

  public getIsAmbientPlaying() {
    return this.isAmbientPlaying;
  }
}

export const audio = new AudioEngine();
