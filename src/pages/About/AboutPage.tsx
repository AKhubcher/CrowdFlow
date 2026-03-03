import { Link } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { Section } from '../../components/layout/Section';

export default function AboutPage() {
  return (
    <PageLayout>
      <Section>
        <div className="max-w-3xl mx-auto">
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span className="text-[11px] text-white/30 uppercase tracking-widest">About</span>
            </div>
            <h1 className="text-6xl font-black mb-5 tracking-tight">
              About <span className="text-gradient">CrowdFlow</span>
            </h1>
            <p className="text-white/35 text-lg font-light leading-relaxed">
              An interactive crowd simulation engine built entirely in the browser, from scratch.
            </p>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-white/[0.04] bg-gradient-to-br from-cyan-500/[0.03] to-transparent p-8">
              <h2 className="text-xl font-bold text-white/80 mb-4">What is CrowdFlow?</h2>
              <p className="text-sm text-white/40 leading-relaxed">
                CrowdFlow is an interactive crowd simulation engine built entirely in the browser.
                It combines autonomous steering behaviors, spatial hashing, flow field pathfinding,
                and a stress system to create realistic crowd dynamics. The simulation runs on a
                fixed-timestep physics loop completely decoupled from React rendering — the engine
                has zero React dependencies.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.04] bg-gradient-to-br from-blue-500/[0.03] to-transparent p-8">
              <h2 className="text-xl font-bold text-white/80 mb-4">Technical Highlights</h2>
              <ul className="space-y-3 text-sm text-white/40">
                {[
                  { label: 'Zero-allocation hot loop', desc: 'All Vec2 math uses pre-allocated scratch vectors. No GC pauses during simulation.' },
                  { label: 'Spatial hash grid', desc: 'Cell-based partitioning for O(n) neighbor queries instead of O(n\u00B2).' },
                  { label: '4-layer canvas', desc: 'Stacked canvases with camera transforms. Static layers skip unnecessary redraws.' },
                  { label: 'Engine-React bridge', desc: 'Simulation runs via requestAnimationFrame. React polls stats at 10fps.' },
                  { label: '7 steering behaviors', desc: 'Goal seeking, separation, alignment, wall avoidance, hazard avoidance, attractor pull, and noise.' },
                ].map(item => (
                  <li key={item.label} className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                    <span>
                      <strong className="text-white/60">{item.label}</strong>
                      <span className="text-white/30"> — {item.desc}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/[0.04] bg-gradient-to-br from-violet-500/[0.03] to-transparent p-8">
              <h2 className="text-xl font-bold text-white/80 mb-4">Tech Stack</h2>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'React 18', color: 'border-cyan-500/20 text-cyan-400/60' },
                  { name: 'TypeScript', color: 'border-blue-500/20 text-blue-400/60' },
                  { name: 'Vite', color: 'border-purple-500/20 text-purple-400/60' },
                  { name: 'Tailwind CSS', color: 'border-teal-500/20 text-teal-400/60' },
                  { name: 'HTML5 Canvas', color: 'border-orange-500/20 text-orange-400/60' },
                  { name: 'React Router', color: 'border-red-500/20 text-red-400/60' },
                ].map(tech => (
                  <span key={tech.name} className={`px-3.5 py-1.5 rounded-full bg-white/[0.02] text-xs border ${tech.color}`}>
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.04] bg-gradient-to-br from-emerald-500/[0.03] to-transparent p-8">
              <h2 className="text-xl font-bold text-white/80 mb-4">Built From Scratch</h2>
              <p className="text-sm text-white/40 leading-relaxed">
                No simulation libraries, no physics engines, no pre-built pathfinding — every system
                was written from the ground up. The engine module has zero external dependencies and
                could run headlessly in Node.js. The rendering pipeline, collision detection, flow field
                pathfinding, and all 7 steering behaviors are custom implementations.
              </p>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Link
                to="/simulator"
                className="h-11 px-8 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-400 text-sm font-medium ring-1 ring-cyan-500/20 transition-all inline-flex items-center"
              >
                Try the Simulator
              </Link>
              <Link
                to="/how-it-works"
                className="h-11 px-8 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-white/50 text-sm font-medium border border-white/[0.06] transition-all inline-flex items-center"
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
