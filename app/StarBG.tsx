"use client";

import { useEffect } from "react";

export default function StarBG() {
  useEffect(() => {
    const draw = () => {
      const w = Math.ceil(window.innerWidth);
      const h = Math.ceil(window.innerHeight);

      // Pixel block size in CSS pixels; higher => blockier look
      const pixelBlock = 3;

      // Render at lower resolution; scale up without smoothing
      const lowW = Math.max(1, Math.floor(w / pixelBlock));
      const lowH = Math.max(1, Math.floor(h / pixelBlock));

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) return;
      ctx.imageSmoothingEnabled = false;

      canvas.width = lowW;
      canvas.height = lowH;
      ctx.clearRect(0, 0, lowW, lowH);

      const rand = (x: number, y: number) => {
        const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
        return s - Math.floor(s);
      };

      const density = 0.26; // probability cell has a star (slightly denser)
      for (let y = 0; y < lowH; y++) {
        for (let x = 0; x < lowW; x++) {
          const r = rand(x, y);
          if (r > density) continue;
          const b = rand(x + 13, y + 17);
          const quant = b < 0.33 ? 0.35 : b < 0.66 ? 0.65 : 1.0;
          ctx.fillStyle = `rgba(255,255,255,${quant})`;
          ctx.fillRect(x, y, 1, 1); // 1x1 low-res pixel -> big block on page
        }
      }

      // Circular fade mask from bottom center (match sunrise circle concept)
      const cx = lowW * 0.5;
      const cy = lowH; // bottom edge
      const r = Math.min(lowW, lowH) * 0.80; // reduce how far out pixels go
      const radial = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      // More gradual, near-linear fade from center to edge
      radial.addColorStop(0.00, "rgba(0,0,0,1.0)");
      radial.addColorStop(0.60, "rgba(0,0,0,0.55)");
      radial.addColorStop(0.80, "rgba(0,0,0,0.28)");
      radial.addColorStop(1.00, "rgba(0,0,0,0.0)");
      ctx.globalCompositeOperation = "destination-in";
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, lowW, lowH);
      ctx.globalCompositeOperation = "source-over";

      const url = canvas.toDataURL("image/png");
      const root = document.documentElement;
      root.style.setProperty("--stars", `url(${url})`);
      root.style.setProperty("--stars-size", `${w}px ${h}px`);
    };

    // Initial render
    draw();

    // Avoid re-drawing on minor viewport-height changes (mobile URL bar show/hide).
    let lastW = window.innerWidth;
    let lastH = window.innerHeight;
    let raf = 0;
    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const curW = window.innerWidth;
        const curH = window.innerHeight;
        // Only redraw if width changes noticeably or height changes a lot (orientation/UI change)
        if (Math.abs(curW - lastW) > 8 || Math.abs(curH - lastH) > 120) {
          lastW = curW;
          lastH = curH;
          draw();
        }
      });
    };

    const onResize = () => schedule();
    const onOrientation = () => {
      // Force redraw on orientation change
      lastW = 0; lastH = 0; schedule();
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onOrientation);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onOrientation);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}


