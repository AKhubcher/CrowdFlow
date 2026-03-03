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

        // Cool-to-hot gradient: blue → cyan → yellow → orange → red
        let r: number, g: number, b: number;
        if (val < 0.25) {
          const t = val / 0.25;
          r = 0; g = Math.floor(80 * t); b = Math.floor(200 * (1 - t * 0.3));
        } else if (val < 0.5) {
          const t = (val - 0.25) / 0.25;
          r = Math.floor(200 * t); g = Math.floor(180 + 75 * t); b = Math.floor(140 * (1 - t));
        } else if (val < 0.75) {
          const t = (val - 0.5) / 0.25;
          r = Math.floor(200 + 55 * t); g = Math.floor(180 * (1 - t * 0.5)); b = 0;
        } else {
          const t = (val - 0.75) / 0.25;
          r = 255; g = Math.floor(90 * (1 - t)); b = Math.floor(30 * t);
        }

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${val * 0.4})`;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }
}
