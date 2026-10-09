/**
 * MapTerrain System for "Mèo Chiến Đảo"
 * Renders authentic strategy game world cartography (Total War, Civilization, Kingdom Rush style):
 * - Seamless full-bleed oceanic waters with wave crests, windrose, and nautical details (NO artificial boxed-in frames!).
 * - Multi-tiered 3D faceted mountain chains with granite crags, snow caps, and alpine pine foothills.
 * - Detailed wooden harbor docks (`===⚓`) jutting into open ocean water for maritime sea routes.
 * - Fortified stone pass gatehouses with burning torch braziers at mountain pass summits.
 * - Winding cobblestone highways ('land'), rugged passes ('mountain'), and sea shipping lanes ('sea').
 * - Strict graph connectivity: units can only march and attack along valid connecting routes!
 */

import { Container, Graphics } from 'pixi.js';
import { vGrad, arcPath } from '../utils/gfx.js';

export class MapTerrain extends Container {
  constructor() {
    super();

    this.oceanGfx = new Graphics();
    this.waterDetailsGfx = new Graphics();
    this.roadsGfx = new Graphics();
    this.activeRoutesGfx = new Graphics();
    this.mountainsGfx = new Graphics();
    this.routeMarkersContainer = new Container();

    // Distinct Depth Layers to allow GameScene to interleave territories & troops seamlessly:
    // 1. Full-screen Ocean, Waves & Nautical Chart details
    this.bgLayer = new Container();
    this.bgLayer.eventMode = 'none';
    this.bgLayer.addChild(this.oceanGfx, this.waterDetailsGfx);

    // 2. Physical Roads, Mountain Passes, Harbor Docks & Buoys
    this.routesLayer = new Container();
    this.routesLayer.eventMode = 'none';
    this.routesLayer.addChild(this.roadsGfx, this.routeMarkersContainer);

    // 3. Tactical Route Highlighting Beams
    this.activeRoutesLayer = new Container();
    this.activeRoutesLayer.eventMode = 'none';
    this.activeRoutesLayer.addChild(this.activeRoutesGfx);

    // 4. 3D Mountain Ridges & Peaks (drawn above roads so passes cut through natural defiles)
    this.mountainsLayer = new Container();
    this.mountainsLayer.eventMode = 'none';
    this.mountainsLayer.addChild(this.mountainsGfx);

    this.addChild(
      this.bgLayer,
      this.routesLayer,
      this.activeRoutesLayer,
      this.mountainsLayer
    );

    this.routes = [];
    this.activeFromId = null;
    this.animTimer = 0;
    this.territoryMap = new Map();
    this.oceanWidth = 1200;
    this.oceanHeight = 900;
  }

  loadLevelTerrain(levelConfig, territories) {
    this.levelConfig = levelConfig;
    this.territories = territories;
    this.territoryMap.clear();

    for (const t of territories) {
      this.territoryMap.set(t.id, t);
      t.connections = new Set();
    }

    // Build routes
    this.routes = this._buildLevelRoutes(levelConfig, territories);

    // Register connections in Territory objects
    for (const r of this.routes) {
      const t1 = this.territoryMap.get(r.from);
      const t2 = this.territoryMap.get(r.to);
      if (t1 && t2) {
        t1.connections.add(r.to);
        t2.connections.add(r.from);
      }
    }

    // Render visual terrain layers (No rigid frame box!)
    this._renderOcean(this.oceanWidth, this.oceanHeight);
    this._renderRoads();
    this._renderMountains();
  }

  resizeOcean(w, h) {
    this.oceanWidth = Math.max(320, w);
    this.oceanHeight = Math.max(320, h);
    this._renderOcean(this.oceanWidth, this.oceanHeight);
  }

  _buildLevelRoutes(config, territories) {
    if (config.routes && config.routes.length > 0) {
      return config.routes.map(r => ({
        ...r,
        waypoints: r.waypoints || []
      }));
    }

    const routes = [];
    const len = territories.length;

    for (let i = 0; i < len; i++) {
      const t1 = territories[i];
      for (let j = i + 1; j < len; j++) {
        const t2 = territories[j];
        const dist = Math.hypot(t1.x - t2.x, t1.y - t2.y);

        if (dist <= 260) {
          let type = 'land';
          if (config.level === 3 && ((t1.x <= 200 && t2.x >= 350) || (t1.x <= 450 && t2.x >= 600))) {
            type = 'sea';
          } else if (config.level === 5) {
            type = dist > 200 ? 'sea' : 'land';
          } else if (dist > 220) {
            type = 'mountain';
          }

          routes.push({
            from: t1.id,
            to: t2.id,
            type,
            dist
          });
        }
      }
    }

    return routes;
  }

  areConnected(fromId, toId) {
    if (fromId === toId) return false;
    const t = this.territoryMap.get(fromId);
    return t ? t.connections.has(toId) : false;
  }

  getRoute(fromId, toId) {
    return this.routes.find(
      r => (r.from === fromId && r.to === toId) || (r.from === toId && r.to === fromId)
    ) || null;
  }

  highlightRoutes(fromBaseId) {
    this.activeFromId = fromBaseId;
    this._updateActiveRoutesVisual();
  }

  clearRouteHighlight() {
    this.activeFromId = null;
    this.activeRoutesGfx.clear();
  }

  // --- RENDERING PIPELINE ---

  _renderOcean(w = 1200, h = 900) {
    this.oceanGfx.clear();
    this.waterDetailsGfx.clear();

    // 1. Full-bleed vivid tropical ocean (normalized gradient -> real color depth)
    // Bright turquoise shallows at the top fading into rich azure depths.
    const oceanGrad = vGrad([
      { offset: 0, color: 0x22b8e6 },
      { offset: 0.45, color: 0x1498d6 },
      { offset: 1, color: 0x0b6fb8 },
    ]);

    // Draw generous bounds beyond screen margins to guarantee zero seams
    this.oceanGfx
      .rect(-200, -200, w + 400, h + 400)
      .fill({ fill: oceanGrad });

    // Soft light pools for a sunny, glossy water surface
    this.oceanGfx
      .ellipse(w * 0.5, h * 0.42, w * 0.62, h * 0.38)
      .fill({ color: 0x7dd8ff, alpha: 0.16 })
      .ellipse(w * 0.5, h * 0.42, w * 0.38, h * 0.24)
      .fill({ color: 0xa5e8ff, alpha: 0.12 });

    // 2. Gentle Ocean Waves (~) scattered relative to the real screen size
    const waveSeeds = [
      [0.12, 0.16], [0.78, 0.13], [0.9, 0.3], [0.08, 0.42], [0.86, 0.55],
      [0.15, 0.7], [0.72, 0.82], [0.4, 0.9], [0.5, 0.1], [0.3, 0.26], [0.62, 0.68], [0.92, 0.88]
    ];
    for (const [fx, fy] of waveSeeds) {
      const wx = Math.round(w * fx);
      const wy = Math.round(h * fy);
      arcPath(this.waterDetailsGfx, wx, wy, 11, Math.PI, Math.PI * 2)
        .stroke({ width: 2, color: 0xffffff, alpha: 0.35 });
      arcPath(this.waterDetailsGfx, wx + 14, wy + 3, 8, Math.PI, Math.PI * 2)
        .stroke({ width: 1.6, color: 0xe0f7ff, alpha: 0.28 });
    }

    // Compass rose only when there's spare room (desktop / landscape)
    const showCompass = w >= 700;
    const compassX = Math.round(w - 70);
    const compassY = Math.round(h - 110);

    if (!showCompass) return;

    // 4. Decorative Tropical Coral Atoll in Deep Ocean (SW Corner)
    const atollX = 70;
    const atollY = h - 130;
    // Sand spit
    this.waterDetailsGfx
      .ellipse(atollX, atollY, 18, 11)
      .fill({ color: 0xfde68a })
      .stroke({ width: 3, color: 0x7ee8fa, alpha: 0.8 });
    // Palm grove on atoll
    this.waterDetailsGfx
      .circle(atollX - 2, atollY - 1, 5.5)
      .fill({ color: 0x22c55e });
    this.waterDetailsGfx
      .circle(atollX + 5, atollY + 1, 4.5)
      .fill({ color: 0x4ade80 });

    // Decorative Exploration Galleon Silhouette (top-right, below HUD)
    const shipX = w - 90;
    const shipY = 130;
    this.waterDetailsGfx
      // Hull
      .poly([shipX - 10, shipY, shipX + 10, shipY, shipX + 6, shipY + 4, shipX - 8, shipY + 4])
      .fill({ color: 0x7c2d12 })
      // Mast
      .moveTo(shipX, shipY - 12)
      .lineTo(shipX, shipY)
      .stroke({ width: 1.5, color: 0xffffff, alpha: 0.9 })
      // Sails
      .poly([shipX, shipY - 11, shipX + 6, shipY - 6, shipX, shipY - 3])
      .fill({ color: 0xffffff, alpha: 0.95 });

    // 5. Compass Rose (SE Corner)
    const rC = 30;
    this.waterDetailsGfx
      .circle(compassX, compassY, rC)
      .stroke({ width: 2, color: 0xffffff, alpha: 0.55 })
      .circle(compassX, compassY, rC * 0.68)
      .stroke({ width: 1.2, color: 0xffffff, alpha: 0.4 });

    // 8-Point Golden Star
    for (let i = 0; i < 8; i++) {
      const ang = (Math.PI / 4) * i;
      const isCard = i % 2 === 0;
      const len = isCard ? rC * 0.96 : rC * 0.58;
      const tx = compassX + Math.cos(ang) * len;
      const ty = compassY + Math.sin(ang) * len;

      const pAngL = ang - Math.PI / 16;
      const pAngR = ang + Math.PI / 16;
      const wBase = isCard ? 4.5 : 2.5;

      this.waterDetailsGfx
        .poly([
          compassX, compassY,
          compassX + Math.cos(pAngL) * wBase, compassY + Math.sin(pAngL) * wBase,
          tx, ty
        ])
        .fill({ color: isCard ? 0xfde047 : 0xffffff, alpha: 0.85 })
        .poly([
          compassX, compassY,
          compassX + Math.cos(pAngR) * wBase, compassY + Math.sin(pAngR) * wBase,
          tx, ty
        ])
        .fill({ color: isCard ? 0xf59e0b : 0xe0f2fe, alpha: 0.85 });
    }
  }

  _renderRoads() {
    this.roadsGfx.clear();
    this.routeMarkersContainer.removeChildren();

    for (const r of this.routes) {
      const t1 = this.territoryMap.get(r.from);
      const t2 = this.territoryMap.get(r.to);
      if (!t1 || !t2) continue;

      const dx = t2.x - t1.x;
      const dy = t2.y - t1.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 40) continue;

      const dirX = dx / dist;
      const dirY = dy / dist;

      // Truncate at capital base perimeter so roads connect cleanly to gates without penetrating buildings
      const r1 = t1.radius || 30;
      const r2 = t2.radius || 30;
      const pad1 = Math.min(dist * 0.38, Math.max(38, r1 * 1.15));
      const pad2 = Math.min(dist * 0.38, Math.max(38, r2 * 1.15));
      const x1 = t1.x + dirX * pad1;
      const y1 = t1.y + dirY * pad1;
      const x2 = t2.x - dirX * pad2;
      const y2 = t2.y - dirY * pad2;

      const midX = (x1 + x2) * 0.5;
      const midY = (y1 + y2) * 0.5;

      if (r.type === 'sea') {
        // --- MARITIME SHIPPING CHANNEL (Đường biển) ---
        // 1. Coastal Harbor Docks extending into sea water
        this._drawHarborPier(this.roadsGfx, x1, y1, dirX, dirY);
        this._drawHarborPier(this.roadsGfx, x2, y2, -dirX, -dirY);

        // 2. Soft oceanic channel under-glow
        this.roadsGfx
          .moveTo(x1, y1)
          .lineTo(x2, y2)
          .stroke({ width: 7, color: 0x0369a1, alpha: 0.25 });

        // 3. Bright dashed maritime shipping line
        this._drawDashedLine(this.roadsGfx, x1, y1, x2, y2, [9, 6], 3, 0xffffff, 0.9);

        // 4. Floating Nautical Lantern Buoy at midpoint
        const buoy = new Graphics()
          // Wooden float
          .circle(0, 0, 5)
          .fill({ color: 0x78350f })
          .stroke({ width: 1.2, color: 0xfef08a })
          // Glowing lantern beacon
          .circle(0, 0, 2.5)
          .fill({ color: 0xfacc15 });
        buoy.x = midX;
        buoy.y = midY;
        this.routeMarkersContainer.addChild(buoy);

      } else if (r.type === 'mountain') {
        // --- MOUNTAIN PASS (Đường đèo núi) ---
        // 1. Soft trail shadow
        this.roadsGfx
          .moveTo(x1, y1 + 1.5)
          .lineTo(x2, y2 + 1.5)
          .stroke({ width: 5, color: 0x7c2d12, alpha: 0.18 });

        // 2. Amber rugged pass trail
        this._drawDashedLine(this.roadsGfx, x1, y1, x2, y2, [8, 5], 3.2, 0xfff3c4, 1);

        // 3. Fortified Stone Mountain Pass Gatehouse at summit
        const gatehouse = this._createPassGatehouse();
        gatehouse.x = midX;
        gatehouse.y = midY;
        this.routeMarkersContainer.addChild(gatehouse);

      } else {
        // --- OVERLAND HIGHWAY (Đường bộ) ---
        // 1. Soft trail shadow
        this.roadsGfx
          .moveTo(x1, y1 + 1.5)
          .lineTo(x2, y2 + 1.5)
          .stroke({ width: 5, color: 0x1e3a8a, alpha: 0.15 });

        // 2. Clean white dotted trail
        this._drawDashedLine(this.roadsGfx, x1, y1, x2, y2, [8, 6], 3.2, 0xffffff, 0.95);

        // 3. Stone milestone dot at midpoint
        const dot = new Graphics()
          .circle(0, 0, 2.4)
          .fill({ color: 0xffffff, alpha: 0.85 });
        dot.x = midX;
        dot.y = midY;
        this.routeMarkersContainer.addChild(dot);
      }
    }
  }

  _drawHarborPier(gfx, px, py, dirX, dirY) {
    const perpX = -dirY;
    const perpY = dirX;
    const pierLen = 14;
    const pierW = 5.5;

    const pEndX = px + dirX * pierLen;
    const pEndY = py + dirY * pierLen;

    // Timber pier deck extending into water
    const c1x = px + perpX * (pierW * 0.5);
    const c1y = py + perpY * (pierW * 0.5);
    const c2x = pEndX + perpX * (pierW * 0.5);
    const c2y = pEndY + perpY * (pierW * 0.5);
    const c3x = pEndX - perpX * (pierW * 0.5);
    const c3y = pEndY - perpY * (pierW * 0.5);
    const c4x = px - perpX * (pierW * 0.5);
    const c4y = py - perpY * (pierW * 0.5);

    // Pier drop shadow
    gfx.poly([c1x, c1y + 2, c2x, c2y + 2, c3x, c3y + 2, c4x, c4y + 2])
      .fill({ color: 0x021b38, alpha: 0.45 });

    // Wooden timber deck
    gfx.poly([c1x, c1y, c2x, c2y, c3x, c3y, c4x, c4y])
      .fill({ color: 0x78350f })
      .stroke({ width: 1.2, color: 0xb45309 });

    // Wooden Pilings
    gfx.circle(c2x, c2y, 1.8).fill({ color: 0x451a03 });
    gfx.circle(c3x, c3y, 1.8).fill({ color: 0x451a03 });

    // Harbor water ripple foam (circle, NOT arc: arc would chain a stray line from (0,0))
    gfx.circle(pEndX, pEndY, 6)
      .stroke({ width: 1.2, color: 0xffffff, alpha: 0.75 });
  }

  _createPassGatehouse() {
    const gate = new Container();

    const gfx = new Graphics();
    // Shadow
    gfx.ellipse(0, 3, 10, 4).fill({ color: 0x000000, alpha: 0.35 });

    // Stone Arch Base
    gfx.roundRect(-7, -6, 14, 11, 2)
      .fill({ color: 0x334155 })
      .stroke({ width: 1.2, color: 0x64748b });

    // Arched Gateway Opening (tunnel)
    gfx.roundRect(-3, -2, 6, 7, 1.5)
      .fill({ color: 0x0f172a });

    // Left & Right Torch Lanterns
    gfx.circle(-5, -2, 1.8).fill({ color: 0xf59e0b });
    gfx.circle(5, -2, 1.8).fill({ color: 0xf59e0b });

    gate.addChild(gfx);
    return gate;
  }

  _drawDashedLine(gfx, x1, y1, x2, y2, dashArray = [8, 6], width = 2, color = 0xffffff, alpha = 0.8) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    if (dist <= 0) return;

    const dirX = dx / dist;
    const dirY = dy / dist;

    let cur = 0;
    let dashIdx = 0;

    while (cur < dist) {
      const segLen = dashArray[dashIdx % dashArray.length];
      const next = Math.min(dist, cur + segLen);

      if (dashIdx % 2 === 0) {
        gfx.moveTo(x1 + dirX * cur, y1 + dirY * cur)
          .lineTo(x1 + dirX * next, y1 + dirY * next)
          .stroke({ width, color, alpha });
      }

      cur = next;
      dashIdx++;
    }
  }

  _renderMountains() {
    this.mountainsGfx.clear();
    const config = this.levelConfig;
    if (!config) return;

    let mountainList = [];
    if (config.terrain && config.terrain.mountains) {
      mountainList = config.terrain.mountains;
    } else if (config.level === 1) {
      mountainList = [{ x: 400, y: 300, count: 5, scale: 1.2 }];
    }

    for (const m of mountainList) {
      this._drawMountainRange(m.x, m.y, m.count || 4, m.scale || 1.0, !!config.isTransposed);
    }
  }

  _drawMountainRange(cx, cy, count = 4, scale = 1.0, vertical = false) {
    const spacing = (vertical ? 14 : 18) * scale;
    const startOffset = -((count - 1) * spacing) * 0.5;

    for (let i = 0; i < count; i++) {
      const heightVar = 0.85 + Math.sin(i * 1.8) * 0.25;
      const jitter = Math.sin(i * 2.2) * (4 * scale);
      const px = vertical ? cx + jitter : cx + startOffset + i * spacing;
      const py = vertical ? cy + startOffset + i * spacing : cy + jitter;
      this._drawSingleMountainPeak(px, py, scale * heightVar);
    }
  }

  _drawSingleMountainPeak(x, y, scale = 1.0) {
    const w = 24 * scale;
    const h = 26 * scale;

    const apexX = x;
    const apexY = y - h;
    const leftX = x - w * 0.5;
    const rightX = x + w * 0.5;
    const baseY = y + 2;

    // Mountain Ground Drop Shadow
    this.mountainsGfx
      .ellipse(x + 2, baseY, w * 0.6, 5 * scale)
      .fill({ color: 0x021b38, alpha: 0.35 });

    // Sunny Slope (West face)
    this.mountainsGfx
      .poly([apexX, apexY, leftX, baseY, apexX, baseY])
      .fill({ color: 0x78716c })
      .stroke({ width: 0.8, color: 0xa8a29e });

    // Shadowed Granite Slope (East face)
    this.mountainsGfx
      .poly([apexX, apexY, apexX, baseY, rightX, baseY])
      .fill({ color: 0x334155 })
      .stroke({ width: 0.8, color: 0x1e293b });

    // Glistening Snow Cap on Peak
    const snowH = h * 0.38;
    const snowBaseY = apexY + snowH;
    const snowLeftX = apexX - (w * 0.5) * (snowH / h);
    const snowRightX = apexX + (w * 0.5) * (snowH / h);

    this.mountainsGfx
      .poly([apexX, apexY, snowLeftX, snowBaseY, apexX - 2, snowBaseY - 2, apexX, snowBaseY + 1, apexX + 2, snowBaseY - 2, snowRightX, snowBaseY])
      .fill({ color: 0xffffff })
      .stroke({ width: 0.6, color: 0xe0f2fe });

    // Alpine Pine Tree at mountain base
    const pineX = leftX + 4;
    const pineY = baseY;
    this.mountainsGfx
      .poly([pineX, pineY - 8 * scale, pineX - 3.5 * scale, pineY, pineX + 3.5 * scale, pineY])
      .fill({ color: 0x064e3b });
  }

  _updateActiveRoutesVisual() {
    this.activeRoutesGfx.clear();
    if (!this.activeFromId) return;

    const tFrom = this.territoryMap.get(this.activeFromId);
    if (!tFrom) return;

    for (const r of this.routes) {
      if (r.from !== this.activeFromId && r.to !== this.activeFromId) continue;

      const otherId = r.from === this.activeFromId ? r.to : r.from;
      const tOther = this.territoryMap.get(otherId);
      if (!tOther) continue;

      const dx = tOther.x - tFrom.x;
      const dy = tOther.y - tFrom.y;
      const dist = Math.hypot(dx, dy);
      const rFrom = tFrom.radius || 30;
      const rOther = tOther.radius || 30;
      const padFrom = Math.min(dist * 0.38, Math.max(38, rFrom * 1.15));
      const padOther = Math.min(dist * 0.38, Math.max(38, rOther * 1.15));

      const x1 = tFrom.x + dirX * padFrom;
      const y1 = tFrom.y + dirY * padFrom;
      const x2 = tOther.x - dirX * padOther;
      const y2 = tOther.y - dirY * padOther;

      // Glowing active route tactical pulse
      const pulseColor = r.type === 'sea' ? 0x06b6d4 : (r.type === 'mountain' ? 0xf59e0b : 0x38bdf8);

      this.activeRoutesGfx
        .moveTo(x1, y1)
        .lineTo(x2, y2)
        .stroke({ width: 6, color: pulseColor, alpha: 0.45 })
        .moveTo(x1, y1)
        .lineTo(x2, y2)
        .stroke({ width: 2.2, color: 0xffffff, alpha: 0.9 });
    }
  }

  update(deltaSeconds) {
    this.animTimer += deltaSeconds;

    if (this.activeFromId) {
      // Gentle shimmer pulse on active highlighted routes
      const pulseAlpha = 0.35 + Math.sin(this.animTimer * 6) * 0.15;
      this.activeRoutesGfx.alpha = pulseAlpha + 0.5;
    }
  }
}
