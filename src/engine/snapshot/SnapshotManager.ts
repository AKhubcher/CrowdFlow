import type { WorldState, AgentData } from '../core/types';
import { SNAPSHOT_INTERVAL, SNAPSHOT_BUFFER_SIZE } from '../core/constants';

interface Snapshot {
  tick: number;
  agents: Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    state: number;
    stress: number;
    color: string;
  }>;
  panicMode: boolean;
}

export class SnapshotManager {
  private snapshots: Snapshot[] = [];
  private maxSize = SNAPSHOT_BUFFER_SIZE;
  private interval = SNAPSHOT_INTERVAL;

  capture(world: WorldState): void {
    if (world.tick % this.interval !== 0) return;

    const snap: Snapshot = {
      tick: world.tick,
      panicMode: world.panicMode,
      agents: world.agents.map(a => ({
        id: a.id,
        x: a.position.x,
        y: a.position.y,
        vx: a.velocity.x,
        vy: a.velocity.y,
        state: a.state,
        stress: a.stress,
        color: a.color,
      })),
    };

    this.snapshots.push(snap);
    if (this.snapshots.length > this.maxSize) {
      this.snapshots.shift();
    }
  }

  restore(index: number, world: WorldState): boolean {
    const snap = this.snapshots[index];
    if (!snap) return false;

    world.panicMode = snap.panicMode;
    world.tick = snap.tick;

    // Restore agents
    world.agents.length = 0;
    for (const sa of snap.agents) {
      const agent: AgentData = {
        id: sa.id,
        position: { x: sa.x, y: sa.y },
        velocity: { x: sa.vx, y: sa.vy },
        desiredVelocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        radius: 5,
        maxSpeed: 2,
        maxForce: 0.15,
        mass: 1,
        state: sa.state,
        stress: sa.stress,
        targetExitId: -1,
        color: sa.color,
        groupId: 0,
        lingerTimer: 0,
        _scratch0: { x: 0, y: 0 },
        _scratch1: { x: 0, y: 0 },
        _scratch2: { x: 0, y: 0 },
      };
      world.agents.push(agent);
    }

    // Trim future snapshots
    this.snapshots.length = index + 1;
    return true;
  }

  getCount(): number {
    return this.snapshots.length;
  }

  getSnapshotTick(index: number): number {
    return this.snapshots[index]?.tick ?? 0;
  }

  clear(): void {
    this.snapshots.length = 0;
  }
}
