import { Link } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { Section } from '../../components/layout/Section';
import { Card } from '../../components/ui/Card';

export default function AboutPage() {
  return (
    <PageLayout>
      <Section>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-black mb-4">
            About <span className="text-gradient">CrowdFlow</span>
          </h1>

          <div className="space-y-6 mt-8">
            <Card>
              <h2 className="text-xl font-semibold text-white/80 mb-3">What is CrowdFlow?</h2>
              <p className="text-sm text-white/50 leading-relaxed">
                CrowdFlow is an interactive crowd simulation engine built entirely in the browser.
                It combines autonomous steering behaviors, spatial hashing, flow field pathfinding,
                and a stress system to create realistic crowd dynamics. The simulation runs on a
                fixed-timestep physics loop completely decoupled from React rendering.
              </p>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-white/80 mb-3">Technical Highlights</h2>
              <ul className="space-y-2 text-sm text-white/50">
                <li className="flex items-start gap-2">
                  <span className="text-accent-cyan mt-0.5">-</span>
                  <span><strong className="text-white/70">Zero-allocation hot loop</strong> — All Vec2 math uses pre-allocated scratch vectors. No GC pauses during simulation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-cyan mt-0.5">-</span>
                  <span><strong className="text-white/70">Spatial hash grid</strong> — Cell-based partitioning for O(n) neighbor queries instead of O(n{'\u00B2'}).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-cyan mt-0.5">-</span>
                  <span><strong className="text-white/70">4-layer canvas</strong> — Stacked canvases with camera transforms. Static layers skip unnecessary redraws.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-cyan mt-0.5">-</span>
                  <span><strong className="text-white/70">Engine-React bridge</strong> — Simulation runs via requestAnimationFrame. React polls stats at 10fps via setInterval.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-cyan mt-0.5">-</span>
                  <span><strong className="text-white/70">7 steering behaviors</strong> — Goal seeking, separation, alignment, wall avoidance, hazard avoidance, attractor pull, and noise.</span>
                </li>
              </ul>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-white/80 mb-3">Tech Stack</h2>
              <div className="flex flex-wrap gap-2">
                {['React 18', 'TypeScript', 'Vite', 'Tailwind CSS', 'HTML5 Canvas', 'React Router'].map(tech => (
                  <span key={tech} className="px-3 py-1 rounded-full bg-white/5 text-xs text-white/50 border border-white/10">
                    {tech}
                  </span>
                ))}
              </div>
            </Card>

            <div className="flex items-center gap-4 pt-4">
              <Link
                to="/simulator"
                className="h-10 px-6 rounded-lg bg-accent-cyan/20 hover:bg-accent-cyan/30 text-accent-cyan text-sm font-medium border border-accent-cyan/20 transition-all inline-flex items-center"
              >
                Try the Simulator
              </Link>
              <Link
                to="/how-it-works"
                className="h-10 px-6 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium border border-white/10 transition-all inline-flex items-center"
              >
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
}
