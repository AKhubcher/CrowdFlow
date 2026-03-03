import { useState, useEffect } from 'react';
import { SimulationStats } from '../engine/core/types';
import { STATS_POLL_INTERVAL } from '../engine/core/constants';
import { SimulationController } from './SimulationController';

const defaultStats: SimulationStats = {
  agentCount: 0,
  exitedCount: 0,
  averageSpeed: 0,
  averageStress: 0,
  fps: 0,
  tick: 0,
};

export function useSimulationStats(controller: SimulationController | null): SimulationStats {
  const [stats, setStats] = useState<SimulationStats>(defaultStats);

  useEffect(() => {
    if (!controller) return;

    const interval = setInterval(() => {
      setStats(controller.getStats());
    }, STATS_POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [controller]);

  return stats;
}
