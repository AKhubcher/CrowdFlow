import { AgentData, AgentState, WorldState, SimulationStats } from './types';
import {
  STRESS_INCREASE_DENSITY, STRESS_INCREASE_HAZARD, STRESS_INCREASE_PANIC,
  STRESS_DECREASE_OPEN, STRESS_DECREASE_PROGRESS, STRESS_FREEZE_THRESHOLD,
  SEPARATION_RADIUS,
} from './constants';
import { Vec2 } from '../math/Vec2';
import { clamp } from '../math/math-utils';
import { SpatialHashGrid } from '../spatial/SpatialHashGrid';
import { SteeringManager } from '../steering/SteeringManager';
import { resolveAgentCollisions } from '../collision/agentCollision';
import { resolveWallCollisions } from '../collision/wallCollision';
import { FlowField } from '../pathfinding/FlowField';
import { assignExits } from '../pathfinding/ExitSelector';
import { LineSegment } from '../math/LineSegment';

const _steerForce = { x: 0, y: 0 };
const _closest = { x: 0, y: 0 };

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

  step(_dt: number): void {
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

      // Check freeze from stress
      if (agent.stress > STRESS_FREEZE_THRESHOLD && Math.random() < 0.02) {
        agent.state = AgentState.Frozen;
      }
      if (agent.state === AgentState.Frozen) {
        // Chance to unfreeze
        if (Math.random() < 0.01) {
          agent.state = AgentState.Moving;
        }
        // Apply friction while frozen
        agent.velocity.x *= 0.9;
        agent.velocity.y *= 0.9;
        this.updateStress(agent);
        agent.color = this.stressColor(agent.stress);
        continue;
      }

      // Compute combined steering force
      steering.computeForce(_steerForce, agent, world, grid, flowField);

      // Apply force: velocity += force / mass
      agent.velocity.x += _steerForce.x / agent.mass;
      agent.velocity.y += _steerForce.y / agent.mass;

      // Clamp velocity — panic mode allows faster movement
      const maxSpd = world.panicMode ? agent.maxSpeed * 1.4 : agent.maxSpeed;
      Vec2.clampLength(agent.velocity, agent.velocity, maxSpd);

      // Integrate position
      agent.position.x += agent.velocity.x;
      agent.position.y += agent.velocity.y;

      // Update state
      const speed = Vec2.length(agent.velocity);
      agent.state = speed > 0.1 ? AgentState.Moving : AgentState.Idle;

      // Update stress
      this.updateStress(agent);

      // Update color — smooth gradient instead of hard thresholds
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
    // Smooth color gradient: cyan(0) -> yellow(0.4) -> orange(0.7) -> red(1.0)
    if (stress < 0.4) {
      const t = stress / 0.4;
      const r = Math.round(6 + (234 - 6) * t);
      const g = Math.round(182 + (179 - 182) * t);
      const b = Math.round(212 + (8 - 212) * t);
      return `rgb(${r},${g},${b})`;
    }
    if (stress < 0.7) {
      const t = (stress - 0.4) / 0.3;
      const r = Math.round(234 + (249 - 234) * t);
      const g = Math.round(179 + (115 - 179) * t);
      const b = Math.round(8 + (22 - 8) * t);
      return `rgb(${r},${g},${b})`;
    }
    const t = (stress - 0.7) / 0.3;
    const r = Math.round(249 + (239 - 249) * t);
    const g = Math.round(115 + (68 - 115) * t);
    const b = Math.round(22 + (68 - 22) * t);
    return `rgb(${r},${g},${b})`;
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
        // Use distance to exit line segment, not just midpoint
        LineSegment.closestPoint(
          _closest,
          exit.ax, exit.ay, exit.bx, exit.by,
          agent.position.x, agent.position.y,
        );
        const dx = agent.position.x - _closest.x;
        const dy = agent.position.y - _closest.y;
        const distSq = dx * dx + dy * dy;
        const threshold = agent.radius + 8; // close enough to exit line

        if (distSq < threshold * threshold) {
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
      fps: 0,
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
