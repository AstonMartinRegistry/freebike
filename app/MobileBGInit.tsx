"use client";

import { useEffect } from "react";

export default function MobileBGInit() {
  useEffect(() => {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
    if (!isMobile) return;

    const h = window.innerHeight;
    const w = window.innerWidth;
    const root = document.documentElement;
    root.style.setProperty("--initial-vh", `${h}px`);
    root.style.setProperty("--initial-vw", `${w}px`);
    const bg = document.getElementById("fixed-bg") as HTMLElement | null;
    if (bg) {
      bg.style.height = `${h}px`;
      bg.style.width = `${w}px`;
    }
  }, []);

  return null;
}


