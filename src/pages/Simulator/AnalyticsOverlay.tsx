import { useState, useEffect, useRef } from 'react';
import type { SimulationStats } from '../../engine/core/types';

const SPARKLINE_MAX_POINTS = 60;
const SPARKLINE_SAMPLE_INTERVAL = 500; // ms
const SPARKLINE_WIDTH = 80;
const SPARKLINE_HEIGHT = 24;

interface AnalyticsOverlayProps {
  stats: SimulationStats;
  isPlaying: boolean;
  resetKey: number;
}

export function AnalyticsOverlay({ stats, isPlaying, resetKey }: AnalyticsOverlayProps) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(0);

  // Evacuation curve data: stores the last N cumulative exitedCount samples
  const evacDataRef = useRef<number[]>([]);
  const lastSampleTimeRef = useRef(0);
  const [evacPoints, setEvacPoints] = useState<string>('');

  // Use a ref for stats so the sparkline interval doesn't need it as a dep
  const statsRef = useRef(stats);
  statsRef.current = stats;

  // Reset all state when simulation is reset
  useEffect(() => {
    setElapsed(0);
    startRef.current = 0;
    evacDataRef.current = [];
    lastSampleTimeRef.current = 0;
    setEvacPoints('');
  }, [resetKey]);

  useEffect(() => {
    if (isPlaying) {
      if (startRef.current === 0) startRef.current = Date.now() - elapsed;
      const interval = setInterval(() => {
        setElapsed(Date.now() - startRef.current);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  // Sample evacuation data every SPARKLINE_SAMPLE_INTERVAL ms while playing
  useEffect(() => {
    if (!isPlaying) return;

    const sampleInterval = setInterval(() => {
      const data = evacDataRef.current;
      data.push(statsRef.current.exitedCount);
      if (data.length > SPARKLINE_MAX_POINTS) {
        data.shift();
      }
      setEvacPoints(buildPolylinePoints(data));
    }, SPARKLINE_SAMPLE_INTERVAL);

    return () => clearInterval(sampleInterval);
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
      <EvacSparkline points={evacPoints} />
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

/** Convert an array of cumulative values into an SVG polyline points string. */
function buildPolylinePoints(data: number[]): string {
  if (data.length === 0) return '';
  const max = Math.max(...data, 1); // avoid division by zero
  const xStep = SPARKLINE_WIDTH / Math.max(data.length - 1, 1);
  return data
    .map((v, i) => {
      const x = (i * xStep).toFixed(1);
      // Invert Y because SVG y=0 is top
      const y = (SPARKLINE_HEIGHT - (v / max) * SPARKLINE_HEIGHT).toFixed(1);
      return `${x},${y}`;
    })
    .join(' ');
}

function EvacSparkline({ points }: { points: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[9px] uppercase tracking-wider text-white/20">Evac</span>
      <svg
        width={SPARKLINE_WIDTH}
        height={SPARKLINE_HEIGHT}
        viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`}
        className="overflow-visible"
      >
        {/* Subtle baseline */}
        <line
          x1="0"
          y1={SPARKLINE_HEIGHT}
          x2={SPARKLINE_WIDTH}
          y2={SPARKLINE_HEIGHT}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.5"
        />
        {points ? (
          <polyline
            points={points}
            fill="none"
            stroke="#10b981"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <text
            x={SPARKLINE_WIDTH / 2}
            y={SPARKLINE_HEIGHT / 2 + 3}
            textAnchor="middle"
            fill="rgba(255,255,255,0.15)"
            fontSize="8"
          >
            --
          </text>
        )}
      </svg>
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
