import type { Vec2, WorldState } from '../core/types';
import { FLOW_FIELD_RESOLUTION } from '../core/constants';

/**
 * Multi-source BFS flow field from all exits.
 * Computes a direction field that agents follow to reach the nearest exit.
 */
export class FlowField {
  private cols: number;
  private rows: number;
  private resolution: number;
  private distance: Float32Array;
  private dirX: Float32Array;
  private dirY: Float32Array;
  private blocked: Uint8Array;
  dirty = true;

  constructor(width: number, height: number, resolution = FLOW_FIELD_RESOLUTION) {
    this.resolution = resolution;
    this.cols = Math.ceil(width / resolution);
    this.rows = Math.ceil(height / resolution);
    const size = this.cols * this.rows;
    this.distance = new Float32Array(size);
    this.dirX = new Float32Array(size);
    this.dirY = new Float32Array(size);
    this.blocked = new Uint8Array(size);
  }

  markDirty(): void {
    this.dirty = true;
  }

  compute(world: WorldState): void {
    if (!this.dirty) return;
    this.dirty = false;

    const { cols, rows, resolution, distance, dirX, dirY, blocked } = this;
    const size = cols * rows;

    // Reset
    distance.fill(Infinity);
    dirX.fill(0);
    dirY.fill(0);
    blocked.fill(0);

    // Mark wall cells as blocked
    for (const wall of world.walls) {
      this.rasterizeWall(wall.ax, wall.ay, wall.bx, wall.by);
    }

    // BFS from all exit cells
    const queue: number[] = [];

    for (const exit of world.exits) {
      const mx = (exit.ax + exit.bx) * 0.5;
      const my = (exit.ay + exit.by) * 0.5;
      // Rasterize exit line into seed cells
      const steps = Math.ceil(exit.width / resolution) + 1;
      for (let s = 0; s <= steps; s++) {
        const t = s / Math.max(steps, 1);
        const px = exit.ax + (exit.bx - exit.ax) * t;
        const py = exit.ay + (exit.by - exit.ay) * t;
        const cx = Math.floor(px / resolution);
        const cy = Math.floor(py / resolution);
        if (cx >= 0 && cx < cols && cy >= 0 && cy < rows) {
          const idx = cy * cols + cx;
          if (distance[idx] === Infinity) {
            distance[idx] = 0;
            queue.push(idx);
          }
        }
      }
    }

    // BFS
    const dx4 = [1, -1, 0, 0];
    const dy4 = [0, 0, 1, -1];
    let head = 0;

    while (head < queue.length) {
      const idx = queue[head++];
      const cx = idx % cols;
      const cy = (idx - cx) / cols;
      const d = distance[idx];

      for (let dir = 0; dir < 4; dir++) {
        const nx = cx + dx4[dir];
        const ny = cy + dy4[dir];
        if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
        const nIdx = ny * cols + nx;
        if (blocked[nIdx]) continue;
        const nd = d + 1;
        if (nd < distance[nIdx]) {
          distance[nIdx] = nd;
          queue.push(nIdx);
        }
      }
    }

    // Compute gradient directions
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx = y * cols + x;
        if (blocked[idx] || distance[idx] === Infinity) continue;

        let bestDist = distance[idx];
        let bx = 0, by = 0;

        for (let dir = 0; dir < 4; dir++) {
          const nx = x + dx4[dir];
          const ny = y + dy4[dir];
          if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
          const nIdx = ny * cols + nx;
          if (distance[nIdx] < bestDist) {
            bestDist = distance[nIdx];
            bx = dx4[dir];
            by = dy4[dir];
          }
        }

        const len = Math.sqrt(bx * bx + by * by);
        if (len > 0) {
          dirX[idx] = bx / len;
          dirY[idx] = by / len;
        }
      }
    }
  }

  getDirection(wx: number, wy: number): Vec2 | null {
    const cx = Math.floor(wx / this.resolution);
    const cy = Math.floor(wy / this.resolution);
    if (cx < 0 || cx >= this.cols || cy < 0 || cy >= this.rows) return null;
    const idx = cy * this.cols + cx;
    if (this.distance[idx] === Infinity) return null;
    return { x: this.dirX[idx], y: this.dirY[idx] };
  }

  getDistance(wx: number, wy: number): number {
    const cx = Math.floor(wx / this.resolution);
    const cy = Math.floor(wy / this.resolution);
    if (cx < 0 || cx >= this.cols || cy < 0 || cy >= this.rows) return Infinity;
    return this.distance[cy * this.cols + cx];
  }

  getCols(): number { return this.cols; }
  getRows(): number { return this.rows; }
  getResolution(): number { return this.resolution; }
  getDistanceArray(): Float32Array { return this.distance; }
  getDirXArray(): Float32Array { return this.dirX; }
  getDirYArray(): Float32Array { return this.dirY; }
  getBlockedArray(): Uint8Array { return this.blocked; }

  private rasterizeWall(ax: number, ay: number, bx: number, by: number): void {
    const { cols, rows, resolution, blocked } = this;
    const len = Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);
    const steps = Math.ceil(len / (resolution * 0.5)) + 1;
    for (let s = 0; s <= steps; s++) {
      const t = s / Math.max(steps, 1);
      const px = ax + (bx - ax) * t;
      const py = ay + (by - ay) * t;
      const cx = Math.floor(px / resolution);
      const cy = Math.floor(py / resolution);
      if (cx >= 0 && cx < cols && cy >= 0 && cy < rows) {
        blocked[cy * cols + cx] = 1;
      }
    }
  }
}
