"use client";

export const dynamic = "force-dynamic";
export const revalidate = false;          // ✅ boolean, NICHT {}
export const fetchCache = "force-no-store";

import Script from "next/script";
import { Suspense } from "react";
import GridInner from "./grid-inner";

export default function Page() {
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/iframe-resizer/js/iframeResizer.contentWindow.min.js"
        strategy="beforeInteractive"
      />
      <Suspense fallback={<div style={{padding:16,textAlign:"center"}}>Lade Dashboard…</div>}>
        <GridInner />
      </Suspense>
    </>
  );
}
