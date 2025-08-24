"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PRESETS, KPIConf } from "./presets";
import "./grid.css";

type ApiResp = { 
  count: number; 
  maxAgeDays: number; 
  status: "green"|"amber"|"red"; 
  records?: any[] 
};

function Card({conf, data, err}:{conf:KPIConf; data?:ApiResp; err?:string}) {
  const color = err ? "red" : data?.status || "amber";
  const sub = err 
    ? err 
    : !data 
      ? "Lade..." 
      : !conf.showDateInfo 
        ? "" 
        : data.status==="green"
          ? "Alles erledigt"
          : data.status==="red"
            ? `Älteste offen: ${data.maxAgeDays} Tage`
            : `Offene: bis ${data.maxAgeDays} Tage`;

  const card = (
    <div className={`kpi-card kpi-${color}`}>
      <div className="kpi-title">{conf.label}</div>
      <div className="kpi-value">
        {err ? "!" : data ? data.count : "…"}
      </div>
      <div className="kpi-sub">{sub}</div>
    </div>
  );

  return conf.target ? (
    <a 
      href={conf.target} 
      target={conf.targetBlank===false ? "_self" : "_blank"} 
      rel="noreferrer" 
      className="kpi-link"
    >
      {card}
    </a>
  ) : card;
}

export default function GridInner() {
  const sp = useSearchParams();
  const b64 = sp.get("config");
  const preset = sp.get("preset") || "vertrieb";

  const [items,setItems]=useState<{conf:KPIConf;data?:ApiResp;err?:string}[]>([]);

  useEffect(()=>{
    let confs: KPIConf[] | null = null;
    if (b64) {
      try { confs = JSON.parse(atob(b64)) as KPIConf[]; } catch(e){ /* ignore */ }
    }
    if (!confs) confs = PRESETS[preset] || [];

    if (!confs.length) {
      setItems([{conf:{label:"Config fehlt",table:"x"},err:"config oder preset ungültig"}]);
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

      fetch(u.toString())
        .then(r=>r.json())
        .then(data=>{
          setItems(prev => { 
            const copy=[...prev]; 
            copy[i]={conf:c,data}; 
            return copy; 
          });
        })
        .catch(e=>{
          setItems(prev => { 
            const copy=[...prev]; 
            copy[i]={conf:c,err:String(e)}; 
            return copy; 
          });
        });
    });
  },[b64,preset]);

  // ✅ Iframe-Höhe sauber anpassen
  useEffect(() => {
    const resize = () => {
      const h = document.body.scrollHeight;
      window.parent.postMessage({ type: "resize-iframe", height: h }, "*");
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className="kpi-grid">
      {items.map((it,idx)=>
        <Card key={idx} {...it} />
      )}
    </div>
  );
}
