import { useRef, useEffect, useCallback } from 'react';
import { SimulationController } from './SimulationController';
import { WorldState } from '../engine/core/types';

export function useSimulation(initialWorld?: WorldState) {
  const controllerRef = useRef<SimulationController | null>(null);

  if (!controllerRef.current) {
    controllerRef.current = new SimulationController(initialWorld);
  }

  useEffect(() => {
    return () => {
      controllerRef.current?.destroy();
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
