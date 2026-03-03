import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.04] py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-white/30">
          <span className="text-gradient font-semibold">CrowdFlow</span>
          {' '}— Interactive Crowd Simulation Engine
        </div>
        <div className="flex items-center gap-6">
          <Link to="/simulator" className="text-xs text-white/30 hover:text-white/60 transition-colors">
            Simulator
          </Link>
          <Link to="/how-it-works" className="text-xs text-white/30 hover:text-white/60 transition-colors">
            How It Works
          </Link>
          <Link to="/about" className="text-xs text-white/30 hover:text-white/60 transition-colors">
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}
