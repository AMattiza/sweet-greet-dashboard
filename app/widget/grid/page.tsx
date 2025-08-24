// app/widget/grid/page.tsx
import Script from "next/script";
import GridInner from "./grid-inner";

export default function Page() {
  return (
    <>
      {/* iFrame-Resizer Child-Script: passt Höhe automatisch an */}
      <Script
        src="https://cdn.jsdelivr.net/npm/iframe-resizer/js/iframeResizer.contentWindow.min.js"
        strategy="beforeInteractive"
      />
      <GridInner />
    </>
  );
}
