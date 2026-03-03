import { useState, useEffect } from 'react';
import { presets } from '../../../presets';
import { loadCustomScenarios, deleteCustomScenario } from '../../../engine/core/SessionTracker';
import type { PresetScenario } from '../../../engine/core/types';

interface PresetSelectorProps {
  activePreset: string;
  onSelect: (preset: PresetScenario) => void;
}

export function PresetSelector({ activePreset, onSelect }: PresetSelectorProps) {
  const [customScenarios, setCustomScenarios] = useState<PresetScenario[]>([]);

  useEffect(() => {
    setCustomScenarios(loadCustomScenarios());
  }, [activePreset]); // refresh when active preset changes (e.g. after saving)

  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCustomScenario(id);
    setCustomScenarios(loadCustomScenarios());
  };

  const renderPresetButton = (preset: PresetScenario, isCustom = false) => {
    const active = activePreset === preset.id;
    return (
      <button
        key={preset.id}
        onClick={() => onSelect(preset)}
        className={`text-left px-3 py-2.5 rounded-xl text-xs transition-all group/item ${
          active
            ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 ring-1 ring-cyan-500/20'
            : 'bg-white/[0.02] hover:bg-white/[0.04]'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-base">{preset.icon}</span>
          <div className="min-w-0 flex-1">
            <div className={`font-medium truncate ${active ? 'text-cyan-400' : 'text-white/60'}`}>
              {preset.name}
            </div>
            <div className="text-[10px] text-white/20 mt-0.5 truncate">{preset.description}</div>
          </div>
          {isCustom && (
            <span
              onClick={(e) => handleDeleteCustom(preset.id, e)}
              className="opacity-0 group-hover/item:opacity-100 text-white/20 hover:text-red-400 transition-all text-[10px] px-1"
              title="Delete custom scenario"
            >
              ✕
            </span>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] text-white/30 uppercase tracking-widest font-medium mb-0.5">Scenarios</span>
      <div className="flex flex-col gap-1 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
        {presets.map(p => renderPresetButton(p))}
        {customScenarios.length > 0 && (
          <>
            <div className="text-[9px] text-white/20 uppercase tracking-widest mt-2 mb-0.5 px-1">Custom</div>
            {customScenarios.map(p => renderPresetButton(p, true))}
          </>
        )}
      </div>
    </div>
  );
}
