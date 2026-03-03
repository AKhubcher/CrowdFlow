import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Engine } from '../../engine/core/Engine';
import { createWorld, addExit, addWall } from '../../engine/core/World';
import { createAgent } from '../../engine/core/Agent';
import { FIXED_DT } from '../../engine/core/constants';

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement!;
    let w = parent.clientWidth;
    let h = parent.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    const buildWorld = () => {
      const wld = createWorld(w, h);
      // Exits all around the edges — agents flow outward in every direction
      // Right edge
      addExit(wld, w - 2, h * 0.05, w - 2, h * 0.25);
      addExit(wld, w - 2, h * 0.35, w - 2, h * 0.65);
      addExit(wld, w - 2, h * 0.75, w - 2, h * 0.95);
      // Left edge
      addExit(wld, 2, h * 0.05, 2, h * 0.25);
      addExit(wld, 2, h * 0.35, 2, h * 0.65);
      addExit(wld, 2, h * 0.75, 2, h * 0.95);
      // Top edge
      addExit(wld, w * 0.05, 2, w * 0.3, 2);
      addExit(wld, w * 0.4, 2, w * 0.6, 2);
      addExit(wld, w * 0.7, 2, w * 0.95, 2);
      // Bottom edge
      addExit(wld, w * 0.05, h - 2, w * 0.3, h - 2);
      addExit(wld, w * 0.4, h - 2, w * 0.6, h - 2);
      addExit(wld, w * 0.7, h - 2, w * 0.95, h - 2);

      const count = Math.min(400, Math.floor((w * h) / 2500));
      for (let i = 0; i < count; i++) {
        wld.agents.push(createAgent(
          50 + Math.random() * (w - 100),
          50 + Math.random() * (h - 100),
        ));
      }
      return { world: wld, engine: new Engine(wld), agentCount: count };
    };

    let { world, engine, agentCount } = buildWorld();

    const resize = () => {
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ({ world, engine, agentCount } = buildWorld());
    };
    resize();
    window.addEventListener('resize', resize);
    const ctx = canvas.getContext('2d')!;

    // Track mouse for interactive repulsion — listen on parent to catch events above overlays
    const section = canvas.closest('section')!;
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };
    section.addEventListener('mousemove', onMouseMove);

    let rafId: number;
    let frame = 0;

    const render = () => {
      rafId = requestAnimationFrame(render);
      frame++;

      // Mouse repulsion — push agents away from cursor with larger radius
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      for (const agent of world.agents) {
        const dx = agent.position.x - mx;
        const dy = agent.position.y - my;
        const distSq = dx * dx + dy * dy;
        if (distSq < 22500 && distSq > 1) { // 150px radius
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / 150) * 1.2;
          agent.velocity.x += (dx / dist) * force;
          agent.velocity.y += (dy / dist) * force;
        }
      }

      engine.step(FIXED_DT);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Draw connections between nearby agents
      ctx.lineWidth = 0.5;
      for (let i = 0; i < world.agents.length; i++) {
        const a = world.agents[i];
        for (let j = i + 1; j < Math.min(i + 10, world.agents.length); j++) {
          const b = world.agents[j];
          const dx = a.position.x - b.position.x;
          const dy = a.position.y - b.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 40) {
            const alpha = (1 - dist / 40) * 0.08;
            ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.position.x, a.position.y);
            ctx.lineTo(b.position.x, b.position.y);
            ctx.stroke();
          }
        }
      }

      // Draw agents with trails
      for (const agent of world.agents) {
        const { x, y } = agent.position;
        const speed = Math.sqrt(agent.velocity.x ** 2 + agent.velocity.y ** 2);
        const r = agent.radius * 0.6 + speed * 0.3;

        // Glow
        ctx.shadowColor = agent.color;
        ctx.shadowBlur = 12 + speed * 4;
        ctx.fillStyle = agent.color;
        ctx.globalAlpha = 0.5 + speed * 0.15;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        // Bright core
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(x, y, r * 0.25, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Respawn from all edges + center clusters
      while (world.agents.length < agentCount) {
        const edge = Math.random();
        let ax: number, ay: number;
        if (edge < 0.2) { ax = 10; ay = Math.random() * h; }           // left
        else if (edge < 0.4) { ax = w - 10; ay = Math.random() * h; }  // right
        else if (edge < 0.55) { ax = Math.random() * w; ay = 10; }     // top
        else if (edge < 0.7) { ax = Math.random() * w; ay = h - 10; }  // bottom
        else {
          // Random interior spawn for constant density
          ax = 100 + Math.random() * (w - 200);
          ay = 100 + Math.random() * (h - 200);
        }
        world.agents.push(createAgent(ax, ay));
      }
    };

    rafId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafId);
      section.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background sim */}
      <div className="absolute inset-0">
        <canvas ref={canvasRef} className="w-full h-full" />
        {/* Multi-layer gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-surface-950/70 via-surface-950/30 to-surface-950/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(6,5,15,0.8)_80%)]" />
      </div>

      {/* Content */}
      <div className={`relative z-10 text-center px-6 max-w-5xl transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Status badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-xs mb-10 group hover:border-accent-cyan/30 transition-all cursor-default">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cyan" />
          </span>
          <span className="text-accent-cyan font-medium">Real-time crowd simulation</span>
          <span className="text-white/20">|</span>
          <span className="text-white/40">Move your mouse to interact</span>
        </div>

        <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.9]">
          <span className="text-gradient bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-purple bg-clip-text text-transparent">Crowd</span>
          <span className="text-white/90">Flow</span>
        </h1>

        <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
          A from-scratch physics engine with autonomous steering behaviors,
          spatial optimization, and flow field pathfinding — running
          entirely in your browser.
        </p>

        <div className="flex items-center justify-center gap-5">
          <Link
            to="/simulator"
            className="group relative h-14 px-10 rounded-2xl bg-gradient-to-r from-accent-cyan/20 to-accent-blue/20 text-white font-semibold text-sm border border-accent-cyan/20 transition-all inline-flex items-center gap-3 hover:border-accent-cyan/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="relative z-10">Launch Simulator</span>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="relative z-10 group-hover:translate-x-1 transition-transform">
              <path d="M7 4l5.5 5-5.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent-cyan/10 to-accent-blue/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link
            to="/how-it-works"
            className="h-14 px-10 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] text-white/50 hover:text-white/80 font-medium text-sm border border-white/[0.06] hover:border-white/[0.12] transition-all inline-flex items-center active:scale-[0.98]"
          >
            How It Works
          </Link>
        </div>

        {/* Tech badges */}
        <div className={`mt-16 flex items-center justify-center gap-3 flex-wrap transition-all duration-1000 delay-500 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {['React', 'TypeScript', 'HTML5 Canvas', 'Custom Physics'].map(tech => (
            <span key={tech} className="px-3 py-1 rounded-full text-[10px] font-mono text-white/20 border border-white/[0.04]">
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={`absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-1000 delay-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-5 h-9 rounded-full border border-white/10 flex items-start justify-center p-1.5">
          <div className="w-1 h-2 rounded-full bg-white/20 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
