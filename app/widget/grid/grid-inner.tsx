"use client";
import "./grid.css";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type KPIConf = {
  label: string;
  table: string;
  view?: string;
  formula?: string;
  dateField?: string;
  redDays?: number;
  target?: string;
  targetBlank?: boolean;
  showDateInfo?: boolean;
  modal?: boolean;
  detailUrl?: string;
  bereich?: string;
  filterField?: string;
  personen?: string[];
  logicType?: string; 
  statusLogic?: string; 
  field?: string;

  // 👉 NEU für Pipeline-Widgets
  leadTarget?: string;       // Zielwert, z.B. "10"
  leadThreshold?: string;    // Mindestwert, z.B. "5"
};

type ApiResp = {
  count: number;
  maxAgeDays: number;
  status: "green" | "amber" | "red" | "gray";
  value?: string | number | null;
};

function Card({ conf, data, err }: { conf: KPIConf; data?: ApiResp; err?: string }) {
  const simpleMode = conf.logicType === "Nur zählen";

  const parseNum = (val?: string) => {
    if (!val) return undefined;
    const num = parseInt(val, 10);
    return isNaN(num) ? undefined : num;
  };

  const leadTarget = parseNum(conf.leadTarget);
  const leadThreshold = parseNum(conf.leadThreshold);

  // --- Hintergrundfarbe ---
  let bg = "#FFD54F"; // default gelb
  if (conf.statusLogic === "pipeline" && data && leadTarget && leadThreshold) {
    if (data.count < leadThreshold) {
      bg = "#E57373"; // rot
    } else if (data.count < leadTarget) {
      bg = "#FFD54F"; // orange
    } else {
      bg = "#9EB384"; // grün
    }
  } else if (simpleMode) {
    bg = "#f4f4f4";
  } else {
    const color = err ? "red" : data?.status || "amber";
    if (color === "green") bg = "#9EB384";
    else if (color === "red") bg = "#E57373";
    else if (color === "gray") bg = "#e0e0e0";
  }

  // --- Subtext ---
  let sub = "";
  if (err) {
    sub = err;
  } else if (!data) {
    sub = "Lade...";
  } else if (!simpleMode) {
    if (conf.statusLogic === "pipeline" && leadTarget && leadThreshold) {
      if (data.count < leadTarget) {
        const diff = leadTarget - data.count;
        sub = `Dir fehlen nur noch ${diff} bis zum Ziel von ${leadTarget}`;
      } else {
        sub = `Ziel von ${leadTarget} erreicht`;
      }
    } else {
      // Standard-Widgets
      if (conf.showDateInfo !== false) {
        if (data.status === "green") sub = "Alles erledigt";
        else if (data.status === "red") sub = `Älteste offen: ${data.maxAgeDays} Tage`;
        else if (data.status !== "gray") sub = `Offene: bis ${data.maxAgeDays} Tage`;
      }
    }
  }

  // --- Value ---
  let valueDisplay: string | number = err ? "!" : data ? (data.value ?? data.count ?? "…") : "…";
  if (!err && data && data.value !== undefined && data.value !== null) {
    if (typeof data.value === "number" && conf.label.toLowerCase().includes("kosten")) {
      valueDisplay = `€${data.value.toFixed(2)}`;
    }
  }

  return (
    <div
      className="card"
      style={{ background: bg, color: simpleMode ? "#333" : "#fff" }}
    >
      <div className="card-title">{conf.label}</div>
      <div className="card-value">{valueDisplay}</div>
      {sub && <div className="card-sub">{sub}</div>}
    </div>
  );
}

export default function GridInner() {
  const sp = useSearchParams();
  const presetKey = sp.get("preset") || "vertrieb";

  const [items, setItems] = useState<{ conf: KPIConf; data?: ApiResp; err?: string }[]>([]);
  const [confs, setConfs] = useState<KPIConf[]>([]);

  // Widgets laden
  useEffect(() => {
    fetch(`/api/widgets?preset=${presetKey}`)
      .then((r) => r.json())
      .then((data: KPIConf[]) => {
        if (!Array.isArray(data) || !data.length) {
          setItems([{ conf: { label: "Config fehlt", table: "—" }, err: "config oder preset ungültig" }]);
          return;
        }
        setConfs(data);
      })
      .catch((e) => {
        setItems([{ conf: { label: "Fehler beim Laden", table: "—" }, err: String(e) }]);
      });
  }, [presetKey]);

  // Daten pro Widget laden
  useEffect(() => {
    if (!confs.length) return;
    setItems(confs.map((c) => ({ conf: c })));

    confs.forEach((c, i) => {
      const u = new URL("/api/kpi", window.location.origin);
      u.searchParams.set("table", c.table);
      if (c.view) u.searchParams.set("view", c.view);
      if (c.formula) u.searchParams.set("formula", c.formula);
      if (c.dateField) u.searchParams.set("dateField", c.dateField);
      if (c.redDays) u.searchParams.set("redDays", String(c.redDays));
      if (c.field) u.searchParams.set("field", c.field);
      if (c.statusLogic) u.searchParams.set("statusLogic", c.statusLogic);
      if (c.thresholdLow) u.searchParams.set("thresholdLow", c.thresholdLow);
      if (c.thresholdMid) u.searchParams.set("thresholdMid", c.thresholdMid);
      if (c.thresholdHigh) u.searchParams.set("thresholdHigh", c.thresholdHigh);

      fetch(u.toString())
        .then((r) => r.json())
        .then((data: ApiResp) =>
          setItems((prev) => prev.map((p, idx) => (idx === i ? { conf: c, data } : p)))
        )
        .catch((e) =>
          setItems((prev) => prev.map((p, idx) => (idx === i ? { conf: c, err: String(e) } : p)))
        );
    });
  }, [confs]);

  return (
    <div id="kpi-root" data-iframe-height>
      <div className="grid-container">
        {items.map((it, idx) => (
          <Card key={idx} {...it} />
        ))}
      </div>
    </div>
  );
}
