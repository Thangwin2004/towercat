/**
 * Tropical Cartoon Cat Island UI Theme ("Mèo Chiến Đảo")
 * Procedural graphics generators for authentic cartoon island UI:
 * - Handcrafted Wooden Signboards & Timber Plaques (Biển gỗ nhiệt đới)
 * - 3D Paw Print & Coconut Stump Disc Buttons (Nút chân mèo & thớt gỗ)
 * - Floating Bamboo/Timber Raft Docks (Bè tre nổi chứa kỹ năng)
 * - Tropical Ropes, Golden Studs & Coconut Palm Accents
 */

import { Container, Graphics, Text } from 'pixi.js';
import { vGrad } from '../utils/gfx.js';

// Color Palette for Tropical Island Theme
export const ISLAND_COLORS = {
  // Rich Wood Tones
  WOOD_DARK: 0x451a03,     // Deep mahogany outline & 3D base
  WOOD_SHADOW: 0x78350f,   // Shadowed wood bevel
  WOOD_MID: 0xb45309,      // Warm amber wood
  WOOD_LIGHT: 0xd97706,    // Sunlit timber surface
  WOOD_HIGHLIGHT: 0xf59e0b,// Sunny edge highlight
  WOOD_GRAIN: 0x92400e,    // Subtle grain streaks

  // Golden Brass & Bronze Hardware
  GOLD_STUD: 0xfacc15,
  GOLD_STUD_SHADOW: 0x9a3412,

  // Warm Beach Sand & Parchment
  SAND_PARCHMENT: 0xfef9e7,
  SAND_BORDER: 0xfde68a,

  // Tropical Bamboo & Vines
  BAMBOO_GREEN: 0x65a30d,
  BAMBOO_LIGHT: 0x84cc16,
  BAMBOO_DARK: 0x3f6212,

  // Rope
  ROPE_COLOR: 0xd97706,
  ROPE_DARK: 0x92400e,

  // Vibrant CTA Orange
  BTN_PLAY_TOP: 0xfbbf24,
  BTN_PLAY_MID: 0xf97316,
  BTN_PLAY_BOT: 0xea580c,
  BTN_PLAY_SHADOW: 0x9a3412,
};

/**
 * Draw a cartoon wooden signboard / plaque with beveled planks, wood grain,
 * golden studs, and optional cute cat ears poking from the top.
 */
export function drawWoodenPlankBoard(g, x, y, w, h, opts = {}) {
  const radius = opts.radius || 18;
  const hasCatEars = opts.catEars !== false;
  const isPill = opts.pill || false;
  const r = isPill ? h / 2 : radius;

  // 1. Deep 3D Drop Shadow underneath
  g.roundRect(x - w / 2, y - h / 2 + 6, w, h, r)
    .fill({ color: ISLAND_COLORS.WOOD_DARK, alpha: 0.9 });

  // 2. Optional cute cat ears on top edge
  if (hasCatEars) {
    const earW = Math.min(22, w * 0.12);
    const earH = earW * 1.05;
    const earOffX = w * 0.32;
    // Left ear shadow & body
    g.poly([
      x - earOffX - earW, y - h / 2 + 4,
      x - earOffX + earW * 0.4, y - h / 2 + 4,
      x - earOffX - earW * 0.3, y - h / 2 - earH
    ]).fill({ color: ISLAND_COLORS.WOOD_DARK });
    g.poly([
      x - earOffX - earW + 2, y - h / 2 + 2,
      x - earOffX + earW * 0.4 - 2, y - h / 2 + 2,
      x - earOffX - earW * 0.3, y - h / 2 - earH + 3
    ]).fill({ color: ISLAND_COLORS.WOOD_MID });
    // Left ear inner pink/light patch
    g.poly([
      x - earOffX - earW * 0.7, y - h / 2,
      x - earOffX, y - h / 2,
      x - earOffX - earW * 0.35, y - h / 2 - earH * 0.65
    ]).fill({ color: 0xfda4af });

    // Right ear shadow & body
    g.poly([
      x + earOffX - earW * 0.4, y - h / 2 + 4,
      x + earOffX + earW, y - h / 2 + 4,
      x + earOffX + earW * 0.3, y - h / 2 - earH
    ]).fill({ color: ISLAND_COLORS.WOOD_DARK });
    g.poly([
      x + earOffX - earW * 0.4 + 2, y - h / 2 + 2,
      x + earOffX + earW - 2, y - h / 2 + 2,
      x + earOffX + earW * 0.3, y - h / 2 - earH + 3
    ]).fill({ color: ISLAND_COLORS.WOOD_MID });
    // Right ear inner pink/light patch
    g.poly([
      x + earOffX, y - h / 2,
      x + earOffX + earW * 0.7, y - h / 2,
      x + earOffX + earW * 0.35, y - h / 2 - earH * 0.65
    ]).fill({ color: 0xfda4af });
  }

  // 3. Main Wooden Plank Body (Amber honey wood gradient)
  const colorTop = opts.colorTop || ISLAND_COLORS.WOOD_HIGHLIGHT;
  const colorBot = opts.colorBot || ISLAND_COLORS.WOOD_MID;
  const borderColor = opts.borderColor || ISLAND_COLORS.WOOD_DARK;

  g.roundRect(x - w / 2, y - h / 2, w, h, r)
    .fill({
      fill: vGrad([
        { offset: 0, color: colorTop },
        { offset: 0.3, color: ISLAND_COLORS.WOOD_LIGHT },
        { offset: 1, color: colorBot }
      ])
    })
    .stroke({ width: 3.5, color: borderColor });

  // 4. Horizontal Plank Groove (creates a 2-plank wooden deck effect)
  const grooveY = y + h * 0.08;
  const grooveMargin = r * 0.6;
  g.moveTo(x - w / 2 + grooveMargin, grooveY)
    .lineTo(x + w / 2 - grooveMargin, grooveY)
    .stroke({ width: 2.2, color: ISLAND_COLORS.WOOD_DARK, alpha: 0.65 });
  g.moveTo(x - w / 2 + grooveMargin, grooveY + 1.5)
    .lineTo(x + w / 2 - grooveMargin, grooveY + 1.5)
    .stroke({ width: 1.2, color: 0xffffff, alpha: 0.35 });

  // 5. Stylized Wood Grain Streaks
  g.moveTo(x - w * 0.35, y - h * 0.22)
    .quadraticCurveTo(x - w * 0.2, y - h * 0.28, x - w * 0.05, y - h * 0.22)
    .stroke({ width: 1.5, color: ISLAND_COLORS.WOOD_GRAIN, alpha: 0.45 });
  g.moveTo(x + w * 0.1, y + h * 0.28)
    .quadraticCurveTo(x + w * 0.25, y + h * 0.24, x + w * 0.38, y + h * 0.29)
    .stroke({ width: 1.5, color: ISLAND_COLORS.WOOD_GRAIN, alpha: 0.45 });

  // 6. Top Glossy Sun Highlight Sheen
  g.roundRect(x - w / 2 + 5, y - h / 2 + 3, w - 10, h * 0.38, r * 0.8)
    .fill({ color: 0xffffff, alpha: 0.25 });

  // 7. Golden Studs / Brass Rivets in the corners
  if (opts.studs !== false) {
    const studMarginX = isPill ? r * 0.75 : 12;
    const studMarginY = 10;
    const studR = 3.2;
    const drawStud = (sx, sy) => {
      g.circle(sx, sy + 1, studR).fill({ color: ISLAND_COLORS.GOLD_STUD_SHADOW });
      g.circle(sx, sy, studR).fill({ color: ISLAND_COLORS.GOLD_STUD });
      g.circle(sx - 0.9, sy - 0.9, 1).fill({ color: 0xffffff, alpha: 0.8 });
    };
    drawStud(x - w / 2 + studMarginX, y - h / 2 + studMarginY);
    drawStud(x + w / 2 - studMarginX, y - h / 2 + studMarginY);
    drawStud(x - w / 2 + studMarginX, y + h / 2 - studMarginY);
    drawStud(x + w / 2 - studMarginX, y + h / 2 - studMarginY);
  }
}

/**
 * Draw an authentic 3D Paw Print Button (Nút Dấu Chân Mèo Đảo Nhiệt Đới)
 * Features an oval heel pad in the center and 3 cute toe pads protruding on top.
 */
export function drawPawButtonGfx(g, x, y, r, opts = {}) {
  const padColor = opts.color || 0xffffff;
  const baseTop = opts.baseTop || ISLAND_COLORS.WOOD_LIGHT;
  const baseBot = opts.baseBot || ISLAND_COLORS.WOOD_MID;
  const borderCol = opts.borderColor || ISLAND_COLORS.WOOD_DARK;

  // 1. Shadow for entire paw
  g.circle(x, y + 4.5, r).fill({ color: ISLAND_COLORS.WOOD_DARK, alpha: 0.95 });

  // 2. Circular Coconut Wood Disc base
  g.circle(x, y, r)
    .fill({
      fill: vGrad([
        { offset: 0, color: baseTop },
        { offset: 1, color: baseBot }
      ])
    })
    .stroke({ width: 3.2, color: borderCol });

  // Concentric tree rings / bevel
  g.circle(x, y, r * 0.78).stroke({ width: 1.4, color: borderCol, alpha: 0.35 });

  // 3. Top sunlit crescent highlight
  g.ellipse(x, y - r * 0.38, r * 0.55, r * 0.22)
    .fill({ color: 0xffffff, alpha: 0.3 });

  // 4. Cat Paw Print in the center
  const pawScale = r / 28;
  const toeY = y - 4 * pawScale;
  // Toe 1 (left)
  g.ellipse(x - 8 * pawScale, toeY - 4 * pawScale, 3.2 * pawScale, 4.2 * pawScale)
    .fill({ color: padColor })
    .stroke({ width: 1.2, color: borderCol });
  // Toe 2 (middle)
  g.ellipse(x, toeY - 7 * pawScale, 3.5 * pawScale, 4.8 * pawScale)
    .fill({ color: padColor })
    .stroke({ width: 1.2, color: borderCol });
  // Toe 3 (right)
  g.ellipse(x + 8 * pawScale, toeY - 4 * pawScale, 3.2 * pawScale, 4.2 * pawScale)
    .fill({ color: padColor })
    .stroke({ width: 1.2, color: borderCol });

  // Main palm pad
  g.ellipse(x, y + 4.5 * pawScale, 9 * pawScale, 6.8 * pawScale)
    .fill({ color: padColor })
    .stroke({ width: 1.4, color: borderCol });
}

/**
 * Draw a Carved Wooden Disc Button with an Island Icon inside
 */
export function drawWoodenDiscButton(g, x, y, r, opts = {}) {
  const baseTop = opts.baseTop || ISLAND_COLORS.WOOD_HIGHLIGHT;
  const baseBot = opts.baseBot || ISLAND_COLORS.WOOD_MID;
  const borderCol = opts.borderColor || ISLAND_COLORS.WOOD_DARK;

  // 1. Deep 3D Shadow
  g.circle(x, y + 4.5, r).fill({ color: ISLAND_COLORS.WOOD_DARK, alpha: 0.9 });

  // 2. Main Wood Log Body
  g.circle(x, y, r)
    .fill({
      fill: vGrad([
        { offset: 0, color: baseTop },
        { offset: 0.4, color: ISLAND_COLORS.WOOD_LIGHT },
        { offset: 1, color: baseBot }
      ])
    })
    .stroke({ width: 3.2, color: borderCol });

  // 3. Tree stump growth ring
  g.circle(x, y, r * 0.78).stroke({ width: 1.2, color: borderCol, alpha: 0.35 });

  // 4. Subtle glossy highlight
  g.ellipse(x, y - r * 0.38, r * 0.52, r * 0.22)
    .fill({ color: 0xffffff, alpha: 0.32 });
}

/**
 * Draw a Floating Bamboo / Timber Raft Dock (Bè Tre/Gỗ Nổi cho HUD)
 * Used as the tactical dock in-game, complete with tied rope bindings.
 */
export function drawFloatingRaftDock(g, x, y, w, h) {
  const halfW = w / 2;
  const halfH = h / 2;

  // 1. Water shadow beneath the raft
  g.roundRect(x - halfW - 4, y - halfH + 8, w + 8, h, 20)
    .fill({ color: 0x064e3b, alpha: 0.35 });

  // 2. Outer Bamboo/Timber Planks container
  g.roundRect(x - halfW, y - halfH, w, h, 20)
    .fill({
      fill: vGrad([
        { offset: 0, color: 0xfef08a },
        { offset: 0.3, color: 0xd97706 },
        { offset: 1, color: 0x78350f }
      ])
    })
    .stroke({ width: 3.2, color: ISLAND_COLORS.WOOD_DARK });

  // 3. Three distinct bamboo logs horizontally
  const logH = h / 3.2;
  for (let i = 0; i < 3; i++) {
    const ly = y - halfH + i * logH + logH / 2 + 1;
    // Log highlight
    g.roundRect(x - halfW + 14, ly - logH / 2 + 2, w - 28, logH * 0.38, 5)
      .fill({ color: 0xffffff, alpha: 0.22 });
    // Log seam
    if (i > 0) {
      g.moveTo(x - halfW + 12, ly - logH / 2)
        .lineTo(x + halfW - 12, ly - logH / 2)
        .stroke({ width: 2, color: ISLAND_COLORS.WOOD_DARK, alpha: 0.7 });
    }
  }

  // 4. Hemp Rope Bindings at both ends (Dây thừng buộc bè)
  const drawRopeLashing = (rx) => {
    // Top rope band
    g.roundRect(rx - 5, y - halfH - 2, 10, h + 4, 3)
      .fill({ color: ISLAND_COLORS.ROPE_COLOR })
      .stroke({ width: 1.5, color: ISLAND_COLORS.WOOD_DARK });
    // Cross stitch bindings
    g.moveTo(rx - 4, y - halfH + 4).lineTo(rx + 4, y + halfH - 4)
      .moveTo(rx + 4, y - halfH + 4).lineTo(rx - 4, y + halfH - 4)
      .stroke({ width: 1.4, color: ISLAND_COLORS.ROPE_DARK });
  };
  drawRopeLashing(x - halfW + 24);
  drawRopeLashing(x + halfW - 24);
}
