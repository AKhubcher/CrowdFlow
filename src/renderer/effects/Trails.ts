import type { AgentData, WorldState, Vec2 } from '../../engine/core/types';
import { TRAIL_LENGTH } from '../../engine/core/constants';
import { Camera } from '../camera/Camera';

/** Trail length multiplier for a selected agent (shows longer history). */
const SELECTED_TRAIL_MULTIPLIER = 4;

interface TrailBuffer {
  points: Vec2[];
  head: number;   // index of oldest entry
  size: number;    // number of valid entries
}

export class Trails {
  private trails: Map<number, TrailBuffer> = new Map();
  private enabled = false;
  private selectedAgentId: number | null = null;

  setEnabled(on: boolean): void {
    this.enabled = on;
    if (!on) this.trails.clear();
  }

  setSelectedAgent(id: number | null): void {
    this.selectedAgentId = id;
  }

  getSelectedAgent(): number | null {
    return this.selectedAgentId;
  }

  /** Return a copy of the trail for the given agent (oldest-to-newest), or null. */
  getTrail(agentId: number): Vec2[] | null {
    const buf = this.trails.get(agentId);
    if (!buf || buf.size === 0) return null;
    const result: Vec2[] = new Array(buf.size);
    const cap = buf.points.length;
    for (let i = 0; i < buf.size; i++) {
      const p = buf.points[(buf.head + i) % cap];
      result[i] = { x: p.x, y: p.y };
    }
    return result;
  }

  update(agents: AgentData[]): void {
    if (!this.enabled) return;

    const activeIds = new Set<number>();
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      activeIds.add(agent.id);

      const maxLen = agent.id === this.selectedAgentId
        ? TRAIL_LENGTH * SELECTED_TRAIL_MULTIPLIER
        : TRAIL_LENGTH;

      let buf = this.trails.get(agent.id);
      if (!buf) {
        buf = { points: new Array(maxLen), head: 0, size: 0 };
        this.trails.set(agent.id, buf);
      }

      // Resize buffer if capacity changed (selection toggled)
      if (buf.points.length !== maxLen) {
        const newPoints: Vec2[] = new Array(maxLen);
        const copyCount = Math.min(buf.size, maxLen);
        // Copy the most recent entries in order
        const startOffset = buf.size - copyCount;
        const oldCap = buf.points.length;
        for (let j = 0; j < copyCount; j++) {
          newPoints[j] = buf.points[(buf.head + startOffset + j) % oldCap];
        }
        buf.points = newPoints;
        buf.head = 0;
        buf.size = copyCount;
      }

      if (buf.size < maxLen) {
        // Buffer not full — append
        const idx = (buf.head + buf.size) % maxLen;
        if (buf.points[idx]) {
          buf.points[idx].x = agent.position.x;
          buf.points[idx].y = agent.position.y;
        } else {
          buf.points[idx] = { x: agent.position.x, y: agent.position.y };
        }
        buf.size++;
      } else {
        // Buffer full — overwrite oldest, O(1)
        const pt = buf.points[buf.head];
        pt.x = agent.position.x;
        pt.y = agent.position.y;
        buf.head = (buf.head + 1) % maxLen;
      }
    }

    // Clean up trails for removed agents
    for (const id of this.trails.keys()) {
      if (!activeIds.has(id)) this.trails.delete(id);
    }
  }

  render(ctx: CanvasRenderingContext2D, world: WorldState, camera: Camera, w: number, h: number): void {
    if (!this.enabled || this.trails.size === 0) return;

    camera.apply(ctx, w, h);
    ctx.lineCap = 'round';

    for (const [id, buf] of this.trails) {
      if (buf.size < 2) continue;

      const isSelected = id === this.selectedAgentId;
      const cap = buf.points.length;

      if (isSelected) {
        // Highlighted trail: thicker, bright white-to-yellow, higher alpha
        ctx.lineWidth = 3.5;
        for (let i = 1; i < buf.size; i++) {
          const prev = buf.points[(buf.head + i - 1) % cap];
          const curr = buf.points[(buf.head + i) % cap];
          const t = i / buf.size;
          const alpha = t * 0.9;
          const r = 255;
          const g = Math.round(200 + t * 55);
          const b = Math.round(80 + t * 175);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.stroke();
        }
      } else {
        // Normal trail: thin, cyan, lower alpha
        ctx.lineWidth = 1.5;
        for (let i = 1; i < buf.size; i++) {
          const prev = buf.points[(buf.head + i - 1) % cap];
          const curr = buf.points[(buf.head + i) % cap];
          const alpha = (i / buf.size) * 0.4;
          ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.stroke();
        }
      }
    }
  }

  clear(): void {
    this.trails.clear();
  }
}
