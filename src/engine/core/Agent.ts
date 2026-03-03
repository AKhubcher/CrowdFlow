import { AgentData, AgentState, Vec2 as V2 } from './types';
import {
  DEFAULT_AGENT_RADIUS,
  DEFAULT_MAX_SPEED,
  DEFAULT_MAX_FORCE,
  DEFAULT_AGENT_MASS,
  AGENT_COLOR_CALM,
} from './constants';

let nextAgentId = 1;

export function createAgent(x: number, y: number, vx = 0, vy = 0): AgentData {
  return {
    id: nextAgentId++,
    position: { x, y },
    velocity: { x: vx, y: vy },
    desiredVelocity: { x: 0, y: 0 },
    acceleration: { x: 0, y: 0 },
    radius: DEFAULT_AGENT_RADIUS,
    maxSpeed: DEFAULT_MAX_SPEED,
    maxForce: DEFAULT_MAX_FORCE,
    mass: DEFAULT_AGENT_MASS,
    state: AgentState.Idle,
    stress: 0,
    targetExitId: -1,
    color: AGENT_COLOR_CALM,
    groupId: 0,
    _scratch0: { x: 0, y: 0 },
    _scratch1: { x: 0, y: 0 },
    _scratch2: { x: 0, y: 0 },
  };
}

export function resetAgentId(): void {
  nextAgentId = 1;
}
