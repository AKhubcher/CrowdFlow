import { useRef, useCallback, useEffect } from 'react';
import { CanvasContainer } from '../../components/canvas/CanvasContainer';
import type { SimulationController } from '../../bridge/SimulationController';
import type { InteractionMode } from '../../engine/core/types';
import { createAgent } from '../../engine/core/Agent';
import { addWall, addExit, addHazard, addAttractor, removeEntity } from '../../engine/core/World';

interface SimCanvasProps {
  controller: SimulationController;
  mode: InteractionMode;
}

export function SimCanvas({ controller, mode }: SimCanvasProps) {
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const isPanning = useRef(false);

  const getWorldPos = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    return controller.renderer.camera.screenToWorld(sx, sy, rect.width, rect.height);
  }, [controller]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const worldPos = getWorldPos(e);

    // Middle mouse or space+click for panning
    if (e.button === 1) {
      isPanning.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (e.button !== 0) return;

    dragging.current = true;
    dragStart.current = worldPos;

    if (mode === 'addAgent') {
      const world = controller.getWorld();
      world.agents.push(createAgent(worldPos.x, worldPos.y));
    } else if (mode === 'addHazard') {
      addHazard(controller.getWorld(), worldPos.x, worldPos.y, 40, 1);
      controller.renderer.environmentLayer.forceRedraw();
      controller.engine.flowField.markDirty();
    } else if (mode === 'addAttractor') {
      addAttractor(controller.getWorld(), worldPos.x, worldPos.y, 60, 1);
      controller.renderer.environmentLayer.forceRedraw();
    } else if (mode === 'erase') {
      eraseAt(worldPos.x, worldPos.y);
    }
  }, [controller, mode, getWorldPos]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const worldPos = getWorldPos(e);

    if (isPanning.current) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      controller.renderer.camera.pan(-dx, -dy);
      dragStart.current = { x: e.clientX, y: e.clientY };
      controller.renderer.environmentLayer.forceRedraw();
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
      } else if (mode === 'addAgent') {
        // Spray agents while dragging
        if (Math.random() < 0.3) {
          controller.getWorld().agents.push(createAgent(worldPos.x, worldPos.y));
        }
      } else if (mode === 'select') {
        controller.renderer.overlayLayer.setSelection(dragStart.current, worldPos);
      }
    }
  }, [controller, mode, getWorldPos]);

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
  }, [controller, mode, getWorldPos]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    controller.renderer.camera.zoomAt(factor, sx, sy, rect.width, rect.height);
    controller.renderer.environmentLayer.forceRedraw();
  }, [controller]);

  const eraseAt = useCallback((x: number, y: number) => {
    const world = controller.getWorld();
    const eraseRadius = 15;
    const eraseRadiusSq = eraseRadius * eraseRadius;

    // Remove agents near cursor
    world.agents = world.agents.filter(a => {
      const dx = a.position.x - x;
      const dy = a.position.y - y;
      return dx * dx + dy * dy > eraseRadiusSq;
    });

    // Remove hazards
    for (let i = world.hazards.length - 1; i >= 0; i--) {
      const h = world.hazards[i];
      const dx = h.x - x;
      const dy = h.y - y;
      if (dx * dx + dy * dy < eraseRadiusSq + h.radius * h.radius) {
        world.hazards.splice(i, 1);
        controller.renderer.environmentLayer.forceRedraw();
      }
    }

    // Remove attractors
    for (let i = world.attractors.length - 1; i >= 0; i--) {
      const a = world.attractors[i];
      const dx = a.x - x;
      const dy = a.y - y;
      if (dx * dx + dy * dy < eraseRadiusSq + a.radius * a.radius) {
        world.attractors.splice(i, 1);
        controller.renderer.environmentLayer.forceRedraw();
      }
    }
  }, [controller]);

  const cursorClass = mode === 'select' ? 'cursor-default' :
    mode === 'erase' ? 'cursor-crosshair' : 'cursor-crosshair';

  return (
    <div
      className={`flex-1 ${cursorClass}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onWheel={onWheel}
      onContextMenu={e => e.preventDefault()}
    >
      <CanvasContainer controller={controller} className="w-full h-full" />
    </div>
  );
}
