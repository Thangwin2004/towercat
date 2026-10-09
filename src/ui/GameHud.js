/**
 * In-Game Tactical HUD
 * Top status bar (territorial control ratio, pause, audio) & Bottom Tactical Skills dock.
 * Minimalist text & icon-driven design conforming to hyper-casual standards.
 */

import { Container, Graphics, Text } from 'pixi.js';
import { vGrad, getUiScale } from '../utils/gfx.js';
import { SoundSynth } from '../core/SoundSynth.js';
import { createSvgIcon } from './SvgIcons.js';
import { FACTIONS } from '../game/MapConfig.js';
import { drawWoodenPlankBoard, drawWoodenDiscButton, drawFloatingRaftDock, ISLAND_COLORS } from './TropicalUiTheme.js';

export class GameHud extends Container {
  constructor({ onPause, onToggleAudio, onSkillActivate, onTogglePercentage }) {
    super();
    this.onPause = onPause;
    this.onToggleAudio = onToggleAudio;
    this.onSkillActivate = onSkillActivate;
    this.onTogglePercentage = onTogglePercentage;

    this.sendPercentage = 0.5;

    // Top Bar Container
    this.topContainer = new Container();
    this.addChild(this.topContainer);

    // Floating Level Title Capsule with 3D Crown Icon (Minimal text)
    this.levelBadge = new Container();
    this.levelBadgeBg = new Graphics();
    this.levelIcon = createSvgIcon('crown', 16);
    this.levelTitleText = new Text({
      text: '1',
      style: {
        fontFamily: '"Be Vietnam Pro", sans-serif',
        fontSize: 15,
        fontWeight: '900',
        fill: 0x78350f,
      }
    });
    this.levelTitleText.anchor.set(0, 0.5);

    this.levelBadge.addChild(this.levelBadgeBg, this.levelIcon, this.levelTitleText);
    this.topContainer.addChild(this.levelBadge);

    // Dominance / Territory control bar with colored percentages on both ends
    this.dominanceGfx = new Graphics();
    const pctStyle = (fill) => ({
      fontFamily: '"Be Vietnam Pro", sans-serif',
      fontSize: 13,
      fontWeight: '900',
      fill,
      dropShadow: { alpha: 0.55, blur: 2, color: 0x0f172a, distance: 1 },
    });
    this.playerPctText = new Text({ text: '0%', style: pctStyle(0xd6ecff) });
    this.playerPctText.anchor.set(0, 0.5);
    this.enemyPctText = new Text({ text: '0%', style: pctStyle(0xffd2d2) });
    this.enemyPctText.anchor.set(1, 0.5);
    this.dominanceIcon = createSvgIcon('swords', 16, 0xffffff);
    this.domFillGfx = new Graphics();
    this.domMask = new Graphics();
    this.domFillGfx.mask = this.domMask;
    this.topContainer.addChild(this.dominanceGfx, this.domFillGfx, this.domMask, this.playerPctText, this.enemyPctText, this.dominanceIcon);

    // Top Action Buttons (Pause & Sound) with handcrafted Coconut Wood Discs
    this.pauseBtn = this._createCircularIconButton('pause', 20, () => this.onPause?.());
    this.soundBtn = this._createCircularIconButton(
      SoundSynth.isMuted ? 'volumeOff' : 'volumeOn',
      20,
      () => {
        const muted = SoundSynth.toggleMute();
        this._updateSoundIcon(muted);
      }
    );
    this.topContainer.addChild(this.pauseBtn, this.soundBtn);

    // Bottom Tactical Skills Dock Container
    this.bottomContainer = new Container();
    this.dockContent = new Container();
    this.dockBackingGfx = new Graphics();
    this.dockContent.addChild(this.dockBackingGfx);

    this.bottomContainer.addChild(this.dockContent);
    this.addChild(this.bottomContainer);

    // Dispatch % Toggle Button: Handcrafted Wooden Plaque with squad icon + "50%" / "100%"
    this.pctBtn = this._createDispatchButton(() => {
      const pct = this.onTogglePercentage?.();
      this.sendPercentage = pct || 0.5;
      this._updatePctButtonVisual();
    });

    // Skill 1: Blitz (Hermes Winged Speed Boot - Tăng tốc chạy)
    this.blitzBtn = this._createSkillButton('speedBoot', () => this.onSkillActivate?.('blitz'));
    // Skill 2: Bastion (Castle Tower Fortress Shield - Khiên phòng thủ đảo)
    this.bastionBtn = this._createSkillButton('fortressShield', () => this.onSkillActivate?.('bastion'));
    // Skill 3: Surge (Troop Reinforce Squad '+' - Viện binh)
    this.surgeBtn = this._createSkillButton('troopReinforce', () => this.onSkillActivate?.('surge'));

    this.dockContent.addChild(this.pctBtn, this.blitzBtn, this.bastionBtn, this.surgeBtn);

    this._layoutDock();
  }

  _updatePctButtonVisual() {
    const isFull = this.sendPercentage >= 0.99;
    this.pctBtn.valText.text = isFull ? '100%' : '50%';

    // Swap squad icon between 2 cats (50%) and 4 cats with battle flag & flames (100%)
    this.pctBtn.removeChild(this.pctBtn.squadIcon);
    this.pctBtn.squadIcon.destroy();
    const newSquad = createSvgIcon(isFull ? 'squadFull' : 'squadHalf', 24);
    newSquad.x = -17;
    newSquad.y = 0;
    this.pctBtn.squadIcon = newSquad;
    this.pctBtn.addChildAt(newSquad, 1);

    const w = 84;
    const h = 48;

    this.pctBtn.body.clear();
    drawWoodenPlankBoard(this.pctBtn.body, 0, 0, w, h, {
      pill: true,
      catEars: false,
      studs: false,
      colorTop: ISLAND_COLORS.WOOD_HIGHLIGHT,
      colorBot: ISLAND_COLORS.WOOD_MID
    });
  }

  _layoutDock() {
    // Dock total width: pctBtn (84) + gap (10) + 3 skills * 58 = 268px
    const totalW = 268;
    const startX = -totalW / 2;

    // Authentic Floating Bamboo / Timber Raft Dock with Hemp Lashings
    this.dockBackingGfx.clear();
    drawFloatingRaftDock(this.dockBackingGfx, 0, 0, totalW + 28, 64);

    this.pctBtn.x = startX + 42;
    this.pctBtn.y = 0;

    const skillSpacing = 58;
    const skillsStartX = startX + 84 + 10 + 29;

    this.blitzBtn.x = skillsStartX;
    this.blitzBtn.y = 0;

    this.bastionBtn.x = skillsStartX + skillSpacing;
    this.bastionBtn.y = 0;

    this.surgeBtn.x = skillsStartX + skillSpacing * 2;
    this.surgeBtn.y = 0;
  }

  _createCircularIconButton(iconKey, r, onClick) {
    const btn = new Container();

    const bg = new Graphics();
    drawWoodenDiscButton(bg, 0, 0, r);

    const icon = createSvgIcon(iconKey, Math.round(r * 1.15));

    btn.addChild(bg, icon);
    btn.icon = icon;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    btn.on('pointerdown', () => {
      btn.scale.set(0.92);
      SoundSynth.playClick();
    });
    btn.on('pointerup', () => {
      btn.scale.set(1.0);
      onClick?.();
    });
    btn.on('pointerupoutside', () => btn.scale.set(1.0));

    return btn;
  }

  _updateSoundIcon(muted) {
    this.soundBtn.removeChild(this.soundBtn.icon);
    this.soundBtn.icon.destroy();

    const newIcon = createSvgIcon(muted ? 'volumeOff' : 'volumeOn', Math.round(20 * 1.15));
    this.soundBtn.icon = newIcon;
    this.soundBtn.addChild(newIcon);
  }

  _createDispatchButton(onClick) {
    const btn = new Container();
    const w = 84;
    const h = 48;

    const body = new Graphics();
    drawWoodenPlankBoard(body, 0, 0, w, h, {
      pill: true,
      catEars: false,
      studs: false,
      colorTop: ISLAND_COLORS.WOOD_HIGHLIGHT,
      colorBot: ISLAND_COLORS.WOOD_MID
    });

    const squadIcon = createSvgIcon('squadHalf', 24);
    squadIcon.x = -17;
    squadIcon.y = 0;

    const valText = new Text({
      text: '50%',
      style: {
        fontFamily: '"Be Vietnam Pro", sans-serif',
        fontSize: 16,
        fontWeight: '900',
        fill: 0xffffff,
        stroke: { color: ISLAND_COLORS.WOOD_DARK, width: 2.2 },
        dropShadow: { alpha: 0.7, blur: 0, color: ISLAND_COLORS.WOOD_DARK, distance: 1.5, angle: Math.PI / 2 },
      }
    });
    valText.anchor.set(0, 0.5);
    valText.x = -1;
    valText.y = 0;

    btn.addChild(body, squadIcon, valText);
    btn.body = body;
    btn.squadIcon = squadIcon;
    btn.valText = valText;

    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    btn.on('pointerdown', () => {
      btn.scale.set(0.93);
      btn.y += 2;
      SoundSynth.playClick();
    });
    btn.on('pointerup', () => {
      btn.scale.set(1.0);
      btn.y -= 2;
      onClick?.();
    });
    btn.on('pointerupoutside', () => {
      btn.scale.set(1.0);
      btn.y -= 2;
    });

    return btn;
  }

  // Pure 3D Circular Skill Button with distinct intuitive icon & cooldown overlay
  _createSkillButton(iconKey, onClick) {
    const btn = new Container();
    const r = 24;

    const bg = new Graphics();
    drawWoodenDiscButton(bg, 0, 0, r);

    const icon = createSvgIcon(iconKey, 28);

    const cdGfx = new Graphics();
    const cdText = new Text({
      text: '',
      style: {
        fontFamily: '"Be Vietnam Pro", sans-serif',
        fontSize: 14,
        fontWeight: '900',
        fill: 0xffffff,
        dropShadow: { alpha: 0.8, blur: 2, color: 0x000000, distance: 1 }
      }
    });
    cdText.anchor.set(0.5);

    btn.addChild(bg, icon, cdGfx, cdText);
    btn.cdGfx = cdGfx;
    btn.cdText = cdText;

    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    btn.on('pointerdown', () => {
      btn.scale.set(0.92);
      SoundSynth.playClick();
      onClick?.();
    });
    btn.on('pointerup', () => btn.scale.set(1.0));
    btn.on('pointerupoutside', () => btn.scale.set(1.0));

    return btn;
  }

  setLevelTitle(title) {
    // Clear display: "ẢI 1", "ẢI 2", etc.
    const str = String(title);
    const num = str.replace(/\D/g, '') || str;
    this.levelTitleText.text = num ? `ẢI ${num}` : str;

    const iconW = 16;
    const gap = 6;
    const totalW = iconW + gap + this.levelTitleText.width;
    const textW = totalW + 22;
    const textH = 28;

    this.levelBadgeBg.clear();
    drawWoodenPlankBoard(this.levelBadgeBg, 0, 0, textW, textH, {
      pill: true,
      catEars: false,
      studs: false,
      colorTop: 0xfde047,
      colorBot: 0xf59e0b
    });

    const startX = -totalW / 2;
    this.levelIcon.x = startX + iconW / 2;
    this.levelIcon.y = 0;
    this.levelTitleText.x = startX + iconW + gap;
    this.levelTitleText.y = -0.5;
  }

  updateDominance(territories) {
    if (!territories || territories.length === 0) return;

    const total = territories.length;
    const counts = {};
    let playerCount = 0;
    let enemyCount = 0;
    for (const t of territories) {
      counts[t.owner] = (counts[t.owner] || 0) + 1;
      if (t.owner === 'player') playerCount++;
      else if (t.owner !== 'neutral') enemyCount++;
    }
    const enemyKeys = Object.keys(counts)
      .filter((k) => k !== 'player' && k !== 'neutral')
      .sort((a, b) => counts[b] - counts[a]);
    const order = ['player', 'neutral', ...enemyKeys.slice().reverse()];

    const playerPct = Math.round((playerCount / total) * 100);
    const enemyPct = Math.round((enemyCount / total) * 100);

    const screenW = (this.screenWidth || 800) / (this.uiScale || 1);
    const barW = Math.min(240, Math.max(120, screenW - 150));
    const domKey = order.map((k) => `${k}:${counts[k] || 0}`).join('|') + `|${barW}`;
    if (this._domKey === domKey) return;
    this._domKey = domKey;
    // Cache one gradient per faction (never create FillGradient per frame)
    this._domGrads ||= {};
    const gradFor = (k) => {
      if (!this._domGrads[k]) {
        const f = FACTIONS[k] || FACTIONS.neutral;
        this._domGrads[k] = vGrad(f.landLightHex ?? 0xffffff, f.landColorHex ?? f.colorHex);
      }
      return this._domGrads[k];
    };
    const barH = 14;
    const startX = -barW / 2;
    const y = 26;

    this.dominanceGfx.clear();
    // Handcrafted Bamboo / Wood Track
    this.dominanceGfx
      .roundRect(startX - 4, y - 4, barW + 8, barH + 8, (barH + 8) / 2)
      .fill({ color: ISLAND_COLORS.WOOD_DARK, alpha: 0.95 })
      .roundRect(startX - 2.5, y - 2.5, barW + 5, barH + 5, (barH + 5) / 2)
      .fill({ color: 0x78350f })
      .stroke({ width: 1.8, color: ISLAND_COLORS.WOOD_DARK });

    this.domMask.clear().roundRect(startX, y, barW, barH, barH / 2).fill({ color: 0xffffff });
    this.domFillGfx.clear();
    let curX = startX;
    for (const k of order) {
      const c = counts[k] || 0;
      if (!c) continue;
      const w = (c / total) * barW;
      this.domFillGfx.rect(curX, y, w, barH).fill({ fill: gradFor(k) });
      if (curX > startX) {
        this.domFillGfx.rect(curX - 0.75, y, 1.5, barH).fill({ color: 0xffffff, alpha: 0.85 });
      }
      curX += w;
    }
    // Glossy sheen
    this.domFillGfx.roundRect(startX + 4, y + 2, barW - 8, barH * 0.3, barH * 0.15).fill({ color: 0xffffff, alpha: 0.35 });

    // Enemy % text takes the colour of the leading enemy (only restyle on change)
    const lead = enemyKeys[0] || 'enemy_red';
    if (this._domLead !== lead) {
      this._domLead = lead;
      this.enemyPctText.style.fill = FACTIONS[lead]?.landLightHex ?? 0xffd2d2;
    }

    const labelY = y + barH + 14;
    this.playerPctText.text = `TA: ${playerPct}%`;
    this.playerPctText.x = startX;
    this.playerPctText.y = labelY;
    this.enemyPctText.text = `ĐỊCH: ${enemyPct}%`;
    this.enemyPctText.x = startX + barW;
    this.enemyPctText.y = labelY;
    this.dominanceIcon.x = 0;
    this.dominanceIcon.y = labelY;
  }

  updateSkillCooldowns(skillsManager) {
    const list = [
      { btn: this.blitzBtn, skill: skillsManager.skills.blitz },
      { btn: this.bastionBtn, skill: skillsManager.skills.bastion },
      { btn: this.surgeBtn, skill: skillsManager.skills.surge },
    ];

    for (const { btn, skill } of list) {
      btn.cdGfx.clear();
      if (skill.remaining > 0) {
        btn.cdGfx.circle(0, 0, 24).fill({ color: 0x000000, alpha: 0.72 });
        btn.cdText.text = Math.ceil(skill.remaining) + 's';
        btn.cdText.visible = true;
      } else {
        btn.cdText.visible = false;
        if (skill.activeTimer && skill.activeTimer > 0) {
          btn.cdGfx
            .circle(0, 0, 27)
            .stroke({ width: 3.2, color: 0xfde047, alpha: 0.95 });
        }
      }
    }
  }

  resize(width, height) {
    this.screenWidth = width;
    const ui = getUiScale(width, height);
    this.uiScale = ui;

    // Top Bar: scaled as a whole; inner coordinates are in "design pixels"
    this.topContainer.scale.set(ui);
    this.topContainer.x = Math.round(width * 0.5);
    this.topContainer.y = Math.round(16 * ui);

    const halfW = width / ui / 2;
    this.pauseBtn.x = -Math.round(halfW) + 32;
    this.pauseBtn.y = 14;

    this.soundBtn.x = Math.round(halfW) - 32;
    this.soundBtn.y = 14;

    // Bottom Skills Dock: as big as the screen comfortably allows
    const dockW = 300;
    const dockScale = Math.min(ui * 1.05, (width - 16) / dockW);
    this.dockContent.scale.set(dockScale);
    this.bottomContainer.x = Math.round(width * 0.5);
    this.bottomContainer.y = Math.round(height - 40 * dockScale - 8);
  }
}
