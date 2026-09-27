'use client';

import { useEffect } from 'react';

export function AmbientMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(pointer: fine)');
    let frame = 0;

    const commit = (x: number, y: number) => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        root.style.setProperty('--pointer-x', `${x}px`);
        root.style.setProperty('--pointer-y', `${y}px`);
      });
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!reducedMotion.matches && finePointer.matches) commit(event.clientX, event.clientY);
    };

    const onScroll = () => {
      if (reducedMotion.matches) return;
      const depth = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 2.5);
      root.style.setProperty('--scroll-depth', depth.toFixed(3));
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return null;
}
