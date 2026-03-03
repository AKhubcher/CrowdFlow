import type { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function Section({ children, className = '', id }: SectionProps) {
  return (
    <section id={id} className={`py-24 px-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </section>
  );
}
