import type { WorldState, AgentData } from '../../engine/core/types';
import { AgentState } from '../../engine/core/types';
import { Camera } from '../camera/Camera';

export class AgentLayer {
  private showVelocityVectors = false;

  setShowVelocityVectors(show: boolean): void {
    this.showVelocityVectors = show;
  }

  render(ctx: CanvasRenderingContext2D, world: WorldState, camera: Camera, w: number, h: number): void {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    camera.apply(ctx, w, h);

    const agents = world.agents;

    // First pass — draw all glows (batched for performance)
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      const { x, y } = agent.position;
      const speed = Math.sqrt(agent.velocity.x ** 2 + agent.velocity.y ** 2);
      const glowSize = agent.radius * 2.5 + speed * 2 + agent.stress * 8;

      ctx.globalAlpha = 0.15 + agent.stress * 0.1;
      ctx.fillStyle = agent.color;
      ctx.beginPath();
      ctx.arc(x, y, glowSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Second pass — draw bodies
    for (let i = 0; i < agents.length; i++) {
      this.drawAgent(ctx, agents[i]);
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  private drawAgent(ctx: CanvasRenderingContext2D, agent: AgentData): void {
    const { x, y } = agent.position;
    const speed = Math.sqrt(agent.velocity.x ** 2 + agent.velocity.y ** 2);
    const r = agent.radius;

    // Frozen agents pulse
    if (agent.state === AgentState.Frozen) {
      ctx.globalAlpha = 0.3 + Math.sin(Date.now() * 0.01) * 0.15;
    } else {
      ctx.globalAlpha = 0.75 + speed * 0.1;
    }

    // Body with subtle gradient feel
    ctx.shadowColor = agent.color;
    ctx.shadowBlur = 8 + agent.stress * 6;
    ctx.fillStyle = agent.color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Bright inner core
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.5 + speed * 0.15;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Direction indicator for fast agents
    if (speed > 0.8) {
      const vx = agent.velocity.x;
      const vy = agent.velocity.y;
      const nx = vx / speed;
      const ny = vy / speed;

      ctx.strokeStyle = agent.color;
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + nx * r * 0.8, y + ny * r * 0.8);
      ctx.lineTo(x + nx * (r + speed * 3), y + ny * (r + speed * 3));
      ctx.stroke();
    }

    // Velocity vectors overlay
    if (this.showVelocityVectors && speed > 0.1) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + agent.velocity.x * 10, y + agent.velocity.y * 10);
      ctx.stroke();

      // Arrowhead
      const angle = Math.atan2(agent.velocity.y, agent.velocity.x);
      const headLen = 3;
      const ex = x + agent.velocity.x * 10;
      const ey = y + agent.velocity.y * 10;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - headLen * Math.cos(angle - 0.5), ey - headLen * Math.sin(angle - 0.5));
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - headLen * Math.cos(angle + 0.5), ey - headLen * Math.sin(angle + 0.5));
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }
}
