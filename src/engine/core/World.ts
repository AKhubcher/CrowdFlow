import { AgentData, WallData, ExitData, HazardData, AttractorData, WorldState } from './types';
import { DEFAULT_WORLD_WIDTH, DEFAULT_WORLD_HEIGHT } from './constants';

let nextEntityId = 1;

export function createWorld(width = DEFAULT_WORLD_WIDTH, height = DEFAULT_WORLD_HEIGHT): WorldState {
  return {
    agents: [],
    walls: [],
    exits: [],
    hazards: [],
    attractors: [],
    width,
    height,
    tick: 0,
    panicMode: false,
  };
}

export function addWall(world: WorldState, ax: number, ay: number, bx: number, by: number): WallData {
  const wall: WallData = { id: nextEntityId++, ax, ay, bx, by, thickness: 4 };
  world.walls.push(wall);
  return wall;
}

export function addExit(world: WorldState, ax: number, ay: number, bx: number, by: number): ExitData {
  const exit: ExitData = { id: nextEntityId++, ax, ay, bx, by, width: 0, capacity: Infinity, agentsExited: 0 };
  exit.width = Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);
  world.exits.push(exit);
  return exit;
}

export function addHazard(world: WorldState, x: number, y: number, radius: number, intensity = 1): HazardData {
  const hazard: HazardData = { id: nextEntityId++, x, y, radius, intensity };
  world.hazards.push(hazard);
  return hazard;
}

export function addAttractor(world: WorldState, x: number, y: number, radius: number, strength = 1): AttractorData {
  const attractor: AttractorData = { id: nextEntityId++, x, y, radius, strength };
  world.attractors.push(attractor);
  return attractor;
}

export function removeEntity(world: WorldState, id: number): void {
  world.walls = world.walls.filter(w => w.id !== id);
  world.exits = world.exits.filter(e => e.id !== id);
  world.hazards = world.hazards.filter(h => h.id !== id);
  world.attractors = world.attractors.filter(a => a.id !== id);
  world.agents = world.agents.filter(a => a.id !== id);
}

export function clearWorld(world: WorldState): void {
  world.agents.length = 0;
  world.walls.length = 0;
  world.exits.length = 0;
  world.hazards.length = 0;
  world.attractors.length = 0;
  world.tick = 0;
  world.panicMode = false;
}

export function resetEntityIds(): void {
  nextEntityId = 1;
}
