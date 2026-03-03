import type { WorldState } from '../../engine/core/types';
import { WALL_COLOR, EXIT_COLOR, HAZARD_COLOR, ATTRACTOR_COLOR } from '../../engine/core/constants';
import { Camera } from '../camera/Camera';

export class EnvironmentLayer {
  private dirty = true;

  markDirty(): void {
    this.dirty = true;
  }

  render(ctx: CanvasRenderingContext2D, world: WorldState, camera: Camera, w: number, h: number): void {
    if (!this.dirty) return;
    this.dirty = false;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    camera.apply(ctx, w, h);

    // World boundary
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, world.width, world.height);

    // Grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    const gridSize = 50;
    for (let x = 0; x <= world.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, world.height);
      ctx.stroke();
    }
    for (let y = 0; y <= world.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(world.width, y);
      ctx.stroke();
    }

    // Hazards
    for (const h of world.hazards) {
      const gradient = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, h.radius);
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = HAZARD_COLOR;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Attractors
    for (const a of world.attractors) {
      const gradient = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, a.radius);
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = ATTRACTOR_COLOR;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Walls
    ctx.strokeStyle = WALL_COLOR;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (const wall of world.walls) {
      ctx.beginPath();
      ctx.moveTo(wall.ax, wall.ay);
      ctx.lineTo(wall.bx, wall.by);
      ctx.stroke();
    }

    // Exits
    ctx.strokeStyle = EXIT_COLOR;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.shadowColor = EXIT_COLOR;
    ctx.shadowBlur = 10;
    for (const exit of world.exits) {
      ctx.beginPath();
      ctx.moveTo(exit.ax, exit.ay);
      ctx.lineTo(exit.bx, exit.by);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  forceRedraw(): void {
    this.dirty = true;
  }
}
