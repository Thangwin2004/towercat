/**
 * Main Menu Screen - "Mèo Chiến Đảo"
 * Pure 1-Tap Play Screen: Grand Title with 4 Clan Mascots,
 * Charismatic Animated Captain Cat Island Mascot, and Giant CHƠI Button.
 * Lively idle animations for ambient clouds, fluttering fish flags, bobbing cat, and star accents.
 */

import { Container, Graphics, Text } from 'pixi.js';
import { vGrad, getUiScale } from '../utils/gfx.js';
import { Storage } from '../core/Storage.js';
import { SoundSynth } from '../core/SoundSynth.js';
import { createSvgIcon } from './SvgIcons.js';
import { drawAnimalHead, drawFish } from '../game/AnimalArt.js';
import { FACTIONS } from '../game/MapConfig.js';
import { drawWoodenPlankBoard, drawWoodenDiscButton, ISLAND_COLORS } from './TropicalUiTheme.js';

export class MainMenu extends Container {
  constructor({ onStartLevel, onOpenLevelSelect, onShowLeaderboard, onShowTutorial }) {
    super();
    this.onStartLevel = onStartLevel;
    this.onOpenLevelSelect = onOpenLevelSelect;
    this.onShowLeaderboard = onShowLeaderboard;
    this.onShowTutorial = onShowTutorial;

    this.animTime = 0;
    this.clouds = [];
    this.starNodes = [];
    this.mascotNodes = [];
    this.horizonY = 400;
    this.screenWidth = 800;
    this.screenHeight = 600;

    this.bgGfx = new Graphics();
    this.decorationsGfx = new Graphics();
    this.cloudsGfx = new Graphics();
    this.wavesGfx = new Graphics();
    this.titleContainer = new Container();
    this.heroMascotContainer = new Container();
    this.buttonsContainer = new Container();

    this.addChild(
      this.bgGfx,
      this.decorationsGfx,
      this.cloudsGfx,
      this.wavesGfx,
      this.titleContainer,
      this.heroMascotContainer,
      this.buttonsContainer
    );

    this._buildTitle(800);
    this._buildHeroMascot(800);
    this._buildButtons(800);
  }

  _buildTitle(screenWidth = 800) {
    this.titleContainer.removeChildren();
    this.mascotNodes = [];

    // Narrow (portrait phone): two big stacked lines; wide: one line
    const isNarrow = screenWidth < 520;
    const fontSize = isNarrow
      ? Math.min(50, Math.max(34, Math.round(screenWidth * 0.12)))
      : Math.min(52, Math.max(30, Math.round(screenWidth * 0.06)));

    // Grand Title: one Text per line so each line gets the full gold gradient (lesson 18)
    const lines = isNarrow ? ['MÈO', 'CHIẾN ĐẢO'] : ['MÈO CHIẾN ĐẢO'];
    const lineH = Math.round(fontSize * 1.15);
    lines.forEach((str, idx) => {
      const titleText = new Text({
        text: str,
        style: {
          fontFamily: '"Be Vietnam Pro", sans-serif',
          fontSize,
          fontWeight: '900',
          fill: vGrad(0xfff59d, 0xfde047, 0xf59e0b),
          stroke: { color: 0x9a3412, width: 2 },
          dropShadow: {
            alpha: 0.6,
            angle: Math.PI / 2,
            blur: 0,
            color: 0x9a3412,
            distance: 4,
          },
          letterSpacing: 1.5,
          padding: 10,
        }
      });
      titleText.anchor.set(0.5);
      titleText.y = (idx - (lines.length - 1) / 2) * lineH;
      this.titleContainer.addChild(titleText);
    });

    // Mascot row: the four rival animal clans peeking over the title
    this.mascotsContainer = new Container();
    const order = ['enemy_red', 'player', 'enemy_gold', 'enemy_purple'];
    const headR = isNarrow ? 22 : 20;
    const gap = headR * 2.7;
    const rowY = -((lines.length - 1) / 2) * lineH - fontSize * 0.55 - headR * 1.15;
    order.forEach((k, i) => {
      const f = FACTIONS[k];
      const hx = (i - (order.length - 1) / 2) * gap;
      const big = k === 'player';
      const r = big ? headR * 1.25 : headR;
      const hy = rowY + (big ? -4 : 2);

      const headNode = new Container();
      headNode.x = hx;
      headNode.y = hy;
      headNode.baseY = hy;

      const g = new Graphics();
      g.ellipse(0, r * 1.05, r * 0.85, r * 0.22).fill({ color: 0x0b4f8a, alpha: 0.25 });
      drawAnimalHead(g, 0, 0, r, f.species, f.colorHex, f.lightColorHex, 0,
        { detail: true, outlineW: 3 });

      headNode.addChild(g);
      this.mascotNodes.push(headNode);
      this.mascotsContainer.addChild(headNode);
    });
    this.titleContainer.addChildAt(this.mascotsContainer, 0);
  }

  _buildHeroMascot(screenWidth = 800) {
    this.heroMascotContainer.removeChildren();
    this.starNodes = [];

    // 1. Soft Island Shadow & Sand Spit (Static base)
    this.heroIsland = new Graphics();
    this.heroIsland.ellipse(0, 44, 115, 22).fill({ color: 0x075985, alpha: 0.35 });
    this.heroIsland.ellipse(0, 40, 110, 18).fill({ color: 0xfde047 }); // sand
    this.heroIsland.ellipse(0, 36, 100, 15).fill({ color: 0x4ade80 }); // green grass hill
    this.heroIsland.ellipse(0, 33, 78, 11).fill({ color: 0x86efac }); // sunny crest
    this.heroMascotContainer.addChild(this.heroIsland);

    // 2. Animated Fluttering Flags Graphics
    this.flagsGfx = new Graphics();
    this.heroMascotContainer.addChild(this.flagsGfx);

    // 3. Cute Captain Cat (sitting triumphantly in the center - animates smoothly)
    this.heroCat = new Container();
    const g = new Graphics();

    // Body / Chest
    g.ellipse(0, 18, 26, 20).fill({ color: 0x2563eb })
      .stroke({ width: 3, color: 0x0f2a63 });
    // White chest patch
    g.ellipse(0, 20, 14, 13).fill({ color: 0xffffff });

    // Golden General's Medal on chest
    g.circle(0, 17, 6).fill({ color: 0xfacc15 }).stroke({ width: 1.4, color: 0xb45309 });
    g.star(0, 17, 5, 3.2, 1.5).fill({ color: 0xffffff });

    // Paws resting in front
    g.ellipse(-14, 30, 8, 6).fill({ color: 0xffffff }).stroke({ width: 1.5, color: 0x0f2a63 });
    g.ellipse(14, 30, 8, 6).fill({ color: 0xffffff }).stroke({ width: 1.5, color: 0x0f2a63 });

    // Cat Head (with expressive face, ears, whiskers)
    drawAnimalHead(g, 0, -8, 36, 'cat', 0x2563eb, 0x38bdf8, 0, { detail: true, outlineW: 3.5 });

    // Golden Captain Crown / Hat on the Cat
    g.poly([-16, -30, -15, -43, -7, -36, 0, -46, 7, -36, 15, -43, 16, -30])
      .fill({ color: 0xfacc15 })
      .stroke({ width: 2, color: 0xb45309 });
    g.roundRect(-16, -31, 32, 5, 2.5).fill({ color: 0xf59e0b }).stroke({ width: 1.4, color: 0xb45309 });
    g.circle(0, -29, 2.2).fill({ color: 0xef4444 });

    this.heroCat.addChild(g);
    this.heroMascotContainer.addChild(this.heroCat);

    // 4. Sparkling star accents around the mascot
    this.heroStars = new Container();
    const starDefs = [
      { x: -75, y: -18, size: 6, rotSpeed: 1.2 },
      { x: 72, y: -13, size: 5, rotSpeed: -1.5 },
      { x: 45, y: -38, size: 4.5, rotSpeed: 1.8 },
      { x: -50, y: -42, size: 4, rotSpeed: -1.0 },
    ];
    for (const def of starDefs) {
      const sCont = new Container();
      sCont.position.set(def.x, def.y);
      sCont.rotSpeed = def.rotSpeed;
      const sg = new Graphics();
      sg.star(0, 0, 4, def.size, def.size * 0.4).fill({ color: 0xfff7cc, alpha: 0.95 });
      sCont.addChild(sg);
      this.starNodes.push(sCont);
      this.heroStars.addChild(sCont);
    }
    this.heroMascotContainer.addChild(this.heroStars);
  }

  _buildButtons(screenWidth = 800) {
    this.buttonsContainer.removeChildren();

    const isSmall = screenWidth < 400;
    const playW = isSmall ? 210 : 236;
    const playH = isSmall ? 60 : 66;

    // 1. Primary Big PLAY Button: "CHƠI" -> opens level select modal directly
    this.playBtn = this._createCapsuleIconButton(
      'CHƠI',
      'paw',
      playW,
      playH,
      () => {
        if (this.onOpenLevelSelect) {
          this.onOpenLevelSelect();
        } else {
          const unlockedLvl = Storage.getUnlockedLevel();
          this.onStartLevel?.(unlockedLvl);
        }
      },
      Math.round(playH * 0.44)
    );
    this.playBtn.x = 0;
    this.playBtn.y = -34;
    this.playBtn.baseY = -34;

    // 2. Secondary Row: [ 🏆 1-2-3 Bục Xếp Hạng ]  [ ❓ Sách Hướng Dẫn ]  [ 🔊 Loa Âm Thanh ]
    const secRowY = 38;
    const subBtnR = isSmall ? 25 : 28;
    const gapX = subBtnR * 2 + 20;

    // Left: Leaderboard 1-2-3 Podium with Golden Star
    const lbBtn = this._createCircularIconButton('podium', subBtnR, () => {
      this.onShowLeaderboard?.();
    }, secRowY);
    lbBtn.x = -gapX;
    lbBtn.y = secRowY;

    // Center: How to Play / Help Guide Book with Bold '?'
    const guideBtn = this._createCircularIconButton('help', subBtnR, () => {
      this.onShowTutorial?.();
    }, secRowY);
    guideBtn.x = 0;
    guideBtn.y = secRowY;

    // Right: Loudspeaker Audio Toggle (Speaker Horn + Waves / Muted Slash)
    const soundBtn = this._createCircularIconButton(
      SoundSynth.isMuted ? 'volumeOff' : 'volumeOn',
      subBtnR,
      () => {
        const muted = SoundSynth.toggleMute();
        soundBtn.removeChild(soundBtn.icon);
        soundBtn.icon.destroy();
        const newIcon = createSvgIcon(muted ? 'volumeOff' : 'volumeOn', Math.round(subBtnR * 1.15));
        soundBtn.icon = newIcon;
        soundBtn.addChildAt(newIcon, 1);
      },
      secRowY
    );
    soundBtn.x = gapX;
    soundBtn.y = secRowY;

    this.buttonsContainer.addChild(this.playBtn, lbBtn, guideBtn, soundBtn);
  }

  _createCircularIconButton(iconKey, r, onClick, baseY = 0) {
    const btn = new Container();
    btn.baseY = baseY;
    btn.isPressed = false;

    // Handcrafted Coconut Stump Disc with tree rings & warm mahogany bevel
    const body = new Graphics();
    drawWoodenDiscButton(body, 0, 0, r);

    const icon = createSvgIcon(iconKey, Math.round(r * 1.15));
    btn.addChild(body, icon);
    btn.icon = icon;

    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    btn.on('pointerdown', () => {
      btn.isPressed = true;
      btn.scale.set(0.92);
      btn.y = btn.baseY + 3;
      SoundSynth.playClick();
    });
    btn.on('pointerup', () => {
      btn.isPressed = false;
      btn.scale.set(1.0);
      btn.y = btn.baseY;
      onClick?.();
    });
    btn.on('pointerupoutside', () => {
      btn.isPressed = false;
      btn.scale.set(1.0);
      btn.y = btn.baseY;
    });

    return btn;
  }

  _createCapsuleIconButton(labelStr, iconKey, w, h, onClick, customFontSize) {
    const btn = new Container();
    btn.isPressed = false;

    // Tropical Wooden Signboard with cute cat ears, golden studs & warm amber wood
    const body = new Graphics();
    drawWoodenPlankBoard(body, 0, 0, w, h, { pill: true, catEars: true });

    const content = new Container();

    const iconSize = Math.round(h * 0.48);
    const icon = createSvgIcon(iconKey, iconSize);

    const fontSize = customFontSize || Math.round(h * 0.40);
    const label = new Text({
      text: labelStr,
      style: {
        fontFamily: '"Be Vietnam Pro", sans-serif',
        fontSize,
        fontWeight: '900',
        fill: 0xffffff,
        letterSpacing: 2,
        stroke: { color: ISLAND_COLORS.WOOD_DARK, width: 2 },
        dropShadow: {
          alpha: 0.75,
          blur: 0,
          color: ISLAND_COLORS.WOOD_DARK,
          distance: 2.5,
          angle: Math.PI / 2,
        },
      }
    });
    label.anchor.set(0, 0.5);

    const gap = 10;
    const totalW = iconSize + gap + label.width;
    const startX = -totalW / 2;

    icon.x = startX + iconSize / 2;
    icon.y = 0;

    label.x = startX + iconSize + gap;
    label.y = 0;

    content.addChild(icon, label);
    btn.addChild(body, content);

    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    btn.on('pointerdown', () => {
      btn.isPressed = true;
      btn.scale.set(0.95);
      btn.y = (btn.baseY || 0) + 3;
      SoundSynth.playClick();
    });
    btn.on('pointerup', () => {
      btn.isPressed = false;
      btn.scale.set(1.0);
      btn.y = btn.baseY || 0;
      onClick?.();
    });
    btn.on('pointerupoutside', () => {
      btn.isPressed = false;
      btn.scale.set(1.0);
      btn.y = btn.baseY || 0;
    });

    return btn;
  }

  refresh() {
    this._buildHeroMascot(this.designW || 800);
    this._buildButtons(this.designW || 800);
  }

  resize(width, height) {
    this.screenWidth = width;
    this.screenHeight = height;
    const ui = getUiScale(width, height);
    this.uiScale = ui;

    const designW = width / ui;
    this.designW = designW;
    this._buildTitle(designW);
    this._buildHeroMascot(designW);
    this._buildButtons(designW);

    // Measure the three blocks and fit them as one centred vertical stack
    const tb = this.titleContainer.getLocalBounds();
    const mb = this.heroMascotContainer.getLocalBounds();
    const bb = this.buttonsContainer.getLocalBounds();
    const gap = 24;
    const contentH = tb.height + mb.height + bb.height + gap * 2;
    const contentW = Math.max(tb.width, mb.width, bb.width);
    const s = Math.max(0.8, Math.min(1.4, (height * 0.86) / contentH, (width * 0.94) / contentW));
    this.uiScale = s;
    this.titleContainer.scale.set(s);
    this.heroMascotContainer.scale.set(s);
    this.buttonsContainer.scale.set(s);

    const free = Math.max(0, height - contentH * s);
    const extra = Math.min(free * 0.18, 50 * s);
    let cy = (height - contentH * s - extra * 2) / 2;
    const cx = Math.round(width * 0.5);

    this.titleContainer.position.set(cx, Math.round(cy - tb.y * s));
    cy += tb.height * s + gap * s + extra;
    this.heroMascotContainer.position.set(cx, Math.round(cy - mb.y * s));
    cy += mb.height * s + gap * s + extra;
    this.buttonsContainer.position.set(cx, Math.round(cy - bb.y * s));

    this.bgGfx.clear();
    const minDim = Math.min(width, height);
    // Horizon sits behind the mascot island so it "floats" on the sea
    const horizonY = Math.round(this.heroMascotContainer.y + (mb.y + mb.height * 0.75) * s);
    this.horizonY = horizonY;

    // Sky (top) and sea (bottom), each with its own normalized gradient
    this.bgGfx.rect(0, 0, width, horizonY).fill({ fill: vGrad(0x5ec8f7, 0xb9ecff) });
    this.bgGfx.rect(0, horizonY, width, height - horizonY).fill({
      fill: vGrad([
        { offset: 0, color: 0x1fb5ec },
        { offset: 1, color: 0x0a6db8 }
      ])
    });
    // Bright horizon line
    this.bgGfx.rect(0, horizonY - 1, width, 3).fill({ color: 0xffffff, alpha: 0.55 });

    // Static decorations (Sun and Distant Islands)
    this.decorationsGfx.clear();
    const d = this.decorationsGfx;
    const sunR = Math.min(34, minDim * 0.055);
    d.circle(width - sunR * 1.6, sunR * 1.6, sunR * 1.5).fill({ color: 0xfff7cc, alpha: 0.35 })
      .circle(width - sunR * 1.6, sunR * 1.6, sunR).fill({ color: 0xffe066 });

    // Distant islands on the horizon
    const island = (x, w, h) => {
      d.moveTo(x - w / 2, horizonY)
        .quadraticCurveTo(x - w * 0.15, horizonY - h * 2, x + w * 0.1, horizonY - h * 0.9)
        .quadraticCurveTo(x + w * 0.3, horizonY - h * 1.3, x + w / 2, horizonY)
        .closePath()
        .fill({ color: 0x43a047 });
      d.ellipse(x, horizonY, w * 0.58, 4).fill({ color: 0xffe29a });
    };
    island(width * 0.08, Math.max(70, width * 0.16), 22);
    island(width * 0.94, Math.max(60, width * 0.12), 16);

    // Initialize procedural drifting clouds
    const cs = Math.max(0.7, Math.min(1.3, width / 600));
    this.clouds = [
      { x: width * 0.12, y: height * 0.07, s: cs * 0.8, speed: 12 },
      { x: width * 0.82, y: height * 0.32, s: cs * 0.95, speed: 18 },
      { x: width * 0.16, y: height * 0.42, s: cs * 0.75, speed: 15 },
      { x: width * 0.52, y: height * 0.18, s: cs * 0.65, speed: 10 },
    ];

    this.update(0);
  }

  /**
   * Per-frame idle animation update for Main Menu
   */
  update(deltaSeconds) {
    this.animTime += deltaSeconds;

    // 1. Drifting Sky Clouds
    if (this.clouds && this.clouds.length > 0) {
      this.cloudsGfx.clear();
      const cg = this.cloudsGfx;
      for (const c of this.clouds) {
        c.x += c.speed * deltaSeconds;
        const maxW = 100 * c.s;
        if (c.x - maxW > this.screenWidth) {
          c.x = -maxW;
        }
        const x = c.x;
        const y = c.y;
        const s = c.s;
        cg.ellipse(x, y + 10 * s, 46 * s, 9 * s).fill({ color: 0x7cc8ea, alpha: 0.32 });
        cg.circle(x - 26 * s, y, 16 * s)
          .circle(x, y - 10 * s, 22 * s)
          .circle(x + 26 * s, y, 15 * s)
          .roundRect(x - 42 * s, y - 2 * s, 84 * s, 16 * s, 8 * s)
          .fill({ color: 0xffffff, alpha: 0.94 });
      }
    }

    // 2. Rocking Ocean Wave Ripples
    this.wavesGfx.clear();
    const wg = this.wavesGfx;
    const wavePoints = [
      [0.15, 0.68, 0],
      [0.82, 0.72, 1.2],
      [0.30, 0.86, 2.4],
      [0.70, 0.90, 0.8],
      [0.50, 0.78, 1.8],
    ];
    for (const [fx, fy, phase] of wavePoints) {
      const baseX = this.screenWidth * fx;
      const baseY = this.screenHeight * fy;
      const wx = baseX + Math.sin(this.animTime * 1.8 + phase) * 6;
      const wy = baseY + Math.cos(this.animTime * 1.5 + phase) * 2.5;
      wg.moveTo(wx - 14, wy)
        .quadraticCurveTo(wx - 7, wy - 6, wx, wy)
        .quadraticCurveTo(wx + 7, wy - 6, wx + 14, wy)
        .stroke({ width: 2.2, color: 0xffffff, alpha: 0.5 });
    }

    // 3. Peeking Title Mascot Heads Bobbing
    for (let i = 0; i < this.mascotNodes.length; i++) {
      const mn = this.mascotNodes[i];
      mn.y = mn.baseY + Math.sin(this.animTime * 3.0 + i * 1.3) * 3.0;
    }

    // 4. Fluttering Fish Windsock Flags
    if (this.flagsGfx) {
      this.flagsGfx.clear();
      // Flagpoles
      this.flagsGfx.moveTo(-68, 38).lineTo(-68, 10).stroke({ width: 2.2, color: 0x78350f });
      this.flagsGfx.circle(-68, 10, 3).fill({ color: 0xfacc15 });
      this.flagsGfx.moveTo(68, 38).lineTo(68, 10).stroke({ width: 2.2, color: 0x78350f });
      this.flagsGfx.circle(68, 10, 3).fill({ color: 0xfacc15 });

      // Dynamic tail flutter
      const wagLeft = Math.sin(this.animTime * 6.5) * 3.6;
      const wagRight = Math.sin(this.animTime * 6.5 + 1.4) * 3.6;
      drawFish(this.flagsGfx, -58, 14, 22, 0xf59e0b, wagLeft, 0xffffff);
      drawFish(this.flagsGfx, 58, 14, 22, 0xef4444, wagRight, 0xffffff);
    }

    // 5. Captain Cat Hero Mascot Breathing & Gentle Bobbing
    if (this.heroCat) {
      const bob = Math.sin(this.animTime * 2.8) * 3.8;
      const breathe = Math.sin(this.animTime * 2.8) * 0.028;
      this.heroCat.y = bob;
      this.heroCat.scale.set(1.0 - breathe * 0.5, 1.0 + breathe);
    }

    // 6. Rotating & Pulsing Accent Stars
    for (let i = 0; i < this.starNodes.length; i++) {
      const sn = this.starNodes[i];
      sn.rotation += deltaSeconds * sn.rotSpeed;
      const p = 0.85 + Math.sin(this.animTime * 3.2 + i * 1.5) * 0.22;
      sn.scale.set(p);
      sn.alpha = 0.68 + Math.sin(this.animTime * 3.2 + i * 1.5) * 0.32;
    }

    // 7. Inviting Breathing Pulse on Primary "CHƠI" Button
    if (this.playBtn && !this.playBtn.isPressed) {
      const pulse = 1.0 + Math.sin(this.animTime * 3.2) * 0.032;
      this.playBtn.scale.set(pulse);
    }
  }
}
