import type { PresetScenario } from '../engine/core/types';

export const bottleneck: PresetScenario = {
  id: 'bottleneck',
  name: 'Bottleneck',
  description: 'Agents funnel through a narrow opening in a wall.',
  icon: '🚪',
  get agents() {
    return Array.from({ length: 150 }, () => ({
      x: 100 + Math.random() * 300,
      y: 100 + Math.random() * 600,
    }));
  },
  walls: [
    { ax: 550, ay: 0, bx: 550, by: 340 },
    { ax: 550, ay: 460, bx: 550, by: 800 },
  ],
  exits: [
    { ax: 1198, ay: 350, bx: 1198, by: 450 },
  ],
};
