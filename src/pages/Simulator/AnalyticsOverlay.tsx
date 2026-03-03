import type { SimulationStats } from '../../engine/core/types';

interface AnalyticsOverlayProps {
  stats: SimulationStats;
}

export function AnalyticsOverlay({ stats }: AnalyticsOverlayProps) {
  return (
    <div className="absolute top-3 left-3 pointer-events-none">
      <div className="glass-strong rounded-xl px-4 py-2.5 flex items-center gap-5">
        <Metric label="Agents" value={stats.agentCount} color="text-cyan-400" />
        <div className="w-px h-5 bg-white/[0.06]" />
        <Metric label="Exited" value={stats.exitedCount} color="text-emerald-400" />
        <div className="w-px h-5 bg-white/[0.06]" />
        <Metric
          label="FPS"
          value={stats.fps}
          color={stats.fps < 30 ? 'text-red-400' : stats.fps < 50 ? 'text-yellow-400' : 'text-white/50'}
        />
        <div className="w-px h-5 bg-white/[0.06]" />
        <Metric label="Avg Speed" value={stats.averageSpeed.toFixed(1)} color="text-white/40" />
        <div className="w-px h-5 bg-white/[0.06]" />
        <Metric
          label="Stress"
          value={`${(stats.averageStress * 100).toFixed(0)}%`}
          color={stats.averageStress > 0.5 ? 'text-red-400' : stats.averageStress > 0.25 ? 'text-orange-400' : 'text-white/40'}
        />
      </div>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className={`text-sm font-mono font-semibold leading-none ${color}`}>{value}</span>
      <span className="text-[8px] uppercase tracking-widest text-white/20 mt-0.5">{label}</span>
    </div>
  );
}
