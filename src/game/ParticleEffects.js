/**
 * ParticleEffects & Tactical Combat VFX for "Mèo Chiến Đảo"
 * Renders high-impact animated visual effects:
 * - Electric Blitz lightning storms & speed streaks
 * - Bastion protective forcefields & shield deflect flashes
 * - Surge troop reinforcement geysers & celebratory fountains
 * - Base conquest shockwaves, starburst confetti, and floating combat banners
 * - Dynamic drag line marching chevrons & tactical reticles
 */

import { Container, Graphics, Text } from 'pixi.js';
import { FACTIONS } from './MapConfig.js';
import { createSvgIcon } from '../ui/SvgIcons.js';

export class ParticleEffects extends Container {
  constructor() {
    super();
    this.particles = [];
    this.shockwaves = [];
    this.lightningBolts = [];
    this.slashFlashes = [];
    this.floatingTexts = [];
    this.dragGfx = new Graphics();
    this.reticleGfx = new Graphics();
    this.gfx = new Graphics();

    // Drag label badge container with SVG swords icon
    this.badgeContainer = new Container();
    this.badgeBg = new Graphics();
    this.badgeIcon = createSvgIcon('swords', 16, 0xffffff);
    this.dragLabel = new Text({
      text: '',
      style: {
        fontFamily: '"Be Vietnam Pro", sans-serif',
        fontSize: 13,
        fontWeight: '900',
        fill: 0xffffff,
        dropShadow: { alpha: 0.8, blur: 3, color: 0x000000, distance: 1.5 },
      }
    });
    this.dragLabel.anchor.set(0, 0.5);

    this.badgeContainer.addChild(this.badgeBg, this.badgeIcon, this.dragLabel);
    this.badgeContainer.visible = false;

    this.addChild(this.dragGfx, this.reticleGfx, this.gfx, this.badgeContainer);
  }

  /**
   * Vibrant clash sparks & combat slash flash
   */
  addClashSparks(x, y, color = 0xfacc15) {
    // 1. Radial Sparks
    for (let i = 0; i < 9; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 110;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2.5 + Math.random() * 2.5,
        color,
        alpha: 1.0,
        decay: 3.5 + Math.random() * 2.0,
      });
    }

    // 2. Sharp 4-point impact star flash
    this.slashFlashes.push({
      x,
      y,
      size: 14 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      color: 0xffffff,
      alpha: 1.0,
      decay: 6.0,
    });
  }

  /**
   * Defensive shield deflect ripple and metallic sparks
   */
  addShieldImpact(x, y) {
    this.shockwaves.push({
      x,
      y,
      radius: 12,
      maxRadius: 48,
      color: 0x38bdf8,
      alpha: 1.0,
      width: 4.0,
    });

    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 80;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2.2 + Math.random() * 2.0,
        color: 0x7dd3fc,
        alpha: 1.0,
        decay: 3.0,
      });
    }

    this.addFloatingText(x, y - 22, '🛡️ ĐỠ ĐÒN!', 0x38bdf8);
  }

  /**
   * Dramatic Base Conquest Ceremony
   */
  addCaptureShockwave(x, y, factionId) {
    const faction = FACTIONS[factionId] || FACTIONS.player;
    const isPlayer = factionId === 'player';

    // 1. Dual expanding shockwaves
    this.shockwaves.push({
      x,
      y,
      radius: 16,
      maxRadius: 95,
      color: faction.lightColorHex || 0x38bdf8,
      alpha: 1.0,
      width: 5.0,
    });
    this.shockwaves.push({
      x,
      y,
      radius: 10,
      maxRadius: 72,
      color: 0xffffff,
      alpha: 0.9,
      width: 3.0,
    });

    // 2. 28 radial confetti & sparkling stars shooting out in 360 degrees
    const colors = [faction.lightColorHex, 0xfacc15, 0xffffff, faction.colorHex];
    for (let i = 0; i < 28; i++) {
      const angle = (Math.PI * 2 * i) / 28 + (Math.random() * 0.2 - 0.1);
      const speed = 100 + Math.random() * 150;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        gravity: 60,
        radius: 3 + Math.random() * 3.5,
        color: colors[i % colors.length],
        alpha: 1.0,
        decay: 1.5 + Math.random() * 0.7,
      });
    }

    // 3. Floating conquest banner text
    const label = isPlayer ? '🏆 CHIẾM ĐẢO!' : '💥 BỊ CƯỚP ĐẢO!';
    const textColor = isPlayer ? 0xfde047 : 0xf87171;
    this.addFloatingText(x, y - 32, label, textColor);
  }

  /**
   * Blitz Skill Activation (Thần Tốc X2)
   */
  triggerBlitzVFX(playerBases) {
    // 1. Central screen announcement
    this.addFloatingText(400, 240, '⚡ THẦN TỐC X2 TỐC ĐỘ!', 0xfde047);

    // 2. Expanding golden shockwaves on all player bases
    for (const b of playerBases) {
      this.shockwaves.push({
        x: b.x,
        y: b.y,
        radius: 15,
        maxRadius: 75,
        color: 0xfacc15,
        alpha: 1.0,
        width: 4.5,
      });

      // Lightning crackles
      for (let i = 0; i < 3; i++) {
        this._createLightningBolt(b.x, b.y, b.x + (Math.random() * 90 - 45), b.y - 50 - Math.random() * 40, 0xfde047);
      }

      // Sparkles
      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 80 + Math.random() * 90;
        this.particles.push({
          x: b.x,
          y: b.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 2.5 + Math.random() * 2.5,
          color: 0xfef08a,
          alpha: 1.0,
          decay: 2.2,
        });
      }
    }
  }

  /**
   * Bastion Skill Activation (Khiên Thùng Carton +3)
   */
  triggerBastionVFX(targetBase) {
    if (!targetBase) return;

    // 1. Floating text
    this.addFloatingText(targetBase.x, targetBase.y - 35, '🛡️ KHIÊN THÙNG CARTON +3!', 0x38bdf8);

    // 2. Dual expanding cyan forcefield ripples
    this.shockwaves.push({
      x: targetBase.x,
      y: targetBase.y,
      radius: 20,
      maxRadius: 90,
      color: 0x38bdf8,
      alpha: 1.0,
      width: 5.5,
    });
    this.shockwaves.push({
      x: targetBase.x,
      y: targetBase.y,
      radius: 15,
      maxRadius: 65,
      color: 0xffffff,
      alpha: 0.9,
      width: 3.0,
    });

    // 3. Ring of 20 protective cyan star particles
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      const speed = 75 + Math.random() * 85;
      this.particles.push({
        x: targetBase.x,
        y: targetBase.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3.2,
        color: i % 2 === 0 ? 0x06b6d4 : 0xffffff,
        alpha: 1.0,
        decay: 1.8,
      });
    }
  }

  /**
   * Surge Skill Activation (Gọi Cả Đàn +10 Quân)
   */
  triggerSurgeVFX(playerBases) {
    // Central banner
    this.addFloatingText(400, 240, '🐾 GỌI CẢ ĐÀN +10 QUÂN!', 0xf59e0b);

    for (const b of playerBases) {
      // Floating text on each base
      this.addFloatingText(b.x, b.y - 30, '+10 🐾', 0x4ade80);

      // Erupting geyser of golden stars
      for (let i = 0; i < 14; i++) {
        const angle = -Math.PI / 2 + (Math.random() * 1.2 - 0.6); // upward fountain
        const speed = 110 + Math.random() * 120;
        this.particles.push({
          x: b.x + (Math.random() * 20 - 10),
          y: b.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          gravity: 140,
          radius: 3.5 + Math.random() * 2.5,
          color: i % 2 === 0 ? 0xfbbf24 : 0x4ade80,
          alpha: 1.0,
          decay: 1.4,
        });
      }

      this.shockwaves.push({
        x: b.x,
        y: b.y,
        radius: 12,
        maxRadius: 65,
        color: 0x4ade80,
        alpha: 0.9,
        width: 3.5,
      });
    }
  }

  _createLightningBolt(x1, y1, x2, y2, color = 0xfde047) {
    const points = [[x1, y1]];
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(3, Math.floor(dist / 18));
    const dirX = (x2 - x1) / steps;
    const dirY = (y2 - y1) / steps;
    const perpX = -dirY;
    const perpY = dirX;

    for (let s = 1; s < steps; s++) {
      const jag = (Math.random() - 0.5) * 22;
      points.push([
        x1 + dirX * s + perpX * jag,
        y1 + dirY * s + perpY * jag
      ]);
    }
    points.push([x2, y2]);

    this.lightningBolts.push({
      points,
      color,
      alpha: 1.0,
      width: 2.8,
      decay: 4.5,
    });
  }

  addFloatingText(x, y, textStr, color = 0xffffff) {
    const txt = new Text({
      text: textStr,
      style: {
        fontFamily: '"Be Vietnam Pro", sans-serif',
        fontSize: 16,
        fontWeight: '900',
        fill: color,
        stroke: { width: 3.5, color: 0x0f172a },
        dropShadow: { alpha: 0.8, blur: 4, color: 0x000000, distance: 2 },
      }
    });
    txt.anchor.set(0.5);
    txt.x = x;
    txt.y = y;
    txt.scale.set(0.6);

    this.addChild(txt);
    this.floatingTexts.push({
      display: txt,
      vy: -50,
      alpha: 1.0,
      scale: 0.6,
      timer: 0,
    });
  }

  addVictoryConfetti(centerX, centerY) {
    const colors = [0x38bdf8, 0xfacc15, 0xef4444, 0x10b981, 0xec4899, 0xa855f7, 0xffffff];
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 140 + Math.random() * 320;
      this.particles.push({
        x: centerX + (Math.random() * 200 - 100),
        y: centerY + (Math.random() * 80 - 40),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 160,
        gravity: 280,
        radius: 3 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        decay: 0.7 + Math.random() * 0.5,
      });
    }
  }

  /**
   * Grand In-Game Victory Climax Celebration
   * Erupts fireworks across all player islands, shockwaves across the sea, and golden banners
   */
  triggerGrandVictoryCelebration(playerBases, mapCenter) {
    const cx = mapCenter?.x || 400;
    const cy = mapCenter?.y || 300;

    // 1. Grand Golden Floating Title
    this.addFloatingText(cx, cy - 50, '🏆 TOÀN THẮNG!', 0xfacc15);

    // 2. Double Oceanic Shockwaves across the entire archipelago
    this.shockwaves.push({
      x: cx,
      y: cy,
      radius: 30,
      maxRadius: 360,
      color: 0xfacc15,
      alpha: 1.0,
      width: 6.0,
    });
    this.shockwaves.push({
      x: cx,
      y: cy,
      radius: 10,
      maxRadius: 280,
      color: 0xffffff,
      alpha: 0.9,
      width: 4.0,
    });

    // 3. Erupting Firework Geysers & Star Fountains from every captured island
    const colors = [0xfacc15, 0x38bdf8, 0x4ade80, 0xf43f5e, 0xa855f7, 0xffffff];
    for (const b of (playerBases || [])) {
      this.addFloatingText(b.x, b.y - 28, '⭐ CHIẾM TRỌN!', 0x4ade80);

      // Radial firework starburst
      for (let i = 0; i < 24; i++) {
        const angle = (Math.PI * 2 * i) / 24;
        const speed = 90 + Math.random() * 120;
        this.particles.push({
          x: b.x,
          y: b.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 60,
          gravity: 120,
          radius: 3.5 + Math.random() * 2.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1.0,
          decay: 1.1 + Math.random() * 0.4,
        });
      }

      // Flash impact star
      this.slashFlashes.push({
        x: b.x,
        y: b.y,
        size: 32,
        rot: Math.random() * Math.PI,
        color: 0xfffbeb,
        alpha: 1.0,
        decay: 3.5,
      });
    }

    // 4. Heavy Confetti Shower from the upper sky across the entire screen
    for (let i = 0; i < 110; i++) {
      const rx = cx + (Math.random() * 560 - 280);
      const ry = cy - 200 + (Math.random() * 100);
      const angle = -Math.PI / 2 + (Math.random() * 2 - 1);
      const speed = 100 + Math.random() * 260;
      this.particles.push({
        x: rx,
        y: ry,
        vx: Math.cos(angle) * speed * 0.6,
        vy: Math.sin(angle) * speed - 120,
        gravity: 240,
        radius: 3 + Math.random() * 3.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        decay: 0.65 + Math.random() * 0.4,
      });
    }
  }

  /**
   * Spawns an individual celebratory firework burst at specific coordinates
   */
  spawnFireworkAt(x, y, color = 0xfacc15) {
    this.slashFlashes.push({
      x,
      y,
      size: 28,
      rot: Math.random() * Math.PI,
      color: 0xffffff,
      alpha: 1.0,
      decay: 4.5,
    });

    this.shockwaves.push({
      x,
      y,
      radius: 8,
      maxRadius: 75,
      color,
      alpha: 0.95,
      width: 3.5,
    });

    const palette = [color, 0xffffff, 0xfde047];
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      const speed = 80 + Math.random() * 110;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 80,
        radius: 3 + Math.random() * 2,
        color: palette[Math.floor(Math.random() * palette.length)],
        alpha: 1.0,
        decay: 1.3,
      });
    }
  }

  /**
   * Render interactive tactical drag line with animated marching chevrons & target lock brackets
   */
  renderDragLine(fromBase, targetX, targetY, targetBase = null, sendPercentage = 0.5, isValidRoute = true) {
    this.dragGfx.clear();
    this.reticleGfx.clear();

    if (!fromBase) {
      this.badgeContainer.visible = false;
      return;
    }

    const startX = fromBase.x;
    const startY = fromBase.y;
    const endX = targetBase ? targetBase.x : targetX;
    const endY = targetBase ? targetBase.y : targetY;

    const dx = endX - startX;
    const dy = endY - startY;
    const dist = Math.hypot(dx, dy);
    if (dist < 12) {
      this.badgeContainer.visible = false;
      return;
    }

    const dirX = dx / dist;
    const dirY = dy / dist;
    const perpX = -dirY;
    const perpY = dirX;

    const isEnemyTarget = targetBase && targetBase.owner !== 'player';
    const isFriendlyTarget = targetBase && targetBase.owner === 'player';
    
    // If target territory is selected but not connected by road/sea route:
    const isBlocked = targetBase && !isValidRoute;
    const lineColor = isBlocked ? 0xef4444 : (isEnemyTarget ? 0xf87171 : (isFriendlyTarget ? 0x60a5fa : 0x38bdf8));

    // 1. Under-glow shadow line
    this.dragGfx.moveTo(startX, startY + 2);
    this.dragGfx.lineTo(endX, endY + 2);
    this.dragGfx.stroke({ width: 7, color: 0x000000, alpha: 0.4 });

    if (isBlocked) {
      // Red dashed warning barrier line
      const dashLen = 8;
      const gapLen = 6;
      let curDist = 0;
      let draw = true;
      while (curDist < dist) {
        const step = draw ? dashLen : gapLen;
        const nextDist = Math.min(dist, curDist + step);
        if (draw) {
          this.dragGfx
            .moveTo(startX + dirX * curDist, startY + dirY * curDist)
            .lineTo(startX + dirX * nextDist, startY + dirY * nextDist)
            .stroke({ width: 4.5, color: 0xef4444, alpha: 0.9 });
        }
        curDist = nextDist;
        draw = !draw;
      }
    } else {
      // 2. Main tactical energy beam
      this.dragGfx.moveTo(startX, startY);
      this.dragGfx.lineTo(endX, endY);
      this.dragGfx.stroke({ width: 5.5, color: lineColor, alpha: 0.92 });

      // 3. Animated marching chevron arrows (>>>)
      const timeOffset = (Date.now() * 0.05) % 24;
      const step = 26;
      for (let d = 26 + timeOffset; d < dist - 26; d += step) {
        const px = startX + dirX * d;
        const py = startY + dirY * d;

        // Draw little arrowhead chevron (>)
        const armLen = 5.5;
        const c1x = px - dirX * armLen + perpX * 4;
        const c1y = py - dirY * armLen + perpY * 4;
        const c2x = px - dirX * armLen - perpX * 4;
        const c2y = py - dirY * armLen - perpY * 4;

        this.dragGfx.moveTo(c1x, c1y).lineTo(px, py).lineTo(c2x, c2y);
        this.dragGfx.stroke({ width: 2.2, color: 0xffffff, alpha: 0.95 });
      }
    }

    // 4. Target base lock brackets [ ] or Blocked Symbol
    if (targetBase) {
      const br = targetBase.radius + 8;
      const bColor = isBlocked ? 0xef4444 : (isEnemyTarget ? 0xef4444 : 0x38bdf8);
      const bracketLen = 14;

      // Brackets
      this.reticleGfx.moveTo(endX - br, endY - br + bracketLen)
        .lineTo(endX - br, endY - br)
        .lineTo(endX - br + bracketLen, endY - br);

      this.reticleGfx.moveTo(endX + br - bracketLen, endY - br)
        .lineTo(endX + br, endY - br)
        .lineTo(endX + br, endY - br + bracketLen);

      this.reticleGfx.moveTo(endX + br, endY + br - bracketLen)
        .lineTo(endX + br, endY + br)
        .lineTo(endX + br - bracketLen, endY + br);

      this.reticleGfx.moveTo(endX - br + bracketLen, endY + br)
        .lineTo(endX - br, endY + br)
        .lineTo(endX - br, endY + br - bracketLen);

      this.reticleGfx.stroke({ width: 3.5, color: bColor, alpha: 0.95 });

      if (isBlocked) {
        // Red Forbidden Circle-Slash icon over target center
        const crossR = 12;
        this.reticleGfx
          .circle(endX, endY, crossR)
          .stroke({ width: 3, color: 0xef4444, alpha: 0.95 })
          .moveTo(endX - crossR * 0.7, endY - crossR * 0.7)
          .lineTo(endX + crossR * 0.7, endY + crossR * 0.7)
          .stroke({ width: 3, color: 0xef4444, alpha: 0.95 });
      }
    } else {
      // Simple pointer tip arrow
      const tipX = endX;
      const tipY = endY;
      const arrowLen = 15;
      const c1x = tipX - dirX * arrowLen + perpX * 8;
      const c1y = tipY - dirY * arrowLen + perpY * 8;
      const c2x = tipX - dirX * arrowLen - perpX * 8;
      const c2y = tipY - dirY * arrowLen - perpY * 8;

      this.dragGfx.poly([tipX, tipY, c1x, c1y, c2x, c2y])
        .fill({ color: lineColor })
        .stroke({ width: 2, color: 0xffffff });
    }

    // 5. Floating dispatch troop capsule badge with SVG icon
    if (isBlocked) {
      this.dragLabel.text = 'CHƯA CÓ ĐƯỜNG';
    } else {
      const sendCount = sendPercentage >= 0.99
        ? Math.max(1, fromBase.units - 1)
        : Math.max(1, Math.floor(fromBase.units * 0.5));
      this.dragLabel.text = `${sendCount} (${Math.round(sendPercentage * 100)}%)`;
    }

    const iconSize = 16;
    const gap = 6;
    const contentW = iconSize + gap + this.dragLabel.width;
    const labelW = contentW + 20;
    const labelH = 28;

    this.badgeBg.clear();
    this.badgeBg
      .roundRect(-labelW / 2, -labelH / 2 + 2, labelW, labelH, labelH / 2)
      .fill({ color: 0x000000, alpha: 0.4 })
      .roundRect(-labelW / 2, -labelH / 2, labelW, labelH, labelH / 2)
      .fill({ color: isBlocked ? 0x450a0a : 0x0f172a, alpha: 0.95 })
      .stroke({ width: 2, color: lineColor });

    const startContentX = -contentW / 2;
    this.badgeIcon.x = startContentX + iconSize / 2;
    this.badgeIcon.y = 0;
    this.dragLabel.x = startContentX + iconSize + gap;
    this.dragLabel.y = 0;

    this.badgeContainer.x = (startX + endX) * 0.5;
    this.badgeContainer.y = (startY + endY) * 0.5 - 20;
    this.badgeContainer.visible = true;
  }

  addBlockedFeedback(x, y) {
    this.addFloatingText(x, y - 25, 'CHƯA NỐI ĐƯỜNG!', 0xef4444);
    this.shockwaves.push({
      x,
      y,
      radius: 12,
      maxRadius: 42,
      color: 0xef4444,
      alpha: 1.0,
      width: 3.5,
    });
  }

  clearDragLine() {
    this.dragGfx.clear();
    this.reticleGfx.clear();
    this.badgeContainer.visible = false;
  }

  update(deltaSeconds) {
    this.gfx.clear();

    // 1. Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += (sw.maxRadius - sw.radius) * 7.5 * deltaSeconds;
      sw.alpha -= deltaSeconds * 1.8;

      if (sw.alpha <= 0.04 || sw.radius >= sw.maxRadius - 2) {
        this.shockwaves.splice(i, 1);
      } else {
        this.gfx.circle(sw.x, sw.y, sw.radius).stroke({
          width: sw.width * sw.alpha,
          color: sw.color,
          alpha: sw.alpha,
        });
      }
    }

    // 2. Lightning Bolts (Blitz VFX)
    for (let i = this.lightningBolts.length - 1; i >= 0; i--) {
      const lb = this.lightningBolts[i];
      lb.alpha -= deltaSeconds * lb.decay;
      if (lb.alpha <= 0.04) {
        this.lightningBolts.splice(i, 1);
      } else {
        for (let j = 0; j < lb.points.length - 1; j++) {
          const p1 = lb.points[j];
          const p2 = lb.points[j + 1];
          this.gfx.moveTo(p1[0], p1[1]).lineTo(p2[0], p2[1])
            .stroke({ width: lb.width * lb.alpha, color: lb.color, alpha: lb.alpha });
        }
      }
    }

    // 3. Slash & Star Impact Flashes
    for (let i = this.slashFlashes.length - 1; i >= 0; i--) {
      const sf = this.slashFlashes[i];
      sf.alpha -= deltaSeconds * sf.decay;
      if (sf.alpha <= 0.04) {
        this.slashFlashes.splice(i, 1);
      } else {
        const s = sf.size * sf.alpha;
        this.gfx.star(sf.x, sf.y, 4, s, s * 0.28, sf.rot).fill({
          color: sf.color,
          alpha: sf.alpha,
        });
      }
    }

    // 4. Particles (Confetti, Sparks, Geysers)
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * deltaSeconds;
      p.y += p.vy * deltaSeconds;
      if (p.gravity) {
        p.vy += p.gravity * deltaSeconds;
      }
      p.alpha -= deltaSeconds * p.decay;

      if (p.alpha <= 0.04) {
        this.particles.splice(i, 1);
      } else {
        this.gfx.circle(p.x, p.y, p.radius * p.alpha).fill({
          color: p.color,
          alpha: p.alpha,
        });
      }
    }

    // 5. Floating Combat Text
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.timer += deltaSeconds;
      ft.display.y += ft.vy * deltaSeconds;

      // Elastic pop animation
      if (ft.timer < 0.2) {
        ft.scale = 0.6 + (ft.timer / 0.2) * 0.6; // Scale up to 1.2
      } else if (ft.timer < 0.35) {
        ft.scale = 1.2 - ((ft.timer - 0.2) / 0.15) * 0.2; // Settle to 1.0
      }
      ft.display.scale.set(ft.scale);

      if (ft.timer > 0.6) {
        ft.alpha -= deltaSeconds * 2.5;
        ft.display.alpha = Math.max(0, ft.alpha);
      }

      if (ft.alpha <= 0.05 || ft.timer > 1.2) {
        this.removeChild(ft.display);
        ft.display.destroy();
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  clear() {
    this.particles = [];
    this.shockwaves = [];
    this.lightningBolts = [];
    this.slashFlashes = [];
    for (const ft of this.floatingTexts) {
      this.removeChild(ft.display);
      ft.display.destroy();
    }
    this.floatingTexts = [];
    this.gfx.clear();
    this.clearDragLine();
  }
}
