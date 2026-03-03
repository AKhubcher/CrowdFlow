import type { AgentData, Vec2 } from '../core/types';

/**
 * Random noise: adds slight randomness to movement, scaled by stress.
 */
export function noise(out: Vec2, agent: AgentData): Vec2 {
  const stressScale = 0.5 + agent.stress * 1.5;
  const angle = Math.random() * Math.PI * 2;
  out.x = Math.cos(angle) * agent.maxForce * 0.3 * stressScale;
  out.y = Math.sin(angle) * agent.maxForce * 0.3 * stressScale;
  return out;
}
