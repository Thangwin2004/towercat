/**
 * GameScene Controller
 * Coordinates map rendering, tactical terrain, road networks, drag interaction,
 * game loop ticker, multi-faction combat, and victory/defeat evaluation.
 */

import { Container } from 'pixi.js';
import { CAMPAIGN_LEVELS, getLevelConfig, generateRandomMap } from './MapConfig.js';
import { computeTerritoryProvinces } from './VoronoiMap.js';
import { Territory } from './Territory.js';
import { TroopManager } from './TroopSwarm.js';
import { ParticleEffects } from './ParticleEffects.js';
import { TacticalAi } from './TacticalAi.js';
import { SkillsManager } from './SkillsManager.js';
import { SoundSynth } from '../core/SoundSynth.js';
import { MapTerrain } from './MapTerrain.js';
import { getUiScale } from '../utils/gfx.js';

// Level data is authored in an 800x600 landscape space.
const LANDSCAPE_BOUNDS = { x1: 45, y1: 40, x2: 755, y2: 560 };
const PORTRAIT_BOUNDS = { x1: 40, y1: 45, x2: 560, y2: 755 };

/**
 * Mirror a level across the diagonal (swap x <-> y) so a landscape map becomes portrait.
 * Distances, routes and adjacency are preserved exactly -> gameplay is identical.
 * Always returns a deep copy (never mutates CAMPAIGN_LEVELS).
 */
function transposeConfig(config) {
  const swap = (o) => (o && typeof o.x === 'number' ? { ...o, x: o.y, y: o.x } : o);
  return {
    ...config,
    isTransposed: !config.isTransposed,
    bases: config.bases.map(swap),
    routes: config.routes
      ? config.routes.map(r => ({
          ...r,
          waypoints: r.waypoints ? r.waypoints.map(wp => (Array.isArray(wp) ? [wp[1], wp[0]] : swap(wp))) : r.waypoints,
        }))
      : config.routes,
    terrain: config.terrain
      ? {
          ...config.terrain,
          mountains: config.terrain.mountains ? config.terrain.mountains.map(swap) : config.terrain.mountains,
        }
      : config.terrain,
  };
}

export class GameScene extends Container {
  constructor(app, onGameEnd) {
    super();
    this.app = app;
    this.onGameEnd = onGameEnd; // (status, stats) => void

    this.currentLevel = 1;
    this.isPlaying = false;
    this.isPaused = false;
    this.elapsedTime = 0;
    this.sendPercentage = 0.5; // 50% or 1.0 (100%)
    this.isVictorySequence = false;
    this.victoryTimer = 0;
    this.victoryStats = null;
    this.nextFireworkTime = 0;

    // Drag dispatch state
    this.selectedTerritory = null;
    this.hoveredTerritory = null;
    this.isDragging = false;
    this.pointerX = 0;
    this.pointerY = 0;

    // Sub-containers & Terrain System
    this.mapContainer = new Container();
    this.mapTerrain = new MapTerrain();
    this.coastContainer = new Container(); // island cliffs/halos of ALL provinces, beneath every land
    this.coastContainer.eventMode = 'none';
    this.territoriesContainer = new Container();
    this.capitalsContainer = new Container(); // settlements, flags, and troop badges (rendered above routes & troops)
    this.capitalsContainer.eventMode = 'none';
    this.troopManager = new TroopManager();
    this.particleEffects = new ParticleEffects();
    this.skillsManager = new SkillsManager();

    this.territories = [];
    this.aiControllers = [];

    // Interleave terrain depth layers with game objects:
    // 1. Full-screen Ocean, Waves, Compass & Nautical Chart details (bgLayer)
    // 2. Continents, Islands, and Provincial Territory Landmasses (territoriesContainer)
    // 3. Cobblestone Highways, Mountain Trails, and Sea Shipping Lanes (routesLayer)
    // 4. Tactical Marching Energy Beams & Chevrons >>> (activeRoutesLayer)
    // 5. 3D Mountain Ridges & Peaks with Snow Caps & Pines (mountainsLayer)
    // 6. Marching Soldiers & Warboats (troopManager)
    // 7. Living Capital Settlements & Troop Count Badges (capitalsContainer - on top of roads & troops)
    // 8. Tactical Drag Beams, Sparks, Shockwaves & Popups (particleEffects)
    this.mapContainer.addChild(
      this.coastContainer,
      this.territoriesContainer,
      this.mapTerrain.routesLayer,
      this.mapTerrain.activeRoutesLayer,
      this.mapTerrain.mountainsLayer,
      this.troopManager,
      this.capitalsContainer,
      this.particleEffects
    );
    this.addChild(
      this.mapTerrain.bgLayer,
      this.mapContainer
    );

    this._setupInputListeners();
  }

  _setupInputListeners() {
    this.eventMode = 'static';
    this.hitArea = this.app.screen;

    this.on('pointerdown', (e) => {
      if (!this.isPlaying || this.isPaused) return;

      const localPos = this.mapContainer.toLocal(e.global);
      const clickedTerritory = this._findTerritoryAt(localPos.x, localPos.y);

      if (clickedTerritory && clickedTerritory.owner === 'player') {
        this.selectedTerritory = clickedTerritory;
        this.selectedTerritory.setSelected(true);
        this.isDragging = true;
        this.pointerX = localPos.x;
        this.pointerY = localPos.y;
        this.mapTerrain.highlightRoutes(this.selectedTerritory.id);
        SoundSynth.playClick();
      }
    });

    this.on('pointermove', (e) => {
      if (!this.isDragging || !this.selectedTerritory) return;

      const localPos = this.mapContainer.toLocal(e.global);
      this.pointerX = localPos.x;
      this.pointerY = localPos.y;

      const hovered = this._findTerritoryAt(localPos.x, localPos.y);

      if (this.hoveredTerritory && this.hoveredTerritory !== hovered) {
        this.hoveredTerritory.setHoveredTarget(false);
      }

      this.hoveredTerritory = hovered;
      if (this.hoveredTerritory && this.hoveredTerritory !== this.selectedTerritory) {
        this.hoveredTerritory.setHoveredTarget(true);
      }

      // Check whether target territory is connected by an open road, mountain pass, or sea lane
      const isConnected = this.hoveredTerritory && this.hoveredTerritory !== this.selectedTerritory
        ? this.mapTerrain.areConnected(this.selectedTerritory.id, this.hoveredTerritory.id)
        : true;

      this.particleEffects.renderDragLine(
        this.selectedTerritory,
        this.pointerX,
        this.pointerY,
        this.hoveredTerritory !== this.selectedTerritory ? this.hoveredTerritory : null,
        this.sendPercentage,
        isConnected
      );
    });

    const finishDrag = () => {
      if (!this.isDragging) return;

      if (this.selectedTerritory && this.hoveredTerritory && this.hoveredTerritory !== this.selectedTerritory) {
        // Strict route connectivity check! Must have a road, mountain pass, or sea lane
        if (this.mapTerrain.areConnected(this.selectedTerritory.id, this.hoveredTerritory.id)) {
          // Launch troop wave along valid route!
          const count = this.selectedTerritory.dispatchTroops(this.sendPercentage);
          if (count > 0) {
            const route = this.mapTerrain.getRoute(this.selectedTerritory.id, this.hoveredTerritory.id);
            this.troopManager.spawnWave(this.selectedTerritory, this.hoveredTerritory, count, route);
            SoundSynth.playDispatch();
          }
        } else {
          // Blocked! No route connecting these two territories
          SoundSynth.playBlocked();
          this.particleEffects.addBlockedFeedback(this.hoveredTerritory.x, this.hoveredTerritory.y);
        }
      }

      if (this.selectedTerritory) {
        this.selectedTerritory.setSelected(false);
        this.selectedTerritory = null;
      }
      if (this.hoveredTerritory) {
        this.hoveredTerritory.setHoveredTarget(false);
        this.hoveredTerritory = null;
      }

      this.mapTerrain.clearRouteHighlight();
      this.isDragging = false;
      this.particleEffects.clearDragLine();
    };

    this.on('pointerup', finishDrag);
    this.on('pointerupoutside', finishDrag);
  }

  _findTerritoryAt(x, y) {
    for (const t of this.territories) {
      if (t.containsPoint && t.containsPoint(x, y)) {
        return t;
      }
      const dx = t.x - x;
      const dy = t.y - y;
      if (Math.hypot(dx, dy) <= t.radius + 15) {
        return t;
      }
    }
    return null;
  }

  toggleSendPercentage() {
    this.sendPercentage = this.sendPercentage >= 0.99 ? 0.5 : 1.0;
    SoundSynth.playToggle();
    return this.sendPercentage;
  }

  loadLevel(levelNumber = 1) {
    this.currentLevel = levelNumber;
    this.isPlaying = true;
    this.isPaused = false;
    this.elapsedTime = 0;
    this.isVictorySequence = false;
    this.victoryTimer = 0;
    this.victoryStats = null;
    this.nextFireworkTime = 0;
    this.position.set(0, 0);

    // Clear old state
    this.territoriesContainer.removeChildren();
    this.coastContainer.removeChildren();
    this.capitalsContainer.removeChildren();
    this.territories = [];
    this.troopManager.clear();
    this.particleEffects.clear();
    this.skillsManager.reset();
    this.aiControllers = [];

    // Get level data from the 50 balanced campaign levels
    let config = getLevelConfig(levelNumber);

    // Portrait phones: rotate the landscape map so it fills the tall screen
    this.isTransposed = this._isPortrait();
    if (this.isTransposed) config = transposeConfig(config);
    this.levelConfig = config;

    // Compute realistic geographical continents, islands, and provinces
    const provinces = computeTerritoryProvinces(
      config.bases,
      config.routes || [],
      this.isTransposed ? PORTRAIT_BOUNDS : LANDSCAPE_BOUNDS
    );

    // Spawn territory nodes with expansive province polygons
    for (const bConf of config.bases) {
      const prov = provinces.find(p => p.id === bConf.id);
      const t = new Territory({
        ...bConf,
        polygon: prov ? prov.poly : []
      });
      this.territories.push(t);
      this.territoriesContainer.addChild(t);
      t.provinceCoastGfx.position.set(t.x, t.y);
      this.coastContainer.addChild(t.provinceCoastGfx);
      t.capitalContainer.position.set(t.x, t.y);
      this.capitalsContainer.addChild(t.capitalContainer);
    }

    // Load physical geography, routes, mountains, and nautical frame
    this.mapTerrain.loadLevelTerrain(config, this.territories);

    // Set up AI controllers for factions present with 5-Tier progressive aggression
    const enemyFactions = new Set(
      config.bases.map(b => b.owner).filter(o => o.startsWith('enemy_'))
    );

    enemyFactions.forEach(fId => {
      let aggression = 0.35;
      if (levelNumber <= 10) {
        // Tier 1: Cực Dễ (0.30 -> 0.48) - very relaxed & forgiving
        aggression = 0.30 + (levelNumber - 1) * 0.02;
      } else if (levelNumber <= 20) {
        // Tier 2: Dễ (0.52 -> 0.70)
        aggression = 0.52 + (levelNumber - 11) * 0.02;
      } else if (levelNumber <= 30) {
        // Tier 3: Bình Thường (0.75 -> 0.95)
        aggression = 0.75 + (levelNumber - 21) * 0.022;
      } else if (levelNumber <= 40) {
        // Tier 4: Khó (1.05 -> 1.25)
        aggression = 1.05 + (levelNumber - 31) * 0.022;
      } else {
        // Tier 5: Siêu Khó (1.30 -> 1.65)
        aggression = 1.30 + (levelNumber - 41) * 0.038;
      }
      this.aiControllers.push(new TacticalAi(fId, aggression));
    });

    SoundSynth.startBgm();
    this.resize(this.app.screen.width, this.app.screen.height);
  }

  update(deltaSeconds) {
    // 1. Victory Celebration in-match sequence (Glorious fireworks & fanfare before modal)
    if (this.isVictorySequence) {
      this.victoryTimer += deltaSeconds;

      // Soft victory camera rumble in the first 0.45s
      if (this.victoryTimer < 0.45) {
        const shake = (0.45 - this.victoryTimer) * 12;
        this.position.set((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      } else {
        this.position.set(0, 0);
      }

      // Continuous firework bursts during celebration
      if (this.victoryTimer >= this.nextFireworkTime && this.victoryTimer < 1.3) {
        this.nextFireworkTime = this.victoryTimer + 0.22;
        const playerBases = this.territories.filter(t => t.owner === 'player');
        if (playerBases.length > 0) {
          const b = playerBases[Math.floor(Math.random() * playerBases.length)];
          const fwColors = [0xfacc15, 0x38bdf8, 0x4ade80, 0xf43f5e, 0xfbbf24, 0xffffff];
          this.particleEffects.spawnFireworkAt(
            b.x + (Math.random() * 60 - 30),
            b.y - 30 - Math.random() * 50,
            fwColors[Math.floor(Math.random() * fwColors.length)]
          );
          SoundSynth.playFireworkBurst();
        }
      }

      this.particleEffects.update(deltaSeconds);
      this.mapTerrain.update(deltaSeconds);

      if (this.victoryTimer >= 1.45) {
        this.isVictorySequence = false;
        this.isPlaying = false;
        this.position.set(0, 0);
        if (this.onGameEnd && this.victoryStats) {
          this.onGameEnd('victory', this.victoryStats);
        }
      }
      return;
    }

    if (!this.isPlaying || this.isPaused) return;

    this.elapsedTime += deltaSeconds;

    // 0. Update terrain animations (pulsing routes, waves)
    this.mapTerrain.update(deltaSeconds);

    // 1. Update territory regeneration
    for (const t of this.territories) {
      t.update(deltaSeconds);
    }

    // 2. Update skills
    this.skillsManager.update(deltaSeconds, this.troopManager);

    // 3. Update troop marching & combat
    this.troopManager.update(
      deltaSeconds,
      (unit, result) => {
        // On arrival combat
        if (result.captured) {
          SoundSynth.playCapture(unit.targetBase.owner === 'player');
          this.particleEffects.addCaptureShockwave(unit.targetBase.x, unit.targetBase.y, unit.targetBase.owner);
          this._checkVictoryCondition();
        } else if (result.shielded) {
          this.particleEffects.addShieldImpact(unit.targetBase.x, unit.targetBase.y);
        } else {
          this.particleEffects.addClashSparks(unit.targetBase.x, unit.targetBase.y);
        }
      },
      (midX, midY) => {
        // On mid-air unit interception
        this.particleEffects.addClashSparks(midX, midY, 0xef4444);
      }
    );

    // 4. Update AIs (constrained to connected roads and routes)
    for (const ai of this.aiControllers) {
      ai.update(deltaSeconds, this.territories, this.troopManager, this.mapTerrain);
    }

    // 5. Update particles
    this.particleEffects.update(deltaSeconds);

    // 6. Check continuous win/loss states
    this._checkVictoryCondition();
  }

  triggerSkillVFX(type) {
    if (type === 'blitz') {
      const playerBases = this.territories.filter(t => t.owner === 'player');
      this.particleEffects.triggerBlitzVFX(playerBases);
    } else if (type === 'bastion') {
      const playerBases = this.territories.filter(t => t.owner === 'player');
      playerBases.sort((a, b) => a.units - b.units);
      if (playerBases.length > 0) {
        this.particleEffects.triggerBastionVFX(playerBases[0]);
      }
    } else if (type === 'surge') {
      const playerBases = this.territories.filter(t => t.owner === 'player');
      this.particleEffects.triggerSurgeVFX(playerBases);
    }
  }

  _checkVictoryCondition() {
    if (!this.isPlaying || this.isVictorySequence) return;

    const playerBases = this.territories.filter(t => t.owner === 'player');
    const playerTroops = this.troopManager.troops.filter(u => u.faction === 'player');

    // DEFEAT: Player has lost all bases and has no troops left marching
    if (playerBases.length === 0 && playerTroops.length === 0) {
      this.isPlaying = false;
      SoundSynth.stopBgm();
      SoundSynth.playDefeat();
      if (this.onGameEnd) {
        this.onGameEnd('defeat', {
          level: this.currentLevel,
          time: Math.round(this.elapsedTime),
          conquered: 0,
        });
      }
      return;
    }

    // VICTORY: All enemy bases are wiped out! (Neutral bases can still exist or be taken)
    const enemyBases = this.territories.filter(t => t.owner.startsWith('enemy_'));
    const enemyTroops = this.troopManager.troops.filter(u => u.faction.startsWith('enemy_'));

    if (enemyBases.length === 0 && enemyTroops.length === 0) {
      this.isVictorySequence = true;
      this.victoryTimer = 0;
      this.nextFireworkTime = 0.2;

      SoundSynth.stopBgm();
      SoundSynth.playVictory();

      // Trigger Grand In-Game Victory Climax Celebration
      this.particleEffects.triggerGrandVictoryCelebration(playerBases, this._mapCenter());

      // Calculate star rating (1 to 3 stars) based on time limit
      const timeLimit = this.levelConfig.timeLimit3Stars || 60;
      let stars = 1;
      if (this.elapsedTime <= timeLimit) {
        stars = 3;
      } else if (this.elapsedTime <= timeLimit * 1.5) {
        stars = 2;
      }

      const score = Math.max(500, Math.round(3000 - this.elapsedTime * 20 + stars * 500));

      this.victoryStats = {
        level: this.currentLevel,
        time: Math.round(this.elapsedTime),
        stars,
        score,
      };
    }
  }

  _isPortrait() {
    const { width, height } = this.app.screen;
    return height > width * 1.08;
  }

  _mapCenter() {
    const bases = this.levelConfig?.bases || [];
    if (!bases.length) return { x: 400, y: 300 };
    let sx = 0, sy = 0;
    for (const b of bases) { sx += b.x; sy += b.y; }
    return { x: sx / bases.length, y: sy / bases.length };
  }

  /**
   * Orientation flipped mid-match (phone rotated / window resized):
   * transpose the live board in place, keeping owners, troop counts and marching units.
   */
  _reorient() {
    this.isTransposed = !this.isTransposed;
    this.levelConfig = transposeConfig(this.levelConfig); // transpose twice == original

    // Cancel any drag in progress
    if (this.selectedTerritory) this.selectedTerritory.setSelected(false);
    if (this.hoveredTerritory) this.hoveredTerritory.setHoveredTarget(false);
    this.selectedTerritory = null;
    this.hoveredTerritory = null;
    this.isDragging = false;
    this.mapTerrain.clearRouteHighlight();
    this.particleEffects.clear();

    for (const t of this.territories) {
      const tmp = t.x; t.x = t.y; t.y = tmp;
    }
    const provinces = computeTerritoryProvinces(
      this.levelConfig.bases,
      this.levelConfig.routes || [],
      this.isTransposed ? PORTRAIT_BOUNDS : LANDSCAPE_BOUNDS
    );
    for (const t of this.territories) {
      const prov = provinces.find(p => p.id === t.id);
      if (prov) t.setPolygon(prov.poly);
      t.provinceCoastGfx.position.set(t.x, t.y);
      t.capitalContainer.position.set(t.x, t.y);
    }
    this.mapTerrain.loadLevelTerrain(this.levelConfig, this.territories);

    for (const u of this.troopManager.troops) {
      [u.startX, u.startY] = [u.startY, u.startX];
      [u.x, u.y] = [u.y, u.x];
      [u.dirX, u.dirY] = [u.dirY, u.dirX];
      u.targetX = u.targetBase.x;
      u.targetY = u.targetBase.y;
    }
    this.troopManager.dustPuffs = [];
  }

  resize(width, height) {
    // 0. Re-orient the live board if the screen flipped portrait <-> landscape
    if (this.levelConfig && this.territories.length && this._isPortrait() !== this.isTransposed) {
      this._reorient();
    }

    // 1. Full-screen seamless ocean backdrop across the entire canvas
    this.mapTerrain.resizeOcean(width, height);

    // 2. Dynamic map auto-fit: exact bounds of province polygons (incl. coastline)
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const t of this.territories) {
      const poly = t.polygon && t.polygon.length ? t.polygon : [[t.x - 60, t.y - 60], [t.x + 60, t.y + 60]];
      for (const p of poly) {
        if (p[0] < minX) minX = p[0];
        if (p[0] > maxX) maxX = p[0];
        if (p[1] < minY) minY = p[1];
        if (p[1] > maxY) maxY = p[1];
      }
    }
    if (!isFinite(minX)) {
      minX = 140; maxX = 660; minY = 140; maxY = 460;
    }

    // Coastline glow / flags padding
    const pad = 30;
    const contentW = Math.max(200, (maxX - minX) + pad * 2);
    const contentH = Math.max(200, (maxY - minY) + pad * 2);
    const centerX = (minX + maxX) * 0.5;
    const centerY = (minY + maxY) * 0.5;

    // Margins match the scaled GameHud (top bar + bottom skills dock)
    const ui = getUiScale(width, height);
    const topMargin = Math.round(78 * ui);
    const botMargin = Math.round(92 * ui);
    const availW = Math.max(200, width - 16);
    const availH = Math.max(200, height - topMargin - botMargin);

    // Scale generously so the map is BIG, crystal clear, and easy to see and touch
    const scale = Math.min(availW / contentW, availH / contentH, 2.2);

    this.mapContainer.scale.set(scale);
    this.mapContainer.x = Math.round(width * 0.5 - centerX * scale);
    this.mapContainer.y = Math.round(topMargin + availH * 0.5 - centerY * scale);

    // Keep settlements & troop numbers readable on small phones (~>= 0.9 effective size)
    const displayScale = Math.max(1, Math.min(1.6, 0.9 / scale));
    for (const t of this.territories) t.setDisplayScale?.(displayScale);

    if (this.hitArea) {
      this.hitArea.width = width;
      this.hitArea.height = height;
    }
  }
}
