/**
 * Wink Game SDK Adapter for "Mèo Chiến Đảo"
 * Connects game lifecycle, leaderboard, and score reporting to winkgames.fun
 * Includes strict preloading guards to prevent premature audio autoplay.
 */

class WinkAdapterClass {
  constructor() {
    this.sdk = null;
    this.isReady = false;
    this.initPromise = this._init();
  }

  async _init() {
    if (typeof window === 'undefined') return null;

    // Check if Wink SDK is present on window
    if (window.Wink) {
      try {
        this.sdk = await window.Wink.init();
        this.isReady = true;
        console.log('[WinkAdapter] Initialized Wink SDK successfully');
        return this.sdk;
      } catch (e) {
        console.warn('[WinkAdapter] Wink SDK init failed:', e);
      }
    }
    return null;
  }

  bindLifecycle(handlers = {}) {
    const stops = [];

    void this.initPromise.then((sdk) => {
      if (!sdk?.on) return;

      const register = (event, listener) => {
        if (!listener) return;
        const off = sdk.on(event, listener);
        if (typeof off === 'function') stops.push(off);
      };

      register('pause', handlers.onPause);
      register('resume', handlers.onResume);
      register('mute', handlers.onMute);
      register('unmute', handlers.onUnmute);
      register('locale', handlers.onLocale);

      if (sdk.muted) handlers.onMute?.();
      // NOTE: Never call handlers.onResume() during init to prevent premature audio autoplay when preloading in iframe!
    });

    return () => {
      for (const stop of stops) stop();
    };
  }

  async submitScore(score) {
    await this.initPromise;
    if (this.sdk?.submitScore) {
      try {
        await this.sdk.submitScore({ score: Math.round(score) });
        console.log('[WinkAdapter] Score submitted to Wink:', score);
      } catch (e) {
        console.warn('[WinkAdapter] Error submitting score:', e);
      }
    }
  }

  async getLeaderboard() {
    await this.initPromise;
    if (this.sdk?.getLeaderboard) {
      try {
        const res = await this.sdk.getLeaderboard();
        if (res?.entries) {
          return res.entries.map((e, idx) => ({
            name: e.player?.name || `Mèo Tướng #${idx + 1}`,
            score: e.score || 0,
            rank: e.rank || idx + 1,
          }));
        }
      } catch (e) {
        console.warn('[WinkAdapter] Error fetching leaderboard from Wink:', e);
      }
    }
    return null;
  }
}

export const WinkAdapter = new WinkAdapterClass();
