"use client";
import Script from "next/script";
import { Suspense } from "react";
import GridInner from "./grid-inner";

export default function GridPage() {
  return (
    <>
      {/* iFrame-Resizer Child-Script */}
      <Script
        src="https://cdn.jsdelivr.net/npm/iframe-resizer/js/iframeResizer.contentWindow.min.js"
        strategy="beforeInteractive"
      />
      <Suspense fallback={<div style={{ padding: 16, textAlign: "center" }}>Lade…</div>}>
        <GridInner />
      </Suspense>
    </>
  );
}
