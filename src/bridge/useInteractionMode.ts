import { useState, useCallback } from 'react';
import { InteractionMode } from '../engine/core/types';

export function useInteractionMode() {
  const [mode, setMode] = useState<InteractionMode>('select');

  const setInteractionMode = useCallback((newMode: InteractionMode) => {
    setMode(newMode);
  }, []);

  return { mode, setInteractionMode };
}
