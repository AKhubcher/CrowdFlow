import type { AgentData, HazardData, Vec2 } from '../core/types';
import { HAZARD_AVOIDANCE_DISTANCE } from '../core/constants';

/**
 * Hazard avoidance: steer away from hazard zones.
 */
export function hazardAvoidance(out: Vec2, agent: AgentData, hazards: HazardData[]): Vec2 {
  out.x = 0;
  out.y = 0;

  const px = agent.position.x;
  const py = agent.position.y;

  for (let i = 0; i < hazards.length; i++) {
    const h = hazards[i];
    const dx = px - h.x;
    const dy = py - h.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const effectiveRadius = h.radius + HAZARD_AVOIDANCE_DISTANCE;

    if (dist < effectiveRadius && dist > 0.001) {
      const strength = (1 - dist / effectiveRadius) * h.intensity;
      out.x += (dx / dist) * strength * agent.maxForce;
      out.y += (dy / dist) * strength * agent.maxForce;
    }
  }

  return out;
}
