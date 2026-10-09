/**
 * Achievements Leaderboard (Bảng Vàng Thành Tích)
 * Strictly follows game-ui-design & hyper-casual-colors:
 * - 500 x 460 card dimensions (closed via the top-right X only)
 * - 2-column layout with Rank, Avatar, Name, Score
 * - Floating Golden Ribbon header with 3D Gold Trophy icon
 * - Pinned personal best footer
 * - Rich Multi-Layered Vector Game Icons
 */

import { Container, Graphics, Text } from 'pixi.js';
import { vGrad, getUiScale } from '../utils/gfx.js';

// Shrink font, then truncate with ellipsis, until text fits maxW (keeps narrow phones readable)
function fitText(txt, maxW, minFont = 11) {
  while (txt.width > maxW && txt.style.fontSize > minFont) {
    txt.style.fontSize = txt.style.fontSize - 1;
  }
  if (txt.width > maxW) {
    let str = txt.text;
    while (str.length > 3 && txt.width > maxW) {
      str = str.slice(0, -1);
      txt.text = str.trimEnd() + '…';
    }
  }
}
import { Storage } from '../core/Storage.js';
import { SoundSynth } from '../core/SoundSynth.js';
import { createSvgIcon } from './SvgIcons.js';
import { drawWoodenPlankBoard, drawWoodenDiscButton, ISLAND_COLORS } from './TropicalUiTheme.js';

export class LeaderboardModal extends Container {
  constructor(onClose) {
    super();
    this.onClose = onClose;

    this.overlayBg = new Graphics();
    this.cardContainer = new Container();

    this.addChild(this.overlayBg, this.cardContainer);
    this.visible = false;
  }

  _computeCardW(width, height) {
    const ui = getUiScale(width, height);
    return Math.round(Math.min(500, Math.max(320, width / ui - 20)));
  }

  show(entries = []) {
    this.cardContainer.removeChildren();
    this.visible = true;
    this._entries = entries;
    SoundSynth.playOpenModal();

    const width = this.screenWidth || 800;
    const height = this.screenHeight || 600;

    this.overlayBg.clear();
    this.overlayBg.rect(0, 0, width, height).fill({ color: 0x091424, alpha: 0.76 });

    this.cardContainer.x = Math.round(width * 0.5);
    this.cardContainer.y = Math.round(height * 0.5);

    const cardW = this._computeCardW(width, height);
    const cardH = 460;
    this._builtCardW = cardW;
    const hw = cardW / 2;
    const showAvatar = cardW >= 420;
    // Column anchors relative to the card width
    const C = {
      rank: -hw + 52,
      avatar: -hw + 96,
      name: showAvatar ? -hw + 120 : -hw + 82,
      score: hw - 38,
    };

    // 1. Soft Card Shadow
    const shadow = new Graphics()
      .roundRect(-cardW / 2 + 6, -cardH / 2 + 10, cardW, cardH, 20)
      .fill({ color: 0x000000, alpha: 0.35 });

    // 2. Thick 3D Tropical Timber Border with Golden Studs
    const borderGfx = new Graphics();
    drawWoodenPlankBoard(borderGfx, 0, 0, cardW, cardH, {
      radius: 20,
      catEars: false,
      colorTop: 0xfbbf24,
      colorBot: 0xd97706,
      borderColor: ISLAND_COLORS.WOOD_DARK,
    });

    // 3. Bright Warm Island Parchment Card Face
    const cardFace = new Graphics()
      .roundRect(-cardW / 2 + 12, -cardH / 2 + 12, cardW - 24, cardH - 24, 14)
      .fill({ color: ISLAND_COLORS.SAND_PARCHMENT })
      .roundRect(-cardW / 2 + 16, -cardH / 2 + 16, cardW - 32, cardH - 32, 11)
      .stroke({ width: 1.5, color: ISLAND_COLORS.SAND_BORDER });

    this.cardContainer.addChild(shadow, borderGfx, cardFace);

    // 4. Floating 3D Title Ribbon (Tropical Wooden Signboard with Cat Ears)
    const ribbonW = Math.min(300, cardW - 40);
    const ribbonH = 48;
    const ribbonY = -cardH / 2;

    const ribbon = new Graphics();
    drawWoodenPlankBoard(ribbon, 0, ribbonY, ribbonW, ribbonH, {
      pill: true,
      catEars: true,
      colorTop: 0xfbbf24,
      colorBot: 0xd97706,
      borderColor: ISLAND_COLORS.WOOD_DARK,
    });

    const ribbonContent = new Container();
    ribbonContent.y = ribbonY;

    const trophyIcon = createSvgIcon('trophy', 24);
    const titleText = new Text({
      text: 'BẢNG VÀNG THÀNH TÍCH',
      style: {
        fontFamily: '"Be Vietnam Pro", sans-serif',
        fontSize: 16.5,
        fontWeight: '900',
        fill: 0xffffff,
        letterSpacing: 1.2,
        dropShadow: {
          alpha: 0.6,
          blur: 3,
          color: 0x78350f,
          distance: 1.5,
        }
      }
    });
    titleText.anchor.set(0, 0.5);

    const totalW = 24 + 8 + titleText.width;
    const startX = -totalW / 2;

    trophyIcon.x = startX + 12;
    trophyIcon.y = 0;
    titleText.x = startX + 24 + 8;
    titleText.y = -1;

    ribbonContent.addChild(trophyIcon, titleText);
    this.cardContainer.addChild(ribbon, ribbonContent);

    // 5. Header Labels at y = -155
    const headerRank = new Text({
      text: 'HẠNG',
      style: { fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: 13, fontWeight: '800', fill: 0x64748b }
    });
    headerRank.anchor.set(0.5);
    headerRank.x = C.rank;
    headerRank.y = -155;

    const headerName = new Text({
      text: 'TƯỚNG MÈO',
      style: { fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: 13, fontWeight: '800', fill: 0x64748b }
    });
    headerName.x = C.name;
    headerName.y = -162;

    const headerScore = new Text({
      text: 'ĐIỂM SỐ',
      style: { fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: 13, fontWeight: '800', fill: 0x64748b }
    });
    headerScore.anchor.set(1, 0);
    headerScore.x = C.score;
    headerScore.y = -162;

    this.cardContainer.addChild(headerRank, headerName, headerScore);

    // 6. Ranking Rows
    const list = entries && entries.length > 0 ? entries : this._getDefaultEntries();
    const startY = -120;
    const rowHeight = 44;

    list.slice(0, 5).forEach((item, idx) => {
      const ry = startY + idx * rowHeight;
      const isEven = idx % 2 === 0;

      // Row Background
      const rowBg = new Graphics()
        .roundRect(-hw + 22, ry - 19, cardW - 44, 38, 10)
        .fill({ color: idx === 0 ? 0xfef9c3 : (idx === 1 ? 0xf1f5f9 : (idx === 2 ? 0xffedd5 : (isEven ? 0xfffcf5 : 0xf8f6f0))) })
        .stroke({ width: 1.2, color: idx === 0 ? 0xfde047 : (idx === 1 ? 0xcbd5e1 : (idx === 2 ? 0xfdba74 : 0xe8e2d4)) });

      // Rank Icon
      const rankContainer = new Container();
      rankContainer.x = C.rank;
      rankContainer.y = ry;

      if (idx === 0) {
        // Gold Medal 3D
        const medal = createSvgIcon('medalGold', 24);
        rankContainer.addChild(medal);
      } else if (idx === 1) {
        // Silver Badge
        const silverBg = new Graphics()
          .circle(0, 0, 11)
          .fill({ color: 0x94a3b8 })
          .stroke({ width: 1.5, color: 0xffffff });
        const silverText = new Text({
          text: '2',
          style: { fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: 12, fontWeight: '900', fill: 0xffffff }
        });
        silverText.anchor.set(0.5);
        rankContainer.addChild(silverBg, silverText);
      } else if (idx === 2) {
        // Bronze Badge
        const bronzeBg = new Graphics()
          .circle(0, 0, 11)
          .fill({ color: 0xd97706 })
          .stroke({ width: 1.5, color: 0xffffff });
        const bronzeText = new Text({
          text: '3',
          style: { fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: 12, fontWeight: '900', fill: 0xffffff }
        });
        bronzeText.anchor.set(0.5);
        rankContainer.addChild(bronzeBg, bronzeText);
      } else {
        const numText = new Text({
          text: String(idx + 1),
          style: { fontFamily: '"Be Vietnam Pro", sans-serif', fontSize: 13.5, fontWeight: '900', fill: 0x64748b }
        });
        numText.anchor.set(0.5);
        rankContainer.addChild(numText);
      }

      // Procedural Tribal Avatar Crest
      const avatarGfx = new Graphics();
      const crestColor = idx === 0 ? 0xf59e0b : (idx === 1 ? 0x0284c7 : (idx === 2 ? 0x10b981 : 0x8b5cf6));
      if (showAvatar) {
        avatarGfx
          .circle(C.avatar, ry, 14)
          .fill({ color: crestColor })
          .stroke({ width: 2, color: 0xffffff });

        // Inner emblem star
        avatarGfx.circle(C.avatar, ry, 5).fill({ color: 0xffffff });
      }

      // Name Text
      const nameText = new Text({
        text: item.name || `Tù Trưởng #${idx + 1}`,
        style: {
          fontFamily: '"Be Vietnam Pro", sans-serif',
          fontSize: 14,
          fontWeight: '800',
          fill: 0x1e293b,
        }
      });
      nameText.anchor.set(0, 0.5);
      nameText.x = C.name;
      nameText.y = ry;

      // Score Text
      const scoreText = new Text({
        text: `${item.score.toLocaleString()} cá`,
        style: {
          fontFamily: '"Be Vietnam Pro", sans-serif',
          fontSize: 14,
          fontWeight: '900',
          fill: idx === 0 ? 0xb45309 : 0x0284c7,
        }
      });
      scoreText.anchor.set(1, 0.5);
      scoreText.x = C.score;
      scoreText.y = ry;
      fitText(nameText, C.score - scoreText.width - 12 - C.name);

      this.cardContainer.addChild(rowBg, rankContainer, avatarGfx, nameText, scoreText);
    });

    // 7. Pinned Personal Best Footer at y = 165
    const footerBg = new Graphics()
      .roundRect(-hw + 22, 143, cardW - 44, 44, 12)
      .fill({ color: 0xfefce8 })
      .stroke({ width: 2, color: 0xfacc15 });

    const starIcon = createSvgIcon('star', 20);
    starIcon.x = C.rank;
    starIcon.y = 165;

    const myAvatarGfx = new Graphics();
    if (showAvatar) {
      myAvatarGfx
        .circle(C.avatar, 165, 14)
        .fill({ color: 0x0284c7 })
        .stroke({ width: 2, color: 0xffffff });
      myAvatarGfx.circle(C.avatar, 165, 5).fill({ color: 0xffffff });
    }

    const myNameText = new Text({
      text: 'Bạn (Kỷ lục cá nhân)',
      style: {
        fontFamily: '"Be Vietnam Pro", sans-serif',
        fontSize: 14,
        fontWeight: '900',
        fill: 0x78350f,
      }
    });
    myNameText.anchor.set(0, 0.5);
    myNameText.x = C.name;
    myNameText.y = 165;

    const myScoreText = new Text({
      text: `${Storage.data.highScore.toLocaleString()} cá`,
      style: {
        fontFamily: '"Be Vietnam Pro", sans-serif',
        fontSize: 15,
        fontWeight: '900',
        fill: 0xd97706,
      }
    });
    myScoreText.anchor.set(1, 0.5);
    myScoreText.x = C.score;
    myScoreText.y = 165;
    fitText(myNameText, C.score - myScoreText.width - 12 - C.name);

    this.cardContainer.addChild(footerBg, starIcon, myAvatarGfx, myNameText, myScoreText);

    // 8. Top-Right Corner Close Button (Wood Disc) - the only close control
    const topCloseBtn = this._createCircularIconButton('close', 18, () => {
      this.hide();
      this.onClose?.();
    });
    topCloseBtn.x = cardW / 2 - 20;
    topCloseBtn.y = -cardH / 2 + 20;
    this.cardContainer.addChild(topCloseBtn);

    this.resize(width, height);
  }

  _createCircularIconButton(iconKey, r, onClick) {
    const btn = new Container();

    const bg = new Graphics();
    drawWoodenDiscButton(bg, 0, 0, r);

    const icon = createSvgIcon(iconKey, Math.round(r * 1.15));

    btn.addChild(bg, icon);
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

  _createCapsuleIconButton(iconKey, labelStr, w, h, onClick) {
    const btn = new Container();

    const topCol = ISLAND_COLORS.WOOD_HIGHLIGHT;
    const botCol = ISLAND_COLORS.WOOD_MID;

    const body = new Graphics();
    drawWoodenPlankBoard(body, 0, 0, w, h, { pill: true, catEars: false, colorTop: topCol, colorBot: botCol });

    const content = new Container();
    const iconSize = Math.round(h * 0.52);
    const icon = createSvgIcon(iconKey, iconSize);

    const label = new Text({
      text: labelStr,
      style: {
        fontFamily: '"Be Vietnam Pro", sans-serif',
        fontSize: 13,
        fontWeight: '900',
        fill: 0xffffff,
        stroke: { color: ISLAND_COLORS.WOOD_DARK, width: 2 },
        dropShadow: { alpha: 0.65, blur: 0, color: ISLAND_COLORS.WOOD_DARK, distance: 1.5, angle: Math.PI / 2 },
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

  _getDefaultEntries() {
    return [
      { name: 'Mèo Mập Bá Chủ', score: 14500 },
      { name: 'Cáo Già Lém Lỉnh', score: 12800 },
      { name: 'Gấu Mật Ong', score: 10400 },
      { name: 'Cú Mèo Thông Thái', score: 9200 },
      { name: 'Mèo Mướp Tiên Phong', score: 8100 },
    ];
  }

  hide() {
    this.visible = false;
  }

  resize(width, height) {
    this.screenWidth = width;
    this.screenHeight = height;

    if (this.visible) {
      this.overlayBg.clear();
      this.overlayBg.rect(0, 0, width, height).fill({ color: 0x091424, alpha: 0.76 });
      this.cardContainer.x = Math.round(width * 0.5);
      this.cardContainer.y = Math.round(height * 0.5);

      // Rebuild if the responsive card width changed (rotation / resize)
      if (this._entries && this._computeCardW(width, height) !== this._builtCardW) {
        this.show(this._entries);
        return;
      }
      const cw = (this._builtCardW || 500) + 16;
      const scale = Math.min(getUiScale(width, height) * 1.05, (width - 16) / cw, (height - 40) / 510);
      this.cardContainer.scale.set(scale);
    }
  }
}
