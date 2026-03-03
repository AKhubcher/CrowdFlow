import { useRef, useCallback } from 'react';
import { CanvasContainer } from '../../components/canvas/CanvasContainer';
import type { SimulationController } from '../../bridge/SimulationController';
import type { InteractionMode } from '../../engine/core/types';
import { createAgent } from '../../engine/core/Agent';
import { addWall, addExit, addHazard, addAttractor } from '../../engine/core/World';

interface SimCanvasProps {
  controller: SimulationController;
  mode: InteractionMode;
}

export function SimCanvas({ controller, mode }: SimCanvasProps) {
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const lastScreenPos = useRef({ x: 0, y: 0 });

  const getWorldPos = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    return controller.renderer.camera.screenToWorld(sx, sy, rect.width, rect.height);
  }, [controller]);

  const eraseAt = useCallback((x: number, y: number) => {
    const world = controller.getWorld();
    const eraseRadius = 20;
    const eraseRadiusSq = eraseRadius * eraseRadius;
    let envChanged = false;

    // Remove agents near cursor
    world.agents = world.agents.filter(a => {
      const dx = a.position.x - x;
      const dy = a.position.y - y;
      return dx * dx + dy * dy > eraseRadiusSq;
    });

    // Remove walls near cursor
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

    // Remove exits near cursor
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

    // Remove hazards
    for (let i = world.hazards.length - 1; i >= 0; i--) {
      const h = world.hazards[i];
      const dx = h.x - x;
      const dy = h.y - y;
      if (dx * dx + dy * dy < (h.radius + eraseRadius) * (h.radius + eraseRadius)) {
        world.hazards.splice(i, 1);
        envChanged = true;
      }
    }

    // Remove attractors
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
    // Always render so erased items disappear immediately
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
    }
  }, [controller, mode, getWorldPos, eraseAt]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const worldPos = getWorldPos(e);

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
      // Render cursor overlay even when not dragging
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
    }
    controller.renderOnce();
  }, [controller, mode, getWorldPos]);

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
