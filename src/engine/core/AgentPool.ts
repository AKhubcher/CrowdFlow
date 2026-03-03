import type { AgentData } from './types';
import { createAgent } from './Agent';

export class AgentPool {
  private pool: AgentData[] = [];

  acquire(x: number, y: number, vx = 0, vy = 0): AgentData {
    const agent = this.pool.pop();
    if (agent) {
      agent.position.x = x;
      agent.position.y = y;
      agent.velocity.x = vx;
      agent.velocity.y = vy;
      agent.stress = 0;
      agent.state = 0;
      agent.targetExitId = -1;
      return agent;
    }
    return createAgent(x, y, vx, vy);
  }

  release(agent: AgentData): void {
    this.pool.push(agent);
  }

  releaseAll(agents: AgentData[]): void {
    for (let i = 0; i < agents.length; i++) {
      this.pool.push(agents[i]);
    }
  }

  getPoolSize(): number {
    return this.pool.length;
  }
}
