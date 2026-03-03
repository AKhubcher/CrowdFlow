import type { PresetScenario } from '../engine/core/types';

export const maze: PresetScenario = {
  id: 'maze',
  name: 'Maze',
  description: 'Agents navigate through a maze to reach the exit.',
  icon: '🧩',
  agents: Array.from({ length: 80 }, () => ({
    x: 60 + Math.random() * 150,
    y: 60 + Math.random() * 680,
  })),
  walls: [
    // Outer walls
    { ax: 30, ay: 30, bx: 1170, by: 30 },
    { ax: 1170, ay: 30, bx: 1170, by: 770 },
    { ax: 1170, ay: 770, bx: 30, by: 770 },
    { ax: 30, ay: 770, bx: 30, by: 30 },
    // Internal maze walls
    { ax: 250, ay: 30, bx: 250, by: 550 },
    { ax: 450, ay: 200, bx: 450, by: 770 },
    { ax: 650, ay: 30, bx: 650, by: 550 },
    { ax: 850, ay: 200, bx: 850, by: 770 },
    { ax: 250, ay: 550, bx: 400, by: 550 },
    { ax: 650, ay: 550, bx: 800, by: 550 },
  ],
  exits: [
    { ax: 1170, ay: 370, bx: 1170, by: 430 },
  ],
};
