import type { ReactNode } from 'react';

interface ConceptCardProps {
  title: string;
  description: string;
  color: string;
  children?: ReactNode;
}

export function ConceptCard({ title, description, color, children }: ConceptCardProps) {
  return (
    <div className="glass rounded-xl p-6">
      <h3 className={`text-lg font-semibold mb-2 ${color}`}>{title}</h3>
      <p className="text-sm text-white/40 mb-4 leading-relaxed">{description}</p>
      {children}
    </div>
  );
}
