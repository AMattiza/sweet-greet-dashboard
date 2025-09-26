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
  thresholdLow?: string;
  thresholdMid?: string;
  thresholdHigh?: string;
};

type ApiResp = {
  count: number;
  maxAgeDays: number;
  status: "green" | "amber" | "red" | "gray";
  value?: string | number | null;
};

function Card({ conf, data, err }: { conf: KPIConf; data?: ApiResp; err?: string }) {
  const simpleMode = conf.logicType === "Nur zählen";

  // --- Thresholds sicher parsen ---
  const parseThreshold = (val?: string) => {
    if (!val) return undefined;
    const num = parseInt(val, 10);
    return isNaN(num) ? undefined : num;
  };

  const low = parseThreshold(conf.thresholdLow);
  const high = parseThreshold(conf.thresholdHigh);

  // --- Hintergrundfarbe ---
  let bg = "#FFD54F"; // Standard gelb
  if (!simpleMode) {
    const color = err ? "red" : data?.status || "amber";
    if (color === "green") bg = "#9EB384";
    else if (color === "red") bg = "#E57373";
    else if (color === "gray") bg = "#e0e0e0";
    else bg = "#FFD54F";
  } else {
    bg = "#f4f4f4";
  }

  // 👉 Pipeline: Farbe überschreiben je nach Thresholds
  if (conf.statusLogic === "pipeline" && data) {
    if (low !== undefined && data.count < low) {
      bg = "#E57373"; // rot
    } else if (high !== undefined && data.count >= high) {
      bg = "#9EB384"; // grün
    } else {
      bg = "#FFD54F"; // orange
    }
  }

  // --- Subtext ---
  const sub = err
    ? err
    : !data
    ? "Lade..."
    : conf.showDateInfo === false
    ? ""
    : simpleMode
    ? ""
    : conf.statusLogic === "pipeline"
    ? (() => {
        if (!data) return "";
        if (low !== undefined && data.count < low) {
          const diff = high !== undefined ? high - data.count : 0;
          return `Schade, nur ${data.count} Leads – Ziel: ${high} (es fehlen ${diff})`;
        }
        if (high !== undefined && data.count >= high) {
          return `Sehr gut, Ziel erreicht: ${data.count} Leads (Ziel: ${high})`;
        }
        return `${data.count} Leads – Ziel: ${high}`;
      })()
    : data.status === "green"
    ? "Alles erledigt"
    : data.status === "red"
    ? `Älteste offen: ${data.maxAgeDays} Tage`
    : data.status === "gray"
    ? ""
    : `Offene: bis ${data.maxAgeDays} Tage`;

  // --- Wertanzeige ---
  let valueDisplay: string | number = err ? "!" : data ? (data.value ?? data.count ?? "…") : "…";
  if (!err && data && data.value !== undefined && data.value !== null) {
    if (typeof data.value === "number" && conf.label.toLowerCase().includes("kosten")) {
      valueDisplay = `€${data.value.toFixed(2)}`;
    }
  }

  // --- Karte ---
  const card = (
    <div
      className="card"
      style={{ background: bg, color: simpleMode || data?.status === "gray" ? "#333" : "#fff" }}
    >
      <div className="card-title">{conf.label}</div>
      <div className="card-value">{valueDisplay}</div>
      {sub && <div className="card-sub">{sub}</div>}
    </div>
  );

  return conf.target ? (
    <a
      href={conf.target}
      target={conf.targetBlank === false ? "_self" : "_blank"}
      rel="noreferrer"
      style={{ textDecoration: "none" }}
    >
      {card}
    </a>
  ) : (
    card
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
