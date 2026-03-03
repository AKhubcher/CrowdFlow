import { useState, useEffect } from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { Section } from '../../components/layout/Section';

const metrics = [
  { value: 3000, label: 'Agents at 60fps', suffix: '+', color: 'from-cyan-400 to-blue-400' },
  { value: 7, label: 'Steering Behaviors', suffix: '', color: 'from-purple-400 to-pink-400' },
  { value: 4, label: 'Canvas Layers', suffix: '', color: 'from-emerald-400 to-teal-400' },
  { value: 60, label: 'FPS Target', suffix: '', color: 'from-orange-400 to-red-400' },
];

export function MetricsTicker() {
  const [ref, visible] = useScrollAnimation<HTMLDivElement>();
  const [counts, setCounts] = useState(metrics.map(() => 0));

  useEffect(() => {
    if (!visible) return;
    const duration = 2000;
    const steps = 80;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCounts(metrics.map(m => Math.round(m.value * eased)));
      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [visible]);

  return (
    <Section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-accent-cyan/[0.02] via-transparent to-accent-purple/[0.02]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div ref={ref as React.Ref<HTMLDivElement>}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {metrics.map((metric, i) => (
            <div
              key={i}
              className={`text-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: visible ? `${i * 150}ms` : '0ms' }}
            >
              <div className={`text-5xl md:text-6xl font-black bg-gradient-to-r ${metric.color} bg-clip-text text-transparent mb-3 tabular-nums`}>
                {counts[i]}{metric.suffix}
              </div>
              <div className="text-sm text-white/30 font-medium">{metric.label}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
