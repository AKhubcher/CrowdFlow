import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { Section } from '../../components/layout/Section';

const useCases = [
  {
    title: 'Emergency Evacuation Planning',
    description: 'Model building evacuations with varying exit widths, obstacle placement, and crowd densities. Identify bottlenecks before they become fatal.',
    scenario: 'roomEvacuation',
    gradient: 'from-red-500/10 to-orange-500/10',
    border: 'hover:border-red-500/20',
    accent: 'text-red-400',
    stats: { metric: '200', label: 'agents evacuating' },
  },
  {
    title: 'Event Crowd Management',
    description: 'Simulate concert venues, stadiums, and festivals. Test crowd flow patterns with multiple entry/exit points and internal barriers.',
    scenario: 'concertVenue',
    gradient: 'from-purple-500/10 to-blue-500/10',
    border: 'hover:border-purple-500/20',
    accent: 'text-purple-400',
    stats: { metric: '300', label: 'agents in venue' },
  },
  {
    title: 'Urban Pedestrian Flow',
    description: 'Study counterflow dynamics, corridor bottlenecks, and intersection patterns. Observe how bidirectional streams self-organize into lanes.',
    scenario: 'counterflow',
    gradient: 'from-cyan-500/10 to-emerald-500/10',
    border: 'hover:border-cyan-500/20',
    accent: 'text-cyan-400',
    stats: { metric: '2', label: 'opposing streams' },
  },
  {
    title: 'Architectural Validation',
    description: 'Test floor plans with multiple rooms, corridors, and stairwells. Ensure egress capacity meets safety requirements before construction.',
    scenario: 'multiFloor',
    gradient: 'from-emerald-500/10 to-teal-500/10',
    border: 'hover:border-emerald-500/20',
    accent: 'text-emerald-400',
    stats: { metric: '3', label: 'connected rooms' },
  },
];

export function UseCasesSection() {
  const [ref, visible] = useScrollAnimation<HTMLDivElement>();

  return (
    <Section>
      <div ref={ref as React.Ref<HTMLDivElement>}>
        <div className={`text-center mb-20 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-5xl font-black mb-5 tracking-tight">
            Real-World <span className="text-gradient">Applications</span>
          </h2>
          <p className="text-white/35 max-w-xl mx-auto text-lg font-light">
            From fire safety to urban planning — crowd simulation has practical impact.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {useCases.map((uc, i) => (
            <div
              key={i}
              className={`group relative rounded-2xl border border-white/[0.04] ${uc.border} bg-gradient-to-br ${uc.gradient} to-transparent p-7 transition-all duration-500 hover:-translate-y-1 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: visible ? `${i * 120}ms` : '0ms' }}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className={`text-lg font-bold ${uc.accent} group-hover:text-white transition-colors`}>
                  {uc.title}
                </h3>
                <div className="text-right flex-shrink-0 ml-4">
                  <div className="text-xl font-bold font-mono text-white/60">{uc.stats.metric}</div>
                  <div className="text-[9px] text-white/20 uppercase tracking-wider">{uc.stats.label}</div>
                </div>
              </div>
              <p className="text-sm text-white/30 leading-relaxed mb-5">{uc.description}</p>
              <Link
                to="/simulator"
                className="inline-flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                Try this scenario
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 2l4 4-4 4" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
