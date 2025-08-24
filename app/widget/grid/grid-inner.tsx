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
  redDays?: string;
  target?: string;
  targetBlank?: boolean;
  showDateInfo?: boolean;
  bereich?: string;
  filterField?: string;
  personen?: string[];
};

type ApiResp = { count: number; maxAgeDays: number; status: "green" | "amber" | "red" };

function Card({ conf, data, err }: { conf: KPIConf; data?: ApiResp; err?: string }) {
  const color = err ? "red" : data?.status || "amber";
  const bg =
    color === "green" ? "#9EB384" : color === "red" ? "#E57373" : "#FFD54F";

  const sub = err
    ? err
    : !data
    ? "Lade..."
    : conf.showDateInfo === false
    ? ""
    : data.status === "green"
    ? "Alles erledigt"
    : data.status === "red"
    ? `Älteste offen: ${data.maxAgeDays} Tage`
    : `Offene: bis ${data.maxAgeDays} Tage`;

  const card = (
    <div className="card" style={{ background: bg, color: "#fff" }}>
      <div className="card-title">{conf.label}</div>
      <div className="card-value">{err ? "!" : data ? data.count : "…"}</div>
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
  const preset = sp.get("preset") || "vertrieb";

  const [items, setItems] = useState<{ conf: KPIConf; data?: ApiResp; err?: string }[]>([]);

  useEffect(() => {
    // 1. Widgets aus Airtable holen
    fetch(`/api/widgets?preset=${preset}`)
      .then((r) => r.json())
      .then((widgets: KPIConf[]) => {
        if (!widgets.length) {
          setItems([{ conf: { label: "Keine Widgets gefunden", table: "—" }, err: "Preset leer oder falsch" }]);
          return;
        }

        // Leere Items vorinitialisieren
        setItems(widgets.map((c) => ({ conf: c })));

        // 2. Für jedes Widget API /api/kpi aufrufen
        widgets.forEach((c, i) => {
          const u = new URL("/api/kpi", window.location.origin);
          u.searchParams.set("table", c.table);
          if (c.view) u.searchParams.set("view", c.view);
          if (c.formula) u.searchParams.set("formula", c.formula);
          if (c.dateField) u.searchParams.set("dateField", c.dateField);
          if (c.redDays) u.searchParams.set("redDays", c.redDays);

          fetch(u.toString())
            .then((r) => r.json())
            .then((data: ApiResp) =>
              setItems((prev) =>
                prev.map((p, idx) => (idx === i ? { conf: c, data } : p))
              )
            )
            .catch((e) =>
              setItems((prev) =>
                prev.map((p, idx) => (idx === i ? { conf: c, err: String(e) } : p))
              )
            );
        });
      })
      .catch((e) => {
        setItems([{ conf: { label: "Widgets-API Fehler", table: "—" }, err: String(e) }]);
      });
  }, [preset]);

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
