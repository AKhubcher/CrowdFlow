import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { Section } from '../../components/layout/Section';

const architecture = [
  { layer: 'Engine', desc: 'Pure simulation — zero React dependency. Agent logic, steering, collision, pathfinding.', color: 'from-cyan-500 to-blue-500', num: '01' },
  { layer: 'Renderer', desc: '4 stacked canvas layers with camera transforms. Background redraws only on change.', color: 'from-blue-500 to-indigo-500', num: '02' },
  { layer: 'Bridge', desc: 'SimulationController runs requestAnimationFrame. React polls stats at 10fps.', color: 'from-indigo-500 to-purple-500', num: '03' },
  { layer: 'UI', desc: 'React components for controls and overlays. Never re-renders for sim state.', color: 'from-purple-500 to-pink-500', num: '04' },
];

const techStack = [
  { name: 'React 18', desc: 'UI framework', gradient: 'from-cyan-400/20 to-cyan-400/5' },
  { name: 'TypeScript', desc: 'Type safety', gradient: 'from-blue-400/20 to-blue-400/5' },
  { name: 'HTML5 Canvas', desc: '4-layer rendering', gradient: 'from-orange-400/20 to-orange-400/5' },
  { name: 'Vite', desc: 'Build tool', gradient: 'from-purple-400/20 to-purple-400/5' },
  { name: 'Tailwind CSS', desc: 'Styling', gradient: 'from-teal-400/20 to-teal-400/5' },
  { name: 'Custom Engine', desc: 'Zero dependencies', gradient: 'from-emerald-400/20 to-emerald-400/5' },
];

export function TechOverview() {
  const [ref, visible] = useScrollAnimation<HTMLDivElement>();

  return (
    <Section>
      <div ref={ref as React.Ref<HTMLDivElement>}>
        <div className={`text-center mb-20 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-5xl font-black mb-5 tracking-tight">
            Under the <span className="text-gradient">Hood</span>
          </h2>
          <p className="text-white/35 max-w-xl mx-auto text-lg font-light">
            A clean separation between simulation engine, rendering pipeline, and React UI.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Architecture — visual layer stack */}
          <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <h3 className="text-xs uppercase tracking-widest text-white/20 mb-6 font-mono">Architecture</h3>
            <div className="space-y-3">
              {architecture.map((item, i) => (
                <div
                  key={i}
                  className={`group relative rounded-xl p-5 border border-white/[0.04] hover:border-white/[0.08] bg-white/[0.015] transition-all duration-500 hover:-translate-y-0.5 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: visible ? `${i * 100}ms` : '0ms' }}
                >
                  <div className={`absolute top-0 left-0 w-1 h-full rounded-l-xl bg-gradient-to-b ${item.color} opacity-30 group-hover:opacity-60 transition-opacity`} />
                  <div className="flex items-start gap-4 pl-3">
                    <span className="text-[10px] font-mono text-white/15 mt-1">{item.num}</span>
                    <div>
                      <div className={`text-sm font-semibold bg-gradient-to-r ${item.color} bg-clip-text text-transparent mb-1`}>
                        {item.layer}
                      </div>
                      <div className="text-xs text-white/35 leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech stack */}
          <div className={`transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <h3 className="text-xs uppercase tracking-widest text-white/20 mb-6 font-mono">Tech Stack</h3>
            <div className="grid grid-cols-2 gap-3">
              {techStack.map((tech, i) => (
                <div
                  key={i}
                  className={`group rounded-xl p-4 border border-white/[0.04] hover:border-white/[0.08] bg-gradient-to-br ${tech.gradient} transition-all duration-500 hover:-translate-y-0.5 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                  style={{ transitionDelay: visible ? `${200 + i * 80}ms` : '0ms' }}
                >
                  <div className="text-sm font-semibold text-white/70 group-hover:text-white/90 mb-0.5 transition-colors">
                    {tech.name}
                  </div>
                  <div className="text-[11px] text-white/25">{tech.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
