import type { VisualizationOverlay } from '../../../engine/core/types';

interface VisualizationTogglesProps {
  overlays: Set<VisualizationOverlay>;
  onToggle: (overlay: VisualizationOverlay) => void;
  panicMode: boolean;
  onTogglePanic: () => void;
}

const overlayOptions: { key: VisualizationOverlay; label: string; color: string; activeColor: string }[] = [
  { key: 'heatmap', label: 'Heatmap', color: 'text-white/40', activeColor: 'text-orange-400' },
  { key: 'flowField', label: 'Flow Field', color: 'text-white/40', activeColor: 'text-emerald-400' },
  { key: 'trails', label: 'Trails', color: 'text-white/40', activeColor: 'text-cyan-400' },
  { key: 'velocityVectors', label: 'Velocity', color: 'text-white/40', activeColor: 'text-blue-400' },
  { key: 'grid', label: 'Grid', color: 'text-white/40', activeColor: 'text-indigo-400' },
];

const dotColors: Record<string, string> = {
  'text-orange-400': 'bg-orange-400',
  'text-emerald-400': 'bg-emerald-400',
  'text-cyan-400': 'bg-cyan-400',
  'text-blue-400': 'bg-blue-400',
  'text-indigo-400': 'bg-indigo-400',
};

export function VisualizationToggles({ overlays, onToggle, panicMode, onTogglePanic }: VisualizationTogglesProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] text-white/30 uppercase tracking-widest font-medium">Overlays</span>
      <div className="flex flex-col gap-0.5">
        {overlayOptions.map(opt => {
          const active = overlays.has(opt.key);
          return (
            <button
              key={opt.key}
              onClick={() => onToggle(opt.key)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-left ${
                active
                  ? 'bg-white/[0.04]'
                  : 'hover:bg-white/[0.02]'
              }`}
            >
              <div className={`w-2 h-2 rounded-full transition-all ${
                active ? dotColors[opt.activeColor] : 'bg-white/10'
              }`} />
              <span className={`text-xs transition-colors ${active ? opt.activeColor : opt.color}`}>
                {opt.label}
              </span>
              {active && (
                <span className="ml-auto text-[8px] uppercase tracking-wider text-white/20">on</span>
              )}
            </button>
          );
        })}
      </div>
      <div className="border-t border-white/[0.04] pt-2 mt-1">
        <button
          onClick={onTogglePanic}
          className={`w-full h-9 rounded-xl text-xs font-semibold transition-all ${
            panicMode
              ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-400 ring-1 ring-red-500/30'
              : 'bg-white/[0.03] text-white/40 hover:bg-white/[0.06] hover:text-white/60'
          }`}
        >
          {panicMode ? 'PANIC MODE ACTIVE' : 'Panic Mode'}
        </button>
      </div>
    </div>
  );
}
