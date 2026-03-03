import type { InteractionMode } from '../engine/core/types';

export function getCursorForMode(mode: InteractionMode): string {
  switch (mode) {
    case 'select': return 'default';
    case 'addAgent': return 'crosshair';
    case 'addWall': return 'crosshair';
    case 'addExit': return 'crosshair';
    case 'addHazard': return 'crosshair';
    case 'addAttractor': return 'crosshair';
    case 'erase': return 'crosshair';
    default: return 'default';
  }
}
