/**
 * Skills Manager (Kỹ Năng Chiến Thuật)
 * Controls cooldowns and activation effects for Blitz, Bastion, and Surge tactics.
 */

import { SoundSynth } from '../core/SoundSynth.js';

export class SkillsManager {
  constructor() {
    this.skills = {
      blitz: {
        id: 'blitz',
        name: 'Bốn Chân Thần Tốc',
        icon: 'lightning',
        cooldown: 18,
        remaining: 0,
        activeDuration: 6,
        activeTimer: 0,
      },
      bastion: {
        id: 'bastion',
        name: 'Khiên Thùng Carton',
        icon: 'shield',
        cooldown: 22,
        remaining: 0,
        activeDuration: 0,
        activeTimer: 0,
      },
      surge: {
        id: 'surge',
        name: 'Gọi Cả Đàn',
        icon: 'surge',
        cooldown: 28,
        remaining: 0,
        activeDuration: 0,
        activeTimer: 0,
      },
    };
  }

  reset() {
    for (const key in this.skills) {
      this.skills[key].remaining = 0;
      this.skills[key].activeTimer = 0;
    }
  }

  update(deltaSeconds, troopManager) {
    // 1. Blitz duration
    if (this.skills.blitz.activeTimer > 0) {
      this.skills.blitz.activeTimer -= deltaSeconds;
      if (this.skills.blitz.activeTimer <= 0) {
        troopManager.setSpeedMultiplier(1.0);
      } else {
        troopManager.setSpeedMultiplier(2.0);
      }
    }

    // 2. Cooldown tickers
    for (const key in this.skills) {
      if (this.skills[key].remaining > 0) {
        this.skills[key].remaining = Math.max(0, this.skills[key].remaining - deltaSeconds);
      }
    }
  }

  canUse(skillId) {
    const s = this.skills[skillId];
    return s && s.remaining <= 0;
  }

  activate(skillId, territories, troopManager) {
    if (!this.canUse(skillId)) return false;

    const s = this.skills[skillId];
    s.remaining = s.cooldown;
    SoundSynth.playSkill(skillId);

    if (skillId === 'blitz') {
      s.activeTimer = s.activeDuration;
      troopManager.setSpeedMultiplier(2.0);
      return true;
    }

    if (skillId === 'bastion') {
      // Find lowest unit player territory or player territory under attack
      const playerBases = territories.filter(t => t.owner === 'player');
      if (playerBases.length === 0) return false;

      playerBases.sort((a, b) => a.units - b.units);
      const target = playerBases[0];
      target.addShield(3);
      return true;
    }

    if (skillId === 'surge') {
      // Add +10 troops to all player bases
      const playerBases = territories.filter(t => t.owner === 'player');
      playerBases.forEach(b => {
        b.units = Math.min(b.maxUnits + 15, b.units + 10);
        b.redraw();
      });
      return true;
    }

    return false;
  }
}
