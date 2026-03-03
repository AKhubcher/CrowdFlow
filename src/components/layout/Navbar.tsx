import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/simulator', label: 'Simulator' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/about', label: 'About' },
];

export function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold text-gradient">
          CrowdFlow
        </Link>
        <div className="flex items-center gap-1">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                location.pathname === link.to
                  ? 'text-accent-cyan bg-accent-cyan/10'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
