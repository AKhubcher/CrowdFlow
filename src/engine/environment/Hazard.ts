import type { HazardData } from '../core/types';

export function isInHazard(hx: number, hy: number, hRadius: number, px: number, py: number): boolean {
  const dx = px - hx;
  const dy = py - hy;
  return dx * dx + dy * dy <= hRadius * hRadius;
}
