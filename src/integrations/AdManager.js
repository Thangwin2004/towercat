/**
 * Mock AdManager bridge conforming strictly to ad-system skill.
 * Provides safe mocks and standard hooks for:
 * - Rewarded Ads (Double rewards, extra troops, revives)
 * - Interstitial Ads (Between levels / back to menu)
 * - Banner Ads
 */

class AdManagerClass {
  constructor() {
    this.isShowingAd = false;
    this.hasRewardedAvailable = true;
    this.hasInterstitialAvailable = true;
    this.bannerVisible = false;
  }

  /**
   * Show a Rewarded Video Ad
   * @param {Object} options
   * @param {string} options.placement 'double_reward' | 'revive' | 'bonus_troops'
   * @returns {Promise<{ success: boolean, rewarded: boolean }>}
   */
  async showRewarded({ placement = 'default' } = {}) {
    if (this.isShowingAd) {
      return { success: false, rewarded: false };
    }

    this.isShowingAd = true;
    console.log(`[AdManager] Playing Rewarded Ad for placement: ${placement}`);

    // If host platform has ads SDK (e.g. Wink SDK ads or Google AdSense)
    if (typeof window !== 'undefined' && window.WinkAds?.showRewarded) {
      try {
        const res = await window.WinkAds.showRewarded({ placement });
        this.isShowingAd = false;
        return { success: true, rewarded: Boolean(res?.rewarded) };
      } catch (err) {
        console.warn('[AdManager] Host Rewarded Ad error, fallback:', err);
      }
    }

    // Safe simulated mock ad with UI modal / timer (1.2s simulated)
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); z-index: 99999;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        color: white; font-family: 'Be Vietnam Pro', sans-serif;
      `;
      overlay.innerHTML = `
        <div style="font-size: 32px; margin-bottom: 12px;">📺</div>
        <div style="font-size: 18px; font-weight: 800; margin-bottom: 8px;">ĐANG TẢI QUẢNG CÁO PHẦN THƯỞNG...</div>
        <div style="font-size: 13px; color: #94a3b8;">Nhận phần thưởng ngay sau thông điệp này</div>
      `;
      document.body.appendChild(overlay);

      setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        this.isShowingAd = false;
        resolve({ success: true, rewarded: true });
      }, 1200);
    });
  }

  /**
   * Show an Interstitial Ad (Between campaign levels)
   * @param {Object} options
   * @returns {Promise<{ success: boolean }>}
   */
  async showInterstitial({ placement = 'level_end' } = {}) {
    if (this.isShowingAd) return { success: false };
    this.isShowingAd = true;
    console.log(`[AdManager] Playing Interstitial Ad for placement: ${placement}`);

    if (typeof window !== 'undefined' && window.WinkAds?.showInterstitial) {
      try {
        await window.WinkAds.showInterstitial({ placement });
        this.isShowingAd = false;
        return { success: true };
      } catch (_) {}
    }

    // Quick simulated interstitial
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isShowingAd = false;
        resolve({ success: true });
      }, 500);
    });
  }

  showBanner() {
    this.bannerVisible = true;
  }

  hideBanner() {
    this.bannerVisible = false;
  }
}

export const AdManager = new AdManagerClass();
