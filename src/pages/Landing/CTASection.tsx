import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { Section } from '../../components/layout/Section';

export function CTASection() {
  const [ref, visible] = useScrollAnimation<HTMLDivElement>();

  return (
    <Section>
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        className={`relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-cyan-500/[0.05] via-blue-500/[0.03] to-purple-500/[0.05] p-12 md:p-16 text-center transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/[0.03] rounded-full blur-3xl pointer-events-none" />

        <h2 className="relative text-4xl md:text-5xl font-black mb-5 tracking-tight">
          Ready to <span className="text-gradient">Simulate</span>?
        </h2>
        <p className="relative text-white/35 max-w-lg mx-auto text-lg font-light mb-10">
          Build your own scenarios, run evacuations, trigger panic mode,
          and watch emergent behavior unfold in real-time.
        </p>

        <div className="relative flex items-center justify-center gap-5 flex-wrap">
          <Link
            to="/simulator"
            className="group h-14 px-10 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white font-semibold text-sm border border-cyan-500/20 transition-all inline-flex items-center gap-3 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:scale-[1.02] active:scale-[0.98]"
          >
            Launch Simulator
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="group-hover:translate-x-1 transition-transform">
              <path d="M7 4l5.5 5-5.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            to="/scenarios"
            className="h-14 px-10 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] text-white/50 hover:text-white/80 font-medium text-sm border border-white/[0.06] hover:border-white/[0.12] transition-all inline-flex items-center active:scale-[0.98]"
          >
            Browse Scenarios
          </Link>
          <Link
            to="/dashboard"
            className="h-14 px-10 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] text-white/50 hover:text-white/80 font-medium text-sm border border-white/[0.06] hover:border-white/[0.12] transition-all inline-flex items-center active:scale-[0.98]"
          >
            View Dashboard
          </Link>
        </div>

        <div className="relative mt-12 flex items-center justify-center gap-8 text-[11px] text-white/15">
          <span>No install required</span>
          <span className="w-1 h-1 rounded-full bg-white/10" />
          <span>Runs in any modern browser</span>
          <span className="w-1 h-1 rounded-full bg-white/10" />
          <span>100% client-side</span>
        </div>
      </div>
    </Section>
  );
}
