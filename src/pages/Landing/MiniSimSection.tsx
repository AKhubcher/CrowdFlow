import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { Section } from '../../components/layout/Section';
import { MiniSimCanvas } from '../../components/canvas/MiniSimCanvas';

const behaviors = [
  { label: 'Goal seeking', desc: 'Agents steer toward the nearest exit via flow fields', color: 'bg-cyan-400' },
  { label: 'Separation', desc: 'Prevents overcrowding by pushing agents apart', color: 'bg-blue-400' },
  { label: 'Wall avoidance', desc: 'Agents detect and steer around solid obstacles', color: 'bg-purple-400' },
  { label: 'Stress propagation', desc: 'Panic spreads through dense crowds realistically', color: 'bg-orange-400' },
];

export function MiniSimSection() {
  const [ref, visible] = useScrollAnimation<HTMLDivElement>();

  return (
    <Section>
      <div ref={ref as React.Ref<HTMLDivElement>}>
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className={`flex-1 transition-all duration-700 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <h2 className="text-5xl font-black mb-5 tracking-tight">
              Watch Them <span className="text-gradient">Think</span>
            </h2>
            <p className="text-white/35 mb-8 leading-relaxed text-lg font-light">
              Each agent independently evaluates its surroundings, calculates steering forces,
              and navigates toward exits — creating realistic, emergent crowd behavior from simple rules.
            </p>
            <div className="space-y-4">
              {behaviors.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition-all duration-500 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                  style={{ transitionDelay: visible ? `${300 + i * 100}ms` : '0ms' }}
                >
                  <div className={`w-2 h-2 rounded-full ${item.color} mt-1.5 flex-shrink-0`} />
                  <div>
                    <div className="text-sm font-medium text-white/70">{item.label}</div>
                    <div className="text-xs text-white/30 mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`flex-shrink-0 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-accent-cyan/10 to-accent-purple/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative rounded-2xl border border-white/[0.06] overflow-hidden bg-surface-950 p-1">
                <MiniSimCanvas width={600} height={400} agentCount={120} className="rounded-xl" />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full glass text-[10px] text-white/30 font-mono">
                live simulation
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
