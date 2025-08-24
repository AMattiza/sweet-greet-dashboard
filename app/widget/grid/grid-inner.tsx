"use client";
import "./grid.css";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

// Typdefinition für Widgets
export type KPIConf = {
  label: string;
  table: string;
  view?: string;
  formula?: string;
  dateField?: string;
  redDays?: string;
  target?: string;
  targetBlank?: boolean;
  showDateInfo?: boolean;
  modal?: boolean;
  detailUrl?: string;
  bereich?: string;
  filterField?: string;
  personen?: string[];

  // NEU: Steuerung der Anzeige-Logik
  logicType?: "Vergangenheit" | "Zukunft" | "Nur zählen";
};

type ApiResp = {
  count: number;
  maxAgeDays: number;
  status: "green" | "amber" | "red";
};

function Card({
  conf,
  data,
  err,
}: {
  conf: KPIConf;
  data?: ApiResp;
  err?: string;
}) {
  const color = err ? "red" : data?.status || "amber";
  const bg =
    color === "green"
      ? "#9EB384"
      : color === "red"
      ? "#E57373"
      : "#FFD54F";

  let sub = "";
  if (err) {
    sub = err;
  } else if (!data) {
    sub = "Lade...";
  } else {
    switch (conf.logicType) {
      case "Vergangenheit":
        sub =
          data.status === "green"
            ? "Alles erledigt"
            : data.status === "red"
            ? `Älteste offen: ${data.maxAgeDays} Tage`
            : `Offene: bis ${data.maxAgeDays} Tage`;
        break;
      case "Zukunft":
        sub =
          data.count === 0
            ? "Keine Termine"
            : `Nächster Termin in ${data.maxAgeDays} Tagen`;
        break;
      case "Nur zählen":
        sub = ""; // bewusst keine Detailanzeige
        break;
      default:
        sub = `Offen: ${data.count}`;
    }
  }

  const card = (
    <div className="card" style={{ background: bg, color: "#fff" }}>
      <div className="card-title">{conf.label}</div>
      <div className="card-value">
        {err ? "!" : data ? data.count : "…"}
      </div>
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
  const b64 = sp.get("config");
  const presetKey = sp.get("preset") || "vertrieb";

  const [items, setItems] = useState<
    { conf: KPIConf; data?: ApiResp; err?: string }[]
  >([]);

  // Widgets aus API laden
  const [confs, setConfs] = useState<KPIConf[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/widgets?preset=${presetKey}`);
        const data = await res.json();
        setConfs(data);
      } catch (e) {
        console.error("❌ Widgets laden fehlgeschlagen", e);
        setConfs([]);
      }
    }
    load();
  }, [presetKey]);

  useEffect(() => {
    if (!confs.length) {
      setItems([
        {
          conf: { label: "Config fehlt", table: "—" },
          err: "config oder preset ungültig",
        },
      ]);
      return;
    }

    setItems(confs.map((c) => ({ conf: c })));

    confs.forEach((c, i) => {
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
