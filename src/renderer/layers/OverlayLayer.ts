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

      // Fill
      ctx.fillStyle = 'rgba(6, 182, 212, 0.06)';
      ctx.fillRect(sx, sy, sw, sh);
      // Border
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(sx, sy, sw, sh);
      ctx.setLineDash([]);
      // Corner marks
      const markLen = Math.min(8, sw / 4, sh / 4);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      const markCorners = [
        [sx, sy, 1, 1], [sx + sw, sy, -1, 1],
        [sx, sy + sh, 1, -1], [sx + sw, sy + sh, -1, -1],
      ];
      for (const [cx, cy, dx, dy] of markCorners) {
        ctx.beginPath();
        ctx.moveTo(cx + dx * markLen, cy);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx, cy + dy * markLen);
        ctx.stroke();
      }
    }

    // Cursor feedback
    if (this.cursorPos) {
      const { x, y } = this.cursorPos;

      if (this.cursorMode === 'addAgent') {
        // Agent placement — pulsing circle
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.stroke();
        // Outer ring
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.stroke();
      } else if (this.cursorMode === 'addWall' || this.cursorMode === 'addExit') {
        // Wall/exit — crosshair with dot
        ctx.fillStyle = this.cursorMode === 'addWall'
          ? 'rgba(148, 163, 184, 0.6)' : 'rgba(16, 185, 129, 0.6)';
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = this.cursorMode === 'addWall'
          ? 'rgba(148, 163, 184, 0.3)' : 'rgba(16, 185, 129, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - 12, y); ctx.lineTo(x - 4, y);
        ctx.moveTo(x + 4, y); ctx.lineTo(x + 12, y);
        ctx.moveTo(x, y - 12); ctx.lineTo(x, y - 4);
        ctx.moveTo(x, y + 4); ctx.lineTo(x, y + 12);
        ctx.stroke();
      } else if (this.cursorMode === 'addHazard') {
        // Hazard — danger circle
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(x, y, 40, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        // Inner dot
        ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.cursorMode === 'addAttractor') {
        // Attractor — magnetic rings
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(x, y, 60, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(139, 92, 246, 0.5)';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.cursorMode === 'erase') {
        // Erase — red circle with X
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.stroke();
        // X inside
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - 5, y - 5); ctx.lineTo(x + 5, y + 5);
        ctx.moveTo(x + 5, y - 5); ctx.lineTo(x - 5, y + 5);
        ctx.stroke();
      } else {
        // Select — minimal crosshair
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - 10, y); ctx.lineTo(x - 3, y);
        ctx.moveTo(x + 3, y); ctx.lineTo(x + 10, y);
        ctx.moveTo(x, y - 10); ctx.lineTo(x, y - 3);
        ctx.moveTo(x, y + 3); ctx.lineTo(x, y + 10);
        ctx.stroke();
      }
    }
  }

  forceRedraw(): void {
    this.dirty = true;
  }
}
