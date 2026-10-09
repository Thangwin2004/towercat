/**
 * TroopSwarm Manager
 * Controls active marching units across the map with procedural vector graphics,
 * stream formation, speed modifiers, and mid-field intercept combat.
 * Fully scalable vector graphics that never blur or pixelate.
 */

import { Container, Graphics } from 'pixi.js';
import { FACTIONS } from './MapConfig.js';
import { SoundSynth } from '../core/SoundSynth.js';
import { drawAnimalHead } from './AnimalArt.js';

export class TroopUnit {
  constructor({ id, faction, startX, startY, targetBase, speed = 130, delay = 0, routeType = 'land' }) {
    this.id = id;
    this.faction = faction;
    this.targetBase = targetBase;
    this.speed = speed;
    this.delay = delay; // Staggered stream launch
    this.routeType = routeType; // 'land' | 'mountain' | 'sea'
    this.active = false;
    this.finished = false;

    this.startX = startX;
    this.startY = startY;
    this.targetX = targetBase.x;
    this.targetY = targetBase.y;

    const dx = this.targetX - this.startX;
    const dy = this.targetY - this.startY;
    this.totalDistance = Math.hypot(dx, dy);
    this.dirX = dx / (this.totalDistance || 1);
    this.dirY = dy / (this.totalDistance || 1);

    this.currentDist = 0;
    this.x = startX;
    this.y = startY;
    this.wobble = Math.random() * Math.PI * 2;
    this.stepTimer = 0;
  }

  update(deltaSeconds, speedMultiplier = 1.0) {
    if (this.finished) return;

    if (this.delay > 0) {
      this.delay -= deltaSeconds;
      if (this.delay <= 0) {
        this.active = true;
      } else {
        return;
      }
    } else {
      this.active = true;
    }

    const effectiveSpeed = this.speed * speedMultiplier;
    this.currentDist += effectiveSpeed * deltaSeconds;
    this.wobble += deltaSeconds * 14;
    this.stepTimer += deltaSeconds;

    // Wobble perpendicular to direction for natural marching/sailing gait
    const perpX = -this.dirY;
    const perpY = this.dirX;
    const offset = Math.sin(this.wobble) * (this.routeType === 'sea' ? 1.4 : 2.2);

    this.x = this.startX + this.dirX * this.currentDist + perpX * offset;
    this.y = this.startY + this.dirY * this.currentDist + perpY * offset;

    // Check arrival at target base perimeter (stop outside gate)
    const targetDistLeft = this.totalDistance - this.currentDist;
    const stopPad = Math.max(26, (this.targetBase.radius || 30) * 0.95);
    if (targetDistLeft <= stopPad) {
      this.finished = true;
      this.active = false;
    }
  }
}

export class TroopManager extends Container {
  constructor() {
    super();
    this.troops = [];
    this.dustPuffs = [];
    this.renderGfx = new Graphics();
    this.dustGfx = new Graphics();

    this.addChild(this.dustGfx, this.renderGfx);
    this.speedMultiplier = 1.0;
  }

  setSpeedMultiplier(mult = 1.0) {
    this.speedMultiplier = mult;
  }

  /**
   * Dispatch a wave of troops from source to target along a specific route
   */
  spawnWave(sourceBase, targetBase, count, route = null, speed = 135) {
    if (count <= 0) return;
    const staggerInterval = 0.07;
    const routeType = route ? route.type : 'land';

    const dx = targetBase.x - sourceBase.x;
    const dy = targetBase.y - sourceBase.y;
    const dist = Math.hypot(dx, dy) || 1;
    const startPad = Math.min(dist * 0.35, Math.max(30, (sourceBase.radius || 30) * 1.05));
    const startX = sourceBase.x + (dx / dist) * startPad;
    const startY = sourceBase.y + (dy / dist) * startPad;

    for (let i = 0; i < count; i++) {
      const unit = new TroopUnit({
        id: `${sourceBase.id}->${targetBase.id}-${Date.now()}-${i}`,
        faction: sourceBase.owner,
        startX,
        startY,
        targetBase: targetBase,
        speed: speed,
        delay: i * staggerInterval,
        routeType,
      });
      this.troops.push(unit);
    }

    SoundSynth.playDispatch();
  }

  /**
   * Update all units, handle collisions and arrivals
   */
  update(deltaSeconds, onArrivalCallback, onInterceptCallback) {
    const activeUnits = [];

    // 1. Move units
    for (let i = 0; i < this.troops.length; i++) {
      const u = this.troops[i];
      u.update(deltaSeconds, this.speedMultiplier);

      if (u.finished) {
        // Arrived at destination base
        const res = u.targetBase.receiveTroop(u.faction);
        if (!res.sameOwner && !res.captured) {
          SoundSynth.playClash();
        }
        if (onArrivalCallback) {
          onArrivalCallback(u, res);
        }
      } else {
        activeUnits.push(u);

        // Spawn dust puff (on land) or water splash (on sea)
        if (u.active && Math.random() < 0.12) {
          this.dustPuffs.push({
            x: u.x - u.dirX * 5 + (Math.random() * 4 - 2),
            y: u.y - u.dirY * 5 + 3,
            radius: 2 + Math.random() * 2,
            alpha: 0.45,
            isWater: u.routeType === 'sea',
          });
        }
      }
    }

    // 2. Mid-air Interceptions (Opposing troops crashing in the open field)
    for (let i = 0; i < activeUnits.length; i++) {
      const u1 = activeUnits[i];
      if (!u1.active || u1.finished) continue;

      for (let j = i + 1; j < activeUnits.length; j++) {
        const u2 = activeUnits[j];
        if (!u2.active || u2.finished) continue;

        // Must be opposing factions
        if (u1.faction !== u2.faction) {
          const dx = u1.x - u2.x;
          const dy = u1.y - u2.y;
          if (dx * dx + dy * dy < 160) {
            u1.finished = true;
            u2.finished = true;
            u1.active = false;
            u2.active = false;
            SoundSynth.playClash();
            if (onInterceptCallback) {
              onInterceptCallback((u1.x + u2.x) * 0.5, (u1.y + u2.y) * 0.5);
            }
            break;
          }
        }
      }
    }

    this.troops = activeUnits.filter(u => !u.finished);

    // 3. Update dust/water puffs
    for (let i = this.dustPuffs.length - 1; i >= 0; i--) {
      const d = this.dustPuffs[i];
      d.alpha -= deltaSeconds * 2.2;
      d.radius += deltaSeconds * 4.0;
      if (d.alpha <= 0.02) {
        this.dustPuffs.splice(i, 1);
      }
    }

    // 4. Render graphics
    this._renderDust();
    this._renderTroops();
  }

  _renderDust() {
    this.dustGfx.clear();
    for (const d of this.dustPuffs) {
      const color = d.isWater ? 0x7dd3fc : 0x94a3b8;
      this.dustGfx
        .circle(d.x, d.y, d.radius)
        .fill({ color, alpha: d.alpha });
    }
  }

  _renderTroops() {
    this.renderGfx.clear();

    for (let i = 0; i < this.troops.length; i++) {
      const u = this.troops[i];
      if (!u.active) continue;

      const faction = FACTIONS[u.faction] || FACTIONS.neutral;
      const perpX = -u.dirY;
      const perpY = u.dirX;

      if (u.routeType === 'sea') {
        // --- NAVAL EXPEDITION BOAT (Thuyền chiến vượt biển) ---
        // Water wake trail behind boat
        const wakeL = 9;
        this.renderGfx
          .moveTo(u.x, u.y)
          .lineTo(u.x - u.dirX * wakeL + perpX * 4.5, u.y - u.dirY * wakeL + perpY * 4.5)
          .stroke({ width: 1.5, color: 0xffffff, alpha: 0.5 })
          .moveTo(u.x, u.y)
          .lineTo(u.x - u.dirX * wakeL - perpX * 4.5, u.y - u.dirY * wakeL - perpY * 4.5)
          .stroke({ width: 1.5, color: 0xffffff, alpha: 0.5 });

        // Boat Hull (Canoe pointed in direction)
        const bowX = u.x + u.dirX * 8;
        const bowY = u.y + u.dirY * 8;
        const sternL_X = u.x - u.dirX * 6 + perpX * 4;
        const sternL_Y = u.y - u.dirY * 6 + perpY * 4;
        const sternR_X = u.x - u.dirX * 6 - perpX * 4;
        const sternR_Y = u.y - u.dirY * 6 - perpY * 4;

        this.renderGfx
          .poly([bowX, bowY, sternL_X, sternL_Y, sternR_X, sternR_Y])
          .fill({ color: 0x78350f })
          .stroke({ width: 1.5, color: 0xfef08a });

        // Triangular War Sail in Faction Color
        this.renderGfx
          .poly([
            u.x - u.dirX * 1, u.y - u.dirY * 1,
            u.x - u.dirX * 7 + perpX * 5.5, u.y - u.dirY * 7 + perpY * 5.5,
            u.x - u.dirX * 6, u.y - u.dirY * 6
          ])
          .fill({ color: faction.troopColor || faction.colorHex })
          .stroke({ width: 1, color: 0xffffff });

        // Animal captain riding the boat
        drawAnimalHead(this.renderGfx, u.x + u.dirX * 1.5, u.y + u.dirY * 1.5 - 2, 4.6,
          faction.species || 'cat', faction.troopColor || faction.colorHex, faction.lightColorHex, u.dirX,
          { detail: false, outlineW: 1.1 });

      } else {
        // --- OVERLAND & MOUNTAIN ANIMAL WARRIOR ---
        const hop = Math.abs(Math.sin(u.wobble * 0.5)) * 2.2; // bouncy little hop
        this.renderGfx
          .ellipse(u.x, u.y + 6, 6.5 - hop * 0.6, 2.8)
          .fill({ color: 0x000000, alpha: 0.3 });

        drawAnimalHead(this.renderGfx, u.x, u.y - hop, 7,
          faction.species || 'cat', faction.troopColor || faction.colorHex, faction.lightColorHex, u.dirX,
          { detail: true, outlineW: 1.6 });
      }
    }
  }

  clear() {
    this.troops = [];
    this.dustPuffs = [];
    this.renderGfx.clear();
    this.dustGfx.clear();
  }
}
