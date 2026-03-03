import { presets } from '../../../presets';
import type { PresetScenario } from '../../../engine/core/types';

interface PresetSelectorProps {
  activePreset: string;
  onSelect: (preset: PresetScenario) => void;
}

export function PresetSelector({ activePreset, onSelect }: PresetSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] text-white/30 uppercase tracking-widest font-medium mb-0.5">Scenarios</span>
      <div className="flex flex-col gap-1 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
        {presets.map(preset => {
          const active = activePreset === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelect(preset)}
              className={`text-left px-3 py-2.5 rounded-xl text-xs transition-all ${
                active
                  ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 ring-1 ring-cyan-500/20'
                  : 'bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">{preset.icon}</span>
                <div className="min-w-0">
                  <div className={`font-medium truncate ${active ? 'text-cyan-400' : 'text-white/60'}`}>
                    {preset.name}
                  </div>
                  <div className="text-[10px] text-white/20 mt-0.5 truncate">{preset.description}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
