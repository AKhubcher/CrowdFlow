import type { AgentData, Vec2, WorldState } from '../core/types';
import { SEPARATION_RADIUS } from '../core/constants';
import { SpatialHashGrid } from '../spatial/SpatialHashGrid';

/**
 * Separation: steer away from nearby agents.
 * In panic mode, separation radius increases by 50%.
 */
export function separation(out: Vec2, agent: AgentData, grid: SpatialHashGrid, panicMode = false): Vec2 {
  out.x = 0;
  out.y = 0;

  const radius = panicMode ? SEPARATION_RADIUS * 1.5 : SEPARATION_RADIUS;
  const neighbors = grid.queryRadius(
    agent.position.x, agent.position.y,
    radius, agent,
  );

  if (neighbors.length === 0) return out;

  for (let i = 0; i < neighbors.length; i++) {
    const other = neighbors[i];
    const dx = agent.position.x - other.position.x;
    const dy = agent.position.y - other.position.y;
    const distSq = dx * dx + dy * dy;
    if (distSq < 0.0001) continue;
    const dist = Math.sqrt(distSq);
    // Weight inversely by distance
    const weight = 1 / dist;
    out.x += (dx / dist) * weight;
    out.y += (dy / dist) * weight;
  }

  // Average
  out.x /= neighbors.length;
  out.y /= neighbors.length;

  // Scale to maxSpeed then subtract velocity for steering
  const len = Math.sqrt(out.x * out.x + out.y * out.y);
  if (len > 0.0001) {
    out.x = (out.x / len) * agent.maxSpeed - agent.velocity.x;
    out.y = (out.y / len) * agent.maxSpeed - agent.velocity.y;
    // Clamp
    const steerLen = Math.sqrt(out.x * out.x + out.y * out.y);
    if (steerLen > agent.maxForce) {
      const s = agent.maxForce / steerLen;
      out.x *= s;
      out.y *= s;
    }
  }

  return out;
}
