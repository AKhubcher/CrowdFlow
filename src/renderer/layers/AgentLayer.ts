import type { WorldState, AgentData } from '../../engine/core/types';
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
    for (let i = 0; i < agents.length; i++) {
      this.drawAgent(ctx, agents[i]);
    }
  }

  private drawAgent(ctx: CanvasRenderingContext2D, agent: AgentData): void {
    const { x, y } = agent.position;
    const r = agent.radius;

    // Glow
    ctx.shadowColor = agent.color;
    ctx.shadowBlur = 6 + agent.stress * 10;

    // Body
    ctx.fillStyle = agent.color;
    ctx.globalAlpha = 0.7 + agent.stress * 0.3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Core dot
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Velocity vector
    if (this.showVelocityVectors) {
      const vx = agent.velocity.x;
      const vy = agent.velocity.y;
      const speed = Math.sqrt(vx * vx + vy * vy);
      if (speed > 0.1) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + vx * 8, y + vy * 8);
        ctx.stroke();
      }
    }
  }
}
