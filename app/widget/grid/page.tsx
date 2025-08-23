"use client";
import { Suspense } from "react";
import GridInner from "./grid-inner";

export default function GridPage(){
  return <Suspense fallback={<div style={{padding:16,fontFamily:'Inter,system-ui'}}>Lade…</div>}>
    <GridInner/>
  </Suspense>;
}
