/**
 * Custom PixiJS v8 Dialog Overlays (Happy-Color & Marth3 Design System)
 * Strictly follows game-ui-design & hyper-casual-colors:
 * - Thick 3D Cyan-Blue / Gold / Red border
 * - Floating 3D title ribbon with glossy highlight sheen
 * - Bright warm ivory card face (#fffdf7)
 * - Rich Multi-Layered Vector Game Icons and tactile 3D buttons
 * - Perfectly balanced, centered responsive layout for all screens
 */

import { Container, Graphics, Text } from 'pixi.js';
import { vGrad, getUiScale } from '../utils/gfx.js';
import { SoundSynth } from '../core/SoundSynth.js';
import { createSvgIcon } from './SvgIcons.js';
import { Storage } from '../core/Storage.js';
import { drawWoodenPlankBoard, drawWoodenDiscButton, ISLAND_COLORS } from './TropicalUiTheme.js';

export class DialogOverlays extends Container {
  constructor() {
    super();
    this.overlayBg = new Graphics();
    this.sunburstGfx = new Graphics();
    this.confettiGfx = new Graphics();
    this.modalContainer = new Container();

    this.addChild(this.overlayBg, this.sunburstGfx, this.confettiGfx, this.modalContainer);
    this.visible = false;
    this.activeModal = null;
    this.victoryAnim = null;
  }

  hide() {
    this.visible = false;
    this.modalContainer.removeChildren();
    this.sunburstGfx.clear();
    this.confettiGfx.clear();
    this.activeModal = null;
    this.victoryAnim = null;
  }

  _showOverlay(width, height) {
    this.overlayBg.clear();
    // Warm atmospheric dark backdrop with soft twilight tint
    this.overlayBg.rect(0, 0, width, height).fill({ color: 0x091424, alpha: 0.76 });
    this.visible = true;
    this.modalContainer.x = Math.round(width * 0.5);
    this.modalContainer.y = Math.round(height * 0.5);
    this.sunburstGfx.position.set(this.modalContainer.x, this.modalContainer.y);
    this.confettiGfx.position.set(this.modalContainer.x, this.modalContainer.y);
    SoundSynth.playOpenModal();
  }

  // --- 1. VICTORY MODAL WITH DAZZLING CELEBRATION VFX ---
  showVictory({ level, time, stars = 3, score = 1000, onNext, onReplay, onHome }) {
    this.hide();
    const w = this.screenWidth || 800;
    const h = this.screenHeight || 600;
    this._showOverlay(w, h);
    this.activeModal = 'victory';

    const cardW = 350;
    const cardH = 340;
    this.cardW = cardW; this.cardH = cardH;
    const card = this._createCardBase(cardW, cardH, 'VICTORY');

    // 1. Rotating Golden God Rays / Sunburst Wheel (Behind Card)
    this._drawSunburstRays(320);

    // 2. Continuous Cascading Confetti Cannon (48 fluttering festive ribbons)
    const confettiPieces = [];
    const confColors = [0xfacc15, 0x38bdf8, 0x4ade80, 0xf43f5e, 0xa855f7, 0xfbbf24, 0xffffff];
    for (let i = 0; i < 48; i++) {
      confettiPieces.push({
        x: (Math.random() - 0.5) * w,
        y: -h / 2 + Math.random() * h,
        vx: (Math.random() - 0.5) * 40,
        vy: 110 + Math.random() * 140,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 4.5,
        w: 6 + Math.random() * 5,
        h: 10 + Math.random() * 8,
        color: confColors[Math.floor(Math.random() * confColors.length)],
        flipSpeed: 2.5 + Math.random() * 4,
        flipTime: Math.random() * Math.PI * 2,
      });
    }

    // Ribbon (Natural Tropical Wooden Signboard with Cat Ears)
    this._addRibbon(card, cardW, cardH, 'CHIẾN THẮNG!', 'trophy');

    // 3. Sequential 3-Star Slam Nodes with Golden Shockwave Rings
    const starContainer = new Container();
    starContainer.y = -cardH / 2 + 76;
    const starNodes = [];

    // Order: Star 0 (left at 0.3s) -> Star 2 (right at 0.6s) -> Star 1 (center big at 0.9s)
    const orderDefs = [
      { i: 0, x: -54, y: 0, size: 36, slamDelay: 0.3 },
      { i: 2, x: 54, y: 0, size: 36, slamDelay: 0.6 },
      { i: 1, x: 0, y: -6, size: 48, slamDelay: 0.9 },
    ];

    orderDefs.forEach(def => {
      const isLit = def.i < stars;
      const sCont = new Container();
      sCont.x = def.x;
      sCont.y = def.y;
      sCont.baseY = def.y;

      const star = createSvgIcon('star', def.size, isLit ? undefined : 0x64748b);
      const burstRing = new Graphics();
      sCont.addChild(burstRing, star);

      // Start fully hidden; slams down during animation
      sCont.scale.set(0);
      sCont.alpha = 0;

      starContainer.addChild(sCont);
      starNodes.push({
        cont: sCont,
        burstRing,
        starSize: def.size,
        isLit,
        starIdx: def.i,
        slamDelay: def.slamDelay,
        slammed: false,
        timer: 0,
        burstRadius: 0,
        burstAlpha: 0,
      });
    });
    card.addChild(starContainer);

    // 4. Stats Row with Count-Up Rolling Score
    const statsContainer = new Container();
    statsContainer.y = -cardH / 2 + 160;

    // Time Stat Pill (Warm Island Parchment with Wood Border)
    const timePill = new Container();
    timePill.x = -76;
    const timeBg = new Graphics()
      .roundRect(-68, -20, 136, 40, 20)
      .fill({ color: ISLAND_COLORS.SAND_PARCHMENT })
      .stroke({ width: 1.8, color: ISLAND_COLORS.WOOD_MID });
    const timeIcon = createSvgIcon('timer', 20);
    timeIcon.x = -36;
    timeIcon.y = 0;
    const timeTxt = new Text({
      text: `${time}s`,
      style: {
        fontFamily: '"Be Vietnam Pro", sans-serif',
        fontSize: 16,
        fontWeight: '900',
        fill: ISLAND_COLORS.WOOD_DARK,
      }
    });
    timeTxt.anchor.set(0, 0.5);
    timeTxt.x = -18;
    timeTxt.y = 0;
    timePill.addChild(timeBg, timeIcon, timeTxt);

    // Score Stat Pill (with rolling score counter)
    const scorePill = new Container();
    scorePill.x = 76;
    const scoreBg = new Graphics()
      .roundRect(-68, -20, 136, 40, 20)
      .fill({ color: ISLAND_COLORS.SAND_PARCHMENT })
      .stroke({ width: 1.8, color: ISLAND_COLORS.WOOD_MID });
    const scoreIcon = createSvgIcon('coin', 20);
    scoreIcon.x = -38;
    scoreIcon.y = 0;
    const scoreTxt = new Text({
      text: '+0',
      style: {
        fontFamily: '"Be Vietnam Pro", sans-serif',
        fontSize: 16,
        fontWeight: '900',
        fill: ISLAND_COLORS.WOOD_MID,
      }
    });
    scoreTxt.anchor.set(0, 0.5);
    scoreTxt.x = -20;
    scoreTxt.y = 0;
    scorePill.addChild(scoreBg, scoreIcon, scoreTxt);

    statsContainer.addChild(timePill, scorePill);
    card.addChild(statsContainer);

    // Action Buttons: 🏠 Home, 🔄 Replay, ⏩ Next Level (All in Natural Wood Theme)
    const btnY = cardH / 2 - 50;

    const homeBtn = this._createCircularIconButton('home', 26, () => {
      this.hide();
      onHome?.();
    });
    homeBtn.x = -112;
    homeBtn.y = btnY;

    const replayBtn = this._createCircularIconButton('replay', 26, () => {
      this.hide();
      onReplay?.();
    });
    replayBtn.x = -46;
    replayBtn.y = btnY;

    const nextBtn = this._createCapsuleIconButton('arrowRight', 'TIẾP', 132, 54, () => {
      this.hide();
      onNext?.();
    });
    nextBtn.x = 68;
    nextBtn.y = btnY;

    card.addChild(homeBtn, replayBtn, nextBtn);
    this.modalContainer.addChild(card);

    // 5. Store Animation State for update loop
    this.victoryAnim = {
      elapsed: 0,
      targetScore: score,
      currentScore: 0,
      scoreTxt,
      starNodes,
      confettiPieces,
      lastCoinTick: 0,
    };

    this.resize(w, h);
  }

  _drawSunburstRays(radius = 320) {
    this.sunburstGfx.clear();
    const rayCount = 18;
    const angleStep = (Math.PI * 2) / rayCount;
    for (let i = 0; i < rayCount; i++) {
      if (i % 2 === 0) {
        const a1 = i * angleStep;
        const a2 = a1 + angleStep * 0.75;
        this.sunburstGfx.poly([
          0, 0,
          Math.cos(a1) * radius, Math.sin(a1) * radius,
          Math.cos(a2) * radius, Math.sin(a2) * radius,
        ]).fill({ color: 0xfde047, alpha: 0.16 });
      }
    }
  }

  update(deltaSeconds) {
    if (!this.visible) return;

    if (this.activeModal === 'victory' && this.victoryAnim) {
      const anim = this.victoryAnim;
      anim.elapsed += deltaSeconds;

      // 1. Smoothly Rotate Sunburst God Rays
      this.sunburstGfx.rotation += deltaSeconds * 0.42;

      // 2. Cascade Falling Confetti Ribbons
      this.confettiGfx.clear();
      const halfW = (this.screenWidth || 800) / 2;
      const halfH = (this.screenHeight || 600) / 2;

      for (const c of anim.confettiPieces) {
        c.y += c.vy * deltaSeconds;
        c.x += c.vx * deltaSeconds + Math.sin(anim.elapsed * 3 + c.rot) * 20 * deltaSeconds;
        c.rot += c.vRot * deltaSeconds;
        c.flipTime += c.flipSpeed * deltaSeconds;

        if (c.y > halfH + 25) {
          c.y = -halfH - 25;
          c.x = (Math.random() - 0.5) * (this.screenWidth || 800);
        }

        const scaleY = Math.cos(c.flipTime);
        const cw = c.w;
        const ch = c.h * Math.abs(scaleY);

        this.confettiGfx.roundRect(c.x - cw / 2, c.y - ch / 2, cw, ch, 2)
          .fill({ color: c.color, alpha: 0.9 });
      }

      // 3. Staggered Star Slam Sequence
      for (const node of anim.starNodes) {
        if (!node.slammed && anim.elapsed >= node.slamDelay) {
          node.slammed = true;
          node.timer = 0;
          if (node.isLit) {
            SoundSynth.playStarChime(node.starIdx === 1 ? 3 : (node.starIdx === 0 ? 1 : 2));
            node.burstRadius = 8;
            node.burstAlpha = 1.0;
          }
        }

        if (node.slammed) {
          node.timer += deltaSeconds;
          const t = node.timer;
          if (t < 0.2) {
            const p = t / 0.2;
            const s = 2.8 - p * 1.9; // 2.8 -> 0.9
            node.cont.scale.set(s);
            node.cont.alpha = Math.min(1.0, p * 1.5);
          } else if (t < 0.35) {
            const p = (t - 0.2) / 0.15;
            const s = 0.9 + p * 0.25; // 0.9 -> 1.15
            node.cont.scale.set(s);
          } else if (t < 0.5) {
            const p = (t - 0.35) / 0.15;
            const s = 1.15 - p * 0.15; // 1.15 -> 1.0
            node.cont.scale.set(s);
          } else {
            node.cont.scale.set(1.0);
          }

          // Animate Star Burst Shockwave Ring
          if (node.burstAlpha && node.burstAlpha > 0.05) {
            node.burstRing.clear();
            node.burstRadius += deltaSeconds * 95;
            node.burstAlpha -= deltaSeconds * 2.2;
            node.burstRing.circle(0, 0, node.burstRadius)
              .stroke({ width: 3.5 * node.burstAlpha, color: 0xfde047, alpha: node.burstAlpha });
          } else if (node.burstRing) {
            node.burstRing.clear();
          }
        }
      }

      // 4. Rolling Score Counter
      if (anim.elapsed > 0.4 && anim.currentScore < anim.targetScore) {
        const step = Math.ceil(anim.targetScore * deltaSeconds * 2.0);
        anim.currentScore = Math.min(anim.targetScore, anim.currentScore + step);
        anim.scoreTxt.text = `+${anim.currentScore}`;
        if (anim.elapsed - anim.lastCoinTick > 0.08) {
          anim.lastCoinTick = anim.elapsed;
          SoundSynth.playScoreTally();
        }
      }
    }
  }

  // --- 2. DEFEAT MODAL ---
  showDefeat({ level, time, onReplay, onHome }) {
    this.hide();
    const w = this.screenWidth || 800;
    const h = this.screenHeight || 600;
    this._showOverlay(w, h);
    this.activeModal = 'defeat';

    const cardW = 340;
    const cardH = 280;
    this.cardW = cardW; this.cardH = cardH;
    const card = this._createCardBase(cardW, cardH, 'DEFEAT');

    // Ribbon (Natural Wood Theme with Cat Ears)
    this._addRibbon(card, cardW, cardH, 'BỊ CƯỚP ĐẢO!', 'shield');

    // Center Defeat Skull / Broken Shield Emblem
    const emblemContainer = new Container();
    emblemContainer.y = -cardH / 2 + 82;
    const skullEmblem = createSvgIcon('skull', 52);
    emblemContainer.addChild(skullEmblem);
    card.addChild(emblemContainer);

    // Compact Stat Pill: ⏱️ time (Warm Island Parchment with Wood Border)
    const statPill = new Container();
    statPill.y = -cardH / 2 + 150;
    const pillBg = new Graphics()
      .roundRect(-65, -18, 130, 36, 18)
      .fill({ color: ISLAND_COLORS.SAND_PARCHMENT })
      .stroke({ width: 1.8, color: ISLAND_COLORS.WOOD_MID });
    const timerIcon = createSvgIcon('timer', 20);
    timerIcon.x = -36;
    timerIcon.y = 0;
    const timerTxt = new Text({
      text: `${time}s`,
      style: {
        fontFamily: '"Be Vietnam Pro", sans-serif',
        fontSize: 16,
        fontWeight: '900',
        fill: ISLAND_COLORS.WOOD_DARK,
      }
    });
    timerTxt.anchor.set(0, 0.5);
    timerTxt.x = -18;
    timerTxt.y = 0;
    statPill.addChild(pillBg, timerIcon, timerTxt);
    card.addChild(statPill);

    // Action Buttons: 🏠 Home circular & 🔄 Replay prominent capsule (Natural Wood Theme)
    const btnY = cardH / 2 - 46;

    const homeBtn = this._createCircularIconButton('home', 26, () => {
      this.hide();
      onHome?.();
    });
    homeBtn.x = -75;
    homeBtn.y = btnY;

    const replayBtn = this._createCapsuleIconButton('replay', 'CHƠI LẠI', 165, 52, () => {
      this.hide();
      onReplay?.();
    });
    replayBtn.x = 65;
    replayBtn.y = btnY;

    card.addChild(homeBtn, replayBtn);
    this.modalContainer.addChild(card);

    this.resize(w, h);
  }

  // --- 3. PAUSE MODAL ---
  showPause({ onResume, onRestart, onHome, onSelectLevel }) {
    this.hide();
    const w = this.screenWidth || 800;
    const h = this.screenHeight || 600;
    this._showOverlay(w, h);
    this.activeModal = 'pause';

    const cardW = 340;
    const cardH = 205;
    this.cardW = cardW; this.cardH = cardH;
    const card = this._createCardBase(cardW, cardH, 'PAUSE');

    this._addRibbon(card, cardW, cardH, 'TẠM DỪNG', 'pause');

    // 3 3D Wooden Icon Buttons: 🏠 Home (Left), ▶️ Resume (Center Large), 🔄 Replay (Right)
    const btnY = 18;

    const homeBtn = this._createCircularIconButton('home', 26, () => {
      this.hide();
      onHome?.();
    });
    homeBtn.x = -82;
    homeBtn.y = btnY;

    const resumeBtn = this._createCircularIconButton('play', 34, () => {
      this.hide();
      onResume?.();
    });
    resumeBtn.x = 0;
    resumeBtn.y = btnY;

    const restartBtn = this._createCircularIconButton('replay', 26, () => {
      this.hide();
      onRestart?.();
    });
    restartBtn.x = 82;
    restartBtn.y = btnY;

    card.addChild(homeBtn, resumeBtn, restartBtn);
    this.modalContainer.addChild(card);

    this.resize(w, h);
  }

  // --- 4. TUTORIAL / HOW TO PLAY MODAL ---
  showTutorial({ onStart }) {
    this.hide();
    const w = this.screenWidth || 800;
    const h = this.screenHeight || 600;
    this._showOverlay(w, h);
    this.activeModal = 'tutorial';

    const cardW = 350;
    const cardH = 415;
    this.cardW = cardW; this.cardH = cardH;
    const card = this._createCardBase(cardW, cardH, 'TUTORIAL');

    // Ribbon with Royal Codex Icon (Natural Wood Signboard with Cat Ears)
    this._addRibbon(card, cardW, cardH, 'CÁCH CHƠI', 'help');

    const instructions = [
      { icon: 'paw', text: 'Kéo từ đảo ta sang đảo địch để xua quân (nút 50%/100% đổi lực lượng)' },
      { icon: 'flag', text: 'Chiếm đảo hoang ít quân để mở rộng căn cứ & tăng tốc sinh quân' },
      { icon: 'speedBoot', text: 'Giày Bay: Tăng gấp 2 tốc độ bay của toàn quân ta trên biển' },
      { icon: 'fortressShield', text: 'Thành Trì Khiên: Khóa đảo chặn ngay 3 đợt công phá' },
      { icon: 'troopReinforce', text: 'Viện Binh (+): Lập tức triệu hồi 10 chiến binh mèo tức thì' },
    ];

    const instContainer = new Container();
    instContainer.x = -145;
    instContainer.y = -cardH / 2 + 64;

    instructions.forEach((item, idx) => {
      const row = new Container();
      row.y = idx * 52;

      // Icon Backing: Cute Coconut Wood Disc
      const iconBg = new Graphics();
      drawWoodenDiscButton(iconBg, 16, 15, 15);

      const icon = createSvgIcon(item.icon, 18);
      icon.x = 16;
      icon.y = 15;

      const rowText = new Text({
        text: item.text,
        style: {
          fontFamily: '"Be Vietnam Pro", sans-serif',
          fontSize: 12.5,
          fontWeight: '700',
          fill: 0x1e293b,
          wordWrap: true,
          wordWrapWidth: 240,
          lineHeight: 16.5,
        }
      });
      rowText.x = 42;
      rowText.y = 0;

      row.addChild(iconBg, icon, rowText);
      instContainer.addChild(row);
    });
    card.addChild(instContainer);

    const startBtn = this._createCapsuleIconButton('paw', 'ĐÃ HIỂU', 180, 48, () => {
      this.hide();
      onStart?.();
    });
    startBtn.y = cardH / 2 - 42;
    card.addChild(startBtn);

    this.modalContainer.addChild(card);
    this.resize(w, h);
  }

  // --- CARD BASE & RIBBON BUILDERS ---
  _createCardBase(cardW, cardH, type) {
    const card = new Container();

    // 1. Soft Multi-layer Drop Shadow
    const shadow = new Graphics()
      .roundRect(-cardW / 2 + 6, -cardH / 2 + 10, cardW, cardH, 20)
      .fill({ color: 0x000000, alpha: 0.35 });

    // 2. Thick 3D Tropical Timber Border with Golden Studs (Consistent Wood Tones)
    const borderGfx = new Graphics();
    drawWoodenPlankBoard(borderGfx, 0, 0, cardW, cardH, {
      radius: 20,
      catEars: false,
      colorTop: ISLAND_COLORS.WOOD_HIGHLIGHT,
      colorBot: ISLAND_COLORS.WOOD_MID,
      borderColor: ISLAND_COLORS.WOOD_DARK,
    });

    // 3. Aged Warm Island Parchment Card Face & Soft Inset Border
    const face = new Graphics()
      .roundRect(-cardW / 2 + 12, -cardH / 2 + 12, cardW - 24, cardH - 24, 14)
      .fill({ color: ISLAND_COLORS.SAND_PARCHMENT })
      .roundRect(-cardW / 2 + 16, -cardH / 2 + 16, cardW - 32, cardH - 32, 11)
      .stroke({ width: 1.5, color: ISLAND_COLORS.SAND_BORDER });

    card.addChild(shadow, borderGfx, face);
    return card;
  }

  _addRibbon(card, cardW, cardH, titleTextStr, iconKey, colorTop, colorBot, colorShadow) {
    const ribbonW = 252;
    const ribbonH = 48;
    const ribbonY = -cardH / 2;

    const topCol = typeof colorTop === 'number' ? colorTop : ISLAND_COLORS.WOOD_HIGHLIGHT;
    const botCol = typeof colorBot === 'number' ? colorBot : ISLAND_COLORS.WOOD_MID;

    const ribbon = new Graphics();
    drawWoodenPlankBoard(ribbon, 0, ribbonY, ribbonW, ribbonH, {
      pill: true,
      catEars: true,
      colorTop: topCol,
      colorBot: botCol,
      borderColor: ISLAND_COLORS.WOOD_DARK
    });

    // Inner Content Row (Rich 3D Icon + Bold Title)
    const ribbonContent = new Container();
    ribbonContent.y = ribbonY;

    const iconSize = 24;
    const icon = createSvgIcon(iconKey, iconSize);

    const titleText = new Text({
      text: titleTextStr,
      style: {
        fontFamily: '"Be Vietnam Pro", sans-serif',
        fontSize: 16.5,
        fontWeight: '900',
        fill: 0xffffff,
        letterSpacing: 1.2,
        stroke: { color: ISLAND_COLORS.WOOD_DARK, width: 2 },
        dropShadow: {
          alpha: 0.7,
          blur: 0,
          color: ISLAND_COLORS.WOOD_DARK,
          distance: 2,
          angle: Math.PI / 2,
        }
      }
    });
    titleText.anchor.set(0, 0.5);

    const gap = 8;
    const totalW = iconSize + gap + titleText.width;
    const startX = -totalW / 2;

    icon.x = startX + iconSize / 2;
    icon.y = 0;

    titleText.x = startX + iconSize + gap;
    titleText.y = -0.5;

    ribbonContent.addChild(icon, titleText);
    card.addChild(ribbon, ribbonContent);
  }

  _createCircularIconButton(iconKey, r, onClick) {
    const btn = new Container();

    const body = new Graphics();
    drawWoodenDiscButton(body, 0, 0, r);

    const icon = createSvgIcon(iconKey, Math.round(r * 1.15));
    btn.addChild(body, icon);
    btn.icon = icon;

    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    btn.on('pointerdown', () => {
      btn.scale.set(0.92);
      btn.y += 2.5;
      SoundSynth.playClick();
    });
    btn.on('pointerup', () => {
      btn.scale.set(1.0);
      btn.y -= 2.5;
      onClick?.();
    });
    btn.on('pointerupoutside', () => {
      btn.scale.set(1.0);
      btn.y -= 2.5;
    });

    return btn;
  }

  _createCapsuleIconButton(iconKey, labelStr, w, h, onClick) {
    const btn = new Container();

    const topCol = ISLAND_COLORS.WOOD_HIGHLIGHT;
    const botCol = ISLAND_COLORS.WOOD_MID;

    const body = new Graphics();
    drawWoodenPlankBoard(body, 0, 0, w, h, { pill: true, catEars: false, colorTop: topCol, colorBot: botCol, borderColor: ISLAND_COLORS.WOOD_DARK });

    const content = new Container();
    const iconSize = Math.round(h * 0.52);
    const icon = createSvgIcon(iconKey, iconSize);

    const label = new Text({
      text: labelStr,
      style: {
        fontFamily: '"Be Vietnam Pro", sans-serif',
        fontSize: Math.round(h * 0.35),
        fontWeight: '900',
        fill: 0xffffff,
        letterSpacing: 1.2,
        stroke: { color: ISLAND_COLORS.WOOD_DARK, width: 2 },
        dropShadow: {
          alpha: 0.7,
          blur: 0,
          color: ISLAND_COLORS.WOOD_DARK,
          distance: 2,
          angle: Math.PI / 2,
        },
      }
    });
    label.anchor.set(0, 0.5);

    const gap = 8;
    const totalW = iconSize + gap + label.width;
    const startX = -totalW / 2;

    icon.x = startX + iconSize / 2;
    icon.y = 0;

    label.x = startX + iconSize + gap;
    label.y = -0.5;

    content.addChild(icon, label);
    btn.addChild(body, content);

    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    btn.on('pointerdown', () => {
      btn.scale.set(0.95);
      btn.y += 2.5;
      SoundSynth.playClick();
    });
    btn.on('pointerup', () => {
      btn.scale.set(1.0);
      btn.y -= 2.5;
      onClick?.();
    });
    btn.on('pointerupoutside', () => {
      btn.scale.set(1.0);
      btn.y -= 2.5;
    });

    return btn;
  }

  resize(width, height) {
    this.screenWidth = width;
    this.screenHeight = height;

    if (this.visible) {
      this.overlayBg.clear();
      this.overlayBg.rect(0, 0, width, height).fill({ color: 0x091424, alpha: 0.76 });
      this.modalContainer.x = Math.round(width * 0.5);
      this.modalContainer.y = Math.round(height * 0.5);

      // Responsive scaling based on the ACTUAL card size (Lesson 11):
      // fill phones edge-to-edge (minus margin), grow a bit on tablets/desktop.
      const cw = (this.cardW || 360) + 16;
      const ch = (this.cardH || 340) + 40; // ribbon + 3D shadow
      const scale = Math.min(getUiScale(width, height) * 1.1, (width - 20) / cw, (height - 40) / ch);

      this.sunburstGfx.position.set(this.modalContainer.x, this.modalContainer.y);
      this.sunburstGfx.scale.set(scale);
      this.confettiGfx.position.set(this.modalContainer.x, this.modalContainer.y);
      this.modalContainer.scale.set(scale);
    }
  }
}
