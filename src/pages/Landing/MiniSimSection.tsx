import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { Section } from '../../components/layout/Section';
import { MiniSimCanvas } from '../../components/canvas/MiniSimCanvas';

export function MiniSimSection() {
  const [ref, visible] = useScrollAnimation<HTMLDivElement>();

  return (
    <Section>
      <div ref={ref as React.Ref<HTMLDivElement>} className={`scroll-reveal ${visible ? 'visible' : ''}`}>
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-4xl font-bold mb-4">
              Watch Them <span className="text-gradient">Think</span>
            </h2>
            <p className="text-white/40 mb-6 leading-relaxed">
              Each agent independently evaluates its surroundings, calculates steering forces,
              and navigates toward exits — creating realistic, emergent crowd behavior from simple rules.
            </p>
            <div className="space-y-3">
              {[
                'Goal seeking guides agents toward nearest exits',
                'Separation prevents overlapping and crushing',
                'Wall avoidance steers around obstacles',
                'Stress system models panic propagation',
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-white/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="glass rounded-xl p-4">
              <MiniSimCanvas width={400} height={280} agentCount={80} />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
