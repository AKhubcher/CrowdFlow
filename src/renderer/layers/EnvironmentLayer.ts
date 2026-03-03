import type { WorldState } from '../../engine/core/types';
import { EXIT_COLOR, HAZARD_COLOR, ATTRACTOR_COLOR } from '../../engine/core/constants';
import { Camera } from '../camera/Camera';

export class EnvironmentLayer {
  private dirty = true;
  private animFrame = 0;

  markDirty(): void {
    this.dirty = true;
  }

  render(ctx: CanvasRenderingContext2D, world: WorldState, camera: Camera, w: number, h: number): void {
    if (!this.dirty) return;
    this.dirty = false;
    this.animFrame++;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    camera.apply(ctx, w, h);

    // Subtle dot grid pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    const gridSize = 50;
    for (let x = 0; x <= world.width; x += gridSize) {
      for (let y = 0; y <= world.height; y += gridSize) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // World boundary — glowing border
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, world.width, world.height);
    // Corner accents
    const cornerLen = 30;
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
    ctx.lineWidth = 2;
    const corners = [
      [0, 0, cornerLen, 0, 0, cornerLen],
      [world.width, 0, -cornerLen, 0, 0, cornerLen],
      [0, world.height, cornerLen, 0, 0, -cornerLen],
      [world.width, world.height, -cornerLen, 0, 0, -cornerLen],
    ];
    for (const [cx, cy, dx1, dy1, dx2, dy2] of corners) {
      ctx.beginPath();
      ctx.moveTo(cx + dx1, cy + dy1);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + dx2, cy + dy2);
      ctx.stroke();
    }

    // Hazards — pulsing danger zones
    for (const h of world.hazards) {
      // Outer aura
      const outerGradient = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, h.radius * 1.3);
      outerGradient.addColorStop(0, 'rgba(239, 68, 68, 0.25)');
      outerGradient.addColorStop(0.6, 'rgba(239, 68, 68, 0.08)');
      outerGradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = outerGradient;
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.radius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Inner core
      const innerGradient = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, h.radius * 0.5);
      innerGradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
      innerGradient.addColorStop(1, 'rgba(239, 68, 68, 0.05)');
      ctx.fillStyle = innerGradient;
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Dashed border ring
      ctx.strokeStyle = HAZARD_COLOR;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.5;
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // Center icon — small X
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(h.x - 5, h.y - 5);
      ctx.lineTo(h.x + 5, h.y + 5);
      ctx.moveTo(h.x + 5, h.y - 5);
      ctx.lineTo(h.x - 5, h.y + 5);
      ctx.stroke();
    }

    // Attractors — magnetic pull zones
    for (const a of world.attractors) {
      // Outer pull field
      const outerGradient = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, a.radius * 1.2);
      outerGradient.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
      outerGradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.06)');
      outerGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = outerGradient;
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.radius * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Concentric rings (static)
      ctx.strokeStyle = ATTRACTOR_COLOR;
      ctx.lineWidth = 1;
      for (let ring = 1; ring <= 3; ring++) {
        ctx.globalAlpha = 0.15 - ring * 0.03;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.radius * (ring / 3), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Center dot
      ctx.fillStyle = 'rgba(139, 92, 246, 0.6)';
      ctx.beginPath();
      ctx.arc(a.x, a.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Walls — glowing solid barriers
    for (const wall of world.walls) {
      // Glow
      ctx.shadowColor = '#64748b';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(wall.ax, wall.ay);
      ctx.lineTo(wall.bx, wall.by);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Bright core line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(wall.ax, wall.ay);
      ctx.lineTo(wall.bx, wall.by);
      ctx.stroke();

      // End caps
      ctx.fillStyle = '#94a3b8';
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(wall.ax, wall.ay, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(wall.bx, wall.by, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Exits — bright glowing portals
    for (const exit of world.exits) {
      // Wide glow
      ctx.shadowColor = EXIT_COLOR;
      ctx.shadowBlur = 20;
      ctx.strokeStyle = EXIT_COLOR;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(exit.ax, exit.ay);
      ctx.lineTo(exit.bx, exit.by);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Bright core
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(exit.ax, exit.ay);
      ctx.lineTo(exit.bx, exit.by);
      ctx.stroke();

      // Exit arrows (perpendicular)
      const dx = exit.bx - exit.ax;
      const dy = exit.by - exit.ay;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 1) {
        const nx = -dy / len;
        const ny = dx / len;
        const mx = (exit.ax + exit.bx) / 2;
        const my = (exit.ay + exit.by) / 2;
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
        ctx.lineWidth = 1.5;
        const arrowLen = 12;
        // Draw small chevrons pointing outward
        for (let offset = -0.25; offset <= 0.25; offset += 0.25) {
          const ox = mx + dx * offset;
          const oy = my + dy * offset;
          ctx.beginPath();
          ctx.moveTo(ox + nx * 2 - nx * arrowLen * 0.3, oy + ny * 2 - ny * arrowLen * 0.3);
          ctx.lineTo(ox + nx * (2 + arrowLen), oy + ny * (2 + arrowLen));
          ctx.stroke();
        }
      }

      // Exited count badge
      if (exit.agentsExited > 0) {
        const mx = (exit.ax + exit.bx) / 2;
        const my = (exit.ay + exit.by) / 2;
        ctx.fillStyle = 'rgba(16, 185, 129, 0.8)';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`${exit.agentsExited}`, mx, my - 8);
      }
    }
  }

  forceRedraw(): void {
    this.dirty = true;
  }
}
