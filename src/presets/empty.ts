import type { PresetScenario } from '../engine/core/types';

export const empty: PresetScenario = {
  id: 'empty',
  name: 'Empty Canvas',
  description: 'Start with a blank canvas and build your own scenario.',
  icon: '✨',
  agents: [],
  walls: [],
  exits: [],
};
