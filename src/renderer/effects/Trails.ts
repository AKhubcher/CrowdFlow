import type { AgentData, WorldState, Vec2 } from '../../engine/core/types';
import { TRAIL_LENGTH, TRAIL_FADE } from '../../engine/core/constants';
import { Camera } from '../camera/Camera';

export class Trails {
  private trails: Map<number, Vec2[]> = new Map();
  private enabled = false;

  setEnabled(on: boolean): void {
    this.enabled = on;
    if (!on) this.trails.clear();
  }

  update(agents: AgentData[]): void {
    if (!this.enabled) return;

    const activeIds = new Set<number>();
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      activeIds.add(agent.id);

      let trail = this.trails.get(agent.id);
      if (!trail) {
        trail = [];
        this.trails.set(agent.id, trail);
      }

      trail.push({ x: agent.position.x, y: agent.position.y });
      if (trail.length > TRAIL_LENGTH) {
        trail.shift();
      }
    }

    // Clean up trails for removed agents
    for (const id of this.trails.keys()) {
      if (!activeIds.has(id)) this.trails.delete(id);
    }
  }

  render(ctx: CanvasRenderingContext2D, world: WorldState, camera: Camera, w: number, h: number): void {
    if (!this.enabled || this.trails.size === 0) return;

    camera.apply(ctx, w, h);
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';

    for (const [id, trail] of this.trails) {
      if (trail.length < 2) continue;

      for (let i = 1; i < trail.length; i++) {
        const alpha = (i / trail.length) * 0.4;
        ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.stroke();
      }
    }
  }

  clear(): void {
    this.trails.clear();
  }
}
