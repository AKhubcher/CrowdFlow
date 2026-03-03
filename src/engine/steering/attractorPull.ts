import type { AgentData, AttractorData, Vec2 } from '../core/types';

/**
 * Attractor pull: gently steer toward attractor points within range.
 */
export function attractorPull(out: Vec2, agent: AgentData, attractors: AttractorData[]): Vec2 {
  out.x = 0;
  out.y = 0;

  const px = agent.position.x;
  const py = agent.position.y;

  for (let i = 0; i < attractors.length; i++) {
    const a = attractors[i];
    const dx = a.x - px;
    const dy = a.y - py;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < a.radius && dist > 0.001) {
      const strength = (1 - dist / a.radius) * a.strength;
      out.x += (dx / dist) * strength * agent.maxForce;
      out.y += (dy / dist) * strength * agent.maxForce;
    }
  }

  return out;
}
