import { useRef, useEffect, useState } from 'react';
import { Engine } from '../../engine/core/Engine';
import { createWorld, addWall, addExit, addHazard } from '../../engine/core/World';
import { createAgent } from '../../engine/core/Agent';
import { FIXED_DT } from '../../engine/core/constants';

const behaviorDescriptions: Record<string, string> = {
  goalSeeking: 'Agents steer toward the nearest exit, following the flow field gradient.',
  separation: 'Agents push away from neighbors to avoid overcrowding and collisions.',
  wallAvoidance: 'Agents detect nearby walls and steer parallel or away from them.',
  hazardAvoidance: 'Agents flee from hazard zones with force proportional to danger.',
  alignment: 'Agents align their heading with nearby neighbors for cohesive flow.',
};

export function SteeringDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeBehavior, setActiveBehavior] = useState('goalSeeking');
  const engineRef = useRef<Engine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = 500, h = 300;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const world = createWorld(w, h);

    if (activeBehavior === 'wallAvoidance') {
      addWall(world, 200, 50, 200, 250);
      addWall(world, 300, 50, 300, 250);
      addExit(world, w - 2, 100, w - 2, 200);
      for (let i = 0; i < 40; i++) {
        world.agents.push(createAgent(30 + Math.random() * 100, 50 + Math.random() * 200));
      }
    } else if (activeBehavior === 'hazardAvoidance') {
      addHazard(world, 250, 150, 60, 1);
      addExit(world, w - 2, 100, w - 2, 200);
      for (let i = 0; i < 50; i++) {
        world.agents.push(createAgent(30 + Math.random() * 100, 50 + Math.random() * 200));
      }
    } else if (activeBehavior === 'separation') {
      addExit(world, w - 2, 130, w - 2, 170);
      // Tightly packed agents
      for (let i = 0; i < 80; i++) {
        world.agents.push(createAgent(100 + Math.random() * 50, 120 + Math.random() * 60));
      }
    } else if (activeBehavior === 'alignment') {
      addExit(world, w - 2, 100, w - 2, 200);
      for (let i = 0; i < 60; i++) {
        world.agents.push(createAgent(30 + Math.random() * 150, 50 + Math.random() * 200));
      }
    } else {
      addExit(world, w - 2, 120, w - 2, 180);
      for (let i = 0; i < 50; i++) {
        world.agents.push(createAgent(30 + Math.random() * 200, 30 + Math.random() * 240));
      }
    }

    const engine = new Engine(world);
    engineRef.current = engine;

    const ctx = canvas.getContext('2d')!;
    const agentCount = world.agents.length;
    let rafId: number;

    const render = () => {
      rafId = requestAnimationFrame(render);
      engine.step(FIXED_DT);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Walls
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      for (const wall of world.walls) {
        ctx.beginPath();
        ctx.moveTo(wall.ax, wall.ay);
        ctx.lineTo(wall.bx, wall.by);
        ctx.stroke();
      }

      // Exits
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 5;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 8;
      for (const exit of world.exits) {
        ctx.beginPath();
        ctx.moveTo(exit.ax, exit.ay);
        ctx.lineTo(exit.bx, exit.by);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // Hazards
      for (const hz of world.hazards) {
        const gradient = ctx.createRadialGradient(hz.x, hz.y, 0, hz.x, hz.y, hz.radius);
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(hz.x, hz.y, hz.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Agents
      for (const agent of world.agents) {
        ctx.fillStyle = agent.color;
        ctx.globalAlpha = 0.8;
        ctx.shadowColor = agent.color;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(agent.position.x, agent.position.y, agent.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Velocity vector
        const vx = agent.velocity.x;
        const vy = agent.velocity.y;
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(agent.position.x, agent.position.y);
        ctx.lineTo(agent.position.x + vx * 6, agent.position.y + vy * 6);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Respawn
      while (world.agents.length < agentCount) {
        world.agents.push(createAgent(
          30 + Math.random() * 100,
          50 + Math.random() * 200,
        ));
      }
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [activeBehavior]);

  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-lg font-semibold text-accent-cyan mb-4">Steering Behaviors</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.keys(behaviorDescriptions).map(key => (
          <button
            key={key}
            onClick={() => setActiveBehavior(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeBehavior === key
                ? 'bg-accent-cyan/20 text-accent-cyan'
                : 'bg-white/5 text-white/40 hover:bg-white/10'
            }`}
          >
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </button>
        ))}
      </div>
      <p className="text-sm text-white/40 mb-4">{behaviorDescriptions[activeBehavior]}</p>
      <canvas ref={canvasRef} className="rounded-lg bg-surface-950 w-full" />
    </div>
  );
}
