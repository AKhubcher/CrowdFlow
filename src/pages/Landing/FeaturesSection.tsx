import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { Section } from '../../components/layout/Section';

const features = [
  {
    title: 'Autonomous Steering',
    description: '7 independent steering behaviors combine to create emergent crowd dynamics — goal seeking, separation, alignment, wall avoidance, and more.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4.5L6 21l1.5-7.5L2 9h7l3-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
    gradient: 'from-cyan-500 to-blue-500',
    glow: 'shadow-cyan-500/20',
  },
  {
    title: 'Spatial Hash Grid',
    description: 'O(n) spatial partitioning turns naive O(n\u00B2) neighbor lookups into O(n\u00B7k), enabling thousands of agents at 60fps.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    gradient: 'from-purple-500 to-pink-500',
    glow: 'shadow-purple-500/20',
  },
  {
    title: 'Flow Field Pathfinding',
    description: 'Multi-source BFS generates a global direction field from all exits. Agents always find optimal paths through complex environments.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'shadow-emerald-500/20',
  },
  {
    title: 'Stress System',
    description: 'Agents experience stress from density, hazards, and panic. High stress causes color shifts, erratic movement, and freezing.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    gradient: 'from-orange-500 to-red-500',
    glow: 'shadow-orange-500/20',
  },
  {
    title: 'Interactive Environment',
    description: 'Draw walls, place exits, drop hazards, and add attractors in real-time. The simulation responds instantly to all changes.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    gradient: 'from-blue-500 to-indigo-500',
    glow: 'shadow-blue-500/20',
  },
  {
    title: 'Timeline Scrubbing',
    description: 'Capture simulation snapshots every second. Scrub backward and forward through time to analyze crowd behavior patterns.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    gradient: 'from-pink-500 to-rose-500',
    glow: 'shadow-pink-500/20',
  },
];

export function FeaturesSection() {
  const [ref, visible] = useScrollAnimation<HTMLDivElement>();

  return (
    <Section>
      <div ref={ref as React.Ref<HTMLDivElement>}>
        <div className={`text-center mb-20 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-5xl font-black mb-5 tracking-tight">
            Built for <span className="text-gradient">Performance</span>
          </h2>
          <p className="text-white/35 max-w-xl mx-auto text-lg font-light">
            Every component is engineered for speed — zero-allocation math, spatial partitioning,
            and a fixed-timestep physics loop.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`group relative rounded-2xl p-6 bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all duration-500 hover:shadow-2xl hover:${feature.glow} hover:-translate-y-1 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: visible ? `${i * 100}ms` : '0ms' }}
            >
              {/* Gradient top bar */}
              <div className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-50 transition-opacity`} />

              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.gradient} bg-opacity-10 flex items-center justify-center mb-4 text-white/70 group-hover:text-white transition-colors group-hover:shadow-lg group-hover:${feature.glow}`}>
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold text-white/80 group-hover:text-white mb-2 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-white/30 group-hover:text-white/45 leading-relaxed transition-colors">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
