import type { AgentData, WorldState } from '../core/types';
import { FlowField } from './FlowField';

/**
 * Assigns each agent to their best exit based on distance + crowding penalty.
 * Re-evaluates every 120 ticks to switch to less crowded exits.
 */
export function assignExits(agents: AgentData[], world: WorldState, _flowField: FlowField): void {
  if (world.exits.length === 0) return;

  // Compute crowd counts per exit (local, not module-level, to avoid
  // cross-simulation contamination when multiple engines exist)
  const exitCrowdCounts = new Map<number, number>();
  for (const exit of world.exits) exitCrowdCounts.set(exit.id, 0);
  for (const agent of agents) {
    if (agent.targetExitId >= 0) {
      exitCrowdCounts.set(agent.targetExitId, (exitCrowdCounts.get(agent.targetExitId) ?? 0) + 1);
    }
  }

  const totalAgents = agents.length || 1;

  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i];
    // Already assigned? Re-evaluate every 120 ticks, otherwise keep
    const hasValidExit = agent.targetExitId >= 0 && world.exits.some(e => e.id === agent.targetExitId);
    if (hasValidExit && world.tick % 120 !== 0) {
      continue;
    }

    let bestScore = Infinity;
    let bestExitId = -1;

    for (let j = 0; j < world.exits.length; j++) {
      const exit = world.exits[j];
      const mx = (exit.ax + exit.bx) * 0.5;
      const my = (exit.ay + exit.by) * 0.5;
      const dx = agent.position.x - mx;
      const dy = agent.position.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const crowding = (exitCrowdCounts.get(exit.id) ?? 0) / totalAgents;
      const score = dist + crowding * 200;
      if (score < bestScore) {
        bestScore = score;
        bestExitId = exit.id;
      }
    }

    agent.targetExitId = bestExitId;
  }
}
