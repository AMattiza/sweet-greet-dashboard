"use client";

import Script from "next/script";
import GridInner from "./grid-inner";

export default function Page() {
  return (
    <>
      {/* Child-Skript von iframe-resizer – misst Höhe im iFrame */}
      <Script
        src="https://cdn.jsdelivr.net/npm/iframe-resizer/js/iframeResizer.contentWindow.min.js"
        strategy="beforeInteractive"
      />
      <GridInner />
    </>
  );
}
