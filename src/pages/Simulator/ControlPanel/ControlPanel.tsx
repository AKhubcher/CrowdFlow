import type { InteractionMode, VisualizationOverlay, PresetScenario, SimulationStats } from '../../../engine/core/types';
import { PlaybackControls } from './PlaybackControls';
import { ToolSelector } from './ToolSelector';
import { PresetSelector } from './PresetSelector';
import { VisualizationToggles } from './VisualizationToggles';
import { AgentSettings } from './AgentSettings';
import { TimelineScrubber } from './TimelineScrubber';

interface ControlPanelProps {
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
}

export function ControlPanel(props: ControlPanelProps) {
  return (
    <div className="w-64 flex-shrink-0 h-full overflow-y-auto glass-strong rounded-xl p-4 flex flex-col gap-4">
      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-2">
        <StatBadge label="Agents" value={props.stats.agentCount} />
        <StatBadge label="Exited" value={props.stats.exitedCount} />
        <StatBadge label="FPS" value={props.stats.fps} highlight={props.stats.fps < 30} />
        <StatBadge label="Stress" value={`${(props.stats.averageStress * 100).toFixed(0)}%`} />
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
    </div>
  );
}

function StatBadge({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="bg-white/[0.03] rounded-lg px-2.5 py-1.5">
      <div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div>
      <div className={`text-sm font-mono font-medium ${highlight ? 'text-red-400' : 'text-white/80'}`}>
        {value}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-white/[0.04]" />;
}
