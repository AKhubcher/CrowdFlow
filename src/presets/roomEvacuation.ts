import type { PresetScenario } from '../engine/core/types';

export const roomEvacuation: PresetScenario = {
  id: 'roomEvacuation',
  name: 'Room Evacuation',
  description: 'A room full of agents evacuating through two exits.',
  icon: '🏃',
  agents: Array.from({ length: 200 }, () => ({
    x: 100 + Math.random() * 1000,
    y: 100 + Math.random() * 600,
  })),
  walls: [
    { ax: 50, ay: 50, bx: 1150, by: 50 },
    { ax: 1150, ay: 50, bx: 1150, by: 750 },
    { ax: 1150, ay: 750, bx: 50, by: 750 },
    { ax: 50, ay: 750, bx: 50, by: 50 },
  ],
  exits: [
    { ax: 50, ay: 350, bx: 50, by: 450 },
    { ax: 1150, ay: 350, bx: 1150, by: 450 },
  ],
};
