import { useRef, useEffect, useState, useCallback } from 'react';

export function SpatialHashDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [agentCount, setAgentCount] = useState(200);
  const [useSpatialHash, setUseSpatialHash] = useState(true);
  const [queryMs, setQueryMs] = useState(0);

  // Ref to hold the smoothing buffer so it survives across renders
  // without triggering re-renders itself.
  const smoothingRef = useRef<number[]>([]);

  const pushSmoothed = useCallback((ms: number) => {
    const buf = smoothingRef.current;
    buf.push(ms);
    if (buf.length > 10) buf.shift();
    const avg = buf.reduce((s, v) => s + v, 0) / buf.length;
    setQueryMs(avg);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Reset smoothing buffer when mode / count changes
    smoothingRef.current = [];

    const w = 500, h = 300;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const cellSize = 50;
    const queryRadius = 50;
    const queryRadiusSq = queryRadius * queryRadius;

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

    // --- Spatial hash helpers ---------------------------------------------------

    // Build grid: returns a Map from "col,row" -> index[]
    function buildGrid() {
      const grid = new Map<string, number[]>();
      for (let i = 0; i < agents.length; i++) {
        const a = agents[i];
        const cx = Math.floor(a.x / cellSize);
        const cy = Math.floor(a.y / cellSize);
        const key = `${cx},${cy}`;
        let bucket = grid.get(key);
        if (!bucket) {
          bucket = [];
          grid.set(key, bucket);
        }
        bucket.push(i);
      }
      return grid;
    }

    // Query neighbors via spatial hash for a single agent at (px, py)
    function querySpatial(
      grid: Map<string, number[]>,
      probeIdx: number,
      px: number,
      py: number,
    ): Set<number> {
      const neighbors = new Set<number>();
      const minCx = Math.floor((px - queryRadius) / cellSize);
      const maxCx = Math.floor((px + queryRadius) / cellSize);
      const minCy = Math.floor((py - queryRadius) / cellSize);
      const maxCy = Math.floor((py + queryRadius) / cellSize);

      for (let cy = minCy; cy <= maxCy; cy++) {
        for (let cx = minCx; cx <= maxCx; cx++) {
          const bucket = grid.get(`${cx},${cy}`);
          if (!bucket) continue;
          for (const idx of bucket) {
            if (idx === probeIdx) continue;
            const dx = agents[idx].x - px;
            const dy = agents[idx].y - py;
            if (dx * dx + dy * dy <= queryRadiusSq) {
              neighbors.add(idx);
            }
          }
        }
      }
      return neighbors;
    }

    // Query neighbors via brute force for a single agent
    function queryBrute(probeIdx: number, px: number, py: number): Set<number> {
      const neighbors = new Set<number>();
      for (let i = 0; i < agents.length; i++) {
        if (i === probeIdx) continue;
        const dx = agents[i].x - px;
        const dy = agents[i].y - py;
        if (dx * dx + dy * dy <= queryRadiusSq) {
          neighbors.add(i);
        }
      }
      return neighbors;
    }

    // ---------------------------------------------------------------------------

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

      // --- Neighbor queries for ALL agents ------------------------------------
      // We collect the neighbor set for the probe agent (index 0) for
      // visualization, but we time the full batch so the cost difference
      // between O(n*k) and O(n^2) is visible.

      let probeNeighbors: Set<number>;

      const t0 = performance.now();

      if (useSpatialHash) {
        // Build grid once, query for every agent
        const grid = buildGrid();
        probeNeighbors = querySpatial(grid, 0, agents[0].x, agents[0].y);
        for (let i = 1; i < agents.length; i++) {
          querySpatial(grid, i, agents[i].x, agents[i].y);
        }
      } else {
        // Brute force: query every agent against every other
        probeNeighbors = queryBrute(0, agents[0].x, agents[0].y);
        for (let i = 1; i < agents.length; i++) {
          queryBrute(i, agents[i].x, agents[i].y);
        }
      }

      const t1 = performance.now();
      pushSmoothed(t1 - t0);

      // --- Drawing ------------------------------------------------------------

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Grid overlay
      if (showGrid && useSpatialHash) {
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

      // Draw probe radius circle
      const probe = agents[0];
      ctx.beginPath();
      ctx.arc(probe.x, probe.y, queryRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw agents
      ctx.globalAlpha = 0.7;
      for (let i = 0; i < agents.length; i++) {
        const a = agents[i];
        if (i === 0) {
          // Probe agent
          ctx.fillStyle = '#facc15';
          ctx.globalAlpha = 1;
        } else if (probeNeighbors.has(i)) {
          // Neighbor of probe
          ctx.fillStyle = '#f472b6';
          ctx.globalAlpha = 0.9;
        } else {
          ctx.fillStyle = '#06b6d4';
          ctx.globalAlpha = 0.5;
        }
        ctx.beginPath();
        ctx.arc(a.x, a.y, i === 0 ? 5 : 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [showGrid, agentCount, useSpatialHash, pushSmoothed]);

  return (
    <div className="glass rounded-xl p-6 max-w-[560px] mx-auto">
      <h3 className="text-lg font-semibold text-accent-purple mb-4 text-center">
        Spatial Hash Grid
      </h3>
      <p className="text-sm text-white/40 mb-4 text-center">
        The grid partitions space into cells. Neighbor queries only check overlapping cells,
        reducing O(n{'\u00B2'}) to O(n{'\u00B7'}k). Brighter cells indicate higher agent density.
      </p>

      {/* Controls row */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
        {/* Mode toggle */}
        <div className="flex items-center gap-1 bg-white/5 rounded-md p-0.5">
          <button
            onClick={() => setUseSpatialHash(true)}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              useSpatialHash
                ? 'bg-accent-purple/25 text-accent-purple'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            Spatial Hash
          </button>
          <button
            onClick={() => setUseSpatialHash(false)}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              !useSpatialHash
                ? 'bg-red-500/25 text-red-400'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            Brute Force
          </button>
        </div>

        {/* Show grid checkbox */}
        <label className="flex items-center gap-2 text-xs text-white/50 cursor-pointer">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={e => setShowGrid(e.target.checked)}
            className="accent-accent-purple"
          />
          Show Grid
        </label>

        {/* Agent count */}
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

      {/* Timing readout */}
      <div className="flex items-center justify-center gap-3 mb-3">
        <span
          className={`font-mono text-sm font-semibold ${
            useSpatialHash ? 'text-accent-purple' : 'text-red-400'
          }`}
        >
          Queries: {queryMs.toFixed(1)}ms
        </span>
        <span className="text-[10px] text-white/30">
          ({useSpatialHash ? 'O(n\u00B7k)' : 'O(n\u00B2)'} &mdash; {agentCount} agents)
        </span>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mb-3">
        <span className="flex items-center gap-1.5 text-[10px] text-white/40">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#facc15]" />
          Probe agent
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-white/40">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#f472b6]" />
          Neighbor
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-white/40">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#06b6d4]" />
          Other
        </span>
      </div>

      <canvas ref={canvasRef} className="rounded-lg bg-surface-950 block mx-auto" />
    </div>
  );
}
