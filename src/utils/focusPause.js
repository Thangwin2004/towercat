/**
 * Focus and Visibility Handler
 * Pauses game ticker and audio safely on blur / tab hide.
 */

export function installFocusPause({ isRunning, pause, resume, pauseAudio, resumeAudio }) {
  let isWindowFocused = typeof document !== 'undefined' ? document.hasFocus() : true;
  let isDocVisible = typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;
  let wasRunningBeforePause = false;

  const evaluateState = () => {
    const shouldBeActive = isWindowFocused && isDocVisible;

    if (!shouldBeActive) {
      if (isRunning && isRunning()) {
        wasRunningBeforePause = true;
        pause?.();
      }
      pauseAudio?.();
    } else {
      if (wasRunningBeforePause) {
        resume?.();
        wasRunningBeforePause = false;
      }
      resumeAudio?.();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('focus', () => {
      isWindowFocused = true;
      evaluateState();
    });

    window.addEventListener('blur', () => {
      isWindowFocused = false;
      evaluateState();
    });

    document.addEventListener('visibilitychange', () => {
      isDocVisible = document.visibilityState === 'visible';
      evaluateState();
    });
  }

  return {
    pauseFromHost: () => {
      isDocVisible = false;
      evaluateState();
    },
    resumeFromHost: () => {
      isDocVisible = true;
      evaluateState();
    },
    isPaused: () => !(isWindowFocused && isDocVisible),
  };
}
