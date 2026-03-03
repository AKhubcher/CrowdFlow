import { PageLayout } from '../../components/layout/PageLayout';
import { Section } from '../../components/layout/Section';
import { SteeringDemo } from './SteeringDemo';
import { SpatialHashDemo } from './SpatialHashDemo';
import { AgentFlowchart } from './AgentFlowchart';
import { ConceptCard } from './ConceptCard';
import '../../styles/animations.css';

export default function HowItWorksPage() {
  return (
    <PageLayout>
      <Section>
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="text-[11px] text-white/30 uppercase tracking-widest">Technical Deep Dive</span>
          </div>
          <h1 className="text-6xl font-black mb-5 tracking-tight">
            How It <span className="text-gradient">Works</span>
          </h1>
          <p className="text-white/35 max-w-2xl mx-auto text-lg font-light leading-relaxed">
            CrowdFlow simulates autonomous agents using a combination of steering behaviors,
            spatial optimization, and flow field pathfinding.
          </p>
        </div>

        <div className="space-y-10">
          {/* Steering Demo */}
          <SteeringDemo />

          {/* Agent Flowchart + Concepts */}
          <div className="grid md:grid-cols-2 gap-8">
            <AgentFlowchart />
            <div className="space-y-4">
              <ConceptCard
                title="Fixed Timestep Loop"
                description="The simulation uses a fixed 60Hz physics timestep with an accumulator pattern. This ensures deterministic behavior regardless of frame rate — the physics always steps at exactly 16.67ms intervals."
                color="text-accent-cyan"
              />
              <ConceptCard
                title="Zero-Allocation Math"
                description="Vec2 operations use pre-allocated scratch vectors per agent. No 'new' calls in the hot loop — all math writes to existing objects, eliminating garbage collection pauses."
                color="text-accent-orange"
              />
            </div>
          </div>

          {/* Spatial Hash Demo */}
          <SpatialHashDemo />

          {/* Concepts Grid */}
          <div className="grid md:grid-cols-3 gap-5">
            <ConceptCard
              title="Flow Field Pathfinding"
              description="A multi-source BFS floods outward from all exits simultaneously, generating a distance field. The gradient gives every cell a direction toward the nearest exit. Agents simply follow their local cell's direction."
              color="text-accent-green"
            />
            <ConceptCard
              title="Stress System"
              description="Each agent tracks a stress value [0..1] that increases from high density, hazard proximity, and panic mode. At stress > 0.8, agents may freeze temporarily. Stress affects color and adds steering noise."
              color="text-accent-orange"
            />
            <ConceptCard
              title="Collision Resolution"
              description="Position-based collision pushes overlapping agents apart equally. Wall collision projects agents out of wall geometry. The spatial grid makes both operations efficient at O(n)."
              color="text-accent-purple"
            />
          </div>

          {/* Rendering Architecture */}
          <ConceptCard
            title="4-Layer Canvas Rendering"
            description="Four stacked canvas elements separate concerns: Layer 0 (Background) draws walls and exits — only redraws on changes. Layer 1 (Heatmap) updates every 10th frame. Layer 2 (Agents) redraws every frame with glow effects. Layer 3 (UI) only redraws on interaction. This avoids redrawing static content every frame."
            color="text-accent-blue"
          />

          {/* Keyboard shortcuts */}
          <div className="rounded-2xl border border-white/[0.04] bg-gradient-to-br from-white/[0.02] to-transparent p-8">
            <h3 className="text-lg font-bold text-white/70 mb-6">Keyboard Shortcuts</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'Space', action: 'Play/Pause' },
                { key: 'V', action: 'Select tool' },
                { key: 'A', action: 'Add agents' },
                { key: 'W', action: 'Draw walls' },
                { key: 'E', action: 'Place exits' },
                { key: 'H', action: 'Place hazards' },
                { key: 'G', action: 'Place attractors' },
                { key: 'X', action: 'Erase tool' },
                { key: '.', action: 'Step forward' },
                { key: 'R', action: 'Reset' },
                { key: 'Scroll', action: 'Zoom in/out' },
                { key: 'RMB', action: 'Pan camera' },
                { key: 'Del', action: 'Delete selection' },
                { key: 'Ctrl+C', action: 'Copy selection' },
                { key: 'Ctrl+V', action: 'Paste' },
              ].map(({ key, action }) => (
                <div key={key} className="flex items-center gap-2.5">
                  <kbd className="px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-white/40 min-w-[2.5rem] text-center">
                    {key}
                  </kbd>
                  <span className="text-xs text-white/30">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
}
