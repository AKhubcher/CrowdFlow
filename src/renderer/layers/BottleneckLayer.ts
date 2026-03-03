import type { WorldState } from '../../engine/core/types';
import { Camera } from '../camera/Camera';

export class BottleneckLayer {
  private enabled = false;
  private counts: Float32Array | null = null;
  private speedSums: Float32Array | null = null;
  private cachedSize = 0;

  setEnabled(on: boolean): void {
    this.enabled = on;
  }

  render(ctx: CanvasRenderingContext2D, world: WorldState, camera: Camera, w: number, h: number): void {
    if (!this.enabled || world.agents.length === 0) return;

    camera.apply(ctx, w, h);

    const cellSize = 20;
    const cols = Math.ceil(world.width / cellSize);
    const rows = Math.ceil(world.height / cellSize);
    const size = cols * rows;

    // Cache typed arrays, reallocate only when grid size changes
    if (size !== this.cachedSize) {
      this.counts = new Float32Array(size);
      this.speedSums = new Float32Array(size);
      this.cachedSize = size;
    }
    const counts = this.counts!;
    const speedSums = this.speedSums!;
    counts.fill(0);
    speedSums.fill(0);

    for (const agent of world.agents) {
      const cx = Math.floor(agent.position.x / cellSize);
      const cy = Math.floor(agent.position.y / cellSize);
      if (cx >= 0 && cx < cols && cy >= 0 && cy < rows) {
        const idx = cy * cols + cx;
        counts[idx]++;
        const speed = Math.sqrt(agent.velocity.x ** 2 + agent.velocity.y ** 2);
        speedSums[idx] += speed;
      }
    }

    // Highlight bottleneck cells: density >= 3 agents and avg speed < 0.5
    const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 1000 * 3);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx = y * cols + x;
        const count = counts[idx];
        if (count < 3) continue;
        const avgSpeed = speedSums[idx] / count;
        if (avgSpeed > 0.5) continue;

        // Bottleneck detected — draw warning highlight
        const intensity = Math.min((count - 2) / 5, 1) * (1 - avgSpeed / 0.5);
        const alpha = intensity * (0.15 + 0.1 * pulse);
        ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

        // Border for strong bottlenecks
        if (intensity > 0.5) {
          ctx.strokeStyle = `rgba(251, 191, 36, ${intensity * (0.3 + 0.2 * pulse)})`;
          ctx.lineWidth = 1;
          ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }
  }
}
