/**
 * Core Game Application Coordinator
 * Manages PixiJS v8 init, screen states, modals, and responsive layout.
 */

import { Application } from 'pixi.js';
import { MainMenu } from '../ui/MainMenu.js';
import { GameScene } from '../game/GameScene.js';
import { GameHud } from '../ui/GameHud.js';
import { DialogOverlays } from '../ui/DialogOverlays.js';
import { LeaderboardModal } from '../ui/LeaderboardModal.js';
import { LevelSelectScreen } from '../ui/LevelSelectScreen.js';
import { Storage } from './Storage.js';
import { SoundSynth } from './SoundSynth.js';
import { AdManager } from '../integrations/AdManager.js';
import { WinkAdapter } from '../integrations/wink/wink-adapter.js';

export class GameApp {
  constructor() {
    this.app = null;
    this.currentScreen = 'menu'; // 'menu' | 'levelSelect' | 'game'
    this.currentLevel = 1;
  }

  async init() {
    this.app = new Application();

    await this.app.init({
      background: '#1597db',
      resizeTo: window,
      resolution: Math.max(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      antialias: true,
      powerPreference: 'high-performance',
    });

    const container = document.getElementById('game-container');
    if (container) {
      container.appendChild(this.app.canvas);
    } else {
      document.body.appendChild(this.app.canvas);
    }

    // 1. Game Scene
    this.gameScene = new GameScene(this.app, (result, stats) => this.handleGameEnd(result, stats));
    this.gameScene.visible = false;
    this.app.stage.addChild(this.gameScene);

    // 2. Game HUD
    this.gameHud = new GameHud({
      onPause: () => this.handlePause(),
      onToggleAudio: () => SoundSynth.toggleMute(),
      onSkillActivate: (type) => this.handleSkillActivate(type),
      onTogglePercentage: () => this.gameScene.toggleSendPercentage(),
    });
    this.gameHud.visible = false;
    this.app.stage.addChild(this.gameHud);

    // 3. Main Menu
    this.mainMenu = new MainMenu({
      onStartLevel: (lvl) => this.startGame(lvl),
      onOpenLevelSelect: () => this.showLevelSelect(),
      onShowLeaderboard: () => this.showLeaderboard(),
      onShowTutorial: () => this.dialogs.showTutorial({ onStart: () => this.showLevelSelect() }),
    });
    this.app.stage.addChild(this.mainMenu);

    // 3b. Level Select (full screen page, not a popup)
    this.levelSelect = new LevelSelectScreen({
      onSelectLevel: (lvl) => this.startGame(lvl),
      onBack: () => this.showMenu(),
    });
    this.app.stage.addChild(this.levelSelect);

    // 4. Modals Layer
    this.dialogs = new DialogOverlays();
    this.leaderboardModal = new LeaderboardModal(() => {
      this.leaderboardModal.hide();
    });
    this.app.stage.addChild(this.dialogs, this.leaderboardModal);

    // Ticker Loop
    this.app.ticker.add((ticker) => {
      const deltaSeconds = ticker.deltaTime / 60;
      if (this.currentScreen === 'game') {
        this.gameScene.update(deltaSeconds);
        this.gameHud.updateDominance(this.gameScene.territories);
        this.gameHud.updateSkillCooldowns(this.gameScene.skillsManager);
      } else if (this.currentScreen === 'menu') {
        this.mainMenu.update(deltaSeconds);
      } else if (this.currentScreen === 'levelSelect') {
        this.levelSelect.update(deltaSeconds);
      }
      this.dialogs.update?.(deltaSeconds);
    });

    // Window Resize Handler
    window.addEventListener('resize', () => this.onResize());
    this.onResize();
  }

  startGame(levelNumber = 1) {
    this.currentLevel = levelNumber;
    this.currentScreen = 'game';

    this.mainMenu.visible = false;
    this.levelSelect.close();
    this.dialogs.hide();
    this.leaderboardModal.hide();

    this.gameHud.visible = true;
    this.gameHud.setLevelTitle(levelNumber);

    this.gameScene.visible = true;
    this.gameScene.loadLevel(levelNumber);

    this.onResize();
  }

  showMenu() {
    this.currentScreen = 'menu';
    SoundSynth.stopBgm();

    this.gameScene.visible = false;
    this.gameHud.visible = false;
    this.levelSelect.close();
    this.dialogs.hide();

    this.mainMenu.visible = true;
    this.mainMenu.refresh();
    this.onResize();
  }

  showLevelSelect() {
    this.currentScreen = 'levelSelect';
    this.dialogs.hide();
    this.leaderboardModal.hide();
    this.mainMenu.visible = false;
    this.gameScene.visible = false;
    this.gameHud.visible = false;
    this.levelSelect.open();
    this.onResize();
  }

  handlePause() {
    if (this.currentScreen !== 'game') return;
    this.gameScene.isPaused = true;
    SoundSynth.pauseForFocus();

    this.dialogs.showPause({
      onResume: () => {
        this.gameScene.isPaused = false;
        SoundSynth.resumeFromFocus();
      },
      onRestart: () => {
        this.startGame(this.currentLevel);
      },
      onHome: () => {
        this.showMenu();
      }
    });
  }

  async handleGameEnd(result, stats) {
    if (result === 'victory') {
      Storage.recordVictory(stats.level, stats.time, stats.stars, stats.score);
      void WinkAdapter.submitScore(Storage.data.highScore);

      this.dialogs.showVictory({
        level: stats.level,
        time: stats.time,
        stars: stats.stars,
        score: stats.score,
        onNext: async () => {
          await AdManager.showInterstitial({ placement: 'level_complete' });
          if (stats.level < 50) {
            this.startGame(stats.level + 1);
          } else {
            // Endless mode beyond level 50
            this.startGame(stats.level + 1);
          }
        },
        onReplay: () => this.startGame(stats.level),
        onHome: () => this.showMenu(),
        onDoubleReward: async () => {
          const ad = await AdManager.showRewarded({ placement: 'double_reward' });
          if (ad.rewarded) {
            Storage.data.coins += stats.stars * 50;
            Storage.save();
          }
        }
      });
    } else {
      this.dialogs.showDefeat({
        level: stats.level,
        time: stats.time,
        onReplay: async () => {
          await AdManager.showInterstitial({ placement: 'defeat_replay' });
          this.startGame(stats.level);
        },
        onHome: () => this.showMenu(),
      });
    }
  }

  handleSkillActivate(type) {
    if (this.currentScreen !== 'game') return;
    const ok = this.gameScene.skillsManager.activate(
      type,
      this.gameScene.territories,
      this.gameScene.troopManager
    );
    if (ok) {
      this.gameScene.triggerSkillVFX(type);
    }
  }

  async showLeaderboard() {
    SoundSynth.playClick();
    const winkEntries = await WinkAdapter.getLeaderboard();
    this.leaderboardModal.show(winkEntries || []);
  }

  _getLevelName(level) {
    const titles = [
      'Khởi Đầu Khai Hoang',
      'Thế Chân Vạc',
      'Eo Biển Chiến Lược',
      'Bốn Bề Thọ Địch',
      'Quần Đảo Phù Sa',
      'Song Mã Tranh Tài',
      'Tam Quốc Đại Chiến',
      'Vòng Xoáy Chiến Tranh',
      'Tử Địa Phục Kích',
      'Đại Chiến Đỉnh Cao',
    ];
    return titles[level - 1] || `Chiến Địa #${level}`;
  }

  onResize() {
    if (!this.app || !this.app.screen) return;
    // ResizePlugin defers its resize to the next animation frame; resize NOW so
    // app.screen matches the window before we lay anything out.
    this.app.resize?.();
    const { width, height } = this.app.screen;

    if (this.mainMenu) this.mainMenu.resize(width, height);
    if (this.levelSelect) this.levelSelect.resize(width, height);
    if (this.gameScene) this.gameScene.resize(width, height);
    if (this.gameHud) this.gameHud.resize(width, height);
    if (this.dialogs) this.dialogs.resize(width, height);
    if (this.leaderboardModal) this.leaderboardModal.resize(width, height);
  }
}
