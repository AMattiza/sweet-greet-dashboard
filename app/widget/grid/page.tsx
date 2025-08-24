"use client";
import { Suspense } from "react";
import Script from "next/script";
import GridInner from "./grid-inner";

function GridPageContent() {
  return (
    <>
      {/* Initialisierung: Lizenz + auto height */}
      <Script id="iframe-resizer-init" strategy="beforeInteractive">
        {`
          window.iframeResizer = {
            license: 'GPLv3',
            heightCalculationMethod: 'auto'
          };
        `}
      </Script>

      {/* Child-Skript (muss exakt die gleiche Version wie im Parent haben) */}
      <Script
        src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.9/js/iframeResizer.contentWindow.min.js"
        strategy="beforeInteractive"
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
