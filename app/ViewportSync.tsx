"use client";

import { useEffect } from "react";

export default function ViewportSync() {
  useEffect(() => {
    const apply = () => {
      const vh = Math.ceil(window.innerHeight);
      const vw = Math.ceil(window.innerWidth);
      const root = document.documentElement;
      root.style.setProperty("--vhpx", `${vh}px`);
      const bg = document.getElementById("fixed-bg") as HTMLDivElement | null;
      if (bg) {
        bg.style.height = `${vh}px`;
        bg.style.width = `${vw}px`;
      }
    };
    apply();
    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);
    if ((window as any).visualViewport?.addEventListener) {
      (window as any).visualViewport.addEventListener("resize", apply);
    }
    return () => {
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
      if ((window as any).visualViewport?.removeEventListener) {
        (window as any).visualViewport.removeEventListener("resize", apply);
      }
    };
  }, []);

  return null;
}


