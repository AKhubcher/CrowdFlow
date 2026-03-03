import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Engine } from '../../engine/core/Engine';
import { createWorld, addExit } from '../../engine/core/World';
import { createAgent } from '../../engine/core/Agent';
import { FIXED_DT } from '../../engine/core/constants';

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = canvas.parentElement!.clientWidth;
    const h = canvas.parentElement!.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const world = createWorld(w, h);
    addExit(world, w - 2, h * 0.3, w - 2, h * 0.7);
    addExit(world, 2, h * 0.3, 2, h * 0.7);

    const agentCount = 200;
    for (let i = 0; i < agentCount; i++) {
      world.agents.push(createAgent(
        50 + Math.random() * (w - 100),
        50 + Math.random() * (h - 100),
      ));
    }

    const engine = new Engine(world);
    const ctx = canvas.getContext('2d')!;

    let rafId: number;
    const render = () => {
      rafId = requestAnimationFrame(render);
      engine.step(FIXED_DT);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      for (const agent of world.agents) {
        ctx.globalAlpha = 0.4;
        ctx.shadowColor = agent.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = agent.color;
        ctx.beginPath();
        ctx.arc(agent.position.x, agent.position.y, agent.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Respawn
      while (world.agents.length < agentCount) {
        world.agents.push(createAgent(
          50 + Math.random() * (w - 100),
          50 + Math.random() * (h - 100),
        ));
      }
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background sim */}
      <div className="absolute inset-0">
        <canvas ref={canvasRef} className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-surface-950/60 via-surface-950/40 to-surface-950" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs text-accent-cyan mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
          Real-time crowd simulation
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6">
          <span className="text-gradient">CrowdFlow</span>
        </h1>

        <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          An interactive crowd simulation engine with real-time physics,
          autonomous steering behaviors, spatial optimization, and
          beautiful visualizations.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            to="/simulator"
            className="h-12 px-8 rounded-xl bg-accent-cyan/20 hover:bg-accent-cyan/30 text-accent-cyan font-semibold text-sm border border-accent-cyan/20 transition-all inline-flex items-center gap-2 hover:scale-105"
          >
            Launch Simulator
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Link>
          <Link
            to="/how-it-works"
            className="h-12 px-8 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 font-medium text-sm border border-white/10 transition-all inline-flex items-center"
          >
            How It Works
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20">
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1">
          <div className="w-1 h-2 rounded-full bg-white/30 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
