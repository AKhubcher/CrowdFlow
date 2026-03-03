import { useRef, useEffect, useState } from 'react';

export function SpatialHashDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [agentCount, setAgentCount] = useState(200);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = 500, h = 300;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const cellSize = 50;
    const agents: Array<{ x: number; y: number; vx: number; vy: number }> = [];
    for (let i = 0; i < agentCount; i++) {
      agents.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
      });
    }

    const ctx = canvas.getContext('2d')!;
    let rafId: number;

    const render = () => {
      rafId = requestAnimationFrame(render);

      // Update positions
      for (const a of agents) {
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
        a.x = Math.max(0, Math.min(w, a.x));
        a.y = Math.max(0, Math.min(h, a.y));
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Grid
      if (showGrid) {
        // Count agents per cell
        const cols = Math.ceil(w / cellSize);
        const rows = Math.ceil(h / cellSize);
        const counts = new Float32Array(cols * rows);
        for (const a of agents) {
          const cx = Math.floor(a.x / cellSize);
          const cy = Math.floor(a.y / cellSize);
          if (cx >= 0 && cx < cols && cy >= 0 && cy < rows) {
            counts[cy * cols + cx]++;
          }
        }

        // Draw cells with density color
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const count = counts[y * cols + x];
            if (count > 0) {
              const intensity = Math.min(count / 10, 1);
              ctx.fillStyle = `rgba(99, 102, 241, ${intensity * 0.3})`;
              ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
          }
        }

        ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= w; x += cellSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y <= h; y += cellSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      }

      // Agents
      ctx.fillStyle = '#06b6d4';
      ctx.globalAlpha = 0.7;
      for (const a of agents) {
        ctx.beginPath();
        ctx.arc(a.x, a.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [showGrid, agentCount]);

  return (
    <div className="glass rounded-xl p-6 max-w-[560px] mx-auto">
      <h3 className="text-lg font-semibold text-accent-purple mb-4 text-center">Spatial Hash Grid</h3>
      <p className="text-sm text-white/40 mb-4 text-center">
        The grid partitions space into cells. Neighbor queries only check overlapping cells,
        reducing O(n{'\u00B2'}) to O(n{'\u00B7'}k). Brighter cells indicate higher agent density.
      </p>
      <div className="flex items-center justify-center gap-4 mb-4">
        <label className="flex items-center gap-2 text-xs text-white/50 cursor-pointer">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={e => setShowGrid(e.target.checked)}
            className="accent-accent-purple"
          />
          Show Grid
        </label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">Agents:</span>
          {[100, 200, 500, 1000].map(n => (
            <button
              key={n}
              onClick={() => setAgentCount(n)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                agentCount === n
                  ? 'bg-accent-purple/20 text-accent-purple'
                  : 'bg-white/5 text-white/40'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <canvas ref={canvasRef} className="rounded-lg bg-surface-950 block mx-auto" />
    </div>
  );
}
