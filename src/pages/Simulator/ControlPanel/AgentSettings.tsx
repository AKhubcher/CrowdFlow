interface AgentSettingsProps {
  agentCount: number;
  onSpawnBatch: (count: number) => void;
  onClearAgents: () => void;
}

export function AgentSettings({ agentCount, onSpawnBatch, onClearAgents }: AgentSettingsProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] text-white/40 uppercase tracking-wider">Agents</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/60 font-mono">{agentCount} active</span>
      </div>
      <div className="flex gap-1">
        {[10, 50, 100, 500].map(n => (
          <button
            key={n}
            onClick={() => onSpawnBatch(n)}
            className="flex-1 h-7 rounded text-[11px] font-mono bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 transition-colors"
          >
            +{n}
          </button>
        ))}
      </div>
      <button
        onClick={onClearAgents}
        className="h-7 rounded-lg text-[11px] bg-red-500/10 text-red-400/70 hover:bg-red-500/20 hover:text-red-400 transition-colors"
      >
        Clear All Agents
      </button>
    </div>
  );
}
