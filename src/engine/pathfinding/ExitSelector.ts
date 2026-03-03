import type { AgentData, WorldState } from '../core/types';
import { FlowField } from './FlowField';

// How many agents are currently near each exit (cached per frame)
let _exitCrowdCounts: Map<number, number> = new Map();
let _lastCrowdTick = -1;

function updateCrowdCounts(agents: AgentData[], world: WorldState, tick: number): void {
  if (tick === _lastCrowdTick) return;
  _lastCrowdTick = tick;
  _exitCrowdCounts.clear();
  for (const exit of world.exits) _exitCrowdCounts.set(exit.id, 0);
  for (const agent of agents) {
    if (agent.targetExitId >= 0) {
      _exitCrowdCounts.set(agent.targetExitId, (_exitCrowdCounts.get(agent.targetExitId) ?? 0) + 1);
    }
  }
}

/**
 * Assigns each agent to their best exit based on distance + crowding penalty.
 * Re-evaluates every 120 ticks to switch to less crowded exits.
 */
export function assignExits(agents: AgentData[], world: WorldState, flowField: FlowField): void {
  if (world.exits.length === 0) return;

  updateCrowdCounts(agents, world, world.tick);
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
      // Crowding penalty: agents already heading to this exit / total agents
      const crowding = (_exitCrowdCounts.get(exit.id) ?? 0) / totalAgents;
      const score = dist + crowding * 200;
      if (score < bestScore) {
        bestScore = score;
        bestExitId = exit.id;
      }
    }

    agent.targetExitId = bestExitId;
  }
}
