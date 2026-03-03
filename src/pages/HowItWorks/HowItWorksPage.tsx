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
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black mb-4">
            How It <span className="text-gradient">Works</span>
          </h1>
          <p className="text-white/40 max-w-2xl mx-auto">
            CrowdFlow simulates autonomous agents using a combination of steering behaviors,
            spatial optimization, and flow field pathfinding. Explore each system below.
          </p>
        </div>

        <div className="space-y-8">
          {/* Steering Demo */}
          <SteeringDemo />

          {/* Agent Flowchart */}
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

          {/* Flow Field */}
          <div className="grid md:grid-cols-3 gap-4">
            <ConceptCard
              title="Flow Field Pathfinding"
              description="A multi-source BFS floods outward from all exits simultaneously, generating a distance field. The gradient of this field gives every cell a direction toward the nearest exit. Agents simply follow their local cell's direction."
              color="text-accent-green"
            />
            <ConceptCard
              title="Stress System"
              description="Each agent tracks a stress value [0..1] that increases from high density, hazard proximity, and panic mode. At stress > 0.8, agents may freeze temporarily. Stress affects color (cyan→orange→red) and adds steering noise."
              color="text-accent-orange"
            />
            <ConceptCard
              title="Collision Resolution"
              description="Position-based collision pushes overlapping agents apart equally. Wall collision projects agents out of wall geometry and kills their velocity component into the wall. The spatial grid makes both operations efficient."
              color="text-accent-purple"
            />
          </div>

          {/* Rendering Architecture */}
          <ConceptCard
            title="4-Layer Canvas Rendering"
            description="Four stacked canvas elements separate concerns: Layer 0 (Background) draws walls, exits, hazards — only redraws on environment changes. Layer 1 (Heatmap) updates every 10th frame for density visualization. Layer 2 (Agents) redraws every frame with glow effects. Layer 3 (UI) only redraws on interaction — selection boxes, cursor feedback. This layered approach avoids redrawing static content every frame."
            color="text-accent-blue"
          />

          {/* Keyboard shortcuts */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white/80 mb-4">Keyboard Shortcuts</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                { key: 'Scroll', action: 'Zoom' },
                { key: 'Middle Click', action: 'Pan' },
              ].map(({ key, action }) => (
                <div key={key} className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-white/50">
                    {key}
                  </kbd>
                  <span className="text-xs text-white/40">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
}
