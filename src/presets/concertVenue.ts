import type { PresetScenario } from '../engine/core/types';

export const concertVenue: PresetScenario = {
  id: 'concertVenue',
  name: 'Concert Venue',
  description: 'Large crowd around a stage with multiple exits and an attractor.',
  icon: '🎵',
  agents: Array.from({ length: 300 }, () => ({
    x: 200 + Math.random() * 800,
    y: 200 + Math.random() * 500,
  })),
  walls: [
    // Venue boundary
    { ax: 50, ay: 50, bx: 1150, by: 50 },
    { ax: 1150, ay: 50, bx: 1150, by: 750 },
    { ax: 1150, ay: 750, bx: 50, by: 750 },
    { ax: 50, ay: 750, bx: 50, by: 50 },
    // Stage
    { ax: 400, ay: 50, bx: 400, by: 150 },
    { ax: 400, ay: 150, bx: 800, by: 150 },
    { ax: 800, ay: 150, bx: 800, by: 50 },
  ],
  exits: [
    { ax: 50, ay: 650, bx: 50, by: 750 },
    { ax: 1150, ay: 650, bx: 1150, by: 750 },
    { ax: 500, ay: 750, bx: 700, by: 750 },
  ],
  attractors: [
    { x: 600, y: 120, radius: 250, strength: 0.8 },
  ],
};
