import type { WorldState } from '../../engine/core/types';
import { Camera } from '../camera/Camera';

export class OverlayLayer {
  private selectionStart: { x: number; y: number } | null = null;
  private selectionEnd: { x: number; y: number } | null = null;
  private cursorPos: { x: number; y: number } | null = null;
  private cursorMode: string = 'select';
  private dirty = false;

  setSelection(start: { x: number; y: number } | null, end: { x: number; y: number } | null): void {
    this.selectionStart = start;
    this.selectionEnd = end;
    this.dirty = true;
  }

  setCursor(pos: { x: number; y: number } | null, mode: string): void {
    this.cursorPos = pos;
    this.cursorMode = mode;
    this.dirty = true;
  }

  render(ctx: CanvasRenderingContext2D, world: WorldState, camera: Camera, w: number, h: number): void {
    if (!this.dirty) return;
    this.dirty = false;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    camera.apply(ctx, w, h);

    // Selection box
    if (this.selectionStart && this.selectionEnd) {
      const sx = Math.min(this.selectionStart.x, this.selectionEnd.x);
      const sy = Math.min(this.selectionStart.y, this.selectionEnd.y);
      const sw = Math.abs(this.selectionEnd.x - this.selectionStart.x);
      const sh = Math.abs(this.selectionEnd.y - this.selectionStart.y);

      ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
      ctx.fillRect(sx, sy, sw, sh);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(sx, sy, sw, sh);
      ctx.setLineDash([]);
    }

    // Cursor feedback
    if (this.cursorPos) {
      const { x, y } = this.cursorPos;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;

      if (this.cursorMode === 'addAgent') {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.stroke();
      } else if (this.cursorMode === 'addHazard') {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.beginPath();
        ctx.arc(x, y, 40, 0, Math.PI * 2);
        ctx.stroke();
      } else if (this.cursorMode === 'addAttractor') {
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
        ctx.beginPath();
        ctx.arc(x, y, 40, 0, Math.PI * 2);
        ctx.stroke();
      } else if (this.cursorMode === 'erase') {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Crosshair
        ctx.beginPath();
        ctx.moveTo(x - 8, y);
        ctx.lineTo(x + 8, y);
        ctx.moveTo(x, y - 8);
        ctx.lineTo(x, y + 8);
        ctx.stroke();
      }
    }
  }

  forceRedraw(): void {
    this.dirty = true;
  }
}
