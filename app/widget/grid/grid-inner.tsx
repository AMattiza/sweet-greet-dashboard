"use client";
import "./grid.css";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { KPIConf } from "../../api/widgets/types";

type ApiResp = { count: number; maxAgeDays: number; status: "green"|"amber"|"red" };

function Card({conf, data, err}:{conf:KPIConf; data?:ApiResp; err?:string}) {
  const color = err ? "red" : data?.status || "amber";

  const sub = err ? err : !data ? "Lade..." :
    conf.showDateInfo === false ? "" :
    data.status === "green" ? "Alles erledigt" :
    data.status === "red" ? `Älteste offen: ${data.maxAgeDays} Tage` :
    `Offene: bis ${data.maxAgeDays} Tage`;

  const card = (
    <div className={`card ${color === "amber" ? "orange" : color}`}>
      <div className="card-title">{conf.label}</div>
      <div className="card-value">{err ? "!" : data ? data.count : "…"}</div>
      {sub && <div className="card-sub">{sub}</div>}
    </div>
  );

  return conf.target
    ? <a href={conf.target} target={conf.targetBlank === false ? "_self" : "_blank"} rel="noreferrer" style={{ textDecoration:"none" }}>{card}</a>
    : card;
}

export default function GridInner() {
  const sp = useSearchParams();
  const presetKey = sp.get("preset") || "vertrieb";

  const [items, setItems] = useState<{ conf: KPIConf; data?: ApiResp; err?: string }[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/widgets?preset=${presetKey}`);
        const confs: KPIConf[] = await res.json();

        if (!confs.length) {
          setItems([{ conf: { label: "Config fehlt", table: "—" }, err: "config oder preset ungültig" }]);
          return;
        }

        setItems(confs.map(c => ({ conf: c })));

        confs.forEach((c, i) => {
          const u = new URL("/api/kpi", window.location.origin);
          u.searchParams.set("table", c.table);
          if (c.view) u.searchParams.set("view", c.view);
          if (c.formula) u.searchParams.set("formula", c.formula);
          if (c.dateField) u.searchParams.set("dateField", c.dateField);
          if (c.redDays) u.searchParams.set("redDays", c.redDays);

          fetch(u.toString())
            .then(r => r.json())
            .then((data: ApiResp) =>
              setItems(prev => prev.map((p, idx) => idx === i ? { conf: c, data } : p))
            )
            .catch(e =>
              setItems(prev => prev.map((p, idx) => idx === i ? { conf: c, err: String(e) } : p))
            );
        });
      } catch (e) {
        console.error("❌ Fehler beim Laden der Presets:", e);
        setItems([{ conf: { label: "Fehler", table: "—" }, err: "API nicht erreichbar" }]);
      }
    }

    load();
  }, [presetKey]);

  return (
    <div id="kpi-root" data-iframe-height>
      <div className="grid-container">
        {items.map((it, idx) => <Card key={idx} {...it} />)}
      </div>
    </div>
  );
}
