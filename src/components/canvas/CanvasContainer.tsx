import { useRef, useEffect } from 'react';
import { SimulationController } from '../../bridge/SimulationController';
import { useResizeObserver } from '../../hooks/useResizeObserver';

interface CanvasContainerProps {
  controller: SimulationController;
  className?: string;
}

export function CanvasContainer({ controller, className = '' }: CanvasContainerProps) {
  const [containerRef, size] = useResizeObserver<HTMLDivElement>();
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([null, null, null, null]);

  useEffect(() => {
    const canvases = canvasRefs.current.filter((c): c is HTMLCanvasElement => c !== null);
    if (canvases.length === 4) {
      controller.renderer.attach(canvases);
    }
  }, [controller]);

  useEffect(() => {
    if (size.width > 0 && size.height > 0) {
      controller.renderer.resize(size.width, size.height);
      // Center camera on world
      const world = controller.getWorld();
      controller.renderer.camera.setPosition(world.width / 2, world.height / 2);
    }
  }, [controller, size]);

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
          ref={el => { canvasRefs.current[i] = el; }}
          style={{ ...layerStyle, zIndex: i }}
        />
      ))}
    </div>
  );
}
