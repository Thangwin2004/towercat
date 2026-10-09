/**
 * Local Storage & Profile Manager for "Mèo Chiến Đảo"
 */

const STORAGE_KEY = 'blth_game_data_v1';

const DEFAULT_DATA = {
  unlockedLevel: 1,
  totalConquered: 0,
  highScore: 0,
  playerName: 'Thủ Lĩnh',
  avatarId: 1,
  stars: {}, // { [level]: 1..3 }
  bestTimes: {}, // { [level]: seconds }
  coins: 100,
  skills: {
    blitz: { level: 1, max: 3 },
    bastion: { level: 1, max: 3 },
    surge: { level: 1, max: 3 },
  }
};

class StorageManager {
  constructor() {
    this.data = this._load();
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_DATA };
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_DATA, ...parsed };
    } catch (_) {
      return { ...DEFAULT_DATA };
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (_) {}
  }

  getUnlockedLevel() {
    return this.data.unlockedLevel || 1;
  }

  unlockNextLevel(currentLevel) {
    if (currentLevel >= this.data.unlockedLevel && currentLevel < 50) {
      this.data.unlockedLevel = currentLevel + 1;
      this.save();
    }
  }

  recordVictory(level, timeSeconds, starsEarned, score) {
    this.unlockNextLevel(level);

    const oldStars = this.data.stars[level] || 0;
    if (starsEarned > oldStars) {
      this.data.stars[level] = starsEarned;
    }

    const oldBest = this.data.bestTimes[level] || 99999;
    if (timeSeconds < oldBest) {
      this.data.bestTimes[level] = Math.round(timeSeconds);
    }

    this.data.totalConquered += 1;
    this.data.highScore = Math.max(this.data.highScore, score);
    this.data.coins += starsEarned * 50;
    this.save();
  }

  getStars(level) {
    return this.data.stars[level] || 0;
  }

  getTotalStars() {
    return Object.values(this.data.stars).reduce((sum, s) => sum + s, 0);
  }

  upgradeSkill(skillName) {
    const skill = this.data.skills[skillName];
    if (!skill || skill.level >= skill.max) return false;
    const cost = skill.level * 100;
    if (this.data.coins >= cost) {
      this.data.coins -= cost;
      skill.level += 1;
      this.save();
      return true;
    }
    return false;
  }
}

export const Storage = new StorageManager();
