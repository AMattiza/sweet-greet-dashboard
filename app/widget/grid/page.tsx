"use client";

import { Suspense, useEffect } from "react";
import Script from "next/script";
import "./grid.css";
import GridInner from "./grid-inner";

function GridPageContent() {
  useEffect(() => {
    const parentIFrame = (window as any).parentIFrame;

    // 1️⃣  Sofortige erste Größenanpassung
    parentIFrame?.resize?.();

    // 2️⃣  Beobachte Layout-Änderungen im Child (z. B. Grid-Breakpoints)
    const ro = new ResizeObserver(() => parentIFrame?.resize?.());
    ro.observe(document.body);

    // 3️⃣  Reagiere auf Fenster- und Sichtbarkeitsänderungen
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
      {/* 1️⃣ iFrame-Resizer-Konfiguration */}
      <Script id="iframe-resizer-init" strategy="afterInteractive">
        {`
          window.addEventListener("load", function() {
            setTimeout(function() {
              window.iframeResizer = {
                license: 'GPLv3',
                checkOrigin: false,
                log: false,
                sizeHeight: true,
                resizeFrom: 'child',
                warningTimeout: 0,
                heightCalculationMethod: 'auto', // moderne Methode
                tolerance: 10,
                minHeight: 120,
              };

              const anyWindow = window;
              if (anyWindow.parentIFrame && typeof anyWindow.parentIFrame.resize === "function") {
                anyWindow.parentIFrame.resize(); // statt size()
              }
            }, 300);
          });
        `}
      </Script>

      {/* 2️⃣ iFrame-Resizer-Child-Script */}
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
    <Suspense
      fallback={<div style={{ textAlign: "center", padding: "2rem" }}>Lade Dashboard…</div>}
    >
      <GridPageContent />
    </Suspense>
  );
}
