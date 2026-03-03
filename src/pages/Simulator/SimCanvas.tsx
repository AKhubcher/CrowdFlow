import { useRef, useCallback, useEffect } from 'react';
import { CanvasContainer } from '../../components/canvas/CanvasContainer';
import type { SimulationController } from '../../bridge/SimulationController';
import type { InteractionMode } from '../../engine/core/types';
import type { SelectionSet } from '../../renderer/layers/OverlayLayer';
import { createAgent } from '../../engine/core/Agent';
import { addWall, addExit, addHazard, addAttractor } from '../../engine/core/World';

interface ClipboardData {
  agents: Array<{ x: number; y: number; vx: number; vy: number }>;
  walls: Array<{ ax: number; ay: number; bx: number; by: number }>;
  exits: Array<{ ax: number; ay: number; bx: number; by: number }>;
  hazards: Array<{ x: number; y: number; radius: number; intensity: number }>;
  attractors: Array<{ x: number; y: number; radius: number; strength: number }>;
  centerX: number;
  centerY: number;
}

interface SimCanvasProps {
  controller: SimulationController;
  mode: InteractionMode;
}

export function SimCanvas({ controller, mode }: SimCanvasProps) {
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const lastScreenPos = useRef({ x: 0, y: 0 });
  const selection = useRef<SelectionSet | null>(null);
  const clipboard = useRef<ClipboardData | null>(null);
  const lastCursorWorld = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const clearSelection = useCallback(() => {
    selection.current = null;
    controller.renderer.overlayLayer.setSelected(null);
    controller.renderOnce();
  }, [controller]);

  const getWorldPos = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    return controller.renderer.camera.screenToWorld(sx, sy, rect.width, rect.height);
  }, [controller]);

  const computeSelection = useCallback((start: { x: number; y: number }, end: { x: number; y: number }) => {
    const world = controller.getWorld();
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);

    const inBox = (px: number, py: number) => px >= minX && px <= maxX && py >= minY && py <= maxY;

    const agentIds = new Set<number>();
    for (const a of world.agents) {
      if (inBox(a.position.x, a.position.y)) agentIds.add(a.id);
    }

    const wallIds = new Set<number>();
    for (const w of world.walls) {
      if (inBox(w.ax, w.ay) || inBox(w.bx, w.by) || inBox((w.ax + w.bx) / 2, (w.ay + w.by) / 2)) {
        wallIds.add(w.id);
      }
    }

    const exitIds = new Set<number>();
    for (const e of world.exits) {
      if (inBox(e.ax, e.ay) || inBox(e.bx, e.by) || inBox((e.ax + e.bx) / 2, (e.ay + e.by) / 2)) {
        exitIds.add(e.id);
      }
    }

    const hazardIds = new Set<number>();
    for (const h of world.hazards) {
      if (inBox(h.x, h.y)) hazardIds.add(h.id);
    }

    const attractorIds = new Set<number>();
    for (const a of world.attractors) {
      if (inBox(a.x, a.y)) attractorIds.add(a.id);
    }

    const sel: SelectionSet = { agentIds, wallIds, exitIds, hazardIds, attractorIds };
    const totalSelected = agentIds.size + wallIds.size + exitIds.size + hazardIds.size + attractorIds.size;
    if (totalSelected === 0) return null;
    return sel;
  }, [controller]);

  const deleteSelection = useCallback(() => {
    const sel = selection.current;
    if (!sel) return;
    const world = controller.getWorld();
    let envChanged = false;

    if (sel.agentIds.size > 0) {
      world.agents = world.agents.filter(a => !sel.agentIds.has(a.id));
    }
    if (sel.wallIds.size > 0) {
      world.walls = world.walls.filter(w => !sel.wallIds.has(w.id));
      envChanged = true;
    }
    if (sel.exitIds.size > 0) {
      world.exits = world.exits.filter(e => !sel.exitIds.has(e.id));
      envChanged = true;
    }
    if (sel.hazardIds.size > 0) {
      world.hazards = world.hazards.filter(h => !sel.hazardIds.has(h.id));
      envChanged = true;
    }
    if (sel.attractorIds.size > 0) {
      world.attractors = world.attractors.filter(a => !sel.attractorIds.has(a.id));
      envChanged = true;
    }

    if (envChanged) {
      controller.renderer.environmentLayer.forceRedraw();
      controller.engine.flowField.markDirty();
    }
    clearSelection();
  }, [controller, clearSelection]);

  const copySelection = useCallback(() => {
    const sel = selection.current;
    if (!sel) return;
    const world = controller.getWorld();

    const agents = world.agents
      .filter(a => sel.agentIds.has(a.id))
      .map(a => ({ x: a.position.x, y: a.position.y, vx: a.velocity.x, vy: a.velocity.y }));
    const walls = world.walls
      .filter(w => sel.wallIds.has(w.id))
      .map(w => ({ ax: w.ax, ay: w.ay, bx: w.bx, by: w.by }));
    const exits = world.exits
      .filter(e => sel.exitIds.has(e.id))
      .map(e => ({ ax: e.ax, ay: e.ay, bx: e.bx, by: e.by }));
    const hazards = world.hazards
      .filter(h => sel.hazardIds.has(h.id))
      .map(h => ({ x: h.x, y: h.y, radius: h.radius, intensity: h.intensity }));
    const attractors = world.attractors
      .filter(a => sel.attractorIds.has(a.id))
      .map(a => ({ x: a.x, y: a.y, radius: a.radius, strength: a.strength }));

    // Compute center of selection for offset calculation on paste
    let sumX = 0, sumY = 0, count = 0;
    for (const a of agents) { sumX += a.x; sumY += a.y; count++; }
    for (const w of walls) { sumX += (w.ax + w.bx) / 2; sumY += (w.ay + w.by) / 2; count++; }
    for (const e of exits) { sumX += (e.ax + e.bx) / 2; sumY += (e.ay + e.by) / 2; count++; }
    for (const h of hazards) { sumX += h.x; sumY += h.y; count++; }
    for (const a of attractors) { sumX += a.x; sumY += a.y; count++; }

    clipboard.current = {
      agents, walls, exits, hazards, attractors,
      centerX: count > 0 ? sumX / count : 0,
      centerY: count > 0 ? sumY / count : 0,
    };
  }, [controller]);

  const pasteClipboard = useCallback(() => {
    const clip = clipboard.current;
    if (!clip) return;
    const world = controller.getWorld();
    const cursor = lastCursorWorld.current;
    const offsetX = cursor.x - clip.centerX;
    const offsetY = cursor.y - clip.centerY;
    let envChanged = false;

    for (const a of clip.agents) {
      world.agents.push(createAgent(a.x + offsetX, a.y + offsetY, a.vx, a.vy));
    }
    for (const w of clip.walls) {
      addWall(world, w.ax + offsetX, w.ay + offsetY, w.bx + offsetX, w.by + offsetY);
      envChanged = true;
    }
    for (const e of clip.exits) {
      addExit(world, e.ax + offsetX, e.ay + offsetY, e.bx + offsetX, e.by + offsetY);
      envChanged = true;
    }
    for (const h of clip.hazards) {
      addHazard(world, h.x + offsetX, h.y + offsetY, h.radius, h.intensity);
      envChanged = true;
    }
    for (const a of clip.attractors) {
      addAttractor(world, a.x + offsetX, a.y + offsetY, a.radius, a.strength);
      envChanged = true;
    }

    if (envChanged) {
      controller.renderer.environmentLayer.forceRedraw();
      controller.engine.flowField.markDirty();
    }
    controller.renderOnce();
  }, [controller]);

  // Keyboard handlers for selection actions
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && selection.current) {
        e.preventDefault();
        deleteSelection();
      } else if (e.key === 'c' && (e.ctrlKey || e.metaKey) && selection.current) {
        e.preventDefault();
        copySelection();
      } else if (e.key === 'v' && (e.ctrlKey || e.metaKey) && clipboard.current) {
        e.preventDefault();
        pasteClipboard();
      } else if (e.key === 'Escape' && selection.current) {
        clearSelection();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [deleteSelection, copySelection, pasteClipboard, clearSelection]);

  const eraseAt = useCallback((x: number, y: number) => {
    const world = controller.getWorld();
    const eraseRadius = 20;
    const eraseRadiusSq = eraseRadius * eraseRadius;
    let envChanged = false;

    world.agents = world.agents.filter(a => {
      const dx = a.position.x - x;
      const dy = a.position.y - y;
      return dx * dx + dy * dy > eraseRadiusSq;
    });

    for (let i = world.walls.length - 1; i >= 0; i--) {
      const w = world.walls[i];
      const wdx = w.bx - w.ax;
      const wdy = w.by - w.ay;
      const lenSq = wdx * wdx + wdy * wdy;
      let t = lenSq > 0.0001 ? ((x - w.ax) * wdx + (y - w.ay) * wdy) / lenSq : 0;
      t = Math.max(0, Math.min(1, t));
      const cx = w.ax + t * wdx;
      const cy = w.ay + t * wdy;
      const ddx = x - cx;
      const ddy = y - cy;
      if (ddx * ddx + ddy * ddy < eraseRadiusSq) {
        world.walls.splice(i, 1);
        envChanged = true;
      }
    }

    for (let i = world.exits.length - 1; i >= 0; i--) {
      const ex = world.exits[i];
      const edx = ex.bx - ex.ax;
      const edy = ex.by - ex.ay;
      const lenSq = edx * edx + edy * edy;
      let t = lenSq > 0.0001 ? ((x - ex.ax) * edx + (y - ex.ay) * edy) / lenSq : 0;
      t = Math.max(0, Math.min(1, t));
      const cx = ex.ax + t * edx;
      const cy = ex.ay + t * edy;
      const ddx = x - cx;
      const ddy = y - cy;
      if (ddx * ddx + ddy * ddy < eraseRadiusSq) {
        world.exits.splice(i, 1);
        envChanged = true;
      }
    }

    for (let i = world.hazards.length - 1; i >= 0; i--) {
      const h = world.hazards[i];
      const dx = h.x - x;
      const dy = h.y - y;
      if (dx * dx + dy * dy < (h.radius + eraseRadius) * (h.radius + eraseRadius)) {
        world.hazards.splice(i, 1);
        envChanged = true;
      }
    }

    for (let i = world.attractors.length - 1; i >= 0; i--) {
      const a = world.attractors[i];
      const dx = a.x - x;
      const dy = a.y - y;
      if (dx * dx + dy * dy < (a.radius + eraseRadius) * (a.radius + eraseRadius)) {
        world.attractors.splice(i, 1);
        envChanged = true;
      }
    }

    if (envChanged) {
      controller.renderer.environmentLayer.forceRedraw();
      controller.engine.flowField.markDirty();
    }
    controller.renderOnce();
  }, [controller]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const worldPos = getWorldPos(e);

    // Middle mouse or right-click for panning
    if (e.button === 1 || e.button === 2) {
      isPanning.current = true;
      lastScreenPos.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (e.button !== 0) return;

    dragging.current = true;
    dragStart.current = worldPos;

    if (mode === 'addAgent') {
      controller.getWorld().agents.push(createAgent(worldPos.x, worldPos.y));
      controller.renderOnce();
    } else if (mode === 'addHazard') {
      addHazard(controller.getWorld(), worldPos.x, worldPos.y, 40, 1);
      controller.renderer.environmentLayer.forceRedraw();
      controller.engine.flowField.markDirty();
      controller.renderOnce();
    } else if (mode === 'addAttractor') {
      addAttractor(controller.getWorld(), worldPos.x, worldPos.y, 60, 1);
      controller.renderer.environmentLayer.forceRedraw();
      controller.renderOnce();
    } else if (mode === 'erase') {
      eraseAt(worldPos.x, worldPos.y);
    } else if (mode === 'select') {
      // Clear previous selection on new drag start
      clearSelection();
    }
  }, [controller, mode, getWorldPos, eraseAt, clearSelection]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const worldPos = getWorldPos(e);
    lastCursorWorld.current = worldPos;

    if (isPanning.current) {
      const dx = e.clientX - lastScreenPos.current.x;
      const dy = e.clientY - lastScreenPos.current.y;
      controller.renderer.camera.pan(-dx, -dy);
      lastScreenPos.current = { x: e.clientX, y: e.clientY };
      controller.renderer.environmentLayer.forceRedraw();
      controller.renderOnce();
      return;
    }

    // Update overlay cursor
    controller.renderer.overlayLayer.setCursor(worldPos, mode);

    if (dragging.current) {
      if (mode === 'addWall' || mode === 'addExit') {
        controller.renderer.uiLayer.setWallPreview({
          ax: dragStart.current.x, ay: dragStart.current.y,
          bx: worldPos.x, by: worldPos.y,
        });
        controller.renderOnce();
      } else if (mode === 'addAgent') {
        if (Math.random() < 0.3) {
          controller.getWorld().agents.push(createAgent(worldPos.x, worldPos.y));
        }
        controller.renderOnce();
      } else if (mode === 'erase') {
        eraseAt(worldPos.x, worldPos.y);
      } else if (mode === 'select') {
        controller.renderer.overlayLayer.setSelection(dragStart.current, worldPos);
        controller.renderOnce();
      }
    } else {
      controller.renderOnce();
    }
  }, [controller, mode, getWorldPos, eraseAt]);

  const onMouseUp = useCallback((e: React.MouseEvent) => {
    if (isPanning.current) {
      isPanning.current = false;
      return;
    }

    if (!dragging.current) return;
    dragging.current = false;

    const worldPos = getWorldPos(e);
    controller.renderer.uiLayer.setWallPreview(null);
    controller.renderer.overlayLayer.setSelection(null, null);

    const dx = worldPos.x - dragStart.current.x;
    const dy = worldPos.y - dragStart.current.y;
    const dragLen = Math.sqrt(dx * dx + dy * dy);

    if (mode === 'addWall' && dragLen > 10) {
      addWall(controller.getWorld(), dragStart.current.x, dragStart.current.y, worldPos.x, worldPos.y);
      controller.renderer.environmentLayer.forceRedraw();
      controller.engine.flowField.markDirty();
    } else if (mode === 'addExit' && dragLen > 10) {
      addExit(controller.getWorld(), dragStart.current.x, dragStart.current.y, worldPos.x, worldPos.y);
      controller.renderer.environmentLayer.forceRedraw();
      controller.engine.flowField.markDirty();
    } else if (mode === 'select' && dragLen > 5) {
      // Compute selection from drag box
      const sel = computeSelection(dragStart.current, worldPos);
      selection.current = sel;
      controller.renderer.overlayLayer.setSelected(sel);
    }
    controller.renderOnce();
  }, [controller, mode, getWorldPos, computeSelection]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    controller.renderer.camera.zoomAt(factor, sx, sy, rect.width, rect.height);
    controller.renderer.environmentLayer.forceRedraw();
    controller.renderOnce();
  }, [controller]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 cursor-crosshair"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={() => { dragging.current = false; isPanning.current = false; }}
      onWheel={onWheel}
      onContextMenu={e => e.preventDefault()}
    >
      <CanvasContainer controller={controller} className="w-full h-full" />
    </div>
  );
}
