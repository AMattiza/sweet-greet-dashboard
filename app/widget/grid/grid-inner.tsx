"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PRESETS, KPIConf } from "./presets";

type ApiResp = { count: number; maxAgeDays: number; status: "green"|"amber"|"red" };

function Card({conf, data, err}:{conf:KPIConf; data?:ApiResp; err?:string}) {
  const color = err ? "red" : data?.status || "amber";
  const bg = color==="green"?"#d1f0d5":color==="red"?"#ffd8d6":"#fff3c4";
  const sub = err ? err : !data ? "Lade..." :
    data.status==="green" ? "Alles erledigt" :
    data.status==="red" ? `Älteste offen: ${data.maxAgeDays} Tage` :
    `Offene: bis ${data.maxAgeDays} Tage`;

  const card = (
    <div style={{
      fontFamily:"Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      borderRadius:12,padding:18,minWidth:220,flex:1,background:bg,
      border:"1px solid rgba(0,0,0,0.08)",boxShadow:"0 2px 10px rgba(0,0,0,0.06)",
      color:"#101828",margin:8
    }}>
      <div style={{fontSize:13,opacity:.8,marginBottom:6,fontWeight:500}}>{conf.label}</div>
      <div style={{fontSize:36,fontWeight:700,lineHeight:"40px",marginBottom:6}}>{err ? "!" : data ? data.count : "…"}</div>
      <div style={{fontSize:12,opacity:.8}}>{sub}</div>
    </div>
  );
  return conf.target ? <a href={conf.target} target={conf.targetBlank===false?"_self":"_blank"} rel="noreferrer" style={{textDecoration:"none",flex:1}}>{card}</a> : card;
}

export default function GridInner(){
  const sp = useSearchParams();
  const b64 = sp.get("config");
  const preset = sp.get("preset") || "vertrieb";

  const [items,setItems]=useState<{conf:KPIConf;data?:ApiResp;err?:string}[]>([]);

  useEffect(()=>{
    let confs: KPIConf[] | null = null;

    if (b64) {
      try { confs = JSON.parse(atob(b64)) as KPIConf[]; } catch(e){ /* fall back */ }
    }
    if (!confs) {
      confs = PRESETS[preset] || [];
    }

    if (!confs.length) {
      setItems([{conf:{label:"Config fehlt",table:"x"},err:"config oder preset ungültig"}]);
      return;
    }

    setItems(confs.map(c=>({conf:c})));

    confs.forEach((c,i)=>{
      const u = new URL(window.location.origin + "/api/kpi");
      u.searchParams.set("table", c.table);
      if(c.view) u.searchParams.set("view", c.view);
      if(c.formula) u.searchParams.set("formula", c.formula);
      if(c.dateField) u.searchParams.set("dateField", c.dateField);
      if(c.redDays) u.searchParams.set("redDays", c.redDays);
      fetch(u.toString()).then(r=>r.json()).then(data=>{
        setItems(prev => { const copy=[...prev]; copy[i]={conf:c,data}; return copy; });
      }).catch(e=>{
        setItems(prev => { const copy=[...prev]; copy[i]={conf:c,err:String(e)}; return copy; });
      });
    });
  },[b64,preset]);

  return <div style={{display:"flex",flexWrap:"wrap",justifyContent:"space-between"}}>{items.map((it,idx)=><Card key={idx} {...it}/>)}</div>;
}
