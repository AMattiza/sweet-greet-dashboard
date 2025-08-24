"use client";
import { Suspense } from "react";
import Script from "next/script";
import GridInner from "./grid-inner";

function GridPageContent() {
  return (
    <>
      {/* Child-Script für iFrameResizer (muss zur Parent-Version passen) */}
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
