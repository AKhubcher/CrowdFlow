import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div className={`glass rounded-xl p-6 ${hover ? 'hover:bg-surface-900/80 transition-colors' : ''} ${className}`}>
      {children}
    </div>
  );
}
