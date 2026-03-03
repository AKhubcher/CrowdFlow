import type { InteractionMode } from '../../../engine/core/types';

interface ToolSelectorProps {
  mode: InteractionMode;
  onModeChange: (mode: InteractionMode) => void;
}

const tools: { mode: InteractionMode; label: string; shortcut: string; icon: string }[] = [
  { mode: 'select', label: 'Select', shortcut: 'V', icon: '↖' },
  { mode: 'addAgent', label: 'Agent', shortcut: 'A', icon: '●' },
  { mode: 'addWall', label: 'Wall', shortcut: 'W', icon: '▬' },
  { mode: 'addExit', label: 'Exit', shortcut: 'E', icon: '▶' },
  { mode: 'addHazard', label: 'Hazard', shortcut: 'H', icon: '⚠' },
  { mode: 'addAttractor', label: 'Attractor', shortcut: 'G', icon: '◎' },
  { mode: 'erase', label: 'Erase', shortcut: 'X', icon: '✕' },
];

export function ToolSelector({ mode, onModeChange }: ToolSelectorProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Tools</span>
      <div className="grid grid-cols-4 gap-1">
        {tools.map(tool => (
          <button
            key={tool.mode}
            onClick={() => onModeChange(tool.mode)}
            className={`group relative h-9 rounded-lg text-xs font-medium transition-all flex flex-col items-center justify-center gap-0.5 ${
              mode === tool.mode
                ? 'bg-accent-cyan/20 text-accent-cyan ring-1 ring-accent-cyan/30'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
            }`}
            title={`${tool.label} (${tool.shortcut})`}
          >
            <span className="text-sm leading-none">{tool.icon}</span>
            <span className="text-[9px] leading-none">{tool.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
