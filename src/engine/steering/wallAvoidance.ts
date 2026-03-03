import type { AgentData, WallData, Vec2 } from '../core/types';
import { WALL_AVOIDANCE_DISTANCE } from '../core/constants';
import { LineSegment } from '../math/LineSegment';

// Pre-computed sin/cos for +-30 degrees
const RAY_ANGLE = Math.PI / 6; // 30 degrees
const COS_30 = Math.cos(RAY_ANGLE);
const SIN_30 = Math.sin(RAY_ANGLE);

// Minimum speed threshold below which we fall back to closest-point approach
const MIN_SPEED_FOR_RAYCAST = 0.3;

// Ray weights: forward ray has higher influence than side rays
const FORWARD_RAY_WEIGHT = 1.0;
const SIDE_RAY_WEIGHT = 0.6;

// Scratch vector for normal calculations
const _normal: Vec2 = { x: 0, y: 0 };

/**
 * Raycast a segment from (ox,oy) to (ox+dx,oy+dy) against wall segment
 * (wax,way)-(wbx,wby). Returns the parametric t along the ray [0,1] if
 * intersection occurs, or -1 if no intersection.
 */
function rayWallIntersectionT(
  ox: number, oy: number, dx: number, dy: number,
  wax: number, way: number, wbx: number, wby: number,
): number {
  const d2x = wbx - wax;
  const d2y = wby - way;

  const cross = dx * d2y - dy * d2x;
  if (Math.abs(cross) < 0.0001) return -1;

  const ex = wax - ox;
  const ey = way - oy;
  const t = (ex * d2y - ey * d2x) / cross;
  const u = (ex * dy - ey * dx) / cross;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return t;
  }
  return -1;
}

/**
 * Wall avoidance using a 3-raycast system.
 *
 * Casts three rays from the agent's position along its velocity direction:
 *   - Forward (along velocity)
 *   - Left (+30 degrees from velocity)
 *   - Right (-30 degrees from velocity)
 *
 * Each ray has length WALL_AVOIDANCE_DISTANCE. When a ray intersects a wall,
 * a repulsive force is applied perpendicular to that wall, weighted by
 * proximity (closer = stronger). The forward ray carries more weight than
 * the side rays.
 *
 * For nearly-stationary agents (speed < 0.3), falls back to a closest-point
 * approach so agents don't get stuck against walls with no velocity direction.
 */
export function wallAvoidance(out: Vec2, agent: AgentData, walls: WallData[]): Vec2 {
  out.x = 0;
  out.y = 0;

  const px = agent.position.x;
  const py = agent.position.y;
  const vx = agent.velocity.x;
  const vy = agent.velocity.y;
  const speed = Math.sqrt(vx * vx + vy * vy);

  // -------------------------------------------------------------------
  // Fallback: closest-point approach for stationary / near-stationary agents
  // -------------------------------------------------------------------
  if (speed < MIN_SPEED_FOR_RAYCAST) {
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
      const strength = 1 - closestDist / WALL_AVOIDANCE_DISTANCE;
      out.x *= strength * agent.maxForce;
      out.y *= strength * agent.maxForce;
    } else {
      out.x = 0;
      out.y = 0;
    }

    return out;
  }

  // -------------------------------------------------------------------
  // 3-raycast approach
  // -------------------------------------------------------------------

  // Normalised forward direction
  const fwdX = vx / speed;
  const fwdY = vy / speed;

  // Rotate forward vector by +30deg (left ray) and -30deg (right ray)
  // Rotation: x' = x*cos - y*sin,  y' = x*sin + y*cos
  const leftX = fwdX * COS_30 - fwdY * SIN_30;
  const leftY = fwdX * SIN_30 + fwdY * COS_30;
  const rightX = fwdX * COS_30 + fwdY * SIN_30;
  const rightY = -fwdX * SIN_30 + fwdY * COS_30;

  // Ray direction vectors scaled to WALL_AVOIDANCE_DISTANCE
  const dist = WALL_AVOIDANCE_DISTANCE;
  const rayDirX0 = fwdX * dist;
  const rayDirY0 = fwdY * dist;
  const rayDirX1 = leftX * dist;
  const rayDirY1 = leftY * dist;
  const rayDirX2 = rightX * dist;
  const rayDirY2 = rightY * dist;

  // For each ray, find the closest wall intersection
  let bestT0 = 2.0; // forward ray
  let bestT1 = 2.0; // left ray
  let bestT2 = 2.0; // right ray
  let hitWall0 = -1;
  let hitWall1 = -1;
  let hitWall2 = -1;

  for (let i = 0; i < walls.length; i++) {
    const w = walls[i];

    // Forward ray
    const t0 = rayWallIntersectionT(px, py, rayDirX0, rayDirY0, w.ax, w.ay, w.bx, w.by);
    if (t0 >= 0 && t0 < bestT0) {
      bestT0 = t0;
      hitWall0 = i;
    }

    // Left ray
    const t1 = rayWallIntersectionT(px, py, rayDirX1, rayDirY1, w.ax, w.ay, w.bx, w.by);
    if (t1 >= 0 && t1 < bestT1) {
      bestT1 = t1;
      hitWall1 = i;
    }

    // Right ray
    const t2 = rayWallIntersectionT(px, py, rayDirX2, rayDirY2, w.ax, w.ay, w.bx, w.by);
    if (t2 >= 0 && t2 < bestT2) {
      bestT2 = t2;
      hitWall2 = i;
    }
  }

  // Accumulate avoidance forces from each ray that hit a wall
  let forceX = 0;
  let forceY = 0;

  if (hitWall0 >= 0) {
    const w = walls[hitWall0];
    // Get wall normal pointing toward the agent
    LineSegment.normalToward(_normal, w.ax, w.ay, w.bx, w.by, px, py);
    // Proximity: t=0 means at agent position (max strength), t=1 means at ray tip (min strength)
    const proximity = 1 - bestT0;
    forceX += _normal.x * proximity * FORWARD_RAY_WEIGHT;
    forceY += _normal.y * proximity * FORWARD_RAY_WEIGHT;
  }

  if (hitWall1 >= 0) {
    const w = walls[hitWall1];
    LineSegment.normalToward(_normal, w.ax, w.ay, w.bx, w.by, px, py);
    const proximity = 1 - bestT1;
    forceX += _normal.x * proximity * SIDE_RAY_WEIGHT;
    forceY += _normal.y * proximity * SIDE_RAY_WEIGHT;
  }

  if (hitWall2 >= 0) {
    const w = walls[hitWall2];
    LineSegment.normalToward(_normal, w.ax, w.ay, w.bx, w.by, px, py);
    const proximity = 1 - bestT2;
    forceX += _normal.x * proximity * SIDE_RAY_WEIGHT;
    forceY += _normal.y * proximity * SIDE_RAY_WEIGHT;
  }

  out.x = forceX * agent.maxForce;
  out.y = forceY * agent.maxForce;

  return out;
}
