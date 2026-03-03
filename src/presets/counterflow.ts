import type { PresetScenario } from '../engine/core/types';

export const counterflow: PresetScenario = {
  id: 'counterflow',
  name: 'Counterflow',
  description: 'Two groups of agents moving in opposite directions through a corridor.',
  icon: '↔️',
  get agents() {
    return [
      // Left group heading right
      ...Array.from({ length: 80 }, () => ({
        x: 50 + Math.random() * 200,
        y: 300 + Math.random() * 200,
        vx: 1,
        vy: 0,
      })),
      // Right group heading left
      ...Array.from({ length: 80 }, () => ({
        x: 950 + Math.random() * 200,
        y: 300 + Math.random() * 200,
        vx: -1,
        vy: 0,
      })),
    ];
  },
  walls: [
    { ax: 0, ay: 280, bx: 1200, by: 280 },
    { ax: 0, ay: 520, bx: 1200, by: 520 },
  ],
  exits: [
    { ax: 1198, ay: 300, bx: 1198, by: 500 },
    { ax: 2, ay: 300, bx: 2, by: 500 },
  ],
};
