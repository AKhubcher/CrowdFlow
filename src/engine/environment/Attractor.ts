import type { AttractorData } from '../core/types';

export function isInAttractorRange(a: AttractorData, px: number, py: number): boolean {
  const dx = px - a.x;
  const dy = py - a.y;
  return dx * dx + dy * dy <= a.radius * a.radius;
}
