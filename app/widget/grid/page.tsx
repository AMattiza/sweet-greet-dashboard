"use client";

import { Suspense, useEffect } from "react";
import Script from "next/script";
import dynamic from "next/dynamic";
import "./grid.css";

const GridInner = dynamic(() => import("./grid-inner"), { ssr: false });

function GridPageContent() {
  useEffect(() => {
    const parentIFrame = (window as any).parentIFrame;
    const triggerResize = () => parentIFrame?.resize?.();
    triggerResize();

    const ro = new ResizeObserver(triggerResize);
    ro.observe(document.body);

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
      {/* iframe-resizer child script */}
      <Script
        id="iframe-resizer-child"
        src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.9/js/iframeResizer.contentWindow.min.js"
        strategy="beforeInteractive"
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
