import type { ExitData, Vec2 } from '../core/types';

export function exitMidpoint(exit: ExitData, out: Vec2): Vec2 {
  out.x = (exit.ax + exit.bx) * 0.5;
  out.y = (exit.ay + exit.by) * 0.5;
  return out;
}
