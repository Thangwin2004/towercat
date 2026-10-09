/**
 * Main Entry Point for "Mèo Chiến Đảo"
 */

import { GameApp } from './core/Application.js';
import { installFocusPause } from './utils/focusPause.js';
import { SoundSynth } from './core/SoundSynth.js';
import { WinkAdapter } from './integrations/wink/wink-adapter.js';

async function bootstrap() {
  console.log('[BoLacTranhHung] Initializing game...');

  // Await font readiness to prevent font pop or clipping (Lesson 7)
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch (_) {}
  }

  const game = new GameApp();
  await game.init();

  // Install Tab/Window Focus & Visibility Pause
  const focusPause = installFocusPause({
    isRunning: () => game.app?.ticker?.started,
    pause: () => game.app?.ticker?.stop(),
    resume: () => game.app?.ticker?.start(),
    pauseAudio: () => SoundSynth.pauseForFocus(),
    resumeAudio: () => SoundSynth.resumeFromFocus(),
  });

  // Bind Wink SDK Lifecycle hooks safely
  WinkAdapter.bindLifecycle({
    onPause: () => focusPause.pauseFromHost(),
    onResume: () => focusPause.resumeFromHost(),
    onMute: () => SoundSynth.setHostMuted(true),
    onUnmute: () => SoundSynth.setHostMuted(false),
  });

  console.log('[BoLacTranhHung] Game ready!');
}

window.addEventListener('DOMContentLoaded', () => {
  bootstrap().catch((err) => {
    console.error('[BoLacTranhHung] Bootstrap error:', err);
  });
});
