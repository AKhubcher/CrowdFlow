import { useEffect, useRef } from 'react';

export function useAnimationFrame(callback: (dt: number) => void, active = true): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!active) return;
    let lastTime = performance.now();
    let rafId: number;

    const loop = () => {
      rafId = requestAnimationFrame(loop);
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      callbackRef.current(dt);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [active]);
}
