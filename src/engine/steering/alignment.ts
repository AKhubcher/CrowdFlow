import type { AgentData, Vec2 } from '../core/types';
import { ALIGNMENT_RADIUS } from '../core/constants';
import { SpatialHashGrid } from '../spatial/SpatialHashGrid';

/**
 * Alignment: steer toward the average heading of nearby agents.
 */
export function alignment(out: Vec2, agent: AgentData, grid: SpatialHashGrid): Vec2 {
  out.x = 0;
  out.y = 0;

  const neighbors = grid.queryRadius(
    agent.position.x, agent.position.y,
    ALIGNMENT_RADIUS, agent,
  );

  if (neighbors.length === 0) return out;

  for (let i = 0; i < neighbors.length; i++) {
    out.x += neighbors[i].velocity.x;
    out.y += neighbors[i].velocity.y;
  }

  out.x /= neighbors.length;
  out.y /= neighbors.length;

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
