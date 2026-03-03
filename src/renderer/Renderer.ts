import type { WorldState } from '../engine/core/types';
import type { FlowField } from '../engine/pathfinding/FlowField';
import { HEATMAP_UPDATE_INTERVAL } from '../engine/core/constants';
import { Camera } from './camera/Camera';
import { EnvironmentLayer } from './layers/EnvironmentLayer';
import { AgentLayer } from './layers/AgentLayer';
import { OverlayLayer } from './layers/OverlayLayer';
import { FlowFieldLayer } from './layers/FlowFieldLayer';
import { GridLayer } from './layers/GridLayer';
import { UILayer } from './layers/UILayer';
import { Trails } from './effects/Trails';
import { Heatmap } from './effects/Heatmap';

export class Renderer {
  camera = new Camera();
  environmentLayer = new EnvironmentLayer();
  agentLayer = new AgentLayer();
  overlayLayer = new OverlayLayer();
  flowFieldLayer = new FlowFieldLayer();
  gridLayer = new GridLayer();
  uiLayer = new UILayer();
  trails = new Trails();
  heatmap = new Heatmap();

  private canvases: HTMLCanvasElement[] = [];
  private contexts: CanvasRenderingContext2D[] = [];
  private frameCount = 0;
  private width = 0;
  private height = 0;

  attach(canvases: HTMLCanvasElement[]): void {
    this.canvases = canvases;
    this.contexts = canvases.map(c => c.getContext('2d')!);
  }

  getWidth(): number { return this.width; }
  getHeight(): number { return this.height; }

  resize(w: number, h: number): void {
    this.width = w;
    this.height = h;
    const dpr = window.devicePixelRatio || 1;
    this.camera.dpr = dpr;
    for (const canvas of this.canvases) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      // DPR scaling is applied per-frame via camera.dpr — no ctx.scale here
    }
    this.environmentLayer.forceRedraw();
    this.overlayLayer.forceRedraw();
    this.uiLayer.forceRedraw();
  }

  render(world: WorldState, flowField: FlowField): void {
    const w = this.width;
    const h = this.height;
    if (w === 0 || h === 0 || this.contexts.length < 4) return;

    this.camera.update();
    this.frameCount++;

    const [bgCtx, heatCtx, agentCtx, uiCtx] = this.contexts;
    const dpr = this.camera.dpr;

    // Layer 0: Environment (only on dirty)
    this.environmentLayer.render(bgCtx, world, this.camera, w, h);

    // Layer 1: Heatmap + flow field + grid + trails
    if (this.frameCount % HEATMAP_UPDATE_INTERVAL === 0) {
      this.heatmap.update(world);
    }
    heatCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    heatCtx.clearRect(0, 0, w, h);
    this.heatmap.render(heatCtx, this.camera, w, h);
    this.flowFieldLayer.render(heatCtx, flowField, this.camera, w, h);
    this.gridLayer.render(heatCtx, world.width, world.height, this.camera, w, h);

    // Trails
    this.trails.update(world.agents);
    this.trails.render(heatCtx, world, this.camera, w, h);

    // Layer 2: Agents
    this.agentLayer.render(agentCtx, world, this.camera, w, h);

    // Layer 3: UI overlay
    this.overlayLayer.render(uiCtx, world, this.camera, w, h);
    this.uiLayer.render(uiCtx, this.camera, w, h);
  }

  destroy(): void {
    this.canvases = [];
    this.contexts = [];
    this.trails.clear();
  }
}
