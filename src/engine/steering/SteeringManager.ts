import type { AgentData, WorldState, Vec2 } from '../core/types';
import { AgentState } from '../core/types';
import {
  WEIGHT_GOAL, WEIGHT_SEPARATION, WEIGHT_ALIGNMENT,
  WEIGHT_WALL_AVOIDANCE, WEIGHT_HAZARD_AVOIDANCE,
  WEIGHT_ATTRACTOR_PULL, WEIGHT_NOISE,
} from '../core/constants';
import { Vec2 as V } from '../math/Vec2';
import { SpatialHashGrid } from '../spatial/SpatialHashGrid';
import { goalSeeking } from './goalSeeking';
import { separation } from './separation';
import { alignment } from './alignment';
import { wallAvoidance } from './wallAvoidance';
import { hazardAvoidance } from './hazardAvoidance';
import { attractorPull } from './attractorPull';
import { noise } from './noise';
import { FlowField } from '../pathfinding/FlowField';

// Module-level scratch vectors to avoid allocation
const _goalForce: Vec2 = { x: 0, y: 0 };
const _sepForce: Vec2 = { x: 0, y: 0 };
const _alignForce: Vec2 = { x: 0, y: 0 };
const _wallForce: Vec2 = { x: 0, y: 0 };
const _hazardForce: Vec2 = { x: 0, y: 0 };
const _attractForce: Vec2 = { x: 0, y: 0 };
const _noiseForce: Vec2 = { x: 0, y: 0 };

export interface SteeringWeights {
  goal: number;
  separation: number;
  alignment: number;
  wallAvoidance: number;
  hazardAvoidance: number;
  attractorPull: number;
  noise: number;
}

const defaultWeights: SteeringWeights = {
  goal: WEIGHT_GOAL,
  separation: WEIGHT_SEPARATION,
  alignment: WEIGHT_ALIGNMENT,
  wallAvoidance: WEIGHT_WALL_AVOIDANCE,
  hazardAvoidance: WEIGHT_HAZARD_AVOIDANCE,
  attractorPull: WEIGHT_ATTRACTOR_PULL,
  noise: WEIGHT_NOISE,
};

export class SteeringManager {
  weights: SteeringWeights;

  constructor(weights?: Partial<SteeringWeights>) {
    this.weights = { ...defaultWeights, ...weights };
  }

  computeForce(
    out: Vec2,
    agent: AgentData,
    world: WorldState,
    grid: SpatialHashGrid,
    flowField: FlowField | null,
  ): Vec2 {
    out.x = 0;
    out.y = 0;

    if (agent.state === AgentState.Frozen) {
      return out;
    }

    // Goal seeking — use flow field direction if available
    if (flowField && agent.targetExitId >= 0) {
      const dir = flowField.getDirection(agent.position.x, agent.position.y);
      if (dir) {
        const targetX = agent.position.x + dir.x * 50;
        const targetY = agent.position.y + dir.y * 50;
        goalSeeking(_goalForce, agent, targetX, targetY);
      } else {
        V.zero(_goalForce);
      }
    } else if (world.exits.length > 0) {
      // Fallback: seek nearest exit midpoint
      let nearestDist = Infinity;
      let tx = 0, ty = 0;
      for (let i = 0; i < world.exits.length; i++) {
        const e = world.exits[i];
        const mx = (e.ax + e.bx) * 0.5;
        const my = (e.ay + e.by) * 0.5;
        const d = (agent.position.x - mx) ** 2 + (agent.position.y - my) ** 2;
        if (d < nearestDist) {
          nearestDist = d;
          tx = mx;
          ty = my;
        }
      }
      goalSeeking(_goalForce, agent, tx, ty);
    } else {
      V.zero(_goalForce);
    }

    separation(_sepForce, agent, grid, world.panicMode);
    alignment(_alignForce, agent, grid);
    wallAvoidance(_wallForce, agent, world.walls);
    hazardAvoidance(_hazardForce, agent, world.hazards);
    attractorPull(_attractForce, agent, world.attractors);

    out.x += _goalForce.x * this.weights.goal;
    out.y += _goalForce.y * this.weights.goal;
    out.x += _sepForce.x * this.weights.separation;
    out.y += _sepForce.y * this.weights.separation;
    out.x += _alignForce.x * this.weights.alignment;
    out.y += _alignForce.y * this.weights.alignment;
    out.x += _wallForce.x * this.weights.wallAvoidance;
    out.y += _wallForce.y * this.weights.wallAvoidance;
    out.x += _hazardForce.x * this.weights.hazardAvoidance;
    out.y += _hazardForce.y * this.weights.hazardAvoidance;
    out.x += _attractForce.x * this.weights.attractorPull;
    out.y += _attractForce.y * this.weights.attractorPull;

    if (this.weights.noise > 0) {
      noise(_noiseForce, agent);
      out.x += _noiseForce.x * this.weights.noise;
      out.y += _noiseForce.y * this.weights.noise;
    }

    V.clampLength(out, out, agent.maxForce);
    return out;
  }
}
