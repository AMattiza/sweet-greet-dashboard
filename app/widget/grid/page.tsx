"use client";

import { useEffect } from "react";
import Script from "next/script";
import dynamic from "next/dynamic";
import "./grid.css";

const GridInner = dynamic(() => import("./grid-inner"), { ssr: false });

export default function GridPage() {
  useEffect(() => {
    console.group("%c🧭 IFRAME DEBUG", "color: #0af; font-weight: bold;");

    const parentIFrame = (window as any).parentIFrame;

    if (!parentIFrame) {
      console.warn("⚠️ Kein parentIFrame erkannt – Seite läuft wahrscheinlich standalone (nicht in Softr).");
    } else {
      console.log("✅ parentIFrame erkannt:", parentIFrame);
    }

    const triggerResize = (reason: string) => {
      try {
        if (parentIFrame?.resize) {
          parentIFrame.resize();
          console.log(`↕️ Resize ausgeführt (${reason})`);
        } else {
          console.warn("⚠️ parentIFrame.resize() nicht verfügbar");
        }
      } catch (err) {
        console.error("❌ Fehler bei resize()", err);
      }
    };

    // Initial resize
    setTimeout(() => triggerResize("Initial Load"), 400);

    // ResizeObserver für dynamische Höhenänderung
    const ro = new ResizeObserver(() => triggerResize("ResizeObserver"));
    ro.observe(document.body);

    // Browser-Events
    const onResize = () => triggerResize("window.resize");
    const onOrientationChange = () => triggerResize("orientationchange");
    const onVisibility = () => triggerResize("visibilitychange");

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onOrientationChange);
    document.addEventListener("visibilitychange", onVisibility);

    console.log("🟢 GridPage mounted & Observer aktiv");

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onOrientationChange);
      document.removeEventListener("visibilitychange", onVisibility);
      console.log("🟡 GridPage unmounted – Observer entfernt");
      console.groupEnd();
    };
  }, []);

  return (
    <>
      {/* iframe-resizer contentWindow */}
      <Script
        id="iframe-resizer-child"
        src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.9/js/iframeResizer.contentWindow.min.js"
        strategy="beforeInteractive"
        onLoad={() => console.log("📦 iframe-resizer.contentWindow geladen")}
        onError={() => console.error("❌ iframe-resizer.contentWindow konnte nicht geladen werden")}
      />

      <GridInner />
    </>
  );
}
