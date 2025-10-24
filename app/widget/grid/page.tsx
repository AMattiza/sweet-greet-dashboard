"use client";

import { useEffect } from "react";
import Script from "next/script";
import "./grid.css";
import GridInner from "./grid-inner";

export default function GridPage() {
  useEffect(() => {
    const parentIFrame = (window as any).parentIFrame;
    const triggerResize = () => parentIFrame?.resize?.();

    // Sofort beim Laden
    triggerResize();

    // Reaktion auf Layout-Änderungen
    const ro = new ResizeObserver(triggerResize);
    ro.observe(document.body);

    // Browser-Resize
    window.addEventListener("resize", triggerResize);
    window.addEventListener("orientationchange", triggerResize);
    document.addEventListener("visibilitychange", triggerResize);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", triggerResize);
      window.removeEventListener("orientationchange", triggerResize);
      document.removeEventListener("visibilitychange", triggerResize);
    };
  }, []);

  return (
    <>
      {/* iFrame Resizer (child) */}
      <Script
        id="iframe-resizer-child"
        src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.9/js/iframeResizer.contentWindow.min.js"
        strategy="beforeInteractive"
      />

      <GridInner />
    </>
  );
}
