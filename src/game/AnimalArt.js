/**
 * Procedural cartoon animal art for "Mèo Chiến Đảo".
 * One Graphics-friendly helper per species so troops, buildings and menus share the same look.
 * Species: 'cat' (Mèo Xanh), 'fox' (Cáo Đỏ), 'bear' (Gấu Vàng), 'owl' (Cú Tím).
 */

const OUTLINE = 0xffffff;
const EYE = 0x1e293b;
const PINK = 0xfda4af;

/**
 * Draw a cute animal head centred at (x, y).
 * @param {import('pixi.js').Graphics} g
 * @param {number} r       head radius
 * @param {string} species 'cat' | 'fox' | 'bear' | 'owl'
 * @param {number} color   main fur colour
 * @param {number} light   light accent (muzzle / inner ear)
 * @param {number} lookX   -1..1 horizontal gaze offset
 * @param {object} [opts]  { detail: boolean, outline: number, outlineW: number }
 */
export function drawAnimalHead(g, x, y, r, species, color, light, lookX = 0, opts = {}) {
  const detail = opts.detail ?? r >= 6;
  const ol = opts.outline ?? OUTLINE;
  const olW = opts.outlineW ?? Math.max(1.2, r * 0.2);
  const ex = x + lookX * r * 0.12;

  // --- Ears (behind the face) ---
  if (species === 'bear') {
    for (const s of [-1, 1]) {
      g.circle(x + s * r * 0.68, y - r * 0.68, r * 0.4).fill({ color }).stroke({ width: olW, color: ol });
      if (detail) g.circle(x + s * r * 0.68, y - r * 0.68, r * 0.2).fill({ color: light });
    }
  } else if (species === 'owl') {
    for (const s of [-1, 1]) {
      g.poly([x + s * r * 0.25, y - r * 0.8, x + s * r * 0.85, y - r * 0.55, x + s * r * 0.8, y - r * 1.35])
        .fill({ color }).stroke({ width: olW, color: ol });
    }
  } else {
    const tall = species === 'fox' ? 1.55 : 1.3;
    for (const s of [-1, 1]) {
      g.poly([x + s * r * 0.15, y - r * 0.75, x + s * r * 0.92, y - r * 0.35, x + s * r * 0.72, y - r * tall])
        .fill({ color }).stroke({ width: olW, color: ol });
      if (detail) {
        g.poly([x + s * r * 0.35, y - r * 0.7, x + s * r * 0.78, y - r * 0.48, x + s * r * 0.68, y - r * (tall - 0.28)])
          .fill({ color: species === 'fox' ? 0x1e293b : PINK, alpha: species === 'fox' ? 0.55 : 1 });
      }
    }
  }

  // --- Face ---
  g.circle(x, y, r).fill({ color }).stroke({ width: olW, color: ol });

  if (species === 'fox') {
    // white cheeks / muzzle
    g.ellipse(x, y + r * 0.38, r * 0.72, r * 0.48).fill({ color: 0xffffff });
  } else if (species === 'bear') {
    g.ellipse(x, y + r * 0.32, r * 0.46, r * 0.34).fill({ color: light });
  } else if (species === 'owl') {
    g.circle(x - r * 0.38, y - r * 0.05, r * 0.36).circle(x + r * 0.38, y - r * 0.05, r * 0.36).fill({ color: 0xffffff });
  }

  // --- Eyes ---
  const eyeR = species === 'owl' ? r * 0.18 : r * 0.15;
  const eyeY = species === 'owl' ? y - r * 0.05 : y - r * 0.08;
  const eyeDX = species === 'owl' ? r * 0.38 : r * 0.36;
  g.circle(ex - eyeDX, eyeY, eyeR).circle(ex + eyeDX, eyeY, eyeR).fill({ color: EYE });
  if (detail) {
    g.circle(ex - eyeDX + eyeR * 0.35, eyeY - eyeR * 0.35, eyeR * 0.4)
      .circle(ex + eyeDX + eyeR * 0.35, eyeY - eyeR * 0.35, eyeR * 0.4)
      .fill({ color: 0xffffff });
  }

  // --- Nose / beak ---
  if (species === 'owl') {
    g.poly([x - r * 0.13, y + r * 0.18, x + r * 0.13, y + r * 0.18, x, y + r * 0.45]).fill({ color: 0xf59e0b });
  } else if (detail) {
    const ny = species === 'fox' ? y + r * 0.22 : y + r * 0.2;
    g.ellipse(x, ny, r * 0.13, r * 0.09).fill({ color: species === 'cat' ? PINK : EYE });
    if (species === 'cat' && r >= 14) {
      // whiskers
      for (const s of [-1, 1]) {
        g.moveTo(x + s * r * 0.3, y + r * 0.3).lineTo(x + s * r * 0.95, y + r * 0.22)
          .moveTo(x + s * r * 0.3, y + r * 0.38).lineTo(x + s * r * 0.95, y + r * 0.45)
          .stroke({ width: Math.max(1, r * 0.05), color: 0xffffff, alpha: 0.9 });
      }
    }
  }
}

/**
 * Draw a small fish (used for flags, fish piles and decorations), pointing right.
 */
export function drawFish(g, x, y, len, color, tailWag = 0, outline = 0xffffff) {
  const h = len * 0.5;
  g.poly([
    x + len * 0.25, y,
    x + len * 0.55, y - h * 0.5 + tailWag,
    x + len * 0.55, y + h * 0.5 + tailWag,
  ]).fill({ color }).stroke({ width: 1, color: outline });
  g.ellipse(x - len * 0.05, y, len * 0.38, h * 0.5).fill({ color }).stroke({ width: 1, color: outline });
  g.circle(x - len * 0.25, y - h * 0.08, Math.max(0.8, len * 0.06)).fill({ color: EYE });
}
