import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/simulator', label: 'Simulator' },
  { to: '/scenarios', label: 'Scenarios' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/about', label: 'About' },
];

export function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-surface-950/70 backdrop-blur-2xl border-b border-white/[0.04]" />
      <div className="relative max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="text-lg font-black text-gradient hover:opacity-80 transition-opacity">
          CrowdFlow
        </Link>
        <div className="flex items-center gap-0.5">
          {links.map(link => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'text-accent-cyan'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {active && (
                  <div className="absolute inset-0 rounded-lg bg-accent-cyan/[0.08]" />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
