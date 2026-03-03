import { Link } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { Section } from '../../components/layout/Section';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const engineStats = [
  { value: '~3,200', label: 'Lines of engine code', color: 'text-cyan-400' },
  { value: '0', label: 'External physics deps', color: 'text-emerald-400' },
  { value: '7', label: 'Steering behaviors', color: 'text-purple-400' },
  { value: '4', label: 'Canvas render layers', color: 'text-orange-400' },
  { value: '60Hz', label: 'Fixed physics timestep', color: 'text-blue-400' },
  { value: '16.67ms', label: 'Per tick budget', color: 'text-pink-400' },
];

const architecture = [
  {
    title: 'Engine Layer',
    desc: 'Pure simulation logic with zero React dependencies. Contains agent AI, steering behaviors, spatial hash grid, collision detection, flow field pathfinding, stress system, and snapshot management.',
    files: 'engine/',
    color: 'from-cyan-500/[0.05]',
    accent: 'text-cyan-400',
  },
  {
    title: 'Renderer Layer',
    desc: '4 stacked HTML5 canvases with a shared camera. Environment layer only redraws when walls/exits change. Heatmap updates every 10th frame. Agent layer redraws every frame with glow effects. UI layer redraws on interaction only.',
    files: 'renderer/',
    color: 'from-blue-500/[0.05]',
    accent: 'text-blue-400',
  },
  {
    title: 'Bridge Layer',
    desc: 'SimulationController manages the requestAnimationFrame loop with a fixed timestep accumulator. React hooks poll stats at 10fps — the UI never re-renders for simulation state.',
    files: 'bridge/',
    color: 'from-purple-500/[0.05]',
    accent: 'text-purple-400',
  },
  {
    title: 'UI Layer',
    desc: 'React components for the control panel, presets, overlays, and pages. All interaction flows through imperative controller methods, never through React state.',
    files: 'pages/, components/',
    color: 'from-pink-500/[0.05]',
    accent: 'text-pink-400',
  },
];

export default function AboutPage() {
  const [ref, visible] = useScrollAnimation<HTMLDivElement>();

  return (
    <PageLayout>
      <Section>
        <div className="max-w-4xl mx-auto" ref={ref as React.Ref<HTMLDivElement>}>
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span className="text-[11px] text-white/30 uppercase tracking-widest">About</span>
            </div>
            <h1 className="text-6xl font-black mb-5 tracking-tight">
              About <span className="text-gradient">CrowdFlow</span>
            </h1>
            <p className="text-white/35 text-lg font-light leading-relaxed max-w-2xl">
              A from-scratch crowd simulation engine built entirely in the browser — no physics libraries,
              no pathfinding packages, no pre-built AI. Every system hand-written in TypeScript.
            </p>
          </div>

          {/* Engine stats grid */}
          <div className={`grid grid-cols-3 md:grid-cols-6 gap-3 mb-12 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {engineStats.map((stat, i) => (
              <div key={i} className="text-center rounded-xl border border-white/[0.04] bg-white/[0.015] p-4">
                <div className={`text-xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
                <div className="text-[9px] text-white/20 uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {/* What is it */}
            <div className={`rounded-2xl border border-white/[0.04] bg-gradient-to-br from-cyan-500/[0.03] to-transparent p-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h2 className="text-xl font-bold text-white/80 mb-4">What is CrowdFlow?</h2>
              <p className="text-sm text-white/40 leading-relaxed mb-4">
                CrowdFlow is an interactive crowd simulation engine that models autonomous agents
                navigating complex environments. Each agent independently evaluates its surroundings
                using 7 weighted steering behaviors, follows flow field gradients toward exits,
                and experiences stress from density, hazards, and panic propagation.
              </p>
              <p className="text-sm text-white/40 leading-relaxed">
                The simulation runs on a fixed 60Hz physics timestep completely decoupled from React —
                the engine module has zero React dependencies and could run headlessly in Node.js.
                The rendering pipeline uses 4 stacked HTML5 canvases with shared camera transforms,
                only redrawing layers that have changed.
              </p>
            </div>

            {/* Architecture */}
            <div className="rounded-2xl border border-white/[0.04] bg-gradient-to-br from-blue-500/[0.03] to-transparent p-8">
              <h2 className="text-xl font-bold text-white/80 mb-6">Architecture</h2>
              <div className="space-y-4">
                {architecture.map((layer, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border border-white/[0.04] bg-gradient-to-br ${layer.color} to-transparent p-5 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionDelay: visible ? `${200 + i * 100}ms` : '0ms' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`text-sm font-semibold ${layer.accent}`}>{layer.title}</h3>
                      <span className="text-[10px] font-mono text-white/15">{layer.files}</span>
                    </div>
                    <p className="text-xs text-white/30 leading-relaxed">{layer.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical highlights */}
            <div className="rounded-2xl border border-white/[0.04] bg-gradient-to-br from-violet-500/[0.03] to-transparent p-8">
              <h2 className="text-xl font-bold text-white/80 mb-4">Key Technical Decisions</h2>
              <ul className="space-y-3 text-sm text-white/40">
                {[
                  { label: 'Zero-allocation hot loop', desc: 'All Vec2 math uses pre-allocated scratch vectors per agent. No `new` calls in the simulation loop eliminates GC pauses.' },
                  { label: 'Spatial hash grid', desc: 'Cell-based spatial partitioning for O(n) neighbor queries. Clear + rebuild every frame — simpler and faster than incremental updates.' },
                  { label: 'Multi-source BFS flow field', desc: 'Simultaneous flood fill from all exits creates a global direction field. Agents follow their local cell\'s gradient — no per-agent A*.' },
                  { label: 'Fixed timestep accumulator', desc: 'Physics always steps at exactly 16.67ms. Frame rate variations are absorbed by an accumulator, ensuring deterministic behavior.' },
                  { label: 'Position-based collision', desc: 'Overlapping agents are pushed apart equally. Wall collision projects agents out of line segments. Both use the spatial grid for efficiency.' },
                  { label: 'Agent stress model', desc: 'Stress [0..1] increases from density, hazard proximity, and panic. Affects color (cool→warm), steering noise, and freeze probability.' },
                ].map(item => (
                  <li key={item.label} className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-violet-400 mt-2 flex-shrink-0" />
                    <span>
                      <strong className="text-white/60">{item.label}</strong>
                      <span className="text-white/30"> — {item.desc}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tech stack */}
            <div className="rounded-2xl border border-white/[0.04] bg-gradient-to-br from-emerald-500/[0.03] to-transparent p-8">
              <h2 className="text-xl font-bold text-white/80 mb-4">Tech Stack</h2>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'React 18', color: 'border-cyan-500/20 text-cyan-400/60' },
                  { name: 'TypeScript', color: 'border-blue-500/20 text-blue-400/60' },
                  { name: 'Vite', color: 'border-purple-500/20 text-purple-400/60' },
                  { name: 'Tailwind CSS', color: 'border-teal-500/20 text-teal-400/60' },
                  { name: 'HTML5 Canvas', color: 'border-orange-500/20 text-orange-400/60' },
                  { name: 'React Router', color: 'border-red-500/20 text-red-400/60' },
                  { name: 'localStorage', color: 'border-emerald-500/20 text-emerald-400/60' },
                  { name: 'Custom Physics', color: 'border-yellow-500/20 text-yellow-400/60' },
                ].map(tech => (
                  <span key={tech.name} className={`px-3.5 py-1.5 rounded-full bg-white/[0.02] text-xs border ${tech.color}`}>
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
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
              <a
                href="https://github.com/AKhubcher/CrowdFlow"
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 px-8 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-white/50 text-sm font-medium border border-white/[0.06] transition-all inline-flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                GitHub
              </a>
            </div>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
}
