import type { Vec2 } from '../core/types';

// Scratch vectors for internal use
const _scratch: Vec2 = { x: 0, y: 0 };

export const LineSegment = {
  /**
   * Returns the closest point on segment (ax,ay)-(bx,by) to point p.
   * Result is written to `out`.
   */
  closestPoint(out: Vec2, ax: number, ay: number, bx: number, by: number, px: number, py: number): Vec2 {
    const dx = bx - ax;
    const dy = by - ay;
    const lenSq = dx * dx + dy * dy;

    if (lenSq < 0.0001) {
      out.x = ax;
      out.y = ay;
      return out;
    }

    let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    out.x = ax + t * dx;
    out.y = ay + t * dy;
    return out;
  },

  /**
   * Distance from point (px, py) to segment (ax,ay)-(bx,by).
   */
  distanceToPoint(ax: number, ay: number, bx: number, by: number, px: number, py: number): number {
    LineSegment.closestPoint(_scratch, ax, ay, bx, by, px, py);
    const dx = px - _scratch.x;
    const dy = py - _scratch.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  /**
   * Squared distance from point to segment.
   */
  distanceSqToPoint(ax: number, ay: number, bx: number, by: number, px: number, py: number): number {
    LineSegment.closestPoint(_scratch, ax, ay, bx, by, px, py);
    const dx = px - _scratch.x;
    const dy = py - _scratch.y;
    return dx * dx + dy * dy;
  },

  /**
   * Returns the normal vector of the segment pointing toward point p.
   */
  normalToward(out: Vec2, ax: number, ay: number, bx: number, by: number, px: number, py: number): Vec2 {
    LineSegment.closestPoint(_scratch, ax, ay, bx, by, px, py);
    out.x = px - _scratch.x;
    out.y = py - _scratch.y;
    const len = Math.sqrt(out.x * out.x + out.y * out.y);
    if (len > 0.0001) {
      out.x /= len;
      out.y /= len;
    } else {
      // Point is on the segment; use perpendicular
      const dx = bx - ax;
      const dy = by - ay;
      const segLen = Math.sqrt(dx * dx + dy * dy);
      if (segLen > 0.0001) {
        out.x = -dy / segLen;
        out.y = dx / segLen;
      } else {
        out.x = 0;
        out.y = 1;
      }
    }
    return out;
  },

  /**
   * Length of the segment.
   */
  length(ax: number, ay: number, bx: number, by: number): number {
    const dx = bx - ax;
    const dy = by - ay;
    return Math.sqrt(dx * dx + dy * dy);
  },

  /**
   * Midpoint of the segment.
   */
  midpoint(out: Vec2, ax: number, ay: number, bx: number, by: number): Vec2 {
    out.x = (ax + bx) * 0.5;
    out.y = (ay + by) * 0.5;
    return out;
  },

  /**
   * Check if two line segments intersect.
   */
  intersects(
    a1x: number, a1y: number, a2x: number, a2y: number,
    b1x: number, b1y: number, b2x: number, b2y: number,
  ): boolean {
    const d1x = a2x - a1x;
    const d1y = a2y - a1y;
    const d2x = b2x - b1x;
    const d2y = b2y - b1y;

    const cross = d1x * d2y - d1y * d2x;
    if (Math.abs(cross) < 0.0001) return false;

    const dx = b1x - a1x;
    const dy = b1y - a1y;
    const t = (dx * d2y - dy * d2x) / cross;
    const u = (dx * d1y - dy * d1x) / cross;

    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  },
};
