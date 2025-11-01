"use client";

import { useEffect, useRef } from "react";

export default function Stars() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const draw = () => {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const { innerWidth: w, innerHeight: h } = window;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Grid step matches CSS dot density desire
      const step = 8; // px between grid points
      const maxRadius = 1.4; // px for gradient radius

      // Deterministic pseudo-random for stable layout across renders
      const rand = (x: number, y: number) => {
        const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
        return s - Math.floor(s);
      };

      for (let gy = 0, y = step / 2; y < h; y += step, gy++) {
        for (let gx = 0, x = step / 2; x < w; x += step, gx++) {
          const r = rand(gx, gy);

          // 30% fully opaque
          const isOpaque = r < 0.3;
          const base = isOpaque ? 1.0 : 0.15 + rand(gx + 7, gy + 9) * 0.55; // 0.15-0.70

          // Small stars with soft falloff
          const radius = 0.6 + rand(gx + 19, gy + 23) * 0.5; // 0.6 - 1.1 px core
          const falloff = Math.min(maxRadius, radius * 2.6);

          const grad = ctx.createRadialGradient(x, y, 0, x, y, falloff);
          grad.addColorStop(0, `rgba(255,255,255,${base})`);
          grad.addColorStop(0.5, `rgba(255,255,255,${base * 0.5})`);
          grad.addColorStop(1, `rgba(255,255,255,0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, falloff, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    draw();
    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
      aria-hidden
    />
  );
}



