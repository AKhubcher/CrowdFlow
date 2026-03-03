import { useState } from 'react';
import type { SteeringWeights } from '../../../engine/steering/SteeringManager';

interface AgentSettingsProps {
  agentCount: number;
  onSpawnBatch: (count: number) => void;
  onClearAgents: () => void;
  weights: SteeringWeights;
  maxSpeed: number;
  onWeightChange: (key: keyof SteeringWeights, value: number) => void;
  onMaxSpeedChange: (value: number) => void;
}

const sliderDefs: { key: keyof SteeringWeights; label: string; min: number; max: number; step: number }[] = [
  { key: 'goal', label: 'Goal Seeking', min: 0, max: 4, step: 0.1 },
  { key: 'separation', label: 'Separation', min: 0, max: 6, step: 0.1 },
  { key: 'alignment', label: 'Alignment', min: 0, max: 2, step: 0.05 },
  { key: 'wallAvoidance', label: 'Wall Avoidance', min: 0, max: 6, step: 0.1 },
  { key: 'hazardAvoidance', label: 'Hazard Avoidance', min: 0, max: 8, step: 0.1 },
  { key: 'attractorPull', label: 'Attractor Pull', min: 0, max: 3, step: 0.1 },
];

export function AgentSettings({ agentCount, onSpawnBatch, onClearAgents, weights, maxSpeed, onWeightChange, onMaxSpeedChange }: AgentSettingsProps) {
  const [customCount, setCustomCount] = useState('');

  const handleCustomSpawn = () => {
    const n = parseInt(customCount, 10);
    if (n > 0 && n <= 5000) {
      onSpawnBatch(n);
      setCustomCount('');
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-white/30 uppercase tracking-widest font-medium">Agents</span>
        <span className="text-xs text-white/50 font-mono">{agentCount}</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {[10, 50, 100, 500].map(n => (
          <button
            key={n}
            onClick={() => onSpawnBatch(n)}
            className="h-8 rounded-lg text-[11px] font-mono bg-white/[0.03] text-white/40 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all"
          >
            +{n}
          </button>
        ))}
      </div>
      {/* Custom count input */}
      <div className="flex gap-1.5">
        <input
          type="number"
          value={customCount}
          onChange={e => setCustomCount(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCustomSpawn()}
          placeholder="Custom #"
          min={1}
          max={5000}
          className="flex-1 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] px-2.5 text-[11px] font-mono text-white/60 placeholder:text-white/15 focus:outline-none focus:border-cyan-500/30 transition-colors"
        />
        <button
          onClick={handleCustomSpawn}
          className="h-8 px-3 rounded-lg text-[11px] font-medium bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all disabled:opacity-30"
          disabled={!customCount || parseInt(customCount) < 1}
        >
          Spawn
        </button>
      </div>
      <button
        onClick={onClearAgents}
        className="h-8 rounded-lg text-[11px] font-medium bg-white/[0.02] text-white/25 hover:bg-red-500/10 hover:text-red-400 transition-all"
      >
        Clear All
      </button>

      {/* Parameter sliders */}
      <div className="mt-1 pt-2.5 border-t border-white/[0.04]">
        <span className="text-[10px] text-white/30 uppercase tracking-widest font-medium">Parameters</span>
        <div className="mt-2 space-y-2">
          <SliderRow label="Max Speed" value={maxSpeed} min={0.5} max={5} step={0.1} onChange={onMaxSpeedChange} />
          {sliderDefs.map(s => (
            <SliderRow
              key={s.key}
              label={s.label}
              value={weights[s.key]}
              min={s.min}
              max={s.max}
              step={s.step}
              onChange={v => onWeightChange(s.key, v)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SliderRow({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-white/25 w-20 flex-shrink-0 truncate">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="flex-1 h-1 accent-cyan-400 cursor-pointer"
      />
      <span className="text-[10px] text-white/40 font-mono w-8 text-right">{value.toFixed(1)}</span>
    </div>
  );
}
