import { AgentData, AgentState, WorldState, SimulationStats } from './types';
import {
  STRESS_INCREASE_DENSITY, STRESS_INCREASE_HAZARD, STRESS_INCREASE_PANIC,
  STRESS_DECREASE_OPEN, STRESS_DECREASE_PROGRESS, STRESS_FREEZE_THRESHOLD,
  SEPARATION_RADIUS, AGENT_COLOR_CALM, AGENT_COLOR_STRESSED, AGENT_COLOR_PANIC,
} from './constants';
import { Vec2 } from '../math/Vec2';
import { clamp, lerp } from '../math/math-utils';
import { SpatialHashGrid } from '../spatial/SpatialHashGrid';
import { SteeringManager } from '../steering/SteeringManager';
import { resolveAgentCollisions } from '../collision/agentCollision';
import { resolveWallCollisions } from '../collision/wallCollision';
import { FlowField } from '../pathfinding/FlowField';
import { assignExits } from '../pathfinding/ExitSelector';

const _steerForce = { x: 0, y: 0 };

export class Engine {
  world: WorldState;
  grid: SpatialHashGrid;
  steering: SteeringManager;
  flowField: FlowField;
  private totalExited = 0;

  constructor(world: WorldState) {
    this.world = world;
    this.grid = new SpatialHashGrid();
    this.steering = new SteeringManager();
    this.flowField = new FlowField(world.width, world.height);
  }

  step(dt: number): void {
    const { world, grid, steering, flowField } = this;

    // Recompute flow field if dirty
    flowField.compute(world);

    // Assign exits
    assignExits(world.agents, world, flowField);

    // Rebuild spatial grid
    grid.rebuild(world.agents);

    // Compute steering + integrate
    for (let i = 0; i < world.agents.length; i++) {
      const agent = world.agents[i];

      if (agent.state === AgentState.Exiting) continue;

      // Check freeze from stress
      if (agent.stress > STRESS_FREEZE_THRESHOLD && Math.random() < 0.02) {
        agent.state = AgentState.Frozen;
      }
      if (agent.state === AgentState.Frozen) {
        // Chance to unfreeze
        if (Math.random() < 0.01) {
          agent.state = AgentState.Moving;
        }
        continue;
      }

      // Compute combined steering force
      steering.computeForce(_steerForce, agent, world, grid, flowField);

      // Apply force: velocity += force / mass
      agent.velocity.x += _steerForce.x / agent.mass;
      agent.velocity.y += _steerForce.y / agent.mass;

      // Clamp velocity
      Vec2.clampLength(agent.velocity, agent.velocity, agent.maxSpeed);

      // Integrate position
      agent.position.x += agent.velocity.x;
      agent.position.y += agent.velocity.y;

      // Update state
      const speed = Vec2.length(agent.velocity);
      agent.state = speed > 0.1 ? AgentState.Moving : AgentState.Idle;

      // Update stress
      this.updateStress(agent);

      // Update color based on stress
      agent.color = this.stressColor(agent.stress);
    }

    // Collisions
    resolveAgentCollisions(world.agents, grid);
    resolveWallCollisions(world.agents, world.walls);

    // Boundary containment
    this.containAgents();

    // Check exits
    this.checkExits();

    world.tick++;
  }

  private updateStress(agent: AgentData): void {
    const neighbors = this.grid.queryRadius(
      agent.position.x, agent.position.y,
      SEPARATION_RADIUS, agent,
    );

    // Density increases stress
    if (neighbors.length > 3) {
      agent.stress += STRESS_INCREASE_DENSITY * (neighbors.length - 3);
    } else {
      agent.stress -= STRESS_DECREASE_OPEN;
    }

    // Panic mode
    if (this.world.panicMode) {
      agent.stress += STRESS_INCREASE_PANIC;
    }

    // Near hazard
    for (const h of this.world.hazards) {
      const dx = agent.position.x - h.x;
      const dy = agent.position.y - h.y;
      if (dx * dx + dy * dy < h.radius * h.radius) {
        agent.stress += STRESS_INCREASE_HAZARD * h.intensity;
      }
    }

    // Making progress (velocity toward exit)
    if (agent.targetExitId >= 0) {
      const speed = Vec2.length(agent.velocity);
      if (speed > agent.maxSpeed * 0.5) {
        agent.stress -= STRESS_DECREASE_PROGRESS;
      }
    }

    agent.stress = clamp(agent.stress, 0, 1);
  }

  private stressColor(stress: number): string {
    if (stress < 0.3) return AGENT_COLOR_CALM;
    if (stress < 0.7) return AGENT_COLOR_STRESSED;
    return AGENT_COLOR_PANIC;
  }

  private containAgents(): void {
    const { width, height } = this.world;
    for (const agent of this.world.agents) {
      const r = agent.radius;
      if (agent.position.x < r) { agent.position.x = r; agent.velocity.x *= -0.3; }
      if (agent.position.x > width - r) { agent.position.x = width - r; agent.velocity.x *= -0.3; }
      if (agent.position.y < r) { agent.position.y = r; agent.velocity.y *= -0.3; }
      if (agent.position.y > height - r) { agent.position.y = height - r; agent.velocity.y *= -0.3; }
    }
  }

  private checkExits(): void {
    const agents = this.world.agents;
    const exits = this.world.exits;

    for (let i = agents.length - 1; i >= 0; i--) {
      const agent = agents[i];
      for (const exit of exits) {
        const mx = (exit.ax + exit.bx) * 0.5;
        const my = (exit.ay + exit.by) * 0.5;
        const dx = agent.position.x - mx;
        const dy = agent.position.y - my;
        const exitRadius = exit.width * 0.5 + agent.radius;
        if (dx * dx + dy * dy < exitRadius * exitRadius) {
          exit.agentsExited++;
          this.totalExited++;
          agents.splice(i, 1);
          break;
        }
      }
    }
  }

  getStats(): SimulationStats {
    const agents = this.world.agents;
    let totalSpeed = 0;
    let totalStress = 0;

    for (let i = 0; i < agents.length; i++) {
      totalSpeed += Vec2.length(agents[i].velocity);
      totalStress += agents[i].stress;
    }

    const count = agents.length;
    return {
      agentCount: count,
      exitedCount: this.totalExited,
      averageSpeed: count > 0 ? totalSpeed / count : 0,
      averageStress: count > 0 ? totalStress / count : 0,
      fps: 0, // filled in by controller
      tick: this.world.tick,
    };
  }

  resetExitedCount(): void {
    this.totalExited = 0;
    for (const exit of this.world.exits) {
      exit.agentsExited = 0;
    }
  }
}
