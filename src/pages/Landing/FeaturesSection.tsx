import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { Section } from '../../components/layout/Section';
import { Card } from '../../components/ui/Card';

const features = [
  {
    title: 'Autonomous Steering',
    description: '7 independent steering behaviors combine to create emergent crowd dynamics — goal seeking, separation, alignment, wall avoidance, and more.',
    color: 'text-accent-cyan',
    gradient: 'from-accent-cyan/20 to-transparent',
  },
  {
    title: 'Spatial Hash Grid',
    description: 'O(n) spatial partitioning turns naive O(n\u00B2) neighbor lookups into O(n\u00B7k), enabling thousands of agents at 60fps.',
    color: 'text-accent-purple',
    gradient: 'from-accent-purple/20 to-transparent',
  },
  {
    title: 'Flow Field Pathfinding',
    description: 'Multi-source BFS generates a global direction field from all exits simultaneously. Agents always find optimal paths.',
    color: 'text-accent-green',
    gradient: 'from-accent-green/20 to-transparent',
  },
  {
    title: 'Stress System',
    description: 'Agents experience stress from density, hazards, and panic. High stress causes color shifts, erratic movement, and freezing.',
    color: 'text-accent-orange',
    gradient: 'from-accent-orange/20 to-transparent',
  },
  {
    title: 'Interactive Environment',
    description: 'Draw walls, place exits, drop hazards, and add attractors in real-time. The simulation responds instantly to changes.',
    color: 'text-accent-blue',
    gradient: 'from-accent-blue/20 to-transparent',
  },
  {
    title: 'Timeline Scrubbing',
    description: 'Capture simulation snapshots every second. Scrub backward and forward through time to analyze crowd behavior.',
    color: 'text-accent-pink',
    gradient: 'from-accent-pink/20 to-transparent',
  },
];

export function FeaturesSection() {
  const [ref, visible] = useScrollAnimation<HTMLDivElement>();

  return (
    <Section>
      <div ref={ref as React.Ref<HTMLDivElement>} className={`scroll-reveal ${visible ? 'visible' : ''}`}>
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Built for <span className="text-gradient">Performance</span>
          </h2>
          <p className="text-white/40 max-w-xl mx-auto">
            Every component is engineered for speed — zero-allocation math, spatial partitioning,
            layered canvas rendering, and a fixed-timestep physics loop.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <Card key={i} hover className="group">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                <div className={`w-2 h-2 rounded-full ${feature.color.replace('text-', 'bg-')}`} />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${feature.color}`}>{feature.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}
