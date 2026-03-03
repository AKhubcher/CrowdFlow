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
      const newStats = controller.getStats();
      setStats(prev => {
        if (
          prev.agentCount === newStats.agentCount &&
          prev.exitedCount === newStats.exitedCount &&
          prev.fps === newStats.fps &&
          prev.tick === newStats.tick
        ) {
          return prev; // no change — skip re-render
        }
        return newStats;
      });
    }, STATS_POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [controller]);

  return stats;
}
