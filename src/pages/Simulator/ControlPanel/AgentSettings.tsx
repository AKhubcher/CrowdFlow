interface AgentSettingsProps {
  agentCount: number;
  onSpawnBatch: (count: number) => void;
  onClearAgents: () => void;
}

export function AgentSettings({ agentCount, onSpawnBatch, onClearAgents }: AgentSettingsProps) {
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
      <button
        onClick={onClearAgents}
        className="h-8 rounded-lg text-[11px] font-medium bg-white/[0.02] text-white/25 hover:bg-red-500/10 hover:text-red-400 transition-all"
      >
        Clear All
      </button>
    </div>
  );
}
