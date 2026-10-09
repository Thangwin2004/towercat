/**
 * Shared PixiJS v8 drawing helpers for "Mèo Chiến Đảo".
 *
 * - vGrad(): FillGradient in PixiJS >= 8.7 defaults to textureSpace 'local',
 *   meaning start/end must be NORMALIZED (0..1) relative to the shape bounds.
 *   Passing pixel coordinates (e.g. y: -r .. r) collapses the gradient into a flat,
 *   dull single color. Always build gradients through this helper.
 * - arcPath(): Graphics.arc() continues the *current* path. After a fill()/stroke()
 *   PixiJS re-seeds the path at getLastPoint(), which is (0,0) after shapes like
 *   circle/rect/poly. Calling arc() then draws a stray line from the origin.
 *   Always moveTo() the arc start point first.
 * - getUiScale(): one responsive UI multiplier shared by HUD / menu / dialogs.
 */

import { FillGradient } from 'pixi.js';

/** Vertical (top -> bottom) gradient. stops: array of colors or {offset,color}. */
export function vGrad(...stops) {
  const list = stops.length === 1 && Array.isArray(stops[0]) ? stops[0] : stops;
  const colorStops = list.map((s, i) =>
    typeof s === 'object' ? s : { offset: list.length === 1 ? 0 : i / (list.length - 1), color: s }
  );
  return new FillGradient({
    type: 'linear',
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
    textureSpace: 'local',
    colorStops,
  });
}

/** Diagonal (top-left -> bottom-right) gradient. */
export function dGrad(...stops) {
  const list = stops.length === 1 && Array.isArray(stops[0]) ? stops[0] : stops;
  const colorStops = list.map((s, i) =>
    typeof s === 'object' ? s : { offset: list.length === 1 ? 0 : i / (list.length - 1), color: s }
  );
  return new FillGradient({
    type: 'linear',
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    textureSpace: 'local',
    colorStops,
  });
}

/** Safe arc: starts a fresh sub-path at the arc's first point (no stray origin line). */
export function arcPath(gfx, x, y, r, startAngle, endAngle) {
  gfx.moveTo(x + Math.cos(startAngle) * r, y + Math.sin(startAngle) * r);
  gfx.arc(x, y, r, startAngle, endAngle);
  return gfx;
}

/**
 * Responsive UI multiplier. Reference design: 390 x 720 portrait phone.
 * Never shrinks below 0.9 (keeps touch targets >= 40px), grows up to 1.35 on big screens.
 */
export function getUiScale(width, height) {
  const s = Math.min(width / 390, height / 720);
  return Math.max(0.9, Math.min(1.35, s));
}
