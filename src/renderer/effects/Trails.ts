import type { AgentData, WorldState, Vec2 } from '../../engine/core/types';
import { TRAIL_LENGTH, TRAIL_FADE } from '../../engine/core/constants';
import { Camera } from '../camera/Camera';

/** Trail length multiplier for a selected agent (shows longer history). */
const SELECTED_TRAIL_MULTIPLIER = 4;

export class Trails {
  private trails: Map<number, Vec2[]> = new Map();
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

  /** Return a copy of the trail for the given agent, or null. */
  getTrail(agentId: number): Vec2[] | null {
    const trail = this.trails.get(agentId);
    return trail ? [...trail] : null;
  }

  update(agents: AgentData[]): void {
    if (!this.enabled) return;

    const activeIds = new Set<number>();
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      activeIds.add(agent.id);

      let trail = this.trails.get(agent.id);
      if (!trail) {
        trail = [];
        this.trails.set(agent.id, trail);
      }

      trail.push({ x: agent.position.x, y: agent.position.y });
      const maxLen = agent.id === this.selectedAgentId
        ? TRAIL_LENGTH * SELECTED_TRAIL_MULTIPLIER
        : TRAIL_LENGTH;
      if (trail.length > maxLen) {
        trail.shift();
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

    for (const [id, trail] of this.trails) {
      if (trail.length < 2) continue;

      const isSelected = id === this.selectedAgentId;

      if (isSelected) {
        // Highlighted trail: thicker, bright white-to-yellow, higher alpha
        ctx.lineWidth = 3.5;
        for (let i = 1; i < trail.length; i++) {
          const t = i / trail.length;
          const alpha = t * 0.9;
          // Gradient from warm yellow at tail to bright white at head
          const r = Math.round(255);
          const g = Math.round(200 + t * 55);
          const b = Math.round(80 + t * 175);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
          ctx.lineTo(trail[i].x, trail[i].y);
          ctx.stroke();
        }
      } else {
        // Normal trail: thin, cyan, lower alpha
        ctx.lineWidth = 1.5;
        for (let i = 1; i < trail.length; i++) {
          const alpha = (i / trail.length) * 0.4;
          ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
          ctx.lineTo(trail[i].x, trail[i].y);
          ctx.stroke();
        }
      }
    }
  }

  clear(): void {
    this.trails.clear();
  }
}
