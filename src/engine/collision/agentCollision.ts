import type { AgentData } from '../core/types';
import { SpatialHashGrid } from '../spatial/SpatialHashGrid';

/**
 * Position-based overlap resolution between agents.
 * Pushes overlapping agents apart equally.
 */
export function resolveAgentCollisions(agents: AgentData[], grid: SpatialHashGrid): void {
  for (let i = 0; i < agents.length; i++) {
    const a = agents[i];
    const neighbors = grid.queryRadius(
      a.position.x, a.position.y,
      a.radius * 3, a,
    );

    for (let j = 0; j < neighbors.length; j++) {
      const b = neighbors[j];
      if (b.id <= a.id) continue; // avoid double processing

      const dx = b.position.x - a.position.x;
      const dy = b.position.y - a.position.y;
      const distSq = dx * dx + dy * dy;
      const minDist = a.radius + b.radius;

      if (distSq < minDist * minDist && distSq > 0.0001) {
        const dist = Math.sqrt(distSq);
        const overlap = minDist - dist;
        const nx = dx / dist;
        const ny = dy / dist;
        const halfOverlap = overlap * 0.5;

        a.position.x -= nx * halfOverlap;
        a.position.y -= ny * halfOverlap;
        b.position.x += nx * halfOverlap;
        b.position.y += ny * halfOverlap;
      }
    }
  }
}
