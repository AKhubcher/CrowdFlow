import { useState } from 'react';

interface AgentSettingsProps {
  agentCount: number;
  onSpawnBatch: (count: number) => void;
  onClearAgents: () => void;
}

export function AgentSettings({ agentCount, onSpawnBatch, onClearAgents }: AgentSettingsProps) {
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
    </div>
  );
}
