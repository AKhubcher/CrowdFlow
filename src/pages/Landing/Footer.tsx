import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="relative py-16 px-6">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-xl font-black text-gradient">CrowdFlow</span>
            <span className="text-xs text-white/20">Interactive Crowd Simulation Engine</span>
          </div>

          <div className="flex items-center gap-8">
            {[
              { to: '/simulator', label: 'Simulator' },
              { to: '/scenarios', label: 'Scenarios' },
              { to: '/dashboard', label: 'Dashboard' },
              { to: '/how-it-works', label: 'How It Works' },
              { to: '/about', label: 'About' },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="text-xs text-white/25 hover:text-accent-cyan transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/[0.03] text-center">
          <p className="text-[11px] text-white/15">
            Built with React, TypeScript, and a custom physics engine. No simulation libraries — all from scratch.
          </p>
        </div>
      </div>
    </footer>
  );
}
