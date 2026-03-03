import { useState, useEffect, useRef } from 'react';
import type { SimulationStats } from '../../engine/core/types';

interface AnalyticsOverlayProps {
  stats: SimulationStats;
  isPlaying: boolean;
}

export function AnalyticsOverlay({ stats, isPlaying }: AnalyticsOverlayProps) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (isPlaying) {
      if (startRef.current === 0) startRef.current = Date.now() - elapsed;
      const interval = setInterval(() => {
        setElapsed(Date.now() - startRef.current);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const fmtTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `${sec}s`;
  };

  const evacRate = stats.exitedCount > 0 && elapsed > 0
    ? (stats.exitedCount / (elapsed / 1000)).toFixed(1)
    : '0';

  return (
    <div className="flex items-center gap-3 justify-center">
      <Metric label="Agents" value={stats.agentCount} color="text-cyan-400" />
      <Sep />
      <Metric label="Exited" value={stats.exitedCount} color="text-emerald-400" />
      <Sep />
      <Metric label="Rate" value={`${evacRate}/s`} color="text-emerald-400/60" />
      <Sep />
      <Metric
        label="FPS"
        value={stats.fps}
        color={stats.fps < 30 ? 'text-red-400' : stats.fps < 50 ? 'text-yellow-400' : 'text-white/50'}
      />
      <Sep />
      <Metric label="Speed" value={stats.averageSpeed.toFixed(1)} color="text-white/40" />
      <Sep />
      <Metric
        label="Stress"
        value={`${(stats.averageStress * 100).toFixed(0)}%`}
        color={stats.averageStress > 0.5 ? 'text-red-400' : stats.averageStress > 0.25 ? 'text-orange-400' : 'text-white/40'}
      />
      <Sep />
      <Metric label="Time" value={fmtTime(elapsed)} color="text-white/30" />
    </div>
  );
}

function Sep() {
  return <div className="w-px h-4 bg-white/[0.06]" />;
}

function Metric({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[9px] uppercase tracking-wider text-white/20">{label}</span>
      <span className={`text-[11px] font-mono font-semibold ${color}`}>{value}</span>
    </div>
  );
}
