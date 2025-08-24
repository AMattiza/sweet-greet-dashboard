"use client";

import "./grid.css";
import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { PRESETS, KPIConf } from "./presets";

type ApiResp = { count: number; maxAgeDays: number; status: "green"|"amber"|"red" };

function Card({conf, data, err}:{conf:KPIConf; data?:ApiResp; err?:string}) {
  const color = err ? "red" : data?.status || "amber";
  const bg = color==="green" ? "#9EB384" : color==="red" ? "#E57373" : "#FFD54F";
  const sub = err ? err : !data ? "Lade..." :
    conf.showDateInfo===false ? "" :
    data.status==="green" ? "Alles erledigt" :
    data.status==="red" ? `Älteste offen: ${data.maxAgeDays} Tage` :
    `Offene: bis ${data.maxAgeDays} Tage`;

  const card = (
    <div className="card" style={{background:bg, color:"#fff"}}>
      <div className="card-title">{conf.label}</div>
      <div className="card-value">{err ? "!" : data ? data.count : "…"}</div>
      {sub && <div className="card-sub">{sub}</div>}
    </div>
  );

  return conf.target
    ? <a href={conf.target} target={conf.targetBlank===false?"_self":"_blank"} rel="noreferrer" style={{textDecoration:"none"}}>{card}</a>
    : card;
}

export default function GridInner(){
  const sp = useSearchParams();
  const b64 = sp.get("config");
  const presetKey = sp.get("preset") || "vertrieb";

  const [items,setItems]=useState<{conf:KPIConf;data?:ApiResp;err?:string}[]>([]);
  const gridRef = useRef<HTMLDivElement|null>(null);

  // Konfiguration (URL-Config > Preset)
  const confs = useMemo<KPIConf[]>(()=>{
    if (b64) {
      try { const parsed = JSON.parse(atob(b64)) as KPIConf[]; if (Array.isArray(parsed)&&parsed.length) return parsed; } catch {}
    }
    return PRESETS[presetKey] || [];
  },[b64,presetKey]);

  // Daten laden
  useEffect(()=>{
    if (!confs.length) {
      setItems([{conf:{label:"Config fehlt",table:"—"},err:"config oder preset ungültig"}]);
      return;
    }
    setItems(confs.map(c=>({conf:c})));

    confs.forEach((c,i)=>{
      const u = new URL("/api/kpi", window.location.origin);
      u.searchParams.set("table", c.table);
      if(c.view) u.searchParams.set("view", c.view);
      if(c.formula) u.searchParams.set("formula", c.formula);
      if(c.dateField) u.searchParams.set("dateField", c.dateField);
      if(c.redDays) u.searchParams.set("redDays", c.redDays);
      fetch(u.toString()).then(r=>r.json()).then((data:ApiResp)=>{
        setItems(prev=>{ const copy=[...prev]; copy[i]={conf:c,data}; return copy; });
      }).catch(e=>{
        setItems(prev=>{ const copy=[...prev]; copy[i]={conf:c,err:String(e)}; return copy; });
      });
    });
  },[confs]);

  // Höhe an Softr melden (stabil, ohne externe Libraries)
  useEffect(()=>{
    const postHeight = () => {
      const h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      window.parent.postMessage({ type: "resize-iframe", height: h }, "*");
    };
    postHeight();

    const mo = new MutationObserver(postHeight);
    mo.observe(document.body, { childList:true, subtree:true });

    let ro: ResizeObserver | undefined;
    if ("ResizeObserver" in window && gridRef.current) {
      ro = new ResizeObserver(postHeight);
      ro.observe(gridRef.current);
    }

    const iv = window.setInterval(postHeight, 500); // Fallback

    window.addEventListener("resize", postHeight);
    return ()=>{
      mo.disconnect();
      if (ro && gridRef.current) ro.unobserve(gridRef.current);
      window.removeEventListener("resize", postHeight);
      window.clearInterval(iv);
    };
  },[]);

  return (
    <div className="grid-container" ref={gridRef}>
      {items.map((it,idx)=><Card key={idx} {...it}/>)}
    </div>
  );
}
