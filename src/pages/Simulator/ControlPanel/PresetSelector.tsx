import { presets } from '../../../presets';
import type { PresetScenario } from '../../../engine/core/types';

interface PresetSelectorProps {
  activePreset: string;
  onSelect: (preset: PresetScenario) => void;
}

export function PresetSelector({ activePreset, onSelect }: PresetSelectorProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Presets</span>
      <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
        {presets.map(preset => (
          <button
            key={preset.id}
            onClick={() => onSelect(preset)}
            className={`text-left px-3 py-2 rounded-lg text-xs transition-all ${
              activePreset === preset.id
                ? 'bg-accent-cyan/15 text-accent-cyan ring-1 ring-accent-cyan/20'
                : 'bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white/80'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{preset.icon}</span>
              <div>
                <div className="font-medium">{preset.name}</div>
                <div className="text-[10px] text-white/30 mt-0.5">{preset.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
