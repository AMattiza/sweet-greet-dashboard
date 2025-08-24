"use client";

import { Suspense } from "react";
import GridInner from "./grid-inner";

export default function Page() {
  return (
    <Suspense fallback={<div style={{padding:16,textAlign:"center"}}>Lade Dashboard…</div>}>
      <GridInner />
    </Suspense>
  );
}
