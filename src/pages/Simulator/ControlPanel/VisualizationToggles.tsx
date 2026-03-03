import type { VisualizationOverlay } from '../../../engine/core/types';

interface VisualizationTogglesProps {
  overlays: Set<VisualizationOverlay>;
  onToggle: (overlay: VisualizationOverlay) => void;
  panicMode: boolean;
  onTogglePanic: () => void;
}

const overlayOptions: { key: VisualizationOverlay; label: string; color: string }[] = [
  { key: 'heatmap', label: 'Heatmap', color: 'text-orange-400' },
  { key: 'flowField', label: 'Flow Field', color: 'text-emerald-400' },
  { key: 'trails', label: 'Trails', color: 'text-cyan-400' },
  { key: 'velocityVectors', label: 'Velocity', color: 'text-white/60' },
  { key: 'grid', label: 'Grid', color: 'text-indigo-400' },
];

export function VisualizationToggles({ overlays, onToggle, panicMode, onTogglePanic }: VisualizationTogglesProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] text-white/40 uppercase tracking-wider">Overlays</span>
      <div className="flex flex-col gap-1">
        {overlayOptions.map(opt => (
          <label
            key={opt.key}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={overlays.has(opt.key)}
              onChange={() => onToggle(opt.key)}
              className="sr-only"
            />
            <div className={`w-3 h-3 rounded-sm border transition-colors ${
              overlays.has(opt.key)
                ? 'bg-accent-cyan/30 border-accent-cyan'
                : 'border-white/20'
            }`}>
              {overlays.has(opt.key) && (
                <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                  <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" className="text-accent-cyan" />
                </svg>
              )}
            </div>
            <span className={`text-xs ${opt.color}`}>{opt.label}</span>
          </label>
        ))}
      </div>
      <div className="border-t border-white/5 pt-2 mt-1">
        <button
          onClick={onTogglePanic}
          className={`w-full h-8 rounded-lg text-xs font-medium transition-all ${
            panicMode
              ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30 animate-pulse'
              : 'bg-white/5 text-white/50 hover:bg-white/10'
          }`}
        >
          {panicMode ? '🚨 PANIC MODE ON' : 'Panic Mode'}
        </button>
      </div>
    </div>
  );
}
