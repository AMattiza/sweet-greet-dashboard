"use client";
import "./grid.css";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { KPIConf } from "../api/widgets/types";

type ApiResp = { 
  count: number; 
  maxAgeDays: number; 
  status: "green"|"amber"|"red" 
};

function Card({conf, data, err}:{conf:KPIConf; data?:ApiResp; err?:string}) {
  let bg = "";
  let textColor = "#fff";

  // 👉 Neutraler Stil für "Nur zählen"
  if (conf.logicType === "Nur zählen") {
    bg = "#F7F7F7";      
    textColor = "#333";  
  } else {
    const color = err ? "red" : data?.status || "amber";
    bg = color==="green" ? "#9EB384" : color==="red" ? "#E57373" : "#FFD54F";
    textColor = "#fff";
  }

  const sub = err 
    ? err 
    : !data 
      ? "Lade..." 
      : conf.showDateInfo===false 
        ? "" 
        : conf.logicType === "Nur zählen" 
          ? "" // keine Zusatzinfo bei Nur zählen
          : data.status==="green" 
            ? "Alles erledigt" 
            : data.status==="red" 
              ? `Älteste offen: ${data.maxAgeDays} Tage` 
              : `Offene: bis ${data.maxAgeDays} Tage`;

  const card = (
    <div className="card" style={{ background: bg, color: textColor }}>
      <div className="card-title">{conf.label}</div>
      <div className="card-value">{err ? "!" : data ? data.count : "…"}</div>
      {sub && <div className="card-sub">{sub}</div>}
    </div>
  );

  return conf.target
    ? <a href={conf.target} target={conf.targetBlank===false?"_self":"_blank"} rel="noreferrer" style={{ textDecoration:"none" }}>{card}</a>
    : card;
}

export default function GridInner() {
  const sp = useSearchParams();
  const b64 = sp.get("config");
  const presetKey = sp.get("preset") || "vertrieb";

  const [items, setItems] = useState<{ conf: KPIConf; data?: ApiResp; err?: string }[]>([]);

  const [confs, setConfs] = useState<KPIConf[]>([]);

  // 👉 Widgets von API holen
  useEffect(() => {
    async function load() {
      try {
        const url = new URL("/api/widgets", window.location.origin);
        if (presetKey) url.searchParams.set("preset", presetKey);
        const res = await fetch(url.toString());
        const data = await res.json();
        setConfs(data);
      } catch (e) {
        console.error("❌ Fehler beim Laden der Widgets:", e);
        setConfs([]);
      }
    }
    load();
  }, [presetKey, b64]);

  useEffect(() => {
    if (!confs.length) {
      setItems([{ conf: { label: "Config fehlt", table: "—" }, err: "config oder preset ungültig" }]);
      return;
    }

    setItems(confs.map((c) => ({ conf: c })));

    confs.forEach((c, i) => {
      const u = new URL("/api/kpi", window.location.origin);
      u.searchParams.set("table", c.table);
      if (c.view) u.searchParams.set("view", c.view);
      if (c.formula) u.searchParams.set("formula", c.formula);
      if (c.dateField) u.searchParams.set("dateField", c.dateField);
      if (c.redDays) u.searchParams.set("redDays", c.redDays.toString());

      fetch(u.toString())
        .then((r) => r.json())
        .then((data: ApiResp) => 
          setItems(prev => prev.map((p,idx)=> idx===i? {conf:c,data}:p))
        )
        .catch((e) => 
          setItems(prev => prev.map((p,idx)=> idx===i? {conf:c,err:String(e)}:p))
        );
    });
  }, [confs]);

  return (
    <div id="kpi-root" data-iframe-height>
      <div className="grid-container">
        {items.map((it, idx) => <Card key={idx} {...it} />)}
      </div>
    </div>
  );
}
