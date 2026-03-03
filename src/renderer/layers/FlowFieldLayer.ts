import { FlowField } from '../../engine/pathfinding/FlowField';
import { Camera } from '../camera/Camera';

export class FlowFieldLayer {
  private enabled = false;

  setEnabled(on: boolean): void {
    this.enabled = on;
  }

  render(ctx: CanvasRenderingContext2D, flowField: FlowField, camera: Camera, w: number, h: number): void {
    if (!this.enabled) return;

    camera.apply(ctx, w, h);

    const cols = flowField.getCols();
    const rows = flowField.getRows();
    const res = flowField.getResolution();
    const dirX = flowField.getDirXArray();
    const dirY = flowField.getDirYArray();
    const blocked = flowField.getBlockedArray();
    const dist = flowField.getDistanceArray();

    ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.lineWidth = 0.8;

    for (let y = 0; y < rows; y += 2) {
      for (let x = 0; x < cols; x += 2) {
        const idx = y * cols + x;
        if (blocked[idx] || dist[idx] === Infinity) continue;

        const cx = x * res + res * 0.5;
        const cy = y * res + res * 0.5;
        const dx = dirX[idx];
        const dy = dirY[idx];

        if (dx === 0 && dy === 0) continue;

        const arrowLen = res * 0.7;
        const ex = cx + dx * arrowLen;
        const ey = cy + dy * arrowLen;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        // Arrowhead
        const headLen = 3;
        const angle = Math.atan2(dy, dx);
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - headLen * Math.cos(angle - 0.5), ey - headLen * Math.sin(angle - 0.5));
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - headLen * Math.cos(angle + 0.5), ey - headLen * Math.sin(angle + 0.5));
        ctx.stroke();
      }
    }
  }
}
