import type { AgentData, WorldState } from '../core/types';
import { FlowField } from './FlowField';

/**
 * Assigns each agent to their best exit based on flow field distance.
 */
export function assignExits(agents: AgentData[], world: WorldState, flowField: FlowField): void {
  if (world.exits.length === 0) return;

  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i];
    // Already assigned and exit still exists? Keep it.
    if (agent.targetExitId >= 0 && world.exits.some(e => e.id === agent.targetExitId)) {
      continue;
    }

    // Pick nearest exit by flow field distance
    let bestDist = Infinity;
    let bestExitId = -1;

    for (let j = 0; j < world.exits.length; j++) {
      const exit = world.exits[j];
      const mx = (exit.ax + exit.bx) * 0.5;
      const my = (exit.ay + exit.by) * 0.5;
      const dx = agent.position.x - mx;
      const dy = agent.position.y - my;
      const dist = dx * dx + dy * dy;
      if (dist < bestDist) {
        bestDist = dist;
        bestExitId = exit.id;
      }
    }

    agent.targetExitId = bestExitId;
  }
}
