import type { ReactNode } from 'react';

interface ConceptCardProps {
  title: string;
  description: string;
  color: string;
  children?: ReactNode;
}

const colorMap: Record<string, { border: string; glow: string }> = {
  'text-accent-cyan': { border: 'border-cyan-500/10 hover:border-cyan-500/20', glow: 'from-cyan-500/5' },
  'text-accent-green': { border: 'border-emerald-500/10 hover:border-emerald-500/20', glow: 'from-emerald-500/5' },
  'text-accent-orange': { border: 'border-orange-500/10 hover:border-orange-500/20', glow: 'from-orange-500/5' },
  'text-accent-purple': { border: 'border-violet-500/10 hover:border-violet-500/20', glow: 'from-violet-500/5' },
  'text-accent-blue': { border: 'border-blue-500/10 hover:border-blue-500/20', glow: 'from-blue-500/5' },
};

export function ConceptCard({ title, description, color, children }: ConceptCardProps) {
  const mapped = colorMap[color] || { border: 'border-white/[0.06]', glow: 'from-white/5' };

  return (
    <div className={`group relative rounded-2xl border ${mapped.border} bg-gradient-to-br ${mapped.glow} to-transparent p-6 transition-all duration-300 hover:-translate-y-0.5`}>
      <h3 className={`text-lg font-bold mb-2.5 ${color}`}>{title}</h3>
      <p className="text-sm text-white/35 leading-relaxed">{description}</p>
      {children}
    </div>
  );
}
