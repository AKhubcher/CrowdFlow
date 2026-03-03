import type { InteractionMode } from '../../../engine/core/types';

interface ToolSelectorProps {
  mode: InteractionMode;
  onModeChange: (mode: InteractionMode) => void;
}

const tools: { mode: InteractionMode; label: string; shortcut: string; color: string }[] = [
  { mode: 'select', label: 'Select', shortcut: 'V', color: 'white' },
  { mode: 'addAgent', label: 'Agent', shortcut: 'A', color: 'cyan' },
  { mode: 'addWall', label: 'Wall', shortcut: 'W', color: 'slate' },
  { mode: 'addExit', label: 'Exit', shortcut: 'E', color: 'emerald' },
  { mode: 'addHazard', label: 'Hazard', shortcut: 'H', color: 'red' },
  { mode: 'addAttractor', label: 'Attract', shortcut: 'G', color: 'violet' },
  { mode: 'erase', label: 'Erase', shortcut: 'X', color: 'red' },
];

const iconPaths: Record<string, JSX.Element> = {
  select: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 2l4 10 1.5-3.5L11 7z" />
    </svg>
  ),
  addAgent: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <circle cx="7" cy="7" r="4" />
    </svg>
  ),
  addWall: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="2" y1="7" x2="12" y2="7" />
    </svg>
  ),
  addExit: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 7h8M8 4l3 3-3 3" />
    </svg>
  ),
  addHazard: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M7 2L1 12h12L7 2z" />
      <line x1="7" y1="6" x2="7" y2="9" />
      <circle cx="7" cy="10.5" r="0.5" fill="currentColor" />
    </svg>
  ),
  addAttractor: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1">
      <circle cx="7" cy="7" r="2" />
      <circle cx="7" cy="7" r="4" opacity="0.5" />
      <circle cx="7" cy="7" r="6" opacity="0.25" />
    </svg>
  ),
  erase: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="3" y1="3" x2="11" y2="11" />
      <line x1="11" y1="3" x2="3" y2="11" />
    </svg>
  ),
};

const activeColors: Record<string, string> = {
  white: 'bg-white/10 text-white ring-white/20',
  cyan: 'bg-cyan-500/15 text-cyan-400 ring-cyan-500/30',
  slate: 'bg-slate-400/15 text-slate-300 ring-slate-400/30',
  emerald: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
  red: 'bg-red-500/15 text-red-400 ring-red-500/30',
  violet: 'bg-violet-500/15 text-violet-400 ring-violet-500/30',
};

export function ToolSelector({ mode, onModeChange }: ToolSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] text-white/30 uppercase tracking-widest font-medium mb-0.5">Tools</span>
      <div className="grid grid-cols-4 gap-1.5">
        {tools.map(tool => {
          const active = mode === tool.mode;
          return (
            <button
              key={tool.mode}
              onClick={() => onModeChange(tool.mode)}
              className={`group relative h-11 rounded-lg text-xs font-medium transition-all flex flex-col items-center justify-center gap-1 ${
                active
                  ? `${activeColors[tool.color]} ring-1`
                  : 'bg-white/[0.03] text-white/40 hover:bg-white/[0.06] hover:text-white/60'
              }`}
              title={`${tool.label} (${tool.shortcut})`}
            >
              {iconPaths[tool.mode]}
              <span className="text-[9px] leading-none opacity-70">{tool.label}</span>
              <span className="absolute top-0.5 right-1 text-[7px] font-mono text-white/15">{tool.shortcut}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
