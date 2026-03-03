import type { WallData } from '../core/types';

export function createWallData(id: number, ax: number, ay: number, bx: number, by: number): WallData {
  return { id, ax, ay, bx, by, thickness: 4 };
}

export function wallLength(wall: WallData): number {
  const dx = wall.bx - wall.ax;
  const dy = wall.by - wall.ay;
  return Math.sqrt(dx * dx + dy * dy);
}
