"use client";

import { Suspense, useEffect } from "react";
import Script from "next/script";
import "./grid.css";
import GridInner from "./grid-inner";

function GridPageContent() {
  // Fallback/Extra-Trigger für Resizes (siehe Schritt 2)
  useEffect(() => {
    const parentIFrame = (window as any).parentIFrame;

    // Sofort nach Hydration einmal messen
    parentIFrame?.size?.();

    // Reagieren auf Layout-Änderungen im Child (Grid breakpoints etc.)
    const ro = new ResizeObserver(() => parentIFrame?.size?.());
    ro.observe(document.body);

    // Zusätzliche Events
    const onResize = () => parentIFrame?.size?.();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    document.addEventListener("visibilitychange", onResize);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      document.removeEventListener("visibilitychange", onResize);
    };
  }, []);

  return (
    <>
      {/* 1) KONFIG – rein in pures JS, ohne TS-Keywords */}
      <Script id="ifr-config" strategy="beforeInteractive">
        {`
          window.iFrameResizer = {
            log: false,
            checkOrigin: false,
            sizeHeight: true,
            resizeFrom: 'child',
            heightCalculationMethod: 'max',
            tolerance: 10,
            minHeight: 120
          };
        `}
      </Script>

      {/* 2) CHILD-SKRIPT – vor der Interaktion laden */}
      <Script
        id="ifr-child"
        src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.9/js/iframeResizer.contentWindow.min.js"
        strategy="beforeInteractive"
        crossOrigin="anonymous"
      />

      <GridInner />
    </>
  );
}

export default function GridPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "2rem" }}>Lade Dashboard…</div>}>
      <GridPageContent />
    </Suspense>
  );
}
