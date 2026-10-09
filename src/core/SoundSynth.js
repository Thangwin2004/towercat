/**
 * Hybrid Web Audio & Real Open SFX System for "Mèo Chiến Đảo"
 * Integrates high-fidelity open audio samples from /assest/music/:
 * - Button1.mp3: Crisp tactile UI button click
 * - Chest_HeadOpent.mp3: Wooden chest / modal open creak
 * - FullCollect.mp3 & LevelUp.mp3: Triumphant victory fanfare & level completion
 * - ExpEarn.mp3 & Bounce1.mp3: Star chime award & slam bounce
 * - CountNumber.mp3: Score roll-up counting clicks
 * - CardSwipeAll.mp3: Blitz speed dash & marching whoosh
 * - Shake1.mp3: Bastion fortress shield rumble & lock
 * - CharSpawn.mp3: Surge troop rally summon
 * - CharHit.mp3: Weapon clash & battle impact
 * - CharKnockDown.mp3: Island conquered & base captured
 * - Throw.mp3: Troop dispatch launch
 * - Switch.mp3: Dispatch % & tab toggle
 * - music.mp3: Tropical island background soundtrack
 *
 * Full fallback to procedural Web Audio synthesis if offline or loading.
 * Strictly adheres to game-audio-system: GainNode mixer, no HTMLAudio.volume,
 * and zero autoplay leaks during Wink feed preloads.
 */

const toAsset = (file) => `${import.meta.env.BASE_URL || './'}`.replace(/\/+$/, '') + '/assest/music/' + file;

const AUDIO_PATHS = {
  click: toAsset('Button1.mp3'),
  clickAlt: toAsset('Button2.mp3'),
  openModal: toAsset('Chest_HeadOpent.mp3'),
  victory: toAsset('FullCollect.mp3'),
  levelUp: toAsset('LevelUp.mp3'),
  starAward: toAsset('ExpEarn.mp3'),
  starBounce: toAsset('Bounce1.mp3'),
  scoreTally: toAsset('CountNumber.mp3'),
  blitz: toAsset('CardSwipeAll.mp3'),
  bastion: toAsset('Shake1.mp3'),
  surge: toAsset('CharSpawn.mp3'),
  clash: toAsset('CharHit.mp3'),
  conquer: toAsset('CharKnockDown.mp3'),
  dispatch: toAsset('Throw.mp3'),
  toggle: toAsset('Switch.mp3'),
  bgm: toAsset('music.mp3'),
};

class SoundSynthManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.bgmGain = null;

    this.buffers = {};
    this.bgmAudio = null;
    this.bgmSourceNode = null;

    this.hasUserInteracted = false;
    this.isMuted = localStorage.getItem('blth_muted') === 'true';
    this.isHostMuted = false;
    this.isTabVisible = typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;

    this.bgmPlaying = false;
    this.proceduralBgmTimer = null;
    this.bgmStep = 0;

    this._installInteractionUnlock();
    this._installVisibilityWatch();
  }

  _installInteractionUnlock() {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      this.hasUserInteracted = true;
      if (!this.ctx) {
        this._initContext();
      } else if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };

    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
  }

  _installVisibilityWatch() {
    if (typeof document === 'undefined') return;

    document.addEventListener('visibilitychange', () => {
      this.isTabVisible = document.visibilityState === 'visible';
      if (!this.isTabVisible) {
        if (this.ctx && this.ctx.state === 'running') {
          this.ctx.suspend().catch(() => {});
        }
      } else {
        if (this.ctx && this.hasUserInteracted && !this.isMuted && !this.isHostMuted) {
          this.ctx.resume().catch(() => {});
        }
      }
      this.updateGainLevels();
    });
  }

  _initContext() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.bgmGain = this.ctx.createGain();

      this.sfxGain.connect(this.masterGain);
      this.bgmGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.updateGainLevels();

      // Preload & decode open SFX files into memory
      this.preloadAudio();
    } catch (e) {
      console.warn('[SoundSynth] AudioContext init deferred:', e);
    }
  }

  async preloadAudio() {
    if (!this.ctx) return;
    const entries = Object.entries(AUDIO_PATHS);
    await Promise.all(
      entries.map(async ([key, path]) => {
        if (key === 'bgm') return; // Streamed via MediaElementAudioSourceNode
        try {
          const res = await fetch(path);
          if (res.ok) {
            const arr = await res.arrayBuffer();
            const decoded = await this.ctx.decodeAudioData(arr);
            this.buffers[key] = decoded;
          }
        } catch (_) {
          // If fetch fails, procedural fallback handles playback
        }
      })
    );
  }

  /**
   * Internal helper to play a decoded open audio sample
   */
  _playSample(key, { volume = 1.0, pitch = 1.0, bus = 'sfx' } = {}) {
    if (!this.canPlay() || !this.ctx || !this.buffers[key]) return false;
    try {
      const source = this.ctx.createBufferSource();
      source.buffer = this.buffers[key];
      source.playbackRate.value = pitch;

      const gain = this.ctx.createGain();
      gain.gain.value = volume;

      source.connect(gain);
      gain.connect(bus === 'bgm' ? this.bgmGain : this.sfxGain);
      source.start(0);
      return true;
    } catch (_) {
      return false;
    }
  }

  canPlay() {
    const inIframe = typeof window !== 'undefined' && window.self !== window.top;
    if (inIframe && !this.hasUserInteracted) return false;
    return (
      this.hasUserInteracted &&
      this.isTabVisible &&
      !this.isMuted &&
      !this.isHostMuted
    );
  }

  updateGainLevels() {
    if (!this.masterGain) return;
    const silent = this.isMuted || this.isHostMuted || !this.isTabVisible;
    this.masterGain.gain.setValueAtTime(silent ? 0 : 1.0, this.ctx?.currentTime || 0);
    if (this.sfxGain) this.sfxGain.gain.setValueAtTime(0.85, this.ctx?.currentTime || 0);
    if (this.bgmGain) this.bgmGain.gain.setValueAtTime(silent ? 0 : 0.35, this.ctx?.currentTime || 0);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('blth_muted', String(this.isMuted));
    this.updateGainLevels();
    return this.isMuted;
  }

  setHostMuted(muted) {
    this.isHostMuted = Boolean(muted);
    this.updateGainLevels();
  }

  pauseForFocus() {
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  resumeFromFocus() {
    if (this.canPlay() && this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // --- AUDIO METHODS WITH OPEN SFX & PROCEDURAL FALLBACK ---

  /** Tactile button tap (Button1.mp3) */
  playClick() {
    if (this._playSample('click', { volume: 0.85, pitch: 0.95 + Math.random() * 0.1 })) return;

    if (!this.canPlay() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch (_) {}
  }

  /** Modal / Wooden Chest Open (Chest_HeadOpent.mp3) */
  playOpenModal() {
    if (this._playSample('openModal', { volume: 0.85 })) return;

    if (!this.canPlay() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [440, 660].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.15, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.15);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.16);
      });
    } catch (_) {}
  }

  /** Toggle 50%/100% or chapter tab switch (Switch.mp3) */
  playToggle() {
    if (this._playSample('toggle', { volume: 0.7 })) return;
    this.playClick();
  }

  /** Drag line troop dispatch release (Throw.mp3) */
  playDispatch() {
    if (this._playSample('dispatch', { volume: 0.85, pitch: 0.95 + Math.random() * 0.15 })) return;

    if (!this.canPlay() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.09);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (_) {}
  }

  /** Warning buzz when attacking an unconnected territory */
  playBlocked() {
    if (!this.canPlay() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.08);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (_) {}
  }

  /** Subtle clash impact when units collide (CharHit.mp3) */
  playClash() {
    if (this._playSample('clash', { volume: 0.45, pitch: 0.9 + Math.random() * 0.25 })) return;

    if (!this.canPlay() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(380 + Math.random() * 80, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (_) {}
  }

  /** Territory captured / base conquered (CharKnockDown.mp3) */
  playCapture(isPlayer = true) {
    if (isPlayer && this._playSample('conquer', { volume: 0.85 })) return;

    if (!this.canPlay() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const baseFreq = isPlayer ? 440 : 330;
      const notes = isPlayer ? [1, 1.25, 1.5, 2] : [1, 1.18, 1.4];

      notes.forEach((ratio, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq * ratio, now + i * 0.06);

        gain.gain.setValueAtTime(0, now + i * 0.06);
        gain.gain.linearRampToValueAtTime(0.2, now + i * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.36);
      });
    } catch (_) {}
  }

  /** Skill activations (CardSwipeAll / Shake1 / CharSpawn) */
  playSkill(type) {
    if (type === 'blitz' && this._playSample('blitz', { volume: 0.95 })) return;
    if (type === 'bastion' && this._playSample('bastion', { volume: 0.95 })) return;
    if (type === 'surge' && this._playSample('surge', { volume: 0.95 })) return;

    if (!this.canPlay() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      if (type === 'blitz') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === 'bastion') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.35);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.38);
      } else if (type === 'surge') {
        [220, 277, 330, 440].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);
          gain.gain.setValueAtTime(0, now + idx * 0.07);
          gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.07 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.4);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.42);
        });
      }
    } catch (_) {}
  }

  /** Victory Celebration Fanfare (FullCollect.mp3 + LevelUp.mp3) */
  playVictory() {
    if (this._playSample('victory', { volume: 0.95 })) {
      this._playSample('levelUp', { volume: 0.85 });
      return;
    }

    if (!this.canPlay() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const melody = [
        { f: 523.25, t: 0.0, d: 0.18 },
        { f: 659.25, t: 0.18, d: 0.18 },
        { f: 783.99, t: 0.36, d: 0.22 },
        { f: 1046.50, t: 0.58, d: 0.55 },
      ];

      melody.forEach(item => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.f, now + item.t);

        gain.gain.setValueAtTime(0, now + item.t);
        gain.gain.linearRampToValueAtTime(0.3, now + item.t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + item.t + item.d);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + item.t);
        osc.stop(now + item.t + item.d + 0.05);
      });
    } catch (_) {}
  }

  /** Crystal Star Pop & Slam (ExpEarn.mp3 + Bounce1.mp3) */
  playStarChime(starIdx = 1) {
    const pitches = [0.92, 1.12, 1.35];
    if (this._playSample('starAward', { volume: 0.9, pitch: pitches[starIdx - 1] || 1.0 })) {
      this._playSample('starBounce', { volume: 0.5 });
      return;
    }

    if (!this.canPlay() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 1046.50];
      const baseFreq = freqs[Math.min(starIdx - 1, freqs.length - 1)] || 784;

      [1, 2, 3.5].forEach((mult, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * mult, now);

        const amp = 0.22 / (i + 1);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(amp, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.46);
      });
    } catch (_) {}
  }

  /** Celebratory Firework Boom & Sparkle Crackle */
  playFireworkBurst() {
    if (!this.canPlay() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.3);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.36);

      for (let s = 0; s < 4; s++) {
        const pOsc = this.ctx.createOscillator();
        const pGain = this.ctx.createGain();
        const tOffset = 0.08 + s * 0.05 + Math.random() * 0.03;
        pOsc.type = 'sine';
        pOsc.frequency.setValueAtTime(800 + Math.random() * 800, now + tOffset);

        pGain.gain.setValueAtTime(0.08, now + tOffset);
        pGain.gain.exponentialRampToValueAtTime(0.001, now + tOffset + 0.06);

        pOsc.connect(pGain);
        pGain.connect(this.sfxGain);
        pOsc.start(now + tOffset);
        pOsc.stop(now + tOffset + 0.07);
      }
    } catch (_) {}
  }

  /** Quick Coin / Score Tally Blip (CountNumber.mp3) */
  playScoreTally() {
    if (this._playSample('scoreTally', { volume: 0.45, pitch: 1.1 + Math.random() * 0.15 })) return;

    if (!this.canPlay() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (_) {}
  }

  /** Defeat Jingle */
  playDefeat() {
    if (!this.canPlay() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const melody = [
        { f: 440, t: 0.0, d: 0.25 },
        { f: 415.3, t: 0.25, d: 0.25 },
        { f: 392, t: 0.5, d: 0.3 },
        { f: 349.23, t: 0.8, d: 0.6 },
      ];

      melody.forEach(item => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(item.f, now + item.t);

        gain.gain.setValueAtTime(0, now + item.t);
        gain.gain.linearRampToValueAtTime(0.18, now + item.t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + item.t + item.d);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + item.t);
        osc.stop(now + item.t + item.d + 0.05);
      });
    } catch (_) {}
  }

  /** Background Music: Tropical soundtrack (/assest/music/music.mp3) */
  startBgm() {
    if (!this.canPlay()) return;

    if (this.bgmAudio) {
      if (this.bgmAudio.paused) {
        this.bgmAudio.play().catch(() => {});
      }
      return;
    }

    if (!this.ctx) return;

    try {
      this.bgmAudio = new Audio(AUDIO_PATHS.bgm);
      this.bgmAudio.loop = true;
      this.bgmAudio.crossOrigin = 'anonymous';

      const source = this.ctx.createMediaElementSource(this.bgmAudio);
      const localGain = this.ctx.createGain();
      localGain.gain.value = 0.35;

      source.connect(localGain);
      localGain.connect(this.bgmGain);

      this.bgmAudio.play().catch(e => {
        console.log('[SoundSynth] BGM deferred:', e);
        this._startProceduralBgm();
      });
    } catch (e) {
      this._startProceduralBgm();
    }
  }

  stopBgm() {
    if (this.bgmAudio) {
      try {
        this.bgmAudio.pause();
        this.bgmAudio.currentTime = 0;
      } catch (_) {}
    }
    this._stopProceduralBgm();
  }

  _startProceduralBgm() {
    if (this.bgmPlaying || !this.canPlay() || !this.ctx) return;
    this.bgmPlaying = true;
    this._scheduleBgmTick();
  }

  _scheduleBgmTick() {
    if (!this.bgmPlaying) return;

    if (this.canPlay() && this.ctx && this.ctx.state === 'running') {
      try {
        const now = this.ctx.currentTime;
        const step = this.bgmStep % 16;
        if (step % 4 === 0) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          const freq = step === 0 ? 82.4 : step === 8 ? 98.0 : 73.4;
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.exponentialRampToValueAtTime(30, now + 0.22);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.connect(gain);
          gain.connect(this.bgmGain);
          osc.start(now);
          osc.stop(now + 0.25);
        }
        if (step % 2 === 1) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1200 + Math.random() * 200, now);
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          osc.connect(gain);
          gain.connect(this.bgmGain);
          osc.start(now);
          osc.stop(now + 0.045);
        }
        this.bgmStep++;
      } catch (_) {}
    }

    this.proceduralBgmTimer = setTimeout(() => this._scheduleBgmTick(), 160);
  }

  _stopProceduralBgm() {
    this.bgmPlaying = false;
    if (this.proceduralBgmTimer) {
      clearTimeout(this.proceduralBgmTimer);
      this.proceduralBgmTimer = null;
    }
  }
}

export const SoundSynth = new SoundSynthManager();
