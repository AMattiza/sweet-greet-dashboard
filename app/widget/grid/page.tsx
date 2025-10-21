"use client";
import { Suspense } from "react";
import Script from "next/script";
import "./grid.css";
import GridInner from "./grid-inner";

function GridPageContent() {
  return (
    <>
      {/* Initialisierung: Lizenz + moderne Optionen (mit verzögerter Aktivierung) */}
      <Script id="iframe-resizer-init" strategy="afterInteractive">
        {`
          // Warte kurz, bis React vollständig gerendert ist
          window.addEventListener("load", function() {
            setTimeout(function() {
              window.iframeResizer = {
                license: 'GPLv3',
                heightCalculationMethod: 'auto',
                checkOrigin: false,      // erlaubt Softr / Fremddomain
                log: false,              // deaktiviert Debug-Logs
                warningTimeout: 0,       // verhindert dauerhafte Warnungen
                resizeFrom: 'child',     // saubere Höhenanpassung vom iFrame
                sizeHeight: true,
                tolerance: 5,
                minHeight: 100           // verhindert Fehler "height too small"
              };
            }, 300); // kleine Verzögerung für React/Suspense-Render
          });
        `}
      </Script>

      {/* Child-Skript (muss exakt die gleiche Version wie im Parent sein) */}
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
    <Suspense fallback={<div>Lade...</div>}>
      <GridPageContent />
    </Suspense>
  );
}
