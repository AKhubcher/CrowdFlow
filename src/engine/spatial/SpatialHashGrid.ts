import type { AgentData } from '../core/types';
import { SPATIAL_CELL_SIZE } from '../core/constants';

export class SpatialHashGrid {
  private cellSize: number;
  private invCellSize: number;
  private cells: Map<number, AgentData[]>;
  private readonly _reusableResults: AgentData[] = [];

  constructor(cellSize = SPATIAL_CELL_SIZE) {
    this.cellSize = cellSize;
    this.invCellSize = 1 / cellSize;
    this.cells = new Map();
  }

  clear(): void {
    this.cells.clear();
  }

  private key(cx: number, cy: number): number {
    // Cantor pairing with offset for negative coords
    const a = cx + 10000;
    const b = cy + 10000;
    return a * 20001 + b;
  }

  insert(agent: AgentData): void {
    const cx = Math.floor(agent.position.x * this.invCellSize);
    const cy = Math.floor(agent.position.y * this.invCellSize);
    const k = this.key(cx, cy);
    let cell = this.cells.get(k);
    if (!cell) {
      cell = [];
      this.cells.set(k, cell);
    }
    cell.push(agent);
  }

  insertAll(agents: AgentData[]): void {
    for (let i = 0; i < agents.length; i++) {
      this.insert(agents[i]);
    }
  }

  rebuild(agents: AgentData[]): void {
    this.clear();
    this.insertAll(agents);
  }

  queryRadius(x: number, y: number, radius: number, exclude?: AgentData): AgentData[] {
    const results = this._reusableResults;
    results.length = 0;

    const rSq = radius * radius;
    const minCx = Math.floor((x - radius) * this.invCellSize);
    const maxCx = Math.floor((x + radius) * this.invCellSize);
    const minCy = Math.floor((y - radius) * this.invCellSize);
    const maxCy = Math.floor((y + radius) * this.invCellSize);

    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const cell = this.cells.get(this.key(cx, cy));
        if (!cell) continue;
        for (let i = 0; i < cell.length; i++) {
          const agent = cell[i];
          if (agent === exclude) continue;
          const dx = agent.position.x - x;
          const dy = agent.position.y - y;
          if (dx * dx + dy * dy <= rSq) {
            results.push(agent);
          }
        }
      }
    }

    return results;
  }
}
