"use client";

import { Suspense } from "react";
import Script from "next/script";
import "./grid.css";
import GridInner from "./grid-inner";

/**
 * Lädt das KPI-Grid innerhalb eines Softr-iFrames.
 * Stellt sicher, dass iframe-resizer korrekt initialisiert ist,
 * bevor GridInner rendert und nach Datenupdates Höhe angepasst wird.
 */
function GridPageContent() {
  return (
    <>
      {/* Initialisiert iframe-resizer (Kind-Seite) mit stabiler Konfiguration */}
      <Script id="iframe-resizer-init" strategy="afterInteractive">
        {`
          window.addEventListener("load", function() {
            // Kurze Verzögerung, bis Softr das iFrame wirklich gerendert hat
            setTimeout(function() {
              // Lizenz + Optionen setzen
              window.iframeResizer = {
                license: 'GPLv3',
                checkOrigin: false,
                log: false,
                sizeHeight: true,
                resizeFrom: 'child',
                warningTimeout: 0,
                heightCalculationMethod: 'lowestElement', // stabilste Methode
                tolerance: 10,
                minHeight: 120,
              };

              // Falls das iFrame schon eingebettet ist, sofort ein erstes Resize senden
              const anyWindow = window as any;
              if (anyWindow.parentIFrame && typeof anyWindow.parentIFrame.size === "function") {
                anyWindow.parentIFrame.size();
              }
            }, 300);
          });
        `}
      </Script>

      {/* Script des iframe-resizer (Content Window) */}
      <Script
        src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.9/js/iframeResizer.contentWindow.min.js"
        strategy="afterInteractive"
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
