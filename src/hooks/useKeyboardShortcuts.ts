import { useEffect } from 'react';
import type { InteractionMode } from '../engine/core/types';
import type { SimulationController } from '../bridge/SimulationController';

interface ShortcutHandlers {
  togglePlay: () => void;
  setMode: (mode: InteractionMode) => void;
  stepForward: () => void;
  resetSim: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Don't trigger tool shortcuts when Ctrl/Meta is held (reserved for copy/paste)
      if (e.ctrlKey || e.metaKey) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          handlers.togglePlay();
          break;
        case 'v':
        case 'V':
          handlers.setMode('select');
          break;
        case 'a':
        case 'A':
          handlers.setMode('addAgent');
          break;
        case 'w':
        case 'W':
          handlers.setMode('addWall');
          break;
        case 'e':
        case 'E':
          handlers.setMode('addExit');
          break;
        case 'h':
        case 'H':
          handlers.setMode('addHazard');
          break;
        case 'g':
        case 'G':
          handlers.setMode('addAttractor');
          break;
        case 'x':
        case 'X':
          handlers.setMode('erase');
          break;
        case '.':
          handlers.stepForward();
          break;
        case 'r':
        case 'R':
          if (!e.ctrlKey && !e.metaKey) {
            handlers.resetSim();
          }
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlers]);
}
