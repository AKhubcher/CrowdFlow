import { Link } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { Section } from '../../components/layout/Section';
import { presets } from '../../presets';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const difficultyMap: Record<string, { label: string; color: string }> = {
  roomEvacuation: { label: 'Beginner', color: 'text-emerald-400 bg-emerald-400/10' },
  bottleneck: { label: 'Intermediate', color: 'text-yellow-400 bg-yellow-400/10' },
  maze: { label: 'Advanced', color: 'text-orange-400 bg-orange-400/10' },
  concertVenue: { label: 'Advanced', color: 'text-orange-400 bg-orange-400/10' },
  multiFloor: { label: 'Expert', color: 'text-red-400 bg-red-400/10' },
  counterflow: { label: 'Intermediate', color: 'text-yellow-400 bg-yellow-400/10' },
  empty: { label: 'Sandbox', color: 'text-cyan-400 bg-cyan-400/10' },
};

const detailsMap: Record<string, { agents: number; walls: number; exits: number; tips: string }> = {
  roomEvacuation: { agents: 200, walls: 4, exits: 2, tips: 'Try adding hazards to see stress behavior. Enable the heatmap overlay to see density bottlenecks.' },
  bottleneck: { agents: 150, walls: 6, exits: 1, tips: 'Watch how agents compress near the narrow opening. Try panic mode to see freezing behavior.' },
  maze: { agents: 100, walls: 20, exits: 2, tips: 'Enable the flow field overlay to see how agents navigate. Try placing attractors to guide traffic.' },
  concertVenue: { agents: 300, walls: 12, exits: 4, tips: 'A complex layout with multiple exits. Add walls to create barriers and see how flow redirects.' },
  multiFloor: { agents: 200, walls: 16, exits: 3, tips: 'Multiple connected rooms. Watch how agents find the nearest exit via flow field pathfinding.' },
  counterflow: { agents: 200, walls: 4, exits: 2, tips: 'Two groups heading opposite directions. Observe the separation behavior preventing collisions.' },
  empty: { agents: 0, walls: 0, exits: 0, tips: 'A blank canvas. Build your own scenario from scratch — add walls, exits, hazards, and agents.' },
};

export default function ScenariosPage() {
  const [ref, visible] = useScrollAnimation<HTMLDivElement>();

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
          {presets.map((preset, i) => {
            const diff = difficultyMap[preset.id] || { label: 'Custom', color: 'text-white/40 bg-white/5' };
            const details = detailsMap[preset.id] || { agents: preset.agents.length, walls: preset.walls.length, exits: preset.exits.length, tips: '' };

            return (
              <div
                key={preset.id}
                className={`group rounded-2xl border border-white/[0.04] bg-gradient-to-br from-white/[0.02] to-transparent p-6 transition-all duration-500 hover:border-white/[0.08] hover:-translate-y-1 ${
                  visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: visible ? `${i * 80}ms` : '0ms' }}
              >
                {/* Header */}
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

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 py-3 border-y border-white/[0.04]">
                  <div className="text-center">
                    <div className="text-sm font-mono font-bold text-cyan-400">{details.agents}</div>
                    <div className="text-[9px] text-white/20 uppercase">Agents</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-mono font-bold text-slate-400">{details.walls}</div>
                    <div className="text-[9px] text-white/20 uppercase">Walls</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-mono font-bold text-emerald-400">{details.exits}</div>
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

                {/* Tips */}
                {details.tips && (
                  <p className="text-[11px] text-white/20 leading-relaxed">
                    <span className="text-white/30 font-medium">Tip: </span>
                    {details.tips}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Section>
    </PageLayout>
  );
}
