/**
 * Game Icons for "Mèo Chiến Đảo" — procedural PixiJS v8 Graphics (no SVG parsing).
 *
 * Two consistent styles:
 *  - GLYPH icons (paw, pause, play, home, replay, arrows, close, skills...):
 *    chunky white rounded glyph + soft drop shadow. Designed to sit on colored 3D buttons.
 *  - BADGE icons (star, trophy, crown, medal, lock, timer, fish coin, flag, sad cat):
 *    flat colorful shapes with a darker outline. Readable on cream cards & pills.
 *
 * API is unchanged: createSvgIcon(key, size, tintColor) -> Graphics centred at (0,0).
 * All artwork is authored in a 24x24 box.
 */

import { Graphics } from 'pixi.js';
import { arcPath } from '../utils/gfx.js';
import { drawAnimalHead } from '../game/AnimalArt.js';

const SHADOW = 0x0f172a;
const ROUND = { cap: 'round', join: 'round' };

// ---------------------------------------------------------------------------
// GLYPHS: draw(g, ox, oy, color, alpha, detail)
// ---------------------------------------------------------------------------
const GLYPHS = {
  paw(g, ox, oy, c, a) {
    g.ellipse(12 + ox, 15.2 + oy, 5.4, 4.6)
      .circle(5.6 + ox, 10 + oy, 2.4)
      .circle(9.6 + ox, 5.9 + oy, 2.6)
      .circle(14.4 + ox, 5.9 + oy, 2.6)
      .circle(18.4 + ox, 10 + oy, 2.4)
      .fill({ color: c, alpha: a });
  },

  pause(g, ox, oy, c, a) {
    // Two bamboo / timber logs with cute bamboo joints
    for (const bx of [6.5, 13.5]) {
      g.roundRect(bx + ox, 3.5 + oy, 4.5, 17, 2.2)
        .fill({ color: c, alpha: a });
      // Bamboo node notch
      g.moveTo(bx + ox - 0.5, 11 + oy).lineTo(bx + ox + 5, 11 + oy)
        .stroke({ width: 1.4, color: SHADOW, alpha: 0.35, ...ROUND });
    }
  },

  play(g, ox, oy, c, a) {
    g.poly([8 + ox, 5 + oy, 19 + ox, 12 + oy, 8 + ox, 19 + oy])
      .fill({ color: c, alpha: a })
      .stroke({ width: 3, color: c, alpha: a, ...ROUND });
  },

  home(g, ox, oy, c, a) {
    // Cozy Island Cottage (Return to Home / Menu)
    g.poly([2.5 + ox, 11 + oy, 12 + ox, 3.2 + oy, 21.5 + ox, 11 + oy])
      .fill({ color: c, alpha: a })
      .stroke({ width: 1.6, color: c, alpha: a, ...ROUND });
    g.roundRect(5.5 + ox, 10.5 + oy, 13, 10.5, 1.5)
      .fill({ color: c, alpha: a });
    g.roundRect(9.8 + ox, 13.5 + oy, 4.4, 7.5, 2)
      .fill({ color: SHADOW, alpha: 0.55 });
    g.roundRect(16 + ox, 4.5 + oy, 2.5, 5, 0.8)
      .fill({ color: c, alpha: a });
  },

  replay(g, ox, oy, c, a) {
    // Circular Replay / Restart Arrow
    arcPath(g, 12 + ox, 12 + oy, 6.8, -Math.PI * 0.8, Math.PI * 0.7)
      .stroke({ width: 2.8, color: c, alpha: a, ...ROUND });
    g.poly([
      19 + ox, 6.5 + oy,
      21.5 + ox, 11.5 + oy,
      16.5 + ox, 11.5 + oy
    ]).fill({ color: c, alpha: a }).stroke({ width: 1.2, color: c, alpha: a, ...ROUND });
  },

  close(g, ox, oy, c, a) {
    // Bold X close mark
    g.moveTo(6 + ox, 6 + oy).lineTo(18 + ox, 18 + oy)
      .moveTo(18 + ox, 6 + oy).lineTo(6 + ox, 18 + oy)
      .stroke({ width: 3.2, color: c, alpha: a, ...ROUND });
  },

  arrowRight(g, ox, oy, c, a) {
    g.moveTo(9 + ox, 6 + oy).lineTo(15.5 + ox, 12 + oy).lineTo(9 + ox, 18 + oy)
      .stroke({ width: 3.2, color: c, alpha: a, ...ROUND });
  },

  arrowBack(g, ox, oy, c, a) {
    g.moveTo(15 + ox, 6 + oy).lineTo(8.5 + ox, 12 + oy).lineTo(15 + ox, 18 + oy)
      .stroke({ width: 3.2, color: c, alpha: a, ...ROUND });
  },

  podium(g, ox, oy, c, a) {
    // 3-step Leaderboard Podium (Bục Vinh Quang 1 - 2 - 3)
    // Step 2 (Left, silver)
    g.roundRect(2.5 + ox, 13 + oy, 6, 8, 1.2).fill({ color: c, alpha: a * 0.85 });
    // Step 1 (Center, gold, tallest)
    g.roundRect(8.5 + ox, 9.5 + oy, 7, 11.5, 1.4).fill({ color: c, alpha: a });
    // Step 3 (Right, bronze)
    g.roundRect(15.5 + ox, 15 + oy, 6, 6, 1.2).fill({ color: c, alpha: a * 0.75 });

    // Step divider lines
    g.moveTo(8.5 + ox, 9.5 + oy).lineTo(8.5 + ox, 21 + oy).stroke({ width: 1.2, color: SHADOW, alpha: 0.35 });
    g.moveTo(15.5 + ox, 9.5 + oy).lineTo(15.5 + ox, 21 + oy).stroke({ width: 1.2, color: SHADOW, alpha: 0.35 });

    // "1" on center step
    g.moveTo(12 + ox, 12.5 + oy).lineTo(12 + ox, 18 + oy).moveTo(10.8 + ox, 13.8 + oy).lineTo(12 + ox, 12.5 + oy)
      .stroke({ width: 1.6, color: SHADOW, alpha: 0.5, ...ROUND });
    // "2" on left step
    g.moveTo(4.5 + ox, 15.5 + oy).quadraticCurveTo(5.5 + ox, 14.5 + oy, 6.5 + ox, 15.5 + oy)
      .lineTo(4.5 + ox, 18.5 + oy).lineTo(7 + ox, 18.5 + oy)
      .stroke({ width: 1.4, color: SHADOW, alpha: 0.5, ...ROUND });
    // "3" on right step
    g.moveTo(17.5 + ox, 16.8 + oy).quadraticCurveTo(19 + ox, 17.3 + oy, 17.5 + ox, 18 + oy)
      .quadraticCurveTo(19 + ox, 18.7 + oy, 17.5 + ox, 19.5 + oy)
      .stroke({ width: 1.4, color: SHADOW, alpha: 0.5, ...ROUND });

    // Gleaming Star on top of Step 1
    g.star(12 + ox, 5 + oy, 5, 4.2, 1.9).fill({ color: 0xfacc15, alpha: 1 })
      .stroke({ width: 1.2, color: 0xc2410c, ...ROUND });
  },

  help(g, ox, oy, c, a) {
    // Open Guide Book with bold golden Question Mark '?'
    // Left Page
    g.poly([3.5 + ox, 6 + oy, 11 + ox, 4.5 + oy, 11 + ox, 19 + oy, 3.5 + ox, 20.5 + oy])
      .fill({ color: c, alpha: a * 0.9 })
      .stroke({ width: 1.2, color: SHADOW, alpha: 0.25, ...ROUND });
    // Right Page
    g.poly([13 + ox, 4.5 + oy, 20.5 + ox, 6 + oy, 20.5 + ox, 20.5 + oy, 13 + ox, 19 + oy])
      .fill({ color: c, alpha: a })
      .stroke({ width: 1.2, color: SHADOW, alpha: 0.25, ...ROUND });
    // Spine
    g.roundRect(11 + ox, 4 + oy, 2, 15.5, 1).fill({ color: SHADOW, alpha: 0.3 });

    // Bold, unmistakable Help Question Mark '?' in center
    g.moveTo(9.5 + ox, 9 + oy)
      .quadraticCurveTo(12 + ox, 6.5 + oy, 14.5 + ox, 9 + oy)
      .quadraticCurveTo(14 + ox, 12 + oy, 12 + ox, 13 + oy)
      .lineTo(12 + ox, 14.5 + oy)
      .stroke({ width: 2.8, color: 0xf59e0b, ...ROUND });
    g.circle(12 + ox, 17.5 + oy, 1.6).fill({ color: 0xf59e0b });
  },

  speedBoot(g, ox, oy, c, a) {
    // Hermes Winged Sneaker + Speed Wind Streaks (Tăng tốc di chuyển)
    // Sneaker thick curved sole
    g.roundRect(6.5 + ox, 15.5 + oy, 14, 4.5, 2.2).fill({ color: 0xffffff, alpha: a })
      .stroke({ width: 1.2, color: SHADOW, alpha: 0.35 });
    // Sneaker upper body (curving forward)
    g.poly([
      8 + ox, 8.5 + oy,
      13.5 + ox, 9.5 + oy,
      16 + ox, 13 + oy,
      20.5 + ox, 15.5 + oy,
      8 + ox, 15.5 + oy
    ]).fill({ color: 0xfacc15, alpha: a }).stroke({ width: 1.4, color: 0xc2410c, ...ROUND });
    // Shoelace marks
    g.moveTo(11.5 + ox, 10.5 + oy).lineTo(13.5 + ox, 12.5 + oy)
      .moveTo(13 + ox, 12.5 + oy).lineTo(15 + ox, 14.5 + oy)
      .stroke({ width: 1.3, color: 0xffffff, alpha: 0.9, ...ROUND });
    // Pure white feather wings on the ankle
    g.poly([8 + ox, 11 + oy, 2 + ox, 5 + oy, 5 + ox, 10.5 + oy, 1.5 + ox, 9 + oy, 6 + ox, 13 + oy])
      .fill({ color: 0xffffff, alpha: a })
      .stroke({ width: 1.2, color: 0x38bdf8, ...ROUND });
    // Aerodynamic wind dash streaks
    g.moveTo(0.5 + ox, 15 + oy).lineTo(4.5 + ox, 15 + oy)
      .moveTo(2 + ox, 18 + oy).lineTo(5.5 + ox, 18 + oy)
      .stroke({ width: 1.8, color: 0x38bdf8, alpha: 0.85, ...ROUND });
  },

  fortressShield(g, ox, oy, c, a) {
    // Castle Tower Battlements + Heavy Studded Fortress Shield (Phòng thủ đảo)
    // Castle battlements in background
    g.roundRect(5 + ox, 3.5 + oy, 14, 5.5, 1.2).fill({ color: c, alpha: a * 0.75 });
    // Crenellations (merlons)
    g.rect(5 + ox, 2 + oy, 3.2, 2.5).rect(10.4 + ox, 2 + oy, 3.2, 2.5).rect(15.8 + ox, 2 + oy, 3.2, 2.5)
      .fill({ color: c, alpha: a * 0.75 });

    // Heavy Knight Studded Shield in front
    g.moveTo(12 + ox, 6.5 + oy)
      .lineTo(20 + ox, 8.5 + oy)
      .lineTo(20 + ox, 14 + oy)
      .quadraticCurveTo(20 + ox, 20 + oy, 12 + ox, 22.5 + oy)
      .quadraticCurveTo(4 + ox, 20 + oy, 4 + ox, 14 + oy)
      .lineTo(4 + ox, 8.5 + oy)
      .closePath()
      .fill({ color: c, alpha: a })
      .stroke({ width: 1.6, color: 0x0284c7, ...ROUND });

    // Golden boss / emblem in center of shield
    g.circle(12 + ox, 13.5 + oy, 3.2).fill({ color: 0xfacc15 })
      .stroke({ width: 1.2, color: 0xc2410c });
    // 4 steel studs on shield corners
    g.circle(7.5 + ox, 11 + oy, 1.1).circle(16.5 + ox, 11 + oy, 1.1)
      .circle(9.5 + ox, 17.5 + oy, 1).circle(14.5 + ox, 17.5 + oy, 1)
      .fill({ color: 0x0284c7 });
  },

  troopReinforce(g, ox, oy, c, a) {
    // Bold '+' summon plus sign + 3 charging Cat Soldiers (Viện binh)
    // Glowing golden Plus '+' on top-left
    g.roundRect(2.5 + ox, 4.5 + oy, 3.2, 8, 1.2).fill({ color: 0xfacc15, alpha: 1 })
      .stroke({ width: 1.2, color: 0xb45309 });
    g.roundRect(0.5 + ox, 7 + oy, 7.2, 3.2, 1.2).fill({ color: 0xfacc15, alpha: 1 })
      .stroke({ width: 1.2, color: 0xb45309 });

    // Cat Warrior 1 (Leader, center)
    g.circle(15 + ox, 13.5 + oy, 4.5).fill({ color: c, alpha: a });
    // Cat ears
    g.poly([11.8 + ox, 10.5 + oy, 12.5 + ox, 7 + oy, 14.5 + ox, 9.8 + oy]).fill({ color: c, alpha: a });
    g.poly([15.5 + ox, 9.8 + oy, 17.5 + ox, 7 + oy, 18.2 + ox, 10.5 + oy]).fill({ color: c, alpha: a });
    // Sword raised
    g.moveTo(19.5 + ox, 13.5 + oy).lineTo(23 + ox, 8 + oy).stroke({ width: 1.8, color: 0xffffff, ...ROUND });
    g.moveTo(18.5 + ox, 12.5 + oy).lineTo(21 + ox, 11 + oy).stroke({ width: 1.4, color: 0xfacc15, ...ROUND });

    // Cat Warrior 2 (Top right flank, smaller)
    g.circle(18.5 + ox, 5 + oy, 2.8).fill({ color: c, alpha: a * 0.85 });
    g.poly([16.5 + ox, 3.2 + oy, 17 + ox, 1.2 + oy, 18.2 + ox, 2.8 + oy]).fill({ color: c, alpha: a * 0.85 });
    g.poly([18.8 + ox, 2.8 + oy, 20 + ox, 1.2 + oy, 20.5 + ox, 3.2 + oy]).fill({ color: c, alpha: a * 0.85 });

    // Cat Warrior 3 (Bottom flank, smaller)
    g.circle(17.5 + ox, 19.5 + oy, 2.8).fill({ color: c, alpha: a * 0.85 });
    g.poly([15.5 + ox, 17.8 + oy, 16 + ox, 15.8 + oy, 17.2 + ox, 17.2 + oy]).fill({ color: c, alpha: a * 0.85 });
    g.poly([17.8 + ox, 17.2 + oy, 19 + ox, 15.8 + oy, 19.5 + ox, 17.8 + oy]).fill({ color: c, alpha: a * 0.85 });
  },

  squadHalf(g, ox, oy, c, a) {
    // 2 Cat warriors charging together (50% squad)
    g.circle(9.5 + ox, 13 + oy, 4).fill({ color: c, alpha: a });
    g.poly([6.8 + ox, 10 + oy, 7.5 + ox, 6.5 + oy, 9.2 + ox, 9.2 + oy]).fill({ color: c, alpha: a });
    g.poly([10 + ox, 9.2 + oy, 11.8 + ox, 6.5 + oy, 12.2 + ox, 10 + oy]).fill({ color: c, alpha: a });
    g.circle(16 + ox, 11 + oy, 3.5).fill({ color: c, alpha: a * 0.85 });
    g.poly([13.8 + ox, 8.5 + oy, 14.5 + ox, 5.5 + oy, 15.8 + ox, 7.8 + oy]).fill({ color: c, alpha: a * 0.85 });
    g.poly([16.5 + ox, 7.8 + oy, 18 + ox, 5.5 + oy, 18.5 + ox, 8.5 + oy]).fill({ color: c, alpha: a * 0.85 });
    g.moveTo(3 + ox, 18.5 + oy).lineTo(15 + ox, 18.5 + oy).stroke({ width: 1.6, color: c, alpha: a * 0.7, ...ROUND });
  },

  squadFull(g, ox, oy, c, a) {
    // 4 Cat warriors charging with battle flag & speed flames (100% all-out attack)
    g.moveTo(3.5 + ox, 3.5 + oy).lineTo(3.5 + ox, 20.5 + oy).stroke({ width: 1.8, color: 0xfacc15, ...ROUND });
    g.poly([3.5 + ox, 4 + oy, 10 + ox, 7 + oy, 3.5 + ox, 10 + oy]).fill({ color: 0xef4444 });
    g.circle(13 + ox, 13 + oy, 4.2).fill({ color: c, alpha: a });
    g.poly([10 + ox, 10 + oy, 10.8 + ox, 6.5 + oy, 12.5 + ox, 9.2 + oy]).fill({ color: c, alpha: a });
    g.poly([13.5 + ox, 9.2 + oy, 15.2 + ox, 6.5 + oy, 16 + ox, 10 + oy]).fill({ color: c, alpha: a });
    g.circle(19 + ox, 8 + oy, 3.2).fill({ color: c, alpha: a * 0.9 });
    g.circle(18.5 + ox, 17 + oy, 3.2).fill({ color: c, alpha: a * 0.9 });
    g.moveTo(6 + ox, 18 + oy).lineTo(21 + ox, 18 + oy).stroke({ width: 2, color: 0xf97316, alpha: 0.9, ...ROUND });
  },

  swords(g, ox, oy, c, a) {
    // Crossed pirate cutlasses / scimitars
    g.moveTo(4 + ox, 20 + oy).lineTo(18.5 + ox, 5.5 + oy)
      .stroke({ width: 2.2, color: c, alpha: a, ...ROUND });
    g.moveTo(18.5 + ox, 5.5 + oy).lineTo(21 + ox, 3 + oy)
      .stroke({ width: 3.2, color: c, alpha: a, ...ROUND });
    g.moveTo(6 + ox, 16 + oy).lineTo(9 + ox, 19 + oy).stroke({ width: 2, color: 0xfacc15, ...ROUND });

    g.moveTo(20 + ox, 20 + oy).lineTo(5.5 + ox, 5.5 + oy)
      .stroke({ width: 2.2, color: c, alpha: a, ...ROUND });
    g.moveTo(5.5 + ox, 5.5 + oy).lineTo(3 + ox, 3 + oy)
      .stroke({ width: 3.2, color: c, alpha: a, ...ROUND });
    g.moveTo(18 + ox, 16 + oy).lineTo(15 + ox, 19 + oy).stroke({ width: 2, color: 0xfacc15, ...ROUND });
  },

  volumeOn(g, ox, oy, c, a) {
    // Loudspeaker horn with sound waves & musical note
    g.roundRect(3 + ox, 8.5 + oy, 5, 7, 1.4).fill({ color: c, alpha: a });
    g.poly([7.5 + ox, 8.5 + oy, 13.5 + ox, 4.5 + oy, 13.5 + ox, 19.5 + oy, 7.5 + ox, 15.5 + oy])
      .fill({ color: c, alpha: a })
      .stroke({ width: 1.4, color: c, alpha: a, ...ROUND });
    arcPath(g, 13.5 + ox, 12 + oy, 4.8, -0.65, 0.65)
      .stroke({ width: 2.2, color: c, alpha: a, ...ROUND });
    arcPath(g, 13.5 + ox, 12 + oy, 8.2, -0.7, 0.7)
      .stroke({ width: 2.2, color: c, alpha: a, ...ROUND });
    g.circle(18.5 + ox, 5.5 + oy, 1.5).fill({ color: 0xfacc15, alpha: a });
    g.moveTo(19.8 + ox, 5.5 + oy).lineTo(19.8 + ox, 2.5 + oy).lineTo(22 + ox, 3.5 + oy)
      .stroke({ width: 1.2, color: 0xfacc15, alpha: a, ...ROUND });
  },

  volumeOff(g, ox, oy, c, a) {
    // Loudspeaker horn with red muted slash
    g.roundRect(3 + ox, 8.5 + oy, 5, 7, 1.4).fill({ color: c, alpha: a * 0.7 });
    g.poly([7.5 + ox, 8.5 + oy, 13.5 + ox, 4.5 + oy, 13.5 + ox, 19.5 + oy, 7.5 + ox, 15.5 + oy])
      .fill({ color: c, alpha: a * 0.7 })
      .stroke({ width: 1.4, color: c, alpha: a * 0.7, ...ROUND });
    g.moveTo(4 + ox, 4 + oy).lineTo(20 + ox, 20 + oy)
      .stroke({ width: 3.2, color: 0xef4444, alpha: 1, ...ROUND });
  },

  lightning(g, ox, oy, c, a) {
    g.poly([13.5 + ox, 2.5 + oy, 5.5 + ox, 13.5 + oy, 11 + ox, 13.5 + oy, 9.5 + ox, 21.5 + oy, 18.5 + ox, 9.5 + oy, 13 + ox, 9.5 + oy])
      .fill({ color: c, alpha: a })
      .stroke({ width: 1.4, color: c, alpha: a, ...ROUND });
  },

  shield(g, ox, oy, c, a, detail) {
    // Sturdy Island Carton Shield with cat silhouette
    g.moveTo(12 + ox, 2.5 + oy)
      .lineTo(20 + ox, 5.5 + oy)
      .lineTo(20 + ox, 11.5 + oy)
      .quadraticCurveTo(20 + ox, 18.5 + oy, 12 + ox, 21.5 + oy)
      .quadraticCurveTo(4 + ox, 18.5 + oy, 4 + ox, 11.5 + oy)
      .lineTo(4 + ox, 5.5 + oy)
      .closePath()
      .fill({ color: c, alpha: a })
      .stroke({ width: 1.6, color: c, alpha: a, ...ROUND });
    if (detail) {
      // Engraved paw emblem
      g.ellipse(12 + ox, 14.2 + oy, 2.8, 2.3)
        .circle(8.6 + ox, 10.6 + oy, 1.3).circle(10.8 + ox, 8.6 + oy, 1.35).circle(13.2 + ox, 8.6 + oy, 1.35).circle(15.4 + ox, 10.6 + oy, 1.3)
        .fill({ color: SHADOW, alpha: 0.32 });
    }
  },

  surge(g, ox, oy, c, a) {
    // Spiral Conch Shell Horn (Tù và ốc biển triệu hồi quân)
    g.poly([
      4.5 + ox, 15 + oy,
      13 + ox, 8 + oy,
      18.5 + ox, 5 + oy,
      20 + ox, 10 + oy,
      15.5 + ox, 16 + oy,
      8 + ox, 19 + oy
    ]).fill({ color: c, alpha: a }).stroke({ width: 1.6, color: c, alpha: a, ...ROUND });
    // Shell spiral ridges
    g.moveTo(8.5 + ox, 13 + oy).quadraticCurveTo(12.5 + ox, 11 + oy, 14.5 + ox, 14 + oy)
      .stroke({ width: 1.4, color: SHADOW, alpha: 0.35, ...ROUND });
    // Sound vibration lines
    g.moveTo(18 + ox, 2.5 + oy).lineTo(21 + ox, 4 + oy)
      .moveTo(21.5 + ox, 7 + oy).lineTo(23.5 + ox, 8 + oy)
      .stroke({ width: 2, color: c, alpha: a, ...ROUND });
  },

  book(g, ox, oy, c, a, detail) {
    // Pirate Nautical Scroll with rolled spindles & paw wax seal
    // Parchment sheet
    g.roundRect(4 + ox, 5.5 + oy, 16, 13, 2.5).fill({ color: c, alpha: a });
    // Left & right rolled scroll rods
    g.roundRect(2.5 + ox, 4 + oy, 3.2, 16, 1.6).fill({ color: c, alpha: a })
      .stroke({ width: 1.2, color: SHADOW, alpha: 0.25 });
    g.roundRect(18.3 + ox, 4 + oy, 3.2, 16, 1.6).fill({ color: c, alpha: a })
      .stroke({ width: 1.2, color: SHADOW, alpha: 0.25 });
    // Cute paw print wax seal in the center
    g.circle(12 + ox, 12 + oy, 3.4).fill({ color: 0xef4444, alpha: 0.9 });
    g.ellipse(12 + ox, 12.5 + oy, 1.4, 1.1).fill({ color: 0xffffff });
    g.circle(10.8 + ox, 10.8 + oy, 0.55).circle(12 + ox, 10.2 + oy, 0.6).circle(13.2 + ox, 10.8 + oy, 0.55)
      .fill({ color: 0xffffff });
  },

  map(g, ox, oy, c, a) {
    g.poly([3.5 + ox, 6 + oy, 9 + ox, 4 + oy, 9 + ox, 18.5 + oy, 3.5 + ox, 20.5 + oy])
      .fill({ color: c, alpha: a });
    g.poly([9 + ox, 4 + oy, 15 + ox, 5.5 + oy, 15 + ox, 20 + oy, 9 + ox, 18.5 + oy])
      .fill({ color: c, alpha: a * 0.85 });
    g.poly([15 + ox, 5.5 + oy, 20.5 + ox, 4 + oy, 20.5 + ox, 18.5 + oy, 15 + ox, 20 + oy])
      .fill({ color: c, alpha: a });
  },

  grid(g, ox, oy, c, a) {
    const s = 5.2, r = 1.4;
    g.roundRect(4.8 + ox, 4.8 + oy, s, s, r)
      .roundRect(14 + ox, 4.8 + oy, s, s, r)
      .roundRect(4.8 + ox, 14 + oy, s, s, r)
      .roundRect(14 + ox, 14 + oy, s, s, r)
      .fill({ color: c, alpha: a });
  },
};
GLYPHS.swords = GLYPHS.paw; // legacy key: dispatch / play / attack now uses the paw

// ---------------------------------------------------------------------------
// BADGES: draw(g, mono) — mono = optional flat colour (disabled / unearned)
// ---------------------------------------------------------------------------
const BADGES = {
  star(g, mono) {
    g.star(12, 12.8, 5, 10.2, 4.8).fill({ color: mono ?? 0xfacc15 })
      .stroke({ width: 1.8, color: mono !== undefined ? SHADOW : 0xc2410c, alpha: mono !== undefined ? 0.15 : 1, ...ROUND });
    if (mono === undefined) g.ellipse(9.6, 9.2, 2, 1.2).fill({ color: 0xffffff, alpha: 0.75 });
  },

  trophy(g) {
    // Golden Cat Ear Trophy (Cúp Mèo Vàng Hải Trình)
    // Left & right handles
    arcPath(g, 6.2, 9, 3.6, Math.PI * 0.5, Math.PI * 1.5).stroke({ width: 2.2, color: 0xd97706, ...ROUND });
    arcPath(g, 17.8, 9, 3.6, -Math.PI * 0.5, Math.PI * 0.5).stroke({ width: 2.2, color: 0xd97706, ...ROUND });
    // Cat ears on the rim of the cup
    g.poly([6, 4.5, 7.8, 1.2, 10, 4.5]).fill({ color: 0xfacc15 }).stroke({ width: 1.4, color: 0xc2410c, ...ROUND });
    g.poly([14, 4.5, 16.2, 1.2, 18, 4.5]).fill({ color: 0xfacc15 }).stroke({ width: 1.4, color: 0xc2410c, ...ROUND });
    // Cup bowl
    g.moveTo(6, 4.5).lineTo(18, 4.5).lineTo(18, 9.5)
      .quadraticCurveTo(18, 15.5, 12, 15.5).quadraticCurveTo(6, 15.5, 6, 9.5).closePath()
      .fill({ color: 0xfacc15 }).stroke({ width: 1.6, color: 0xc2410c, ...ROUND });
    // Fish / Paw emblem on cup
    g.ellipse(12, 9.5, 2.5, 1.6).fill({ color: 0xffffff, alpha: 0.9 });
    g.poly([14.5, 9.5, 16, 7.8, 16, 11.2]).fill({ color: 0xffffff, alpha: 0.9 });
    // Stem and base
    g.rect(10.6, 15, 2.8, 3).fill({ color: 0xf59e0b });
    g.roundRect(7, 18, 10, 3.5, 1.4).fill({ color: 0xf59e0b }).stroke({ width: 1.4, color: 0xc2410c });
  },

  crown(g) {
    g.poly([3, 17.5, 2.5, 7, 8, 11.5, 12, 4.5, 16, 11.5, 21.5, 7, 21, 17.5])
      .fill({ color: 0xfacc15 }).stroke({ width: 1.6, color: 0xc2410c, ...ROUND });
    g.roundRect(3, 16, 18, 4.5, 1.6).fill({ color: 0xf59e0b }).stroke({ width: 1.4, color: 0xc2410c });
    g.circle(12, 18.2, 1.3).fill({ color: 0xef4444 });
    g.circle(7.2, 18.2, 1).circle(16.8, 18.2, 1).fill({ color: 0x38bdf8 });
    g.circle(12, 4.5, 1.4).circle(2.5, 7, 1.2).circle(21.5, 7, 1.2).fill({ color: 0xfff7cc });
  },

  medalGold(g) {
    g.poly([8, 2, 11, 2, 13.5, 9, 10.5, 9]).fill({ color: 0x38bdf8 });
    g.poly([16, 2, 13, 2, 10.5, 9, 13.5, 9]).fill({ color: 0xef4444 });
    g.circle(12, 15, 7).fill({ color: 0xfacc15 }).stroke({ width: 1.6, color: 0xc2410c });
    g.circle(12, 15, 4.6).stroke({ width: 1, color: 0xc2410c, alpha: 0.5 });
    g.star(12, 15.2, 5, 3.2, 1.5).fill({ color: 0xffffff });
  },

  lock(g) {
    g.moveTo(8, 11).lineTo(8, 7.5);
    g.arc(12, 7.5, 4, Math.PI, 0);
    g.lineTo(16, 11).stroke({ width: 3, color: 0x475569, ...ROUND });
    g.roundRect(5, 10, 14, 11, 3).fill({ color: 0x64748b }).stroke({ width: 1.4, color: 0x334155 });
    g.roundRect(6.5, 11.3, 11, 3, 1.5).fill({ color: 0xffffff, alpha: 0.22 });
    g.circle(12, 15, 1.7).fill({ color: 0xffffff });
    g.roundRect(11.3, 15.5, 1.4, 3, 0.7).fill({ color: 0xffffff });
  },

  timer(g) {
    g.roundRect(10, 1.5, 4, 3, 1.2).fill({ color: 0x0284c7 });
    g.circle(12, 13.5, 8.6).fill({ color: 0xffffff }).stroke({ width: 2.4, color: 0x0284c7 });
    g.moveTo(12, 13.5).lineTo(12, 8.5).moveTo(12, 13.5).lineTo(15.5, 15)
      .stroke({ width: 2, color: 0x1e293b, ...ROUND });
    g.circle(12, 13.5, 1.4).fill({ color: 0xef4444 });
  },

  // Score is counted in fish ("cá")
  coin(g) {
    g.poly([16.5, 12, 22, 7, 22, 17]).fill({ color: 0x38bdf8 }).stroke({ width: 1.5, color: 0x0369a1, ...ROUND });
    g.ellipse(10.5, 12, 8.5, 6).fill({ color: 0x38bdf8 }).stroke({ width: 1.5, color: 0x0369a1 });
    g.ellipse(10, 14, 6, 2.6).fill({ color: 0xbae6fd });
    g.circle(6.5, 10.5, 1.5).fill({ color: 0x1e293b });
    g.circle(6.9, 10.1, 0.5).fill({ color: 0xffffff });
    arcPath(g, 13, 12, 3.5, -0.9, 0.9).stroke({ width: 1.2, color: 0x0369a1, alpha: 0.7, ...ROUND });
  },

  flag(g) {
    g.roundRect(4, 2.5, 2.4, 19.5, 1.2).fill({ color: 0x92400e });
    g.circle(5.2, 2.8, 1.8).fill({ color: 0xfacc15 });
    g.poly([6.4, 4, 20.5, 8.5, 6.4, 13.5]).fill({ color: 0x22c55e }).stroke({ width: 1.4, color: 0x15803d, ...ROUND });
    g.ellipse(10.5, 8.6, 1.6, 1.3).fill({ color: 0xffffff });
  },

  // Defeat emblem: a sad crying cat
  skull(g) {
    drawAnimalHead(g, 12, 13.2, 8.2, 'cat', 0x94a3b8, 0xe2e8f0, 0, { detail: true, outline: 0x475569, outlineW: 1.4 });
    g.ellipse(15.2, 15.6, 1.1, 1.9).fill({ color: 0x38bdf8 });
    g.moveTo(10, 18.3).quadraticCurveTo(12, 16.6, 14, 18.3).stroke({ width: 1.1, color: 0x1e293b, ...ROUND });
  },
};

// Legacy SVG map kept for compatibility (empty: icons are procedural now)
export const SVG_ICONS = {};

export function createSvgIcon(svgKey, size = 24, tintColor) {
  const icon = new Graphics();
  const glyph = GLYPHS[svgKey];
  const badge = BADGES[svgKey];

  if (glyph) {
    const color = tintColor !== undefined ? tintColor : 0xffffff;
    glyph(icon, 0, 1.4, SHADOW, 0.28, false); // soft drop shadow
    glyph(icon, 0, 0, color, 1, true);
  } else if (badge) {
    badge(icon, tintColor !== undefined && tintColor !== 0xffffff ? tintColor : undefined);
  } else {
    // Unknown key: neutral dot so missing icons are visible but not broken
    icon.circle(12, 12, 6).fill({ color: tintColor ?? 0xffffff });
  }

  icon.pivot.set(12, 12);
  icon.scale.set(size / 24);
  return icon;
}
