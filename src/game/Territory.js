/**
 * Territorial Province Node & Living 3D Capital Settlement
 * Represents an authentic strategy game territorial province (Total War / Civilization style):
 * - Lush living terrain: golden beaches, fertile green grasslands, and topographic contours.
 * - Faction realm overlay: luminous colored borders with soft inner glow and translucent wash.
 * - Dense living forest groves: 3D shaded deciduous oak trees, alpine pines, and beach palms.
 * - Living 3D settlement architecture: stone citadels with watchtowers & braziers, timber strongholds, thatched tribal villages.
 * - Animated fluttering silk war-banner in faction colors.
 * - High-contrast tribal troop count shield badge with production progress ring.
 */

import { Container, Graphics, Text, Polygon } from 'pixi.js';
import { FACTIONS, BASE_TYPES } from './MapConfig.js';
import { createSvgIcon } from '../ui/SvgIcons.js';
import { drawAnimalHead, drawFish } from './AnimalArt.js';

// Troop thresholds for the evolving settlement (camp -> village -> fort -> castle -> grand citadel)
const TIER_THRESHOLDS = [0, 8, 18, 30, 55];
const BUILDING_SCALE = 1.4; // settlements drawn big & readable on phones
const TIER_HYSTERESIS = 2; // avoid flicker when units oscillate around a threshold
const OL = 0x334155; // soft outline colour for buildings

export class Territory extends Container {
  constructor(config) {
    super();
    this.id = config.id;
    this.x = config.x;
    this.y = config.y;
    this.owner = config.owner; // 'player', 'enemy_red', 'enemy_gold', 'enemy_purple', 'neutral'
    this.units = config.units || 15;
    this.baseType = BASE_TYPES[config.type || 'village'];
    this.radius = this.baseType.radius;
    this.maxUnits = this.baseType.maxUnits;
    this.productionRate = this.baseType.productionRate;
    this.defense = this.baseType.defense;

    this.shieldCharges = 0;
    this.isSelected = false;
    this.isHoveredTarget = false;
    this.underAttackTimer = 0;
    this.growthAccumulator = 0;
    this.shieldAngle = 0;
    this.captureFlashTimer = 0;
    this.flagTimer = Math.random() * 10;
    this.fireTimer = Math.random() * 10;

    // Territorial Province Polygon
    this.polygon = config.polygon || [];
    this.localPoints = [];
    this.flatLocal = [];

    // 1. Expansive Living Province Terrain & Forest Layers
    this.provinceCoastGfx = new Graphics();
    this.provinceLandGfx = new Graphics();
    this.provinceTreesGfx = new Graphics();
    this.provinceBorderGfx = new Graphics();
    this.provinceFlashGfx = new Graphics();

    // 2. Living 3D Settlement Capital (Fortress ramparts, towers, campfires & war-flags)
    this.capitalContainer = new Container();
    this.buildingContainer = new Container(); // pops when the settlement evolves
    this.buildingContainer.y = 6;
    this.buildingContainer.scale.set(BUILDING_SCALE);
    this.settlementGfx = new Graphics();
    this.flagGfx = new Graphics();
    this.fireGfx = new Graphics();
    this.tier = -1;
    this._popT = 0;
    this._flagBase = { x: 0, y: -30 };

    // 3. Troop Count Badge & Production Arc
    this.badgeContainer = new Container();
    this.crestShadowGfx = new Graphics();
    this.crestAuraGfx = new Graphics();
    this.crestBodyGfx = new Graphics();
    this.progressGfx = new Graphics();
    this.attackPulseGfx = new Graphics();
    this.shieldGfx = new Graphics();

    // High-contrast, bold troop count label
    this.unitText = new Text({
      text: String(Math.floor(this.units)),
      style: {
        fontFamily: '"Be Vietnam Pro", sans-serif',
        fontSize: 17,
        fontWeight: '900',
        fill: 0xffffff,
        align: 'center',
        dropShadow: {
          alpha: 0.45,
          angle: Math.PI / 2,
          blur: 1.5,
          color: 0x0f172a,
          distance: 1.2,
        },
      }
    });
    this.unitText.anchor.set(0.5);
    this.unitText.y = 1;

    // Classification Crest Badge (Crown for Citadel, Shield for Stronghold)
    this.crestBadge = new Container();
    this.crestBadge.y = -22;

    if (this.baseType.type === 'citadel') {
      const crown = createSvgIcon('crown', 15);
      this.crestBadge.addChild(crown);
    } else if (this.baseType.type === 'stronghold') {
      const shield = createSvgIcon('shield', 13);
      this.crestBadge.addChild(shield);
    }

    this.badgeContainer.addChild(
      this.crestShadowGfx,
      this.crestAuraGfx,
      this.attackPulseGfx,
      this.crestBodyGfx,
      this.progressGfx,
      this.unitText,
      this.crestBadge,
      this.shieldGfx
    );

    // Troop badge sits cleanly in front of the building's foot
    this.badgeContainer.y = 25;

    this.buildingContainer.addChild(this.settlementGfx, this.fireGfx, this.flagGfx);
    this.capitalContainer.addChild(
      this.buildingContainer,
      this.badgeContainer
    );

    this.addChild(
      this.provinceCoastGfx,
      this.provinceLandGfx,
      this.provinceTreesGfx,
      this.provinceBorderGfx,
      this.provinceFlashGfx,
      this.capitalContainer
    );

    this.eventMode = 'static';
    this.cursor = 'pointer';

    if (config.polygon && config.polygon.length >= 3) {
      this.setPolygon(config.polygon);
    } else {
      this.redraw();
    }
  }

  setPolygon(polyPoints) {
    this.polygon = polyPoints;
    this.localPoints = polyPoints.map(p => [p[0] - this.x, p[1] - this.y]);
    this.flatLocal = this.localPoints.flatMap(p => p);

    if (this.flatLocal.length >= 6) {
      this.hitArea = new Polygon(this.flatLocal);
    }

    this.redraw();
  }

  /**
   * Counter-scale the settlement + troop badge when the whole map is scaled down
   * (small phones), so numbers never shrink below a readable size.
   */
  setDisplayScale(s = 1) {
    this.capitalContainer.scale.set(s);
  }

  containsPoint(gx, gy) {
    const lx = gx - this.x;
    const ly = gy - this.y;
    if (this.hitArea && typeof this.hitArea.contains === 'function') {
      return this.hitArea.contains(lx, ly);
    }
    return Math.hypot(lx, ly) <= 32;
  }

  _isLocalPointInPoly(lx, ly) {
    if (!this.localPoints || this.localPoints.length < 3) return false;
    let inside = false;
    const len = this.localPoints.length;
    for (let i = 0, j = len - 1; i < len; j = i++) {
      const xi = this.localPoints[i][0], yi = this.localPoints[i][1];
      const xj = this.localPoints[j][0], yj = this.localPoints[j][1];
      const intersect = ((yi > ly) !== (yj > ly)) &&
        (lx < ((xj - xi) * (ly - yi)) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  redraw() {
    const faction = FACTIONS[this.owner] || FACTIONS.neutral;

    // --- 1. PROVINCE LANDMASS & NATURAL TERRAIN BIOME ---
    this.provinceCoastGfx.clear();
    this.provinceLandGfx.clear();
    this.provinceBorderGfx.clear();

    if (this.flatLocal.length >= 6) {
      const landColor = faction.landColorHex ?? 0x7ed957;
      const landLight = faction.landLightHex ?? 0xa8ec85;

      // (1) Island base (rendered in GameScene's shared coastLayer, beneath ALL lands):
      //     shallow-water halo -> earthy cliff (offset down = 3D thickness) -> sand lip -> foam
      const cliff = this.flatLocal.map((v, i) => (i % 2 === 1 ? v + 9 : v));
      const lip = this.flatLocal.map((v, i) => (i % 2 === 1 ? v + 4 : v));
      this.provinceCoastGfx
        .poly(cliff)
        .stroke({ width: 26, color: 0x7fe3ff, alpha: 0.28 })
        .poly(cliff)
        .stroke({ width: 12, color: 0xb6f1ff, alpha: 0.5 })
        .poly(cliff)
        .fill({ color: 0xa8692a })
        .stroke({ width: 3, color: 0xffffff, alpha: 0.85 })
        .poly(lip)
        .fill({ color: 0xf5cf7a });

      // (2) Vivid faction realm fill (solid, bright -> instantly readable ownership)
      this.provinceLandGfx
        .poly(this.flatLocal)
        .fill({ color: landColor, alpha: 1 });

      // (b) Soft sunlit highlight around the capital
      this.provinceLandGfx
        .circle(0, -4, 62)
        .fill({ color: landLight, alpha: 0.4 });

      // (c) Selection wash
      if (this.isSelected) {
        this.provinceLandGfx
          .poly(this.flatLocal)
          .fill({ color: 0xffffff, alpha: 0.18 });
      }

      // (d) Borders
      if (this.isSelected) {
        this.provinceBorderGfx
          .poly(this.flatLocal)
          .stroke({ width: 12, color: 0xffffff, alpha: 0.35 })
          .poly(this.flatLocal)
          .stroke({ width: 4.5, color: 0xffffff, alpha: 1 });
      } else if (this.isHoveredTarget) {
        this.provinceBorderGfx
          .poly(this.flatLocal)
          .stroke({ width: 12, color: 0xfde047, alpha: 0.45 })
          .poly(this.flatLocal)
          .stroke({ width: 4.5, color: 0xfacc15, alpha: 1 });
      } else {
        // Clean white province seam (State.io style)
        this.provinceBorderGfx
          .poly(this.flatLocal)
          .stroke({ width: 3, color: 0xffffff, alpha: 0.9 });
      }
    }

    // --- 2. DENSE LIVING FOREST GROVES & VEGETATION ---
    this._renderTrees();

    // --- 3. LIVING 3D SETTLEMENT CAPITAL ARCHITECTURE ---
    this._renderSettlement(faction);
    this._renderFlag(faction);
    this._renderCampfires();

    // --- 4. TROOP COUNT CREST BADGE (faction-colored pill, auto-width) ---
    this.unitText.text = String(Math.floor(this.units));
    this._drawBadge(faction);
    this._renderShield();
  }

  _drawBadge(faction = FACTIONS[this.owner] || FACTIONS.neutral) {
    const cw = Math.max(40, Math.ceil(this.unitText.width) + 22);
    const ch = 27;
    const cr = ch / 2;
    if (this._badgeW === cw && this._badgeKey === `${this.owner}|${this.isSelected}|${this.isHoveredTarget}`) return;
    this._badgeW = cw;
    this._badgeKey = `${this.owner}|${this.isSelected}|${this.isHoveredTarget}`;
    // Crown / shield crest tucked on the left end of the pill
    this.crestBadge.x = -cw / 2 - 1;
    this.crestBadge.y = -ch / 2 + 2;

    this.crestShadowGfx.clear()
      .roundRect(-cw / 2, -ch / 2 + 3, cw, ch, cr)
      .fill({ color: faction.shadowColorHex ?? 0x0f172a, alpha: 0.8 });

    this.crestAuraGfx.clear();
    if (this.isSelected || this.isHoveredTarget) {
      this.crestAuraGfx
        .roundRect(-cw / 2 - 4, -ch / 2 - 4, cw + 8, ch + 8, cr + 4)
        .fill({ color: this.isSelected ? 0xffffff : 0xfacc15, alpha: 0.55 });
    }

    const bodyColor = this.owner === 'neutral' ? 0x64748b : faction.colorHex;
    this.crestBodyGfx.clear()
      .roundRect(-cw / 2, -ch / 2, cw, ch, cr)
      .fill({ color: bodyColor })
      .stroke({ width: 2.5, color: 0xffffff })
      .roundRect(-cw / 2 + 5, -ch / 2 + 3, cw - 10, ch * 0.32, ch * 0.16)
      .fill({ color: 0xffffff, alpha: 0.25 });
  }

  _renderTrees() {
    this.provinceTreesGfx.clear();
    if (!this.localPoints || this.localPoints.length < 3) return;

    // Dense deterministic forest grove candidates across the province
    const candidates = [
      [-62, -42], [-45, -55], [52, -48], [65, -35],
      [-58, 38], [-42, 52], [55, 42], [42, 58],
      [-32, -68], [28, -65], [-35, 65], [32, 65],
      [-82, 0], [78, -5], [5, -78], [-5, 76],
      [-72, -22], [68, 18], [-22, -82], [18, 78],
      [-52, 12], [48, -12], [-18, 55], [22, -52]
    ];

    for (let c = 0; c < candidates.length; c++) {
      if (c % 3 === 2) continue; // lighter, airier forest (less visual noise)
      const [cx, cy] = candidates[c];
      const distFromCenter = Math.hypot(cx, cy);
      if (distFromCenter < 44) continue; // Keep central settlement & badge clear
      if (Math.abs(cx) < 64 && cy > -120 && cy < 40) continue; // tall evolving building footprint

      if (!this._isLocalPointInPoly(cx, cy)) continue;
      // keep trees off the coastline / seams
      if (!this._isLocalPointInPoly(cx * 1.12, cy * 1.12)) continue;

      const isPine = this.baseType.type === 'stronghold' || Math.abs(cy) > 50;
      const isPalm = Math.abs(cx) > 65 && Math.abs(cy) > 35;
      const treeScale = 0.95 + (c % 4) * 0.08;

      if (isPalm) {
        this._drawPalmTree(this.provinceTreesGfx, cx, cy, treeScale);
      } else if (isPine) {
        this._drawPineTree(this.provinceTreesGfx, cx, cy, treeScale);
      } else {
        this._drawDeciduousGrove(this.provinceTreesGfx, cx, cy, treeScale);
      }
    }
  }

  _drawDeciduousGrove(gfx, x, y, scale = 1.0) {
    // Drop shadow
    gfx.ellipse(x, y + 3, 8 * scale, 3.5 * scale).fill({ color: 0x14532d, alpha: 0.22 });
    // Wooden Trunk
    gfx.rect(x - 1, y - 1, 2, 4 * scale).fill({ color: 0x92400e });
    // Round cartoon canopy (shadow -> body -> highlight)
    gfx.circle(x, y - 5 * scale, 6 * scale).fill({ color: 0x16a34a });
    gfx.circle(x - 1.5 * scale, y - 6.5 * scale, 4.2 * scale).fill({ color: 0x4ade80 });
    gfx.circle(x - 2.5 * scale, y - 8 * scale, 1.8 * scale).fill({ color: 0xbbf7d0, alpha: 0.9 });
  }

  _drawPineTree(gfx, x, y, scale = 1.0) {
    // Drop shadow
    gfx.ellipse(x, y + 2, 6 * scale, 3 * scale).fill({ color: 0x14532d, alpha: 0.22 });
    // Trunk
    gfx.rect(x - 0.8, y - 1, 1.6, 3 * scale).fill({ color: 0x78350f });
    // Pine Tiers (fresh greens, no near-black)
    gfx.poly([x, y - 9 * scale, x - 4.8 * scale, y, x + 4.8 * scale, y]).fill({ color: 0x15803d });
    gfx.poly([x, y - 13 * scale, x - 3.8 * scale, y - 4 * scale, x + 3.8 * scale, y - 4 * scale]).fill({ color: 0x22a34a });
    gfx.poly([x, y - 16 * scale, x - 2.5 * scale, y - 8 * scale, x + 2.5 * scale, y - 8 * scale]).fill({ color: 0x4ade80 });
  }

  _drawPalmTree(gfx, x, y, scale = 1.0) {
    // Drop shadow
    gfx.ellipse(x, y + 2, 6 * scale, 3 * scale).fill({ color: 0x051d3b, alpha: 0.25 });
    // Slender Curved Trunk
    gfx.poly([x - 1, y, x - 2, y - 8 * scale, x + 1, y - 8 * scale, x + 1, y]).fill({ color: 0xb45309 });
    // Palm Fronds
    const crownX = x - 0.5;
    const crownY = y - 8 * scale;
    gfx.poly([crownX, crownY, crownX - 6 * scale, crownY - 3 * scale, crownX - 4 * scale, crownY + 2 * scale]).fill({ color: 0x16a34a });
    gfx.poly([crownX, crownY, crownX + 6 * scale, crownY - 3 * scale, crownX + 4 * scale, crownY + 2 * scale]).fill({ color: 0x22c55e });
    gfx.poly([crownX, crownY, crownX, crownY - 7 * scale, crownX + 2 * scale, crownY - 3 * scale]).fill({ color: 0x4ade80 });
  }

  _computeTier() {
    const u = this.units;
    let t = 0;
    for (let i = 1; i < TIER_THRESHOLDS.length; i++) if (u >= TIER_THRESHOLDS[i]) t = i;
    if (this.tier < 0 || t >= this.tier) return t;
    // Downgrade only once clearly below the current tier's threshold
    return u < TIER_THRESHOLDS[this.tier] - TIER_HYSTERESIS ? t : this.tier;
  }

  _roofColors(faction) {
    if (this.owner === 'neutral') return [0xb7793a, 0xe0a96a];
    return [faction.colorHex, faction.landLightHex ?? 0xffffff];
  }

  _species(faction) {
    return this.owner === 'neutral' ? null : (faction.species || 'cat');
  }

  // --- Animal-head roofs: ears behind the roof, eyes painted on the roof ---
  // Roof triangle: tip (x, tipY), half base hb, height H (base at tipY + H)
  _roofEars(g, x, tipY, hb, H, species, roof) {
    if (!species) return;
    const len = Math.hypot(hb, H);
    const size = Math.max(5, hb * 0.62);
    for (const s of [-1, 1]) {
      const px = x + s * hb * 0.32;
      const py = tipY + H * 0.32;
      const dx = (s * hb) / len, dy = H / len;     // along slope (tip -> base)
      const nx = (s * H) / len, ny = -hb / len;    // outward normal
      if (species === 'bear') {
        g.circle(px + nx * size * 0.45, py + ny * size * 0.45, size * 0.5).fill({ color: roof }).stroke({ width: 1.5, color: OL });
        g.circle(px + nx * size * 0.45, py + ny * size * 0.45, size * 0.24).fill({ color: 0xfde68a });
        continue;
      }
      const reach = species === 'fox' ? 1.35 : species === 'owl' ? 1.15 : 1.0;
      const half = species === 'owl' ? size * 0.3 : size * 0.5;
      const ax = px + nx * size * reach - dx * size * 0.15;
      const ay = py + ny * size * reach - dy * size * 0.15;
      g.poly([px - dx * half, py - dy * half, px + dx * half, py + dy * half, ax, ay])
        .fill({ color: roof }).stroke({ width: 1.5, color: OL });
      if (species !== 'owl') {
        const ix = px + nx * size * reach * 0.55, iy = py + ny * size * reach * 0.55;
        g.poly([px - dx * half * 0.5, py - dy * half * 0.5, px + dx * half * 0.5, py + dy * half * 0.5, ix, iy])
          .fill({ color: species === 'fox' ? 0xffffff : 0xfda4af });
      }
    }
  }

  _roofFace(g, x, tipY, hb, H, species) {
    if (!species) return;
    const ey = tipY + H * 0.66;
    const ex = hb * 0.34;
    const er = Math.max(1.6, hb * 0.13);
    if (species === 'owl') {
      g.circle(x - ex, ey, er * 1.7).circle(x + ex, ey, er * 1.7).fill({ color: 0xffffff });
      g.poly([x - er * 0.7, ey + er * 0.6, x + er * 0.7, ey + er * 0.6, x, ey + er * 2]).fill({ color: 0xf59e0b });
    }
    g.circle(x - ex, ey, er).circle(x + ex, ey, er).fill({ color: 0x1e293b });
    g.circle(x - ex + er * 0.35, ey - er * 0.35, er * 0.4).circle(x + ex + er * 0.35, ey - er * 0.35, er * 0.4).fill({ color: 0xffffff });
    if (species === 'cat' || species === 'bear') {
      g.ellipse(x, ey + er * 1.2, er * 0.6, er * 0.45).fill({ color: species === 'cat' ? 0xfda4af : 0x1e293b });
    } else if (species === 'fox') {
      g.ellipse(x, ey + er * 1.5, hb * 0.35, er * 1.1).fill({ color: 0xffffff, alpha: 0.9 });
      g.circle(x, ey + er * 1.1, er * 0.5).fill({ color: 0x1e293b });
    }
  }

  // --- Building primitives (ground at y = by, everything grows upward) ---
  _hut(g, x, by, r) {
    g.roundRect(x - r, by - r * 0.95, r * 2, r * 0.95, 3).fill({ color: 0xe8b56b }).stroke({ width: 1.5, color: OL });
    g.roundRect(x - r * 0.28, by - r * 0.6, r * 0.56, r * 0.6, r * 0.28).fill({ color: 0x7c2d12 });
    const ty = by - r * 0.85;
    g.poly([x - r - 4, ty, x + r + 4, ty, x, ty - r * 1.5]).fill({ color: 0xfbbf24 }).stroke({ width: 1.5, color: OL });
    g.poly([x - r - 1, ty - 1, x - 1, ty - 1, x, ty - r * 1.5 + 3]).fill({ color: 0xfde68a, alpha: 0.8 });
    return ty - r * 1.5;
  }

  /** Cardboard box with an animal peeking out (tier 0 "nhà" of every pet army) */
  _box(g, x, by, w, h, species, faction) {
    const top = by - h;
    if (species) {
      drawAnimalHead(g, x, top - 2, w * 0.3, species, faction.colorHex, faction.lightColorHex ?? 0xffffff, 0,
        { detail: true, outline: OL, outlineW: 1.4 });
    }
    // open flaps
    g.poly([x - w / 2, top, x - w / 2 - 6, top - 7, x - w * 0.1, top - 6, x - w * 0.05, top]).fill({ color: 0xc8935a }).stroke({ width: 1.3, color: OL });
    g.poly([x + w / 2, top, x + w / 2 + 6, top - 7, x + w * 0.1, top - 6, x + w * 0.05, top]).fill({ color: 0xc8935a }).stroke({ width: 1.3, color: OL });
    // box body
    g.rect(x - w / 2, top, w, h).fill({ color: 0xe0ac6e });
    g.rect(x + w * 0.15, top, w * 0.35, h).fill({ color: 0xcf9a5c });
    g.rect(x - w / 2, top, w, h).stroke({ width: 1.5, color: OL });
    g.rect(x - w * 0.08, top, w * 0.16, h * 0.45).fill({ color: 0xf5deb3, alpha: 0.9 }); // tape
    drawFish(g, x - w * 0.12, by - h * 0.4, w * 0.32, 0x60a5fa, 0, OL);
    return top - (species ? w * 0.3 * 2.2 : 8);
  }

  _house(g, x, by, w, h, roof, roofL, species) {
    g.rect(x - w / 2, by - h, w, h).fill({ color: 0xfde2b3 });
    g.rect(x + w * 0.1, by - h, w * 0.4, h).fill({ color: 0xf2c27e });
    g.rect(x - w / 2, by - h, w, h).stroke({ width: 1.5, color: OL });
    // round pet door
    g.circle(x, by - h * 0.32, w * 0.16).fill({ color: 0x7c2d12 }).stroke({ width: 1.2, color: OL });
    g.rect(x - w * 0.16, by - h * 0.32, w * 0.32, h * 0.32).fill({ color: 0x7c2d12 });
    const ry = by - h;
    const H = h * 0.95;
    const hb = w / 2 + 5;
    const tip = ry - H;
    this._roofEars(g, x, tip, hb, H, species, roof);
    g.poly([x - hb, ry + 1, x + hb, ry + 1, x, tip]).fill({ color: roof }).stroke({ width: 1.5, color: OL });
    g.poly([x - hb + 3, ry - 0.5, x - 1, ry - 0.5, x, tip + 3]).fill({ color: roofL, alpha: 0.45 });
    this._roofFace(g, x, tip, hb, H, species);
    return tip;
  }

  _tower(g, x, by, w, h, roof, roofL, species, gold = false) {
    g.rect(x - w / 2, by - h, w, h).fill({ color: 0xf8fafc });
    g.rect(x + w * 0.08, by - h, w * 0.42, h).fill({ color: 0xcbd5e1 });
    g.rect(x - w / 2, by - h, w, h).stroke({ width: 1.6, color: OL });
    // brick hints
    g.rect(x - w * 0.36, by - h * 0.3, w * 0.22, 2).fill({ color: 0xcbd5e1 });
    g.rect(x + w * 0.14, by - h * 0.18, w * 0.22, 2).fill({ color: 0x94a3b8 });
    // paw-print window
    const wy = by - h * 0.55;
    const pr = w * 0.11;
    g.circle(x, wy + pr * 0.6, pr * 1.25)
      .circle(x - pr * 1.3, wy - pr * 0.6, pr * 0.6)
      .circle(x, wy - pr * 1.2, pr * 0.6)
      .circle(x + pr * 1.3, wy - pr * 0.6, pr * 0.6)
      .fill({ color: 0x1e3a5f });
    // crenel band
    const cy = by - h;
    g.rect(x - w / 2 - 2.5, cy - 5, w + 5, 6).fill({ color: 0xe2e8f0 }).stroke({ width: 1.5, color: OL });
    // animal-head cone roof
    const hb = w / 2 + 4.5;
    const base = cy - 4;
    const tip = cy - 5 - w * 1.05;
    const H = base - tip;
    this._roofEars(g, x, tip, hb, H, species, roof);
    g.poly([x - hb, base, x + hb, base, x, tip])
      .fill({ color: roof })
      .stroke({ width: gold ? 2.2 : 1.6, color: gold ? 0xfacc15 : OL });
    g.poly([x - hb + 3, base - 1, x - 1, base - 1, x, tip + 4]).fill({ color: roofL, alpha: 0.45 });
    this._roofFace(g, x, tip, hb, H, species);
    return tip;
  }

  _stoneWall(g, x0, x1, by, h) {
    g.rect(x0, by - h, x1 - x0, h).fill({ color: 0xe2e8f0 });
    g.rect(x0, by - h * 0.35, x1 - x0, h * 0.35).fill({ color: 0xcbd5e1 });
    g.rect(x0, by - h, x1 - x0, h).stroke({ width: 1.6, color: OL });
    for (let x = x0 + 2; x + 5 <= x1; x += 9) {
      g.rect(x, by - h - 4.5, 5.5, 4.5).fill({ color: 0xe2e8f0 }).stroke({ width: 1.2, color: OL });
    }
  }

  _palisade(g, x0, x1, by, h) {
    for (let x = x0; x < x1; x += 6) {
      g.poly([x, by, x, by - h, x + 3, by - h - 4, x + 6, by - h, x + 6, by])
        .fill({ color: (x / 6) % 2 ? 0xd97706 : 0xb45309 })
        .stroke({ width: 1.2, color: 0x7c2d12 });
    }
  }

  _gate(g, x, by, w, h) {
    g.roundRect(x - w / 2, by - h, w, h, w / 2).fill({ color: 0x92400e }).stroke({ width: 1.5, color: OL });
    g.rect(x - 0.6, by - h + 3, 1.2, h - 3).fill({ color: 0x5b2a0a });
  }

  _fishPile(g, x, by) {
    drawFish(g, x - 4, by - 2, 11, 0x60a5fa, 0, OL);
    drawFish(g, x + 4, by - 1, 10, 0xf472b6, 0, OL);
    drawFish(g, x, by - 7, 10, 0xfbbf24, 0, OL);
  }

  _renderSettlement(faction) {
    const g = this.settlementGfx;
    g.clear();
    this.tier = this._computeTier();
    const [roof, roofL] = this._roofColors(faction);
    const sp = this._species(faction);
    const tier = this.tier;

    // Soft ground shadow scales with the tier
    const footW = [26, 32, 38, 44, 50][tier];
    g.ellipse(0, 2, footW, 9).fill({ color: 0x0b3d2e, alpha: 0.22 });

    let top;
    if (tier === 0) {
      // Camp: cardboard box with a peeking animal + a little fish stash (wild islands keep a hut)
      if (sp) {
        top = this._box(g, -5, 0, 26, 16, sp, faction);
        this._fishPile(g, 16, 2);
        this._flagBase = { x: 4, y: -17 };
      } else {
        top = this._hut(g, -13, 0, 9);
        this._hut(g, 13, 2, 8);
        this._flagBase = { x: -13, y: top + 2 };
      }
    } else if (tier === 1) {
      // Village: pet house with an animal-head roof + fish stash
      this._fishPile(g, 20, 2);
      top = this._house(g, -4, 0, 26, 17, roof, roofL, sp);
      this._palisade(g, -30, -18, 4, 8);
      this._flagBase = { x: -4, y: top + 2 };
    } else if (tier === 2) {
      // Fort: paw-window tower behind a wooden fence
      top = this._tower(g, 0, -2, 17, 30, roof, roofL, sp);
      this._house(g, -22, 0, 14, 10, roof, roofL, null);
      this._palisade(g, -30, 30, 6, 12);
      this._gate(g, 0, 6, 11, 12);
      this._flagBase = { x: 0, y: top + 2 };
    } else {
      const grand = tier === 4;
      const half = grand ? 38 : 32;
      const keepW = grand ? 23 : 19;
      const keepH = grand ? 44 : 36;
      const sideW = grand ? 14 : 12;
      const sideH = grand ? 32 : 25;
      // Keep (back) -> curtain wall (front) -> corner towers (front-most)
      top = this._tower(g, 0, -4, keepW, keepH, roof, roofL, sp, grand);
      if (grand) {
        this._tower(g, -15, -2, 11, 24, roof, roofL, null);
        this._tower(g, 15, -2, 11, 24, roof, roofL, null);
      }
      this._stoneWall(g, -half + 4, half - 4, 6, grand ? 18 : 15);
      this._gate(g, 0, 6, 12, 13);
      this._tower(g, -half, 8, sideW, sideH, roof, roofL, null);
      this._tower(g, half, 8, sideW, sideH, roof, roofL, null);
      if (grand) {
        // golden crown on the keep
        g.poly([-7, top + 1, -7, top - 6, -3.5, top - 2, 0, top - 8, 3.5, top - 2, 7, top - 6, 7, top + 1])
          .fill({ color: 0xfacc15 }).stroke({ width: 1.2, color: 0xb45309 });
        top -= 8;
      }
      this._flagBase = { x: 0, y: top + 2 };
    }
  }

  _renderFlag(faction) {
    const g = this.flagGfx;
    g.clear();
    const { x: px, y: py } = this._flagBase;
    const poleH = 16;
    const topY = py - poleH;

    g.moveTo(px, py).lineTo(px, topY).stroke({ width: 2, color: 0x78350f });
    g.circle(px, topY, 2.4).fill({ color: 0xfacc15 });

    // Fish-shaped windsock banner in faction colour (tail wags)
    const wag = Math.sin(this.flagTimer * 5) * 2.2;
    const color = faction.troopColor || faction.colorHex;
    drawFish(g, px + 9, topY + 5 + wag * 0.25, 17, color, wag, 0xffffff);
  }

  _renderCampfires() {
    const g = this.fireGfx;
    g.clear();
    const flame = (bx, by, s) => {
      const f = Math.sin(this.fireTimer * 11 + bx) * 1.6;
      g.poly([bx - 3.2 * s, by, bx + 3.2 * s, by, bx, by - 9 * s + f]).fill({ color: 0xf97316 });
      g.poly([bx - 1.6 * s, by, bx + 1.6 * s, by, bx, by - 6 * s + f]).fill({ color: 0xfef08a });
    };
    if (this.tier === 4) {
      for (const bx of [-25, 25]) {
        g.rect(bx - 1.2, -6, 2.4, 8).fill({ color: 0x475569 });
        g.ellipse(bx, -6, 4, 1.8).fill({ color: 0x334155 });
        flame(bx, -6.5, 0.85);
      }
    }
  }

  _renderShield() {
    this.shieldGfx.clear();
    if (this.shieldCharges <= 0) return;

    const r = 26;
    const numShields = Math.min(3, this.shieldCharges);

    for (let i = 0; i < numShields; i++) {
      const angle = this.shieldAngle + (i * (Math.PI * 2 / numShields));
      const sx = Math.cos(angle) * r;
      const sy = Math.sin(angle) * (r * 0.75);

      this.shieldGfx
        .circle(sx, sy, 5.5)
        .fill({ color: 0x06b6d4, alpha: 0.85 })
        .stroke({ width: 1.5, color: 0xffffff });
    }
  }

  setSelected(selected) {
    if (this.isSelected === selected) return;
    this.isSelected = selected;
    this.redraw();
  }

  setHoveredTarget(hovered) {
    if (this.isHoveredTarget === hovered) return;
    this.isHoveredTarget = hovered;
    this.redraw();
  }

  addShield(charges = 1) {
    this.shieldCharges = Math.min(3, this.shieldCharges + charges);
    this._renderShield();
  }

  dispatchTroops(percentage = 0.5) {
    if (this.units <= 1) return 0;
    const sendCount = Math.floor(this.units * percentage);
    const actualSend = Math.min(sendCount, Math.floor(this.units - 1));
    if (actualSend <= 0) return 0;

    this.units -= actualSend;
    this.unitText.text = String(Math.floor(this.units));
    return actualSend;
  }

  receiveTroop(attackingFaction) {
    if (attackingFaction === this.owner) {
      if (this.units < this.maxUnits) {
        this.units += 1;
        this.unitText.text = String(Math.floor(this.units));
      }
      return { captured: false, sameOwner: true };
    }

    if (this.shieldCharges > 0) {
      this.shieldCharges -= 1;
      this._renderShield();
      return { captured: false, shielded: true };
    }

    const effectiveDamage = 1.0 / this.defense;
    this.units -= effectiveDamage;
    this.underAttackTimer = 0.5;

    if (this.units <= 0) {
      this.owner = attackingFaction;
      this.units = 2;
      this.captureFlashTimer = 0.5;
      this.redraw();
      return { captured: true, newOwner: attackingFaction };
    }

    this.unitText.text = String(Math.floor(Math.max(1, this.units)));
    return { captured: false, damaged: true };
  }

  update(deltaSeconds) {
    this.flagTimer += deltaSeconds;
    this.fireTimer += deltaSeconds;

    // Animate waving war-banner
    const faction = FACTIONS[this.owner] || FACTIONS.neutral;

    // Evolve the settlement when the garrison crosses a tier threshold
    const newTier = this._computeTier();
    if (newTier !== this.tier) {
      const grew = newTier > this.tier;
      this._renderSettlement(faction);
      this._popT = grew ? 0.45 : 0.3;
      this._popGrow = grew;
    }
    if (this._popT > 0) {
      this._popT = Math.max(0, this._popT - deltaSeconds);
      const dur = this._popGrow ? 0.45 : 0.3;
      const k = Math.sin((1 - this._popT / dur) * Math.PI);
      const amp = this._popGrow ? 0.22 : -0.12;
      this.buildingContainer.scale.set(BUILDING_SCALE * (1 + amp * k * 0.7), BUILDING_SCALE * (1 + amp * k));
    } else if (this.buildingContainer.scale.x !== BUILDING_SCALE) {
      this.buildingContainer.scale.set(BUILDING_SCALE);
    }

    this._renderFlag(faction);
    this._renderCampfires();
    this._drawBadge(faction);

    // Production of new units
    if (this.owner !== 'neutral' && this.units < this.maxUnits) {
      this.growthAccumulator += deltaSeconds * this.productionRate;
      if (this.growthAccumulator >= 1.0) {
        const added = Math.floor(this.growthAccumulator);
        this.growthAccumulator -= added;
        this.units = Math.min(this.maxUnits, this.units + added);
        this.unitText.text = String(Math.floor(this.units));
      }

      // Production progress: slim bar under the troop pill
      this.progressGfx.clear();
      const progress = this.growthAccumulator;
      if (progress > 0.05) {
        const bw = (this._badgeW || 40) - 14;
        this.progressGfx
          .roundRect(-bw / 2, 17, bw, 4, 2)
          .fill({ color: 0x0f172a, alpha: 0.4 })
          .roundRect(-bw / 2, 17, Math.max(4, bw * Math.min(1, progress)), 4, 2)
          .fill({ color: 0xffffff, alpha: 0.95 });
      }
    } else {
      this.progressGfx.clear();
    }

    // Shield orbit
    if (this.shieldCharges > 0) {
      this.shieldAngle += deltaSeconds * 2.5;
      this._renderShield();
    }

    // Under attack red flashing pulse
    if (this.underAttackTimer > 0) {
      this.underAttackTimer -= deltaSeconds;
      this.attackPulseGfx.clear();
      const pulseAlpha = Math.sin(Date.now() * 0.02) * 0.35 + 0.35;
      this.attackPulseGfx
        .roundRect(-24, -15, 48, 30, 8)
        .fill({ color: 0xef4444, alpha: pulseAlpha });
    } else {
      this.attackPulseGfx.clear();
    }

    // Capture flash
    if (this.captureFlashTimer > 0) {
      this.captureFlashTimer -= deltaSeconds;
      this.provinceFlashGfx.clear();
      if (this.flatLocal.length >= 6) {
        this.provinceFlashGfx
          .poly(this.flatLocal)
          .fill({ color: 0xffffff, alpha: this.captureFlashTimer * 0.8 });
      }
    } else {
      this.provinceFlashGfx.clear();
    }
  }

  setDisplayScale(scale = 1.0) {
    this._displayScale = scale;
    if (this.badgeContainer) {
      this.badgeContainer.scale.set(scale);
    }
  }
}
