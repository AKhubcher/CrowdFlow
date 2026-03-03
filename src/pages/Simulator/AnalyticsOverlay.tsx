import type { SimulationStats } from '../../engine/core/types';

interface AnalyticsOverlayProps {
  stats: SimulationStats;
}

export function AnalyticsOverlay({ stats }: AnalyticsOverlayProps) {
  return (
    <div className="absolute top-3 left-3 glass rounded-lg px-3 py-2 pointer-events-none">
      <div className="flex items-center gap-4 text-[11px] font-mono">
        <span className="text-accent-cyan">{stats.agentCount} agents</span>
        <span className="text-emerald-400">{stats.exitedCount} exited</span>
        <span className={`${stats.fps < 30 ? 'text-red-400' : 'text-white/40'}`}>
          {stats.fps} fps
        </span>
        <span className="text-white/30">
          avg speed: {stats.averageSpeed.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
