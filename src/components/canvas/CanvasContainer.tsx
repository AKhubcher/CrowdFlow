import { useRef, useEffect, useState, useCallback } from 'react';
import { SimulationController } from '../../bridge/SimulationController';
import { useResizeObserver } from '../../hooks/useResizeObserver';

interface CanvasContainerProps {
  controller: SimulationController;
  className?: string;
}

export function CanvasContainer({ controller, className = '' }: CanvasContainerProps) {
  const [containerRef, size] = useResizeObserver<HTMLDivElement>();
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([null, null, null, null]);
  const [attached, setAttached] = useState(false);
  const centeredOnce = useRef(false);

  // Re-check attachment whenever a canvas ref is set
  const setCanvasRef = useCallback((index: number, el: HTMLCanvasElement | null) => {
    canvasRefs.current[index] = el;
    const canvases = canvasRefs.current.filter((c): c is HTMLCanvasElement => c !== null);
    if (canvases.length === 4 && !attached) {
      controller.renderer.attach(canvases);
      setAttached(true);
    }
  }, [controller, attached]);

  // Re-attach if controller changes
  useEffect(() => {
    setAttached(false);
    centeredOnce.current = false;
    const canvases = canvasRefs.current.filter((c): c is HTMLCanvasElement => c !== null);
    if (canvases.length === 4) {
      controller.renderer.attach(canvases);
      setAttached(true);
    }
  }, [controller]);

  useEffect(() => {
    if (size.width > 0 && size.height > 0 && attached) {
      controller.renderer.resize(size.width, size.height);
      // Auto-fit world to canvas on first resize
      if (!centeredOnce.current) {
        controller.fitCameraToWorld();
        centeredOnce.current = true;
      }
      // Force a render so the user sees the initial state immediately
      controller.renderer.environmentLayer.forceRedraw();
      controller.renderer.render(controller.engine.world, controller.engine.flowField);
    }
  }, [controller, size, attached]);

  const layerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  };

  return (
    <div ref={containerRef as React.Ref<HTMLDivElement>} className={`relative overflow-hidden ${className}`}>
      {[0, 1, 2, 3].map(i => (
        <canvas
          key={i}
          ref={el => setCanvasRef(i, el)}
          style={{ ...layerStyle, zIndex: i }}
        />
      ))}
    </div>
  );
}
