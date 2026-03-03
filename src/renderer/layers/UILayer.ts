import { Camera } from '../camera/Camera';

export class UILayer {
  private wallPreview: { ax: number; ay: number; bx: number; by: number } | null = null;
  private dirty = false;

  setWallPreview(preview: { ax: number; ay: number; bx: number; by: number } | null): void {
    this.wallPreview = preview;
    this.dirty = true;
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera, w: number, h: number): void {
    if (!this.dirty) return;
    this.dirty = false;

    const dpr = camera.dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    camera.apply(ctx, w, h);

    if (this.wallPreview) {
      const { ax, ay, bx, by } = this.wallPreview;

      ctx.shadowColor = 'rgba(148, 163, 184, 0.5)';
      ctx.shadowBlur = 6;
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 4]);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.setLineDash([]);

      // Endpoints
      ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
      ctx.beginPath();
      ctx.arc(ax, ay, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(bx, by, 4, 0, Math.PI * 2);
      ctx.fill();

      // Length indicator
      const dx = bx - ax;
      const dy = by - ay;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 20) {
        const mx = (ax + bx) / 2;
        const my = (ay + by) / 2;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`${Math.round(len)}px`, mx, my - 6);
      }
    }
  }

  forceRedraw(): void {
    this.dirty = true;
  }
}
