import type { Vec2 as V2 } from '../core/types';

/**
 * Static Vec2 operations — zero allocation in the hot loop.
 * All methods operate on plain {x, y} objects.
 */
export const Vec2 = {
  create(x = 0, y = 0): V2 {
    return { x, y };
  },

  set(out: V2, x: number, y: number): V2 {
    out.x = x;
    out.y = y;
    return out;
  },

  copy(out: V2, a: V2): V2 {
    out.x = a.x;
    out.y = a.y;
    return out;
  },

  add(out: V2, a: V2, b: V2): V2 {
    out.x = a.x + b.x;
    out.y = a.y + b.y;
    return out;
  },

  sub(out: V2, a: V2, b: V2): V2 {
    out.x = a.x - b.x;
    out.y = a.y - b.y;
    return out;
  },

  scale(out: V2, a: V2, s: number): V2 {
    out.x = a.x * s;
    out.y = a.y * s;
    return out;
  },

  addScaled(out: V2, a: V2, b: V2, s: number): V2 {
    out.x = a.x + b.x * s;
    out.y = a.y + b.y * s;
    return out;
  },

  length(a: V2): number {
    return Math.sqrt(a.x * a.x + a.y * a.y);
  },

  lengthSq(a: V2): number {
    return a.x * a.x + a.y * a.y;
  },

  distance(a: V2, b: V2): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  distanceSq(a: V2, b: V2): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  },

  normalize(out: V2, a: V2): V2 {
    const len = Math.sqrt(a.x * a.x + a.y * a.y);
    if (len > 0.0001) {
      const invLen = 1 / len;
      out.x = a.x * invLen;
      out.y = a.y * invLen;
    } else {
      out.x = 0;
      out.y = 0;
    }
    return out;
  },

  setLength(out: V2, a: V2, len: number): V2 {
    Vec2.normalize(out, a);
    out.x *= len;
    out.y *= len;
    return out;
  },

  clampLength(out: V2, a: V2, maxLen: number): V2 {
    const lenSq = a.x * a.x + a.y * a.y;
    if (lenSq > maxLen * maxLen) {
      const invLen = maxLen / Math.sqrt(lenSq);
      out.x = a.x * invLen;
      out.y = a.y * invLen;
    } else {
      out.x = a.x;
      out.y = a.y;
    }
    return out;
  },

  dot(a: V2, b: V2): number {
    return a.x * b.x + a.y * b.y;
  },

  cross(a: V2, b: V2): number {
    return a.x * b.y - a.y * b.x;
  },

  perpCW(out: V2, a: V2): V2 {
    out.x = a.y;
    out.y = -a.x;
    return out;
  },

  perpCCW(out: V2, a: V2): V2 {
    out.x = -a.y;
    out.y = a.x;
    return out;
  },

  lerp(out: V2, a: V2, b: V2, t: number): V2 {
    out.x = a.x + (b.x - a.x) * t;
    out.y = a.y + (b.y - a.y) * t;
    return out;
  },

  zero(out: V2): V2 {
    out.x = 0;
    out.y = 0;
    return out;
  },

  random(out: V2, scale = 1): V2 {
    const angle = Math.random() * Math.PI * 2;
    out.x = Math.cos(angle) * scale;
    out.y = Math.sin(angle) * scale;
    return out;
  },

  angle(a: V2): number {
    return Math.atan2(a.y, a.x);
  },

  rotate(out: V2, a: V2, rad: number): V2 {
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    out.x = a.x * cos - a.y * sin;
    out.y = a.x * sin + a.y * cos;
    return out;
  },

  negate(out: V2, a: V2): V2 {
    out.x = -a.x;
    out.y = -a.y;
    return out;
  },
};
