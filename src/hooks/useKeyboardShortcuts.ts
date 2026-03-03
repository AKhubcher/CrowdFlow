import { useEffect } from 'react';
import type { InteractionMode } from '../engine/core/types';

interface ShortcutHandlers {
  togglePlay: () => void;
  setMode: (mode: InteractionMode) => void;
  currentMode: InteractionMode;
  stepForward: () => void;
  resetSim: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Don't trigger tool shortcuts when Ctrl/Meta is held (reserved for copy/paste)
      if (e.ctrlKey || e.metaKey) return;

      const toggle = (m: Exclude<InteractionMode, null>) => {
        handlers.setMode(handlers.currentMode === m ? null : m);
      };

      switch (e.key) {
        case ' ':
          e.preventDefault();
          handlers.togglePlay();
          break;
        case 'v':
        case 'V':
          toggle('select');
          break;
        case 'a':
        case 'A':
          toggle('addAgent');
          break;
        case 'w':
        case 'W':
          toggle('addWall');
          break;
        case 'e':
        case 'E':
          toggle('addExit');
          break;
        case 'h':
        case 'H':
          toggle('addHazard');
          break;
        case 'g':
        case 'G':
          toggle('addAttractor');
          break;
        case 'x':
        case 'X':
          toggle('erase');
          break;
        case '.':
          handlers.stepForward();
          break;
        case 'r':
        case 'R':
          handlers.resetSim();
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlers]);
}
