import type { AgentData, WallData, Vec2 } from '../core/types';
import { LineSegment } from '../math/LineSegment';

const _closest: Vec2 = { x: 0, y: 0 };

/**
 * Resolve agent-wall collisions by pushing agents out of walls.
 */
export function resolveWallCollisions(agents: AgentData[], walls: WallData[]): void {
  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i];
    for (let j = 0; j < walls.length; j++) {
      const wall = walls[j];
      LineSegment.closestPoint(
        _closest,
        wall.ax, wall.ay, wall.bx, wall.by,
        agent.position.x, agent.position.y,
      );

      const dx = agent.position.x - _closest.x;
      const dy = agent.position.y - _closest.y;
      const distSq = dx * dx + dy * dy;
      const minDist = agent.radius + wall.thickness * 0.5;

      if (distSq < minDist * minDist && distSq > 0.0001) {
        const dist = Math.sqrt(distSq);
        const overlap = minDist - dist;
        const nx = dx / dist;
        const ny = dy / dist;

        agent.position.x += nx * overlap;
        agent.position.y += ny * overlap;

        // Kill velocity component into wall
        const dot = agent.velocity.x * nx + agent.velocity.y * ny;
        if (dot < 0) {
          agent.velocity.x -= nx * dot;
          agent.velocity.y -= ny * dot;
        }
      }
    }
  }
}
