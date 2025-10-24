"use client";

import { Suspense, useEffect } from "react";
import Script from "next/script";
import "./grid.css";
import GridInner from "./grid-inner";

function GridPageContent() {
  useEffect(() => {
    const parentIFrame = (window as any).parentIFrame;
    parentIFrame?.resize?.();

    const ro = new ResizeObserver(() => parentIFrame?.resize?.());
    ro.observe(document.body);

    const onResize = () => parentIFrame?.resize?.();
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
      {/* 1️⃣ KONFIG zuerst – global verfügbar, bevor das Script geladen wird */}
      <Script id="iframe-resizer-config" strategy="beforeInteractive">
        {`
          window.iframeResizer = {
            license: 'GPLv3',
            checkOrigin: false,
            log: false,
            sizeHeight: true,
            resizeFrom: 'child',
            warningTimeout: 0,
            heightCalculationMethod: 'auto',
            tolerance: 10,
            minHeight: 120,
          };
        `}
      </Script>

      {/* 2️⃣ Danach das Child-Script – liest jetzt direkt obige Config */}
      <Script
        id="ifr-child"
        src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.9/js/iframeResizer.contentWindow.min.js"
        strategy="beforeInteractive"
        crossOrigin="anonymous"
      />

      {/* 3️⃣ Inhalt */}
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
