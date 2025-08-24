"use client";

import Script from "next/script";
import { Suspense } from "react";
import GridInner from "./grid-inner";

// Seite dynamisch ausführen (kein Prerender)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <>
      {/* Child-Script für automatische iFrame-Höhe (iframe-resizer) */}
      <Script
        src="https://cdn.jsdelivr.net/npm/iframe-resizer/js/iframeResizer.contentWindow.min.js"
        strategy="beforeInteractive"
      />

      {/* Suspense-Boundary ist Pflicht für useSearchParams() */}
      <Suspense
        fallback={
          <div style={{
            fontFamily:"Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
            padding:16, textAlign:"center"
          }}>
            Lade Dashboard…
          </div>
        }
      >
        <GridInner />
      </Suspense>
    </>
  );
}
