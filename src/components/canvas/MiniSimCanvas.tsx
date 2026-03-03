import { useRef, useEffect } from 'react';
import { Engine } from '../../engine/core/Engine';
import { createWorld, addExit } from '../../engine/core/World';
import { createAgent } from '../../engine/core/Agent';
import { FIXED_DT } from '../../engine/core/constants';

interface MiniSimCanvasProps {
  width?: number;
  height?: number;
  agentCount?: number;
  className?: string;
}

export function MiniSimCanvas({ width = 300, height = 200, agentCount = 60, className = '' }: MiniSimCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const world = createWorld(width, height);
    addExit(world, width - 2, height * 0.3, width - 2, height * 0.7);

    for (let i = 0; i < agentCount; i++) {
      const x = 20 + Math.random() * (width * 0.5);
      const y = 20 + Math.random() * (height - 40);
      world.agents.push(createAgent(x, y));
    }

    const engine = new Engine(world);
    engineRef.current = engine;

    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    let rafId: number;
    const render = () => {
      rafId = requestAnimationFrame(render);
      engine.step(FIXED_DT);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Exits
      for (const exit of world.exits) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 12;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(exit.ax, exit.ay);
        ctx.lineTo(exit.bx, exit.by);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Agents
      for (const agent of world.agents) {
        ctx.fillStyle = agent.color;
        ctx.globalAlpha = 0.8;
        ctx.shadowColor = agent.color;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(agent.position.x, agent.position.y, agent.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Respawn agents when they exit
      while (world.agents.length < agentCount) {
        const x = 10 + Math.random() * 30;
        const y = 20 + Math.random() * (height - 40);
        world.agents.push(createAgent(x, y));
      }
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [width, height, agentCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`rounded-lg ${className}`}
    />
  );
}
