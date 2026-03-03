import type { InteractionMode } from '../engine/core/types';

export function getCursorForMode(mode: InteractionMode): string {
  switch (mode) {
    case 'select': return 'default';
    case 'addAgent': return 'cell';
    case 'addWall': return 'crosshair';
    case 'addExit': return 'crosshair';
    case 'addHazard': return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Ccircle cx=\'12\' cy=\'12\' r=\'10\' fill=\'none\' stroke=\'%23ef4444\' stroke-width=\'2\'/%3E%3Cline x1=\'8\' y1=\'8\' x2=\'16\' y2=\'16\' stroke=\'%23ef4444\' stroke-width=\'2\'/%3E%3Cline x1=\'16\' y1=\'8\' x2=\'8\' y2=\'16\' stroke=\'%23ef4444\' stroke-width=\'2\'/%3E%3C/svg%3E") 12 12, crosshair';
    case 'addAttractor': return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Ccircle cx=\'12\' cy=\'12\' r=\'10\' fill=\'none\' stroke=\'%238b5cf6\' stroke-width=\'2\'/%3E%3Ccircle cx=\'12\' cy=\'12\' r=\'4\' fill=\'%238b5cf6\'/%3E%3C/svg%3E") 12 12, crosshair';
    case 'erase': return 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Crect x=\'4\' y=\'4\' width=\'16\' height=\'16\' rx=\'3\' fill=\'none\' stroke=\'%23f97316\' stroke-width=\'2\'/%3E%3Cline x1=\'9\' y1=\'9\' x2=\'15\' y2=\'15\' stroke=\'%23f97316\' stroke-width=\'2\'/%3E%3Cline x1=\'15\' y1=\'9\' x2=\'9\' y2=\'15\' stroke=\'%23f97316\' stroke-width=\'2\'/%3E%3C/svg%3E") 12 12, crosshair';
    default: return 'grab';
  }
}
