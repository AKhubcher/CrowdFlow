import type { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-surface-950">
      <Navbar />
      <main className="pt-14">
        {children}
      </main>
    </div>
  );
}
