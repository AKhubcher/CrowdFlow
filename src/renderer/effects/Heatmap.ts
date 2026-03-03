import type { WorldState } from '../../engine/core/types';
import { Camera } from '../camera/Camera';

export class Heatmap {
  private enabled = false;
  private gridW = 0;
  private gridH = 0;
  private cellSize = 20;
  private density: Float32Array = new Float32Array(0);

  setEnabled(on: boolean): void {
    this.enabled = on;
  }

  update(world: WorldState): void {
    if (!this.enabled) return;

    const cellSize = this.cellSize;
    const gw = Math.ceil(world.width / cellSize);
    const gh = Math.ceil(world.height / cellSize);

    if (gw !== this.gridW || gh !== this.gridH) {
      this.gridW = gw;
      this.gridH = gh;
      this.density = new Float32Array(gw * gh);
    }

    // Decay
    for (let i = 0; i < this.density.length; i++) {
      this.density[i] *= 0.9;
    }

    // Accumulate
    for (const agent of world.agents) {
      const cx = Math.floor(agent.position.x / cellSize);
      const cy = Math.floor(agent.position.y / cellSize);
      if (cx >= 0 && cx < gw && cy >= 0 && cy < gh) {
        this.density[cy * gw + cx] += 0.3;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera, w: number, h: number): void {
    if (!this.enabled) return;

    camera.apply(ctx, w, h);

    const { gridW, gridH, cellSize, density } = this;
    for (let y = 0; y < gridH; y++) {
      for (let x = 0; x < gridW; x++) {
        const val = Math.min(density[y * gridW + x], 5) / 5;
        if (val < 0.05) continue;
        const r = Math.floor(255 * val);
        const g = Math.floor(100 * (1 - val));
        const b = 50;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${val * 0.5})`;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }
}
