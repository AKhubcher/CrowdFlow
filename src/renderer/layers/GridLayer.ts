import { Camera } from '../camera/Camera';
import { SPATIAL_CELL_SIZE } from '../../engine/core/constants';

export class GridLayer {
  private enabled = false;

  setEnabled(on: boolean): void {
    this.enabled = on;
  }

  render(ctx: CanvasRenderingContext2D, worldW: number, worldH: number, camera: Camera, w: number, h: number): void {
    if (!this.enabled) return;

    camera.apply(ctx, w, h);

    ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
    ctx.lineWidth = 0.5;

    const cellSize = SPATIAL_CELL_SIZE;
    for (let x = 0; x <= worldW; x += cellSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, worldH);
      ctx.stroke();
    }
    for (let y = 0; y <= worldH; y += cellSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(worldW, y);
      ctx.stroke();
    }
  }
}
