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

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    camera.apply(ctx, w, h);

    if (this.wallPreview) {
      const { ax, ay, bx, by } = this.wallPreview;
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.6)';
      ctx.lineWidth = 4;
      ctx.setLineDash([6, 4]);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  forceRedraw(): void {
    this.dirty = true;
  }
}
