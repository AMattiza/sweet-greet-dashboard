"use client";

import { Suspense } from "react";
import GridInner from "./grid-inner";

// optional, aber empfehlenswert: verhindert Prerender/ISR
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function GridPage() {
  return (
    <Suspense fallback={<div style={{ padding: 16, textAlign: "center" }}>Lade Dashboard…</div>}>
      <GridInner />
    </Suspense>
  );
}
