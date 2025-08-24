"use client";

import { Suspense } from "react";
import GridInner from "./grid-inner";

export default function GridPage() {
  return (
    <Suspense fallback={<div style={{ padding: 16, textAlign: "center" }}>Lade Dashboard…</div>}>
      <GridInner />
    </Suspense>
  );
}
