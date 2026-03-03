export class Camera {
  x = 0;
  y = 0;
  zoom = 1;
  private targetX = 0;
  private targetY = 0;
  private targetZoom = 1;
  private smoothing = 0.1;

  pan(dx: number, dy: number): void {
    this.targetX += dx / this.zoom;
    this.targetY += dy / this.zoom;
  }

  zoomAt(factor: number, screenX: number, screenY: number, canvasW: number, canvasH: number): void {
    const newZoom = Math.max(0.2, Math.min(5, this.targetZoom * factor));
    // Zoom toward cursor
    const worldX = (screenX - canvasW / 2) / this.zoom + this.x;
    const worldY = (screenY - canvasH / 2) / this.zoom + this.y;
    this.targetZoom = newZoom;
    this.targetX = worldX - (screenX - canvasW / 2) / newZoom;
    this.targetY = worldY - (screenY - canvasH / 2) / newZoom;
  }

  setPosition(x: number, y: number): void {
    this.targetX = x;
    this.targetY = y;
    this.x = x;
    this.y = y;
  }

  setZoom(z: number): void {
    this.targetZoom = z;
    this.zoom = z;
  }

  update(): void {
    this.x += (this.targetX - this.x) * this.smoothing;
    this.y += (this.targetY - this.y) * this.smoothing;
    this.zoom += (this.targetZoom - this.zoom) * this.smoothing;
  }

  apply(ctx: CanvasRenderingContext2D, canvasW: number, canvasH: number): void {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(canvasW / 2, canvasH / 2);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.x, -this.y);
  }

  screenToWorld(sx: number, sy: number, canvasW: number, canvasH: number): { x: number; y: number } {
    return {
      x: (sx - canvasW / 2) / this.zoom + this.x,
      y: (sy - canvasH / 2) / this.zoom + this.y,
    };
  }

  reset(): void {
    this.targetX = 0;
    this.targetY = 0;
    this.targetZoom = 1;
  }
}
