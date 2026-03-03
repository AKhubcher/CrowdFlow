import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  color?: 'cyan' | 'purple' | 'green' | 'orange' | 'white';
}

const colors = {
  cyan: 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20',
  purple: 'bg-accent-purple/10 text-accent-purple border-accent-purple/20',
  green: 'bg-accent-green/10 text-accent-green border-accent-green/20',
  orange: 'bg-accent-orange/10 text-accent-orange border-accent-orange/20',
  white: 'bg-white/5 text-white/60 border-white/10',
};

export function Badge({ children, color = 'cyan' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[color]}`}>
      {children}
    </span>
  );
}
