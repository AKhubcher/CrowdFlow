import { useRef, useEffect, useCallback } from 'react';
import { SimulationController } from './SimulationController';
import { WorldState } from '../engine/core/types';

export function useSimulation(initialWorld?: WorldState) {
  const controllerRef = useRef<SimulationController | null>(null);
  const initialized = useRef(false);

  // Safe lazy init — guards against React 18 Strict Mode double-invoke
  if (!initialized.current) {
    initialized.current = true;
    controllerRef.current = new SimulationController(initialWorld);
  }

  useEffect(() => {
    return () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;
      initialized.current = false;
    };
  }, []);

  const reset = useCallback((world?: WorldState) => {
    controllerRef.current?.reset(world);
  }, []);

  return {
    controller: controllerRef.current,
    reset,
  };
}
