import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { Section } from '../../components/layout/Section';
import { presets } from '../../presets';
import { loadCustomScenarios, deleteCustomScenario } from '../../engine/core/SessionTracker';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import type { PresetScenario } from '../../engine/core/types';

const difficultyMap: Record<string, { label: string; color: string }> = {
  roomEvacuation: { label: 'Beginner', color: 'text-emerald-400 bg-emerald-400/10' },
  bottleneck: { label: 'Intermediate', color: 'text-yellow-400 bg-yellow-400/10' },
  maze: { label: 'Advanced', color: 'text-orange-400 bg-orange-400/10' },
  concertVenue: { label: 'Advanced', color: 'text-orange-400 bg-orange-400/10' },
  multiFloor: { label: 'Expert', color: 'text-red-400 bg-red-400/10' },
  counterflow: { label: 'Intermediate', color: 'text-yellow-400 bg-yellow-400/10' },
  empty: { label: 'Sandbox', color: 'text-cyan-400 bg-cyan-400/10' },
};

const tipsMap: Record<string, string> = {
  roomEvacuation: 'Try adding hazards to see stress behavior. Enable the heatmap overlay to see density bottlenecks.',
  bottleneck: 'Watch how agents compress near the narrow opening. Try panic mode to see freezing behavior.',
  maze: 'Enable the flow field overlay to see how agents navigate. Try placing attractors to guide traffic.',
  concertVenue: 'A complex layout with multiple exits. Add walls to create barriers and see how flow redirects.',
  multiFloor: 'Multiple connected rooms. Watch how agents find the nearest exit via flow field pathfinding.',
  counterflow: 'Two groups heading opposite directions. Observe the separation behavior preventing collisions.',
  empty: 'A blank canvas. Build your own scenario from scratch — add walls, exits, hazards, and agents.',
};

export default function ScenariosPage() {
  const [ref, visible] = useScrollAnimation<HTMLDivElement>();
  const [customScenarios, setCustomScenarios] = useState<PresetScenario[]>([]);

  useEffect(() => {
    setCustomScenarios(loadCustomScenarios());
  }, []);

  const handleDeleteCustom = (id: string) => {
    deleteCustomScenario(id);
    setCustomScenarios(prev => prev.filter(s => s.id !== id));
  };

  return (
    <PageLayout>
      <Section>
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            <span className="text-[11px] text-white/30 uppercase tracking-widest">Preset Library</span>
          </div>
          <h1 className="text-6xl font-black mb-5 tracking-tight">
            <span className="text-gradient">Scenarios</span>
          </h1>
          <p className="text-white/35 text-lg font-light max-w-2xl">
            Pre-built simulation environments to explore different crowd dynamics.
            Each scenario demonstrates unique behaviors and challenges.
          </p>
        </div>

        <div ref={ref as React.Ref<HTMLDivElement>} className="grid md:grid-cols-2 gap-6">
          {presets.map((preset, i) => (
            <ScenarioCard
              key={preset.id}
              preset={preset}
              index={i}
              visible={visible}
              difficulty={difficultyMap[preset.id]}
              tip={tipsMap[preset.id]}
            />
          ))}
        </div>

        {/* Custom scenarios */}
        {customScenarios.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-white/60">Your Custom Layouts</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-mono">
                {customScenarios.length}
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {customScenarios.map((scenario, i) => (
                <div
                  key={scenario.id}
                  className="group rounded-2xl border border-white/[0.04] bg-gradient-to-br from-purple-500/[0.04] to-transparent p-6 transition-all duration-500 hover:border-purple-500/20 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{scenario.icon}</span>
                        <h2 className="text-lg font-bold text-white/80 group-hover:text-white transition-colors">
                          {scenario.name}
                        </h2>
                      </div>
                      <p className="text-sm text-white/35">{scenario.description}</p>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded-full font-medium text-purple-400 bg-purple-400/10">
                      Custom
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-4 py-3 border-y border-white/[0.04]">
                    <div className="text-center">
                      <div className="text-sm font-mono font-bold text-cyan-400">{scenario.agents.length}</div>
                      <div className="text-[9px] text-white/20 uppercase">Agents</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-mono font-bold text-slate-400">{scenario.walls.length}</div>
                      <div className="text-[9px] text-white/20 uppercase">Walls</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-mono font-bold text-emerald-400">{scenario.exits.length}</div>
                      <div className="text-[9px] text-white/20 uppercase">Exits</div>
                    </div>
                    <div className="flex-1" />
                    <Link
                      to="/simulator"
                      state={{ presetId: scenario.id }}
                      className="h-8 px-4 rounded-lg bg-gradient-to-r from-purple-500/15 to-blue-500/15 text-purple-300 text-xs font-medium ring-1 ring-purple-500/20 hover:from-purple-500/25 hover:to-blue-500/25 transition-all inline-flex items-center gap-1.5"
                    >
                      Launch
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 2l4 3-4 3" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDeleteCustom(scenario.id)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Delete custom scenario"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M2 3h8M4 3V2h4v1M5 5v4M7 5v4M3 3l.5 7h5l.5-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>
    </PageLayout>
  );
}

function ScenarioCard({ preset, index, visible, difficulty, tip }: {
  preset: PresetScenario;
  index: number;
  visible: boolean;
  difficulty?: { label: string; color: string };
  tip?: string;
}) {
  const diff = difficulty || { label: 'Custom', color: 'text-white/40 bg-white/5' };

  return (
    <div
      className={`group rounded-2xl border border-white/[0.04] bg-gradient-to-br from-white/[0.02] to-transparent p-6 transition-all duration-500 hover:border-white/[0.08] hover:-translate-y-1 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: visible ? `${index * 80}ms` : '0ms' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{preset.icon}</span>
            <h2 className="text-lg font-bold text-white/80 group-hover:text-white transition-colors">
              {preset.name}
            </h2>
          </div>
          <p className="text-sm text-white/35">{preset.description}</p>
        </div>
        <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${diff.color}`}>
          {diff.label}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-4 py-3 border-y border-white/[0.04]">
        <div className="text-center">
          <div className="text-sm font-mono font-bold text-cyan-400">{preset.agents.length}</div>
          <div className="text-[9px] text-white/20 uppercase">Agents</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-mono font-bold text-slate-400">{preset.walls.length}</div>
          <div className="text-[9px] text-white/20 uppercase">Walls</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-mono font-bold text-emerald-400">{preset.exits.length}</div>
          <div className="text-[9px] text-white/20 uppercase">Exits</div>
        </div>
        <div className="flex-1" />
        <Link
          to="/simulator"
          state={{ presetId: preset.id }}
          className="h-8 px-4 rounded-lg bg-gradient-to-r from-cyan-500/15 to-blue-500/15 text-cyan-400 text-xs font-medium ring-1 ring-cyan-500/20 hover:from-cyan-500/25 hover:to-blue-500/25 transition-all inline-flex items-center gap-1.5"
        >
          Launch
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 2l4 3-4 3" />
          </svg>
        </Link>
      </div>

      {tip && (
        <p className="text-[11px] text-white/20 leading-relaxed">
          <span className="text-white/30 font-medium">Tip: </span>
          {tip}
        </p>
      )}
    </div>
  );
}
