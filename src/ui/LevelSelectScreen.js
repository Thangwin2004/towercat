/**
 * Level Select Screen ("CHỌN ẢI") - Full-screen page (not a popup).
 * - Tropical sky/sea backdrop matching the Main Menu
 * - Top bar: back disc button + wooden title signboard + total stars pill
 * - 5 difficulty tabs, chapter banner with prev/next, responsive level grid
 * - Grid columns are chosen from the real available area so buttons are
 *   as large as possible on every aspect ratio (portrait phone -> desktop)
 * - Swipe left/right on the board to change chapter
 */

import { Container, Graphics, Text, Rectangle } from 'pixi.js';
import { vGrad, getUiScale } from '../utils/gfx.js';
import { SoundSynth } from '../core/SoundSynth.js';
import { createSvgIcon } from './SvgIcons.js';
import { Storage } from '../core/Storage.js';
import { drawWoodenPlankBoard, drawWoodenDiscButton, ISLAND_COLORS } from './TropicalUiTheme.js';

const FONT = '"Be Vietnam Pro", sans-serif';
const MAX_LEVEL = 50;

const CHAPTERS = [
  { id: 1, name: 'CỰC DỄ', short: 'Cực Dễ', start: 1, end: 10 },
  { id: 2, name: 'DỄ', short: 'Dễ', start: 11, end: 20 },
  { id: 3, name: 'BÌNH THƯỜNG', short: 'Thường', start: 21, end: 30 },
  { id: 4, name: 'KHÓ', short: 'Khó', start: 31, end: 40 },
  { id: 5, name: 'SIÊU KHÓ', short: 'Siêu Khó', start: 41, end: 50 },
];

export class LevelSelectScreen extends Container {
  constructor({ onSelectLevel, onBack }) {
    super();
    this.onSelectLevel = onSelectLevel;
    this.onBack = onBack;

    this.bgGfx = new Graphics();
    this.wavesGfx = new Graphics();
    this.ui = new Container();
    this.addChild(this.bgGfx, this.wavesGfx, this.ui);

    this.visible = false;
    this.screenWidth = 800;
    this.screenHeight = 600;
    this.chapterIdx = 0;
    this.animTime = 0;
    this.nextBtn = null;
    this._swiped = false;
  }

  open() {
    const unlocked = Math.min(Storage.getUnlockedLevel(), MAX_LEVEL);
    let idx = CHAPTERS.findIndex(c => unlocked >= c.start && unlocked <= c.end);
    if (idx < 0) idx = 0;
    this.chapterIdx = idx;
    this.visible = true;
    this._build();
  }

  close() {
    this.visible = false;
    // Defer: close() is usually called from inside a button's pointer handler
    queueMicrotask(() => { if (!this.visible) this._clearUi(); });
  }

  _clearUi() {
    this.nextBtn = null;
    const old = this.ui.removeChildren();
    old.forEach(c => c.destroy({ children: true }));
  }

  resize(width, height) {
    this.screenWidth = width;
    this.screenHeight = height;
    if (this.visible) this._build();
  }

  // ---------------------------------------------------------------- BUILD
  _build() {
    const W = this.screenWidth;
    const H = this.screenHeight;
    this._drawBackground(W, H);
    this._clearUi();

    // Everything is laid out in "design units" that exactly cover the screen
    const s = getUiScale(W, H);
    const dw = W / s;
    const dh = H / s;
    this.ui.scale.set(s);
    this.designW = dw;
    this.designH = dh;

    const cx = dw / 2;
    const contentW = Math.min(dw - 24, 660);
    const left = cx - contentW / 2;
    const compact = dh < 520; // landscape phones

    // --- Top bar ---
    const titleY = compact ? 40 : 52;
    const backBtn = this._createDiscButton('arrowBack', 24, () => this.onBack?.());
    backBtn.position.set(left + 26, titleY);
    backBtn.baseY = titleY;

    const titleW = Math.min(250, contentW - 128);
    const title = this._createTitleSign('CHỌN ẢI', 'crown', titleW, 50);
    title.position.set(cx, titleY);

    this.ui.addChild(title, backBtn);

    // Stars pill: right of the title on wide screens, under it otherwise
    const starsPill = this._createStarsPill();
    let tabsY;
    if (contentW >= 520) {
      starsPill.position.set(left + contentW - 78, titleY);
      tabsY = titleY + 56;
    } else {
      starsPill.position.set(cx, titleY + 50);
      tabsY = titleY + 94;
    }
    this.ui.addChild(starsPill);

    // --- Difficulty tabs ---
    const tabGap = 8;
    const tabW = Math.min(110, (contentW - tabGap * 4) / 5);
    const tabH = 36;
    CHAPTERS.forEach((ch, i) => {
      const tab = this._createTab(ch, i === this.chapterIdx, tabW, tabH, () => this._setChapter(i));
      tab.position.set(left + tabW / 2 + i * (tabW + tabGap), tabsY);
      this.ui.addChild(tab);
    });

    // --- Board panel ---
    const panelTop = tabsY + tabH / 2 + 16;
    const panelBottom = dh - 18;
    const panelH = Math.max(200, panelBottom - panelTop);
    const panel = this._createPanel(contentW, panelH);
    panel.position.set(cx, panelTop + panelH / 2);
    this.ui.addChild(panel);

    // Chapter banner (local coords of panel)
    const ch = CHAPTERS[this.chapterIdx];
    const bannerY = -panelH / 2 + 38;
    const bannerW = Math.min(contentW - 130, 360);
    const banner = new Graphics();
    drawWoodenPlankBoard(banner, 0, bannerY, bannerW, 38, {
      pill: true, catEars: false, studs: true,
    });
    const bannerTxt = new Text({
      text: `CHƯƠNG ${ch.id}: ${ch.name}`,
      style: { fontFamily: FONT, fontSize: 15, fontWeight: '900', fill: 0xffffff, letterSpacing: 0.8,
        dropShadow: { alpha: 0.6, blur: 0, color: ISLAND_COLORS.WOOD_DARK, distance: 1.5, angle: Math.PI / 2 } },
    });
    bannerTxt.anchor.set(0.5);
    bannerTxt.y = bannerY - 1;
    const subTxt = new Text({
      text: `Ải ${ch.start} – ${ch.end}`,
      style: { fontFamily: FONT, fontSize: 12, fontWeight: '800', fill: ISLAND_COLORS.WOOD_SHADOW },
    });
    subTxt.anchor.set(0.5);
    subTxt.y = bannerY + 32;
    panel.addChild(banner, bannerTxt, subTxt);

    if (this.chapterIdx > 0) {
      const prev = this._createDiscButton('arrowBack', 18, () => this._setChapter(this.chapterIdx - 1));
      prev.position.set(-bannerW / 2 - 28, bannerY);
      prev.baseY = bannerY;
      panel.addChild(prev);
    }
    if (this.chapterIdx < CHAPTERS.length - 1) {
      const next = this._createDiscButton('arrowRight', 18, () => this._setChapter(this.chapterIdx + 1));
      next.position.set(bannerW / 2 + 28, bannerY);
      next.baseY = bannerY;
      panel.addChild(next);
    }

    // --- Level grid ---
    const gridTop = bannerY + 52;
    const gridBottom = panelH / 2 - 18;
    this._buildGrid(panel, ch, contentW - 40, Math.max(80, gridBottom - gridTop), gridTop);

    // Swipe left/right on the board to change chapter
    panel.eventMode = 'static';
    panel.hitArea = new Rectangle(-contentW / 2, -panelH / 2, contentW, panelH);
    let downX = null;
    panel.on('pointerdown', (e) => { downX = e.global.x; this._swiped = false; });
    const endSwipe = (e) => {
      if (downX === null) return;
      const dx = (e.global.x - downX) / s;
      downX = null;
      if (Math.abs(dx) > 60) {
        this._swiped = true;
        if (dx < 0 && this.chapterIdx < CHAPTERS.length - 1) this._setChapter(this.chapterIdx + 1);
        else if (dx > 0 && this.chapterIdx > 0) this._setChapter(this.chapterIdx - 1);
      }
    };
    panel.on('pointerup', endSwipe);
    panel.on('pointerupoutside', endSwipe);
  }

  _buildGrid(panel, ch, aw, ah, top) {
    const count = ch.end - ch.start + 1;
    // Pick the column count that gives the biggest cells for this area
    let best = { cols: 5, rows: 2, cell: 0 };
    for (const cols of [5, 4, 3, 2]) {
      const rows = Math.ceil(count / cols);
      const cell = Math.min(aw / cols, ah / rows);
      if (cell > best.cell + 0.5) best = { cols, rows, cell };
    }
    const { cols, rows } = best;
    const cellW = aw / cols;
    const cellH = Math.min(ah / rows, cellW * 1.25);
    const r = Math.max(20, Math.min(46, Math.min(cellW * 0.36, cellH * 0.34)));
    const gridH = cellH * rows;
    const startY = top + (ah - gridH) / 2 + cellH / 2;

    const unlocked = Math.min(Storage.getUnlockedLevel(), MAX_LEVEL);

    for (let i = 0; i < count; i++) {
      const lvl = ch.start + i;
      const row = Math.floor(i / cols);
      const col = i % cols;
      const inRow = Math.min(cols, count - row * cols); // centre incomplete last row
      const x = (col - (inRow - 1) / 2) * cellW;
      const y = startY + row * cellH - r * 0.18;

      const btn = this._createLevelButton(lvl, r, lvl <= unlocked, lvl === unlocked);
      btn.position.set(x, y);
      btn.baseY = y;
      panel.addChild(btn);
      if (lvl === unlocked) this.nextBtn = btn;
    }
  }

  _setChapter(idx) {
    if (idx === this.chapterIdx || idx < 0 || idx >= CHAPTERS.length) return;
    SoundSynth.playToggle();
    this.chapterIdx = idx;
    queueMicrotask(() => { if (this.visible) this._build(); });
  }

  // ------------------------------------------------------------ WIDGETS
  _createLevelButton(lvl, r, isUnlocked, isNext) {
    const btn = new Container();
    const bg = new Graphics();

    if (isNext) {
      bg.circle(0, 2, r + 7).fill({ color: 0xfde047, alpha: 0.35 });
      bg.circle(0, 0, r + 5).stroke({ width: 3.5, color: 0xfde047 });
      drawWoodenDiscButton(bg, 0, 0, r, { baseTop: 0xfef08a, baseBot: ISLAND_COLORS.WOOD_MID });
    } else if (isUnlocked) {
      drawWoodenDiscButton(bg, 0, 0, r);
    } else {
      bg.circle(0, 4, r).fill({ color: 0x64748b, alpha: 0.55 });
      bg.circle(0, 0, r).fill({ fill: vGrad(0xf1f5f9, 0xcbd5e1) }).stroke({ width: 2.5, color: 0x94a3b8 });
      bg.circle(0, 0, r * 0.78).stroke({ width: 1.2, color: 0x94a3b8, alpha: 0.5 });
    }
    btn.addChild(bg);

    if (isUnlocked) {
      const label = new Text({
        text: String(lvl),
        style: {
          fontFamily: FONT, fontSize: Math.round(r * 0.78), fontWeight: '900', fill: 0xffffff,
          dropShadow: { alpha: 0.75, blur: 0, color: ISLAND_COLORS.WOOD_DARK, distance: 2, angle: Math.PI / 2 },
        },
      });
      label.anchor.set(0.5);
      label.y = -1;
      btn.addChild(label);

      const stars = Storage.getStars(lvl);
      const sz = Math.max(12, Math.round(r * 0.42));
      const starRow = new Container();
      starRow.y = r + sz * 0.55 + 4;
      for (let k = 0; k < 3; k++) {
        const st = createSvgIcon('star', sz, k < stars ? undefined : 0xcbd5e1);
        st.x = (k - 1) * sz * 1.05;
        st.y = k === 1 ? 2 : 0;
        starRow.addChild(st);
      }
      btn.addChild(starRow);

      btn.eventMode = 'static';
      btn.cursor = 'pointer';
      btn.on('pointerdown', () => {
        btn.isPressed = true;
        btn.scale.set(0.92);
        btn.y = btn.baseY + 2;
        SoundSynth.playClick();
      });
      const release = () => {
        btn.isPressed = false;
        btn.scale.set(1);
        btn.y = btn.baseY;
      };
      btn.on('pointerup', release);
      btn.on('pointerupoutside', release);
      // pointertap only fires when press & release hit the same button
      btn.on('pointertap', () => {
        if (this._swiped) return;
        this.onSelectLevel?.(lvl);
      });
    } else {
      const lock = createSvgIcon('lock', Math.round(r * 0.85));
      lock.y = -1;
      btn.addChild(lock);
    }
    return btn;
  }

  _createDiscButton(iconKey, r, onClick) {
    const btn = new Container();
    const body = new Graphics();
    drawWoodenDiscButton(body, 0, 0, r);
    const icon = createSvgIcon(iconKey, Math.round(r * 1.1));
    btn.addChild(body, icon);
    btn.baseY = 0;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn.on('pointerdown', (e) => {
      e.stopPropagation();
      btn.scale.set(0.92);
      btn.y = btn.baseY + 2.5;
      SoundSynth.playClick();
    });
    const release = () => { btn.scale.set(1); btn.y = btn.baseY; };
    btn.on('pointerup', release);
    btn.on('pointerupoutside', release);
    btn.on('pointertap', () => onClick?.());
    return btn;
  }

  _createTitleSign(str, iconKey, w, h) {
    const c = new Container();
    const g = new Graphics();
    drawWoodenPlankBoard(g, 0, 0, w, h, { pill: true, catEars: true });
    const iconSize = 26;
    const icon = createSvgIcon(iconKey, iconSize);
    const txt = new Text({
      text: str,
      style: {
        fontFamily: FONT, fontSize: 20, fontWeight: '900', fill: 0xffffff, letterSpacing: 1.5,
        dropShadow: { alpha: 0.75, blur: 0, color: ISLAND_COLORS.WOOD_DARK, distance: 2, angle: Math.PI / 2 },
      },
    });
    txt.anchor.set(0, 0.5);
    const gap = 8;
    const total = iconSize + gap + txt.width;
    icon.x = -total / 2 + iconSize / 2;
    txt.x = -total / 2 + iconSize + gap;
    txt.y = -1;
    c.addChild(g, icon, txt);
    return c;
  }

  _createStarsPill() {
    const c = new Container();
    const total = Storage.getTotalStars();
    const txt = new Text({
      text: `${total} / ${MAX_LEVEL * 3}`,
      style: { fontFamily: FONT, fontSize: 15, fontWeight: '900', fill: ISLAND_COLORS.WOOD_SHADOW },
    });
    txt.anchor.set(0, 0.5);
    const iconSize = 20;
    const w = iconSize + 8 + txt.width + 32;
    const g = new Graphics()
      .roundRect(-w / 2, -15 + 3, w, 30, 15).fill({ color: ISLAND_COLORS.WOOD_DARK, alpha: 0.35 })
      .roundRect(-w / 2, -15, w, 30, 15)
      .fill({ color: ISLAND_COLORS.SAND_PARCHMENT })
      .stroke({ width: 2, color: ISLAND_COLORS.WOOD_MID });
    const icon = createSvgIcon('star', iconSize);
    icon.x = -w / 2 + 16 + iconSize / 2;
    txt.x = icon.x + iconSize / 2 + 8;
    c.addChild(g, icon, txt);
    return c;
  }

  _createTab(ch, isActive, w, h, onClick) {
    const tab = new Container();
    const bg = new Graphics()
      .roundRect(-w / 2, -h / 2 + 3, w, h, h / 2)
      .fill({ color: ISLAND_COLORS.WOOD_DARK, alpha: isActive ? 0.9 : 0.35 })
      .roundRect(-w / 2, -h / 2, w, h, h / 2)
      .fill({ fill: isActive ? vGrad(ISLAND_COLORS.WOOD_HIGHLIGHT, ISLAND_COLORS.WOOD_MID) : ISLAND_COLORS.SAND_PARCHMENT })
      .stroke({ width: isActive ? 2.5 : 2, color: isActive ? ISLAND_COLORS.WOOD_DARK : ISLAND_COLORS.WOOD_HIGHLIGHT });
    const txt = new Text({
      text: ch.short,
      style: {
        fontFamily: FONT, fontSize: w < 64 ? 11 : 13, fontWeight: '900',
        fill: isActive ? 0xffffff : ISLAND_COLORS.WOOD_SHADOW,
      },
    });
    txt.anchor.set(0.5);
    txt.y = -1;
    if (txt.width > w - 8) txt.scale.set((w - 8) / txt.width);
    tab.addChild(bg, txt);
    tab.eventMode = 'static';
    tab.cursor = 'pointer';
    tab.on('pointertap', onClick);
    return tab;
  }

  _createPanel(w, h) {
    const panel = new Container();
    const shadow = new Graphics().roundRect(-w / 2 + 5, -h / 2 + 9, w, h, 22).fill({ color: 0x000000, alpha: 0.25 });
    const border = new Graphics();
    drawWoodenPlankBoard(border, 0, 0, w, h, { radius: 22, catEars: false });
    const face = new Graphics()
      .roundRect(-w / 2 + 12, -h / 2 + 12, w - 24, h - 24, 15)
      .fill({ color: ISLAND_COLORS.SAND_PARCHMENT })
      .roundRect(-w / 2 + 17, -h / 2 + 17, w - 34, h - 34, 11)
      .stroke({ width: 1.5, color: ISLAND_COLORS.SAND_BORDER });
    panel.addChild(shadow, border, face);
    return panel;
  }

  // --------------------------------------------------------- BACKGROUND
  _drawBackground(W, H) {
    const g = this.bgGfx;
    g.clear();
    const horizonY = Math.round(H * 0.42);
    this.horizonY = horizonY;
    g.rect(0, 0, W, horizonY).fill({ fill: vGrad(0x5ec8f7, 0xb9ecff) });
    g.rect(0, horizonY, W, H - horizonY).fill({ fill: vGrad(0x1fb5ec, 0x0a6db8) });
    g.rect(0, horizonY - 1, W, 3).fill({ color: 0xffffff, alpha: 0.55 });

    const sunR = Math.min(34, Math.min(W, H) * 0.055);
    g.circle(W - sunR * 1.6, sunR * 1.6, sunR * 1.5).fill({ color: 0xfff7cc, alpha: 0.35 })
      .circle(W - sunR * 1.6, sunR * 1.6, sunR).fill({ color: 0xffe066 });

    const cloud = (x, y, s) => {
      g.circle(x - 26 * s, y, 16 * s)
        .circle(x, y - 10 * s, 22 * s)
        .circle(x + 26 * s, y, 15 * s)
        .roundRect(x - 42 * s, y - 2 * s, 84 * s, 16 * s, 8 * s)
        .fill({ color: 0xffffff, alpha: 0.85 });
    };
    const cs = Math.max(0.7, Math.min(1.3, W / 600));
    cloud(W * 0.14, H * 0.08, cs * 0.8);
    cloud(W * 0.86, H * 0.26, cs * 0.9);
    cloud(W * 0.5, H * 0.17, cs * 0.6);
  }

  update(deltaSeconds) {
    if (!this.visible) return;
    this.animTime += deltaSeconds;

    // Gentle sea ripples
    const wg = this.wavesGfx;
    wg.clear();
    const pts = [[0.12, 0.62, 0], [0.85, 0.7, 1.2], [0.3, 0.88, 2.4], [0.7, 0.93, 0.8], [0.5, 0.76, 1.8]];
    for (const [fx, fy, ph] of pts) {
      const wx = this.screenWidth * fx + Math.sin(this.animTime * 1.8 + ph) * 6;
      const wy = this.screenHeight * fy + Math.cos(this.animTime * 1.5 + ph) * 2.5;
      wg.moveTo(wx - 14, wy)
        .quadraticCurveTo(wx - 7, wy - 6, wx, wy)
        .quadraticCurveTo(wx + 7, wy - 6, wx + 14, wy)
        .stroke({ width: 2.2, color: 0xffffff, alpha: 0.45 });
    }

    // Pulse the next playable level
    if (this.nextBtn && !this.nextBtn.destroyed && !this.nextBtn.isPressed) {
      this.nextBtn.scale.set(1 + Math.sin(this.animTime * 3.4) * 0.05);
    }
  }
}
