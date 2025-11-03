import type { ReactNode } from "react";
import StarBG from "./StarBG";
import localFont from "next/font/local";

const mondwest = localFont({
  src: "../mondwest-neuebit-font-1761704288-0/ppmondwest-regular.otf",
  display: "swap",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={mondwest.className}
        style={{
          margin: 0,
          backgroundColor: "#d6eaff", // deeper pastel blue base
        }}
      >
        <div
          id="fixed-bg"
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: -1,
            backgroundImage:
              // white blooms and faint greys, mixed around
              "radial-gradient(900px circle at 14% 18%, rgba(255,255,255,0.75), rgba(255,255,255,0) 55%), " +
              "radial-gradient(780px circle at 84% 24%, rgba(255,255,255,0.68), rgba(255,255,255,0) 58%), " +
              "radial-gradient(720px circle at 26% 78%, rgba(229,231,235,0.28), rgba(229,231,235,0) 60%), " +
              "linear-gradient(180deg, rgba(205,225,255,0.28) 0%, rgba(200,220,255,0.16) 55%, rgba(190,210,245,0.10) 100%)",
            backgroundSize: "auto, auto, auto, auto",
            backgroundRepeat: "no-repeat, no-repeat, no-repeat, no-repeat",
            backgroundPosition: "0 0, 0 0, 0 0, 0 0",
            backgroundBlendMode: "screen, screen, multiply, normal",
            imageRendering: "pixelated",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "fixed",
              inset: 0,
              pointerEvents: "none",
              zIndex: 2,
              backgroundImage: "var(--stars)",
              backgroundSize: "var(--stars-size, auto)",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "0 0",
            }}
          />
          <div
            aria-hidden
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              height: 420,
              pointerEvents: "none",
              zIndex: 1,
              backgroundImage:
                "radial-gradient(400px circle at 50% 104%, \
                  rgba(23,37,84,0.85) 0%, \
                  rgba(23,37,84,0.60) 35%, \
                  rgba(23,37,84,0.35) 55%, \
                  rgba(23,37,84,0.12) 70%, \
                  rgba(23,37,84,0.02) 85%, \
                  rgba(23,37,84,0.00) 92%\
                )",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "50% 100%",
            }}
          />
          <img
            src="/images/whitepixel.png"
            alt=""
            aria-hidden
            style={{
              position: "fixed",
              left: "50%",
              transform: "translateX(calc(-50% - 15px))",
              bottom: -173,
              width: 500,
              height: "auto",
              imageRendering: "pixelated",
              pointerEvents: "none",
              zIndex: 3,
            }}
          />
        </div>
        <StarBG />
        
        <style>{`
          html, body { height: 100%; min-height: 100svh; overflow-x: hidden; overscroll-behavior-x: none; overscroll-behavior-y: auto; }
          body { overscroll-behavior-y: auto; }
          /* Grain overlay via SVG fractal noise */
          body::before {
            content: "";
            position: fixed;
            inset: 0;
            pointer-events: none;
            background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='table' tableValues='0 0.18'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
            opacity: 0.22;
            mix-blend-mode: multiply;
          }

          /* Wavy blue shading inside the sunrise circle */
          body::after {
            content: "";
            position: fixed;
            inset: 0;
            pointer-events: none;
            background-image:
              repeating-linear-gradient( 85deg, rgba(59,130,246,0.10) 0 2px, rgba(59,130,246,0.00) 2px 10px),
              repeating-linear-gradient(-75deg, rgba(30,64,175,0.08) 0 1px, rgba(30,64,175,0.00) 1px 9px);
            background-repeat: no-repeat, no-repeat;
            background-size: 100% 100%, 100% 100%;
            filter: blur(18px);
            opacity: 0.55;
            mix-blend-mode: soft-light;
            /* Confine to the sunrise circle area */
            -webkit-mask-image: radial-gradient(400px circle at 50% 104%, #000 0%, #000 70%, transparent 86%);
            mask-image: radial-gradient(400px circle at 50% 104%, #000 0%, #000 70%, transparent 86%);
            -webkit-mask-repeat: no-repeat;
            mask-repeat: no-repeat;
          }
          
          /* Extra softening layer to eliminate residual banding/lines */
          html::after {
            content: "";
            position: fixed;
            inset: 0;
            pointer-events: none;
            background-image:
              radial-gradient(60% 26% at 50% 100%, rgba(59,130,246,0.18), rgba(59,130,246,0) 70%),
              radial-gradient(90% 42% at 50% 104%, rgba(37,99,235,0.14), rgba(37,99,235,0) 75%);
            filter: blur(140px);
            opacity: 0.28;
            mix-blend-mode: screen;
          }
          
        `}</style>
        {children}
      </body>
    </html>
  );
}


