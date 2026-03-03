import type { InteractionMode, VisualizationOverlay, PresetScenario, SimulationStats } from '../../../engine/core/types';
import { PlaybackControls } from './PlaybackControls';
import { ToolSelector } from './ToolSelector';
import { PresetSelector } from './PresetSelector';
import { VisualizationToggles } from './VisualizationToggles';
import { AgentSettings } from './AgentSettings';
import { TimelineScrubber } from './TimelineScrubber';

interface ControlPanelProps {
  width: number;
  isPlaying: boolean;
  speed: number;
  mode: InteractionMode;
  activePreset: string;
  overlays: Set<VisualizationOverlay>;
  panicMode: boolean;
  stats: SimulationStats;
  snapshotCount: number;
  snapshotIndex: number;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onModeChange: (mode: InteractionMode) => void;
  onPresetSelect: (preset: PresetScenario) => void;
  onToggleOverlay: (overlay: VisualizationOverlay) => void;
  onTogglePanic: () => void;
  onSpawnBatch: (count: number) => void;
  onClearAgents: () => void;
  onScrubTimeline: (index: number) => void;
  onSaveLayout: () => void;
}

export function ControlPanel(props: ControlPanelProps) {
  return (
    <div style={{ width: props.width }} className="flex-shrink-0 h-full overflow-y-auto bg-surface-950/80 backdrop-blur-xl border-l border-white/[0.04] p-4 flex flex-col gap-4">
      {/* Stats dashboard */}
      <div className="grid grid-cols-2 gap-2">
        <StatBadge label="Agents" value={props.stats.agentCount} gradient="from-cyan-500/20 to-cyan-500/5" />
        <StatBadge label="Exited" value={props.stats.exitedCount} gradient="from-emerald-500/20 to-emerald-500/5" />
        <StatBadge label="FPS" value={props.stats.fps} highlight={props.stats.fps < 30} gradient="from-blue-500/20 to-blue-500/5" />
        <StatBadge label="Stress" value={`${(props.stats.averageStress * 100).toFixed(0)}%`} highlight={props.stats.averageStress > 0.5} gradient="from-orange-500/20 to-orange-500/5" />
      </div>

      <Divider />
      <PlaybackControls
        isPlaying={props.isPlaying}
        speed={props.speed}
        onTogglePlay={props.onTogglePlay}
        onStepForward={props.onStepForward}
        onReset={props.onReset}
        onSpeedChange={props.onSpeedChange}
      />

      <Divider />
      <ToolSelector mode={props.mode} onModeChange={props.onModeChange} />

      <Divider />
      <PresetSelector activePreset={props.activePreset} onSelect={props.onPresetSelect} />

      <Divider />
      <VisualizationToggles
        overlays={props.overlays}
        onToggle={props.onToggleOverlay}
        panicMode={props.panicMode}
        onTogglePanic={props.onTogglePanic}
      />

      <Divider />
      <AgentSettings
        agentCount={props.stats.agentCount}
        onSpawnBatch={props.onSpawnBatch}
        onClearAgents={props.onClearAgents}
      />

      <Divider />
      <TimelineScrubber
        snapshotCount={props.snapshotCount}
        currentIndex={props.snapshotIndex}
        onScrub={props.onScrubTimeline}
        currentTick={props.stats.tick}
      />

      <Divider />
      {/* Save layout */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] text-white/30 uppercase tracking-widest font-medium">Layout</span>
        <button
          onClick={props.onSaveLayout}
          className="h-9 rounded-lg text-[11px] font-medium bg-gradient-to-r from-purple-500/15 to-blue-500/15 text-purple-300 ring-1 ring-purple-500/20 hover:from-purple-500/25 hover:to-blue-500/25 transition-all flex items-center justify-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 13H3a1 1 0 01-1-1V2a1 1 0 011-1h6l3 3v8a1 1 0 01-1 1z" />
            <path d="M9 13V8H5v5M5 1v3h3" />
          </svg>
          Save Current Layout
        </button>
      </div>
    </div>
  );
}

function StatBadge({ label, value, highlight = false, gradient }: {
  label: string; value: string | number; highlight?: boolean; gradient: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-xl px-3 py-2 border border-white/[0.04] bg-gradient-to-br ${gradient}`}>
      <div className="text-[9px] text-white/30 uppercase tracking-widest font-medium">{label}</div>
      <div className={`text-lg font-mono font-bold leading-tight ${highlight ? 'text-red-400' : 'text-white/80'}`}>
        {value}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-white/[0.04]" />;
}
