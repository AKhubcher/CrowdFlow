import type { AgentData, Vec2 } from '../core/types';
import { Vec2 as V } from '../math/Vec2';

/**
 * Seek toward a target position. Returns desired steering force in `out`.
 */
export function goalSeeking(out: Vec2, agent: AgentData, targetX: number, targetY: number): Vec2 {
  const scratch = agent._scratch0;
  // desired = normalize(target - position) * maxSpeed
  scratch.x = targetX - agent.position.x;
  scratch.y = targetY - agent.position.y;
  V.setLength(scratch, scratch, agent.maxSpeed);
  // steer = desired - velocity
  out.x = scratch.x - agent.velocity.x;
  out.y = scratch.y - agent.velocity.y;
  V.clampLength(out, out, agent.maxForce);
  return out;
}
