import { Engine } from '../engine/core/Engine';
import { WorldState, SimulationStats } from '../engine/core/types';
import { createWorld } from '../engine/core/World';
import { FIXED_DT } from '../engine/core/constants';
import { Renderer } from '../renderer/Renderer';

export class SimulationController {
  engine: Engine;
  renderer: Renderer;

  private running = false;
  private speed = 1;
  private accumulator = 0;
  private lastTime = 0;
  private rafId = 0;
  private fps = 0;
  private frameCount = 0;
  private fpsTime = 0;

  constructor(world?: WorldState) {
    this.engine = new Engine(world ?? createWorld());
    this.renderer = new Renderer();
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.fpsTime = this.lastTime;
    this.frameCount = 0;
    this.loop();
  }

  stop(): void {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  private loop = (): void => {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this.loop);

    const now = performance.now();
    let deltaTime = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // Cap delta to avoid spiral of death
    if (deltaTime > 0.1) deltaTime = 0.1;

    // FPS counter
    this.frameCount++;
    if (now - this.fpsTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTime = now;
    }

    // Fixed timestep accumulator
    this.accumulator += deltaTime * this.speed;
    while (this.accumulator >= FIXED_DT) {
      this.engine.step(FIXED_DT);
      this.accumulator -= FIXED_DT;
    }

    // Render
    this.renderer.render(this.engine.world, this.engine.flowField);
  };

  setSpeed(speed: number): void {
    this.speed = speed;
  }

  getSpeed(): number {
    return this.speed;
  }

  isRunning(): boolean {
    return this.running;
  }

  stepOnce(): void {
    this.engine.step(FIXED_DT);
    this.renderer.render(this.engine.world, this.engine.flowField);
  }

  getStats(): SimulationStats {
    const stats = this.engine.getStats();
    stats.fps = this.fps;
    return stats;
  }

  reset(world?: WorldState): void {
    this.stop();
    this.engine = new Engine(world ?? createWorld());
    this.accumulator = 0;
    // Re-center camera on new world
    this.renderer.camera.setPosition(this.engine.world.width / 2, this.engine.world.height / 2);
    this.renderer.camera.setZoom(1);
    this.renderer.environmentLayer.forceRedraw();
    this.renderer.render(this.engine.world, this.engine.flowField);
  }

  getWorld(): WorldState {
    return this.engine.world;
  }

  destroy(): void {
    this.stop();
    this.renderer.destroy();
  }
}
