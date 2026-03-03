import type { AgentData, WallData, Vec2 } from '../core/types';
import { WALL_AVOIDANCE_DISTANCE } from '../core/constants';
import { LineSegment } from '../math/LineSegment';

const _closest: Vec2 = { x: 0, y: 0 };

/**
 * Wall avoidance: steer away from nearby walls.
 */
export function wallAvoidance(out: Vec2, agent: AgentData, walls: WallData[]): Vec2 {
  out.x = 0;
  out.y = 0;

  const px = agent.position.x;
  const py = agent.position.y;
  let closestDist = WALL_AVOIDANCE_DISTANCE;
  let hasWall = false;

  for (let i = 0; i < walls.length; i++) {
    const w = walls[i];
    const dist = LineSegment.distanceToPoint(w.ax, w.ay, w.bx, w.by, px, py);
    if (dist < closestDist) {
      closestDist = dist;
      LineSegment.normalToward(out, w.ax, w.ay, w.bx, w.by, px, py);
      hasWall = true;
    }
  }

  if (hasWall && closestDist < WALL_AVOIDANCE_DISTANCE) {
    // Stronger force as agent gets closer to wall
    const strength = 1 - closestDist / WALL_AVOIDANCE_DISTANCE;
    out.x *= strength * agent.maxForce;
    out.y *= strength * agent.maxForce;
  } else {
    out.x = 0;
    out.y = 0;
  }

  return out;
}
