import { useState, useEffect } from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { Section } from '../../components/layout/Section';

const metrics = [
  { value: 3000, label: 'Agents at 60fps', suffix: '+' },
  { value: 7, label: 'Steering Behaviors', suffix: '' },
  { value: 4, label: 'Canvas Layers', suffix: '' },
  { value: 60, label: 'FPS Target', suffix: '' },
];

export function MetricsTicker() {
  const [ref, visible] = useScrollAnimation<HTMLDivElement>();
  const [counts, setCounts] = useState(metrics.map(() => 0));

  useEffect(() => {
    if (!visible) return;
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCounts(metrics.map(m => Math.round(m.value * eased)));
      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [visible]);

  return (
    <Section className="border-y border-white/[0.04]">
      <div ref={ref as React.Ref<HTMLDivElement>} className={`scroll-reveal ${visible ? 'visible' : ''}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {metrics.map((metric, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-black text-gradient mb-2">
                {counts[i]}{metric.suffix}
              </div>
              <div className="text-sm text-white/40">{metric.label}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
