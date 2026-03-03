import type { PresetScenario } from '../engine/core/types';
import { bottleneck } from './bottleneck';
import { roomEvacuation } from './roomEvacuation';
import { maze } from './maze';
import { concertVenue } from './concertVenue';
import { multiFloor } from './multiFloor';
import { counterflow } from './counterflow';
import { empty } from './empty';

export const presets: PresetScenario[] = [
  roomEvacuation,
  bottleneck,
  maze,
  concertVenue,
  multiFloor,
  counterflow,
  empty,
];

export { bottleneck, roomEvacuation, maze, concertVenue, multiFloor, counterflow, empty };
