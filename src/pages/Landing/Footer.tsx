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
            <a
              href="https://github.com/AKhubcher/CrowdFlow"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/25 hover:text-white/60 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/arya-khubcher"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/25 hover:text-white/60 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.6 0H2.4C1.08 0 0 1.08 0 2.4v11.2C0 14.92 1.08 16 2.4 16h11.2c1.32 0 2.4-1.08 2.4-2.4V2.4C16 1.08 14.92 0 13.6 0zM4.8 13.6H2.4V6.4h2.4v7.2zM3.6 5.28c-.76 0-1.36-.64-1.36-1.4 0-.76.6-1.36 1.36-1.36s1.36.6 1.36 1.36c0 .76-.6 1.4-1.36 1.4zm10 8.32h-2.4V9.92c0-.88-.72-1.6-1.6-1.6s-1.6.72-1.6 1.6v3.68H5.6V6.4H8v.96c.52-.8 1.44-1.36 2.4-1.36 1.76 0 3.2 1.44 3.2 3.2v4.4z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/[0.03] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-white/15">
            Built by <span className="text-white/30">Arya Khubcher</span> with React, TypeScript, and a custom physics engine. No simulation libraries — all from scratch.
          </p>
          <div className="flex items-center gap-4 text-[10px] text-white/10">
            <span>Zero dependencies</span>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <span>Client-side only</span>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <span>Open source</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
