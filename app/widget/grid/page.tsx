"use client";
import { Suspense } from "react";
import Script from "next/script";
import "./grid.css";
import GridInner from "./grid-inner";

function GridPageContent() {
  return (
    <>
      {/* Initialisierung: Lizenz + moderne Optionen */}
      <Script id="iframe-resizer-init" strategy="beforeInteractive">
        {`
          window.iframeResizer = {
            license: 'GPLv3',
            heightCalculationMethod: 'auto',
            checkOrigin: false,       // erlaubt Einbettung über Softr / Fremddomain
            log: false,               // deaktiviert Debug-Logs in Konsole
            warningTimeout: 0,        // verhindert wiederholte Warnungen
            resizeFrom: 'child'       // sorgt für saubere Höhenanpassung
          };
        `}
      </Script>

      {/* Einbettung: gleiche Version wie Parent */}
      <Script
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
    <Suspense fallback={<div>Lade...</div>}>
      <GridPageContent />
    </Suspense>
  );
}
