"use client";
import Script from "next/script";
import GridInner from "./grid-inner";

export default function GridPage() {
  return (
    <>
      {/* Pflicht: Child-Script für automatische Höhe */}
      <Script
        src="https://cdn.jsdelivr.net/npm/iframe-resizer/js/iframeResizer.contentWindow.min.js"
        strategy="beforeInteractive"
      />
      <GridInner />
    </>
  );
}
