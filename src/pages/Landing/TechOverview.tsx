import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { Section } from '../../components/layout/Section';

const techStack = [
  { name: 'React 18', desc: 'UI framework', color: 'text-accent-cyan' },
  { name: 'TypeScript', desc: 'Type safety', color: 'text-accent-blue' },
  { name: 'HTML5 Canvas', desc: '4-layer rendering', color: 'text-accent-orange' },
  { name: 'Vite', desc: 'Build tool', color: 'text-accent-purple' },
  { name: 'Tailwind CSS', desc: 'Styling', color: 'text-accent-cyan' },
  { name: 'Custom Engine', desc: 'Zero dependencies', color: 'text-accent-green' },
];

const architecture = [
  { layer: 'Engine', desc: 'Pure simulation — zero React dependency. Agent logic, steering, collision, pathfinding.' },
  { layer: 'Renderer', desc: '4 stacked canvas layers with camera transforms. Background redraws only on change.' },
  { layer: 'Bridge', desc: 'SimulationController runs requestAnimationFrame. React polls stats at 10fps.' },
  { layer: 'UI', desc: 'React components for controls, overlays, and page layouts. Never re-renders for sim state.' },
];

export function TechOverview() {
  const [ref, visible] = useScrollAnimation<HTMLDivElement>();

  return (
    <Section>
      <div ref={ref as React.Ref<HTMLDivElement>} className={`scroll-reveal ${visible ? 'visible' : ''}`}>
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Under the <span className="text-gradient">Hood</span>
          </h2>
          <p className="text-white/40 max-w-xl mx-auto">
            A clean separation between simulation engine, rendering pipeline, and React UI.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            <h3 className="text-lg font-semibold text-white/80 mb-4">Architecture Layers</h3>
            <div className="space-y-3">
              {architecture.map((item, i) => (
                <div key={i} className="glass rounded-lg p-4">
                  <div className="text-sm font-mono text-accent-cyan mb-1">{item.layer}</div>
                  <div className="text-xs text-white/40">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white/80 mb-4">Tech Stack</h3>
            <div className="grid grid-cols-2 gap-3">
              {techStack.map((tech, i) => (
                <div key={i} className="glass rounded-lg p-4 text-center">
                  <div className={`text-sm font-semibold ${tech.color} mb-1`}>{tech.name}</div>
                  <div className="text-[11px] text-white/30">{tech.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
