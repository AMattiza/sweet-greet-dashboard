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
  logicType?: string; // z.B. "Nur zählen" oder "Mit Status"
};

type ApiResp = {
  count: number;
  maxAgeDays: number;
  status: "green" | "amber" | "red";
  value?: string | number | null; // 👉 NEU: Feldwert vom Backend
};

function Card({ conf, data, err }: { conf: KPIConf; data?: ApiResp; err?: string }) {
  const simpleMode = conf.logicType === "Nur zählen";

  let bg = "#FFD54F";
  if (!simpleMode) {
    const color = err ? "red" : data?.status || "amber";
    bg = color === "green" ? "#9EB384" : color === "red" ? "#E57373" : "#FFD54F";
  } else {
    bg = "#f4f4f4";
  }

  const sub = err
    ? err
    : !data
    ? "Lade..."
    : conf.showDateInfo === false
    ? ""
    : simpleMode
    ? ""
    : data.status === "green"
    ? "Alles erledigt"
    : data.status === "red"
    ? `Älteste offen: ${data.maxAgeDays} Tage`
    : `Offene: bis ${data.maxAgeDays} Tage`;

  // 👉 Hier Währungsformatierung einbauen
  let valueDisplay: string | number = err ? "!" : data ? (data.value ?? data.count ?? "…") : "…";

  if (!err && data && data.value !== undefined && data.value !== null) {
    if (typeof data.value === "number" && conf.label.toLowerCase().includes("kosten")) {
      valueDisplay = `€${data.value.toFixed(2)}`;
    }
  }

  const card = (
    <div className="card" style={{ background: bg, color: simpleMode ? "#333" : "#fff" }}>
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

  // Lade Widgets aus API (/api/widgets)
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

  // Lade Daten pro Widget
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

      // 👉 Falls Widget ein Feld direkt anfordert
      if ((c as any).field) u.searchParams.set("field", (c as any).field);

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
