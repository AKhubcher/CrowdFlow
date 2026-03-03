import type { AgentData, Vec2 } from '../core/types';
import { ALIGNMENT_RADIUS } from '../core/constants';
import { SpatialHashGrid } from '../spatial/SpatialHashGrid';

/**
 * Alignment: steer toward the average heading of nearby agents.
 * Only aligns with agents in the same group or heading in a similar direction (dot product > 0).
 */
export function alignment(out: Vec2, agent: AgentData, grid: SpatialHashGrid): Vec2 {
  out.x = 0;
  out.y = 0;

  const neighbors = grid.queryRadius(
    agent.position.x, agent.position.y,
    ALIGNMENT_RADIUS, agent,
  );

  if (neighbors.length === 0) return out;

  let count = 0;
  for (let i = 0; i < neighbors.length; i++) {
    const other = neighbors[i];
    // Only align with same-group agents or agents heading in a similar direction
    if (other.groupId !== agent.groupId) {
      const dot = agent.velocity.x * other.velocity.x + agent.velocity.y * other.velocity.y;
      if (dot <= 0) continue;
    }
    out.x += other.velocity.x;
    out.y += other.velocity.y;
    count++;
  }

  if (count === 0) return out;

  out.x /= count;
  out.y /= count;

  const len = Math.sqrt(out.x * out.x + out.y * out.y);
  if (len > 0.0001) {
    out.x = (out.x / len) * agent.maxSpeed - agent.velocity.x;
    out.y = (out.y / len) * agent.maxSpeed - agent.velocity.y;
    const steerLen = Math.sqrt(out.x * out.x + out.y * out.y);
    if (steerLen > agent.maxForce) {
      const s = agent.maxForce / steerLen;
      out.x *= s;
      out.y *= s;
    }
  }

  return out;
}
