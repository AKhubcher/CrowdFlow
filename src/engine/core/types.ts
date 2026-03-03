export interface Vec2 {
  x: number;
  y: number;
}

export const enum AgentState {
  Idle = 0,
  Moving = 1,
  Exiting = 2,
  Panicked = 3,
  Frozen = 4,
}

export interface AgentData {
  id: number;
  position: Vec2;
  velocity: Vec2;
  desiredVelocity: Vec2;
  acceleration: Vec2;
  radius: number;
  maxSpeed: number;
  maxForce: number;
  mass: number;
  state: AgentState;
  stress: number;
  targetExitId: number;
  color: string;
  groupId: number;
  // Scratch vectors — pre-allocated per agent for zero-alloc math
  _scratch0: Vec2;
  _scratch1: Vec2;
  _scratch2: Vec2;
}

export interface WallData {
  id: number;
  ax: number;
  ay: number;
  bx: number;
  by: number;
  thickness: number;
}

export interface ExitData {
  id: number;
  ax: number;
  ay: number;
  bx: number;
  by: number;
  width: number;
  capacity: number;
  agentsExited: number;
}

export interface HazardData {
  id: number;
  x: number;
  y: number;
  radius: number;
  intensity: number;
}

export interface AttractorData {
  id: number;
  x: number;
  y: number;
  radius: number;
  strength: number;
}

export interface WorldState {
  agents: AgentData[];
  walls: WallData[];
  exits: ExitData[];
  hazards: HazardData[];
  attractors: AttractorData[];
  width: number;
  height: number;
  tick: number;
  panicMode: boolean;
}

export interface SimulationStats {
  agentCount: number;
  exitedCount: number;
  averageSpeed: number;
  averageStress: number;
  fps: number;
  tick: number;
}

export type InteractionMode =
  | null
  | 'select'
  | 'addAgent'
  | 'addWall'
  | 'addExit'
  | 'addHazard'
  | 'addAttractor'
  | 'erase';

export type VisualizationOverlay =
  | 'none'
  | 'heatmap'
  | 'flowField'
  | 'trails'
  | 'velocityVectors'
  | 'grid';

export interface PresetScenario {
  id: string;
  name: string;
  description: string;
  icon: string;
  agents: Array<{ x: number; y: number; vx?: number; vy?: number }>;
  walls: Array<{ ax: number; ay: number; bx: number; by: number }>;
  exits: Array<{ ax: number; ay: number; bx: number; by: number }>;
  hazards?: Array<{ x: number; y: number; radius: number; intensity: number }>;
  attractors?: Array<{ x: number; y: number; radius: number; strength: number }>;
  worldWidth?: number;
  worldHeight?: number;
}
