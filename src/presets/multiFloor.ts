import type { PresetScenario } from '../engine/core/types';

export const multiFloor: PresetScenario = {
  id: 'multiFloor',
  name: 'Multi-Floor Building',
  description: 'Simulates a multi-room building layout with corridors.',
  icon: '🏢',
  get agents() {
    return Array.from({ length: 120 }, (_, i) => {
      const room = i % 4;
      const baseX = (room % 2) * 550 + 100;
      const baseY = Math.floor(room / 2) * 350 + 100;
      return {
        x: baseX + Math.random() * 400,
        y: baseY + Math.random() * 200,
      };
    });
  },
  walls: [
    // Outer walls
    { ax: 50, ay: 50, bx: 1150, by: 50 },
    { ax: 1150, ay: 50, bx: 1150, by: 750 },
    { ax: 1150, ay: 750, bx: 50, by: 750 },
    { ax: 50, ay: 750, bx: 50, by: 50 },
    // Horizontal divider
    { ax: 50, ay: 400, bx: 520, by: 400 },
    { ax: 680, ay: 400, bx: 1150, by: 400 },
    // Vertical divider
    { ax: 600, ay: 50, bx: 600, by: 340 },
    { ax: 600, ay: 460, bx: 600, by: 750 },
  ],
  exits: [
    { ax: 50, ay: 380, bx: 50, by: 420 },
    { ax: 1150, ay: 380, bx: 1150, by: 420 },
  ],
};
