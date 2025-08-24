"use client";

import "./grid.css";
import { useEffect, useMemo, useRef, useState } from "react";
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
    <div className="card" style={{ background: bg, color: "#fff" }}>
      <div className="card-title">{conf.label}</div>
      <div className="card-value">{err ? "!" : data ? data.count : "…"}</div>
      {sub && <div className="card-sub">{sub}</div>}
    </div>
  );

  return conf.target
    ? <a href={conf.target} target={conf.targetBlank===false?"_self":"_blank"} rel="noreferrer" style={{ textDecoration: "none" }}>{card}</a>
    : card;
}

// 🔒 Stabiler Auto-Resizer: entkoppelt, gedrosselt, mit Schwellwert
function useIframeAutoHeight(rootRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    let last = 0;
    let raf = 0;
    const THRESHOLD = 8; // min. Änderung in px, um Rauschen zu vermeiden

    const measureAndPost = () => {
      raf = 0;
      const el = rootRef.current ?? document.documentElement;
      const h1 = document.documentElement.scrollHeight;
      const h2 = document.body ? document.body.scrollHeight : 0;
      const h3 = el.getBoundingClientRect ? Math.ceil(el.getBoundingClientRect().height) : 0;
      const h = Math.max(h1, h2, h3) + 1; // +1 gegen Rundungsfehler

      if (Math.abs(h - last) >= THRESHOLD) {
        last = h;
        window.parent.postMessage({ type: "resize-iframe", height: h }, "*");
      }
    };

    const schedule = () => { if (!raf) raf = requestAnimationFrame(measureAndPost); };

    // Beobachter für Layout-/Content-Änderungen
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });

    let ro: ResizeObserver | undefined;
    if ("ResizeObserver" in window) {
      ro = new ResizeObserver(schedule);
      ro.observe(document.documentElement);
      if (rootRef.current) ro.observe(rootRef.current);
    }

    // Fonts & window resize können Höhe verändern
    document.fonts?.ready.then(schedule).catch(() => {});
    window.addEventListener("load", schedule);
    window.addEventListener("resize", schedule);

    // Fallback: gelegentlich prüfen (sehr moderat, kein Flackern)
    const iv = window.setInterval(schedule, 1000);

    // initial
    schedule();

    return () => {
      mo.disconnect();
      ro?.disconnect();
      window.removeEventListener("load", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
      clearInterval(iv);
    };
  }, [rootRef]);
}

export default function GridInner() {
  const sp = useSearchParams();
  const b64 = sp.get("config");
  const presetKey = sp.get("preset") || "vertrieb";

  const [items, setItems] = useState<{ conf: KPIConf; data?: ApiResp; err?: string }[]>([]);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const confs = useMemo<KPIConf[]>(() => {
    if (b64) {
      try {
        const parsed = JSON.parse(atob(b64)) as KPIConf[];
        if (Array.isArray(parsed) && parsed.length) return parsed;
      } catch {}
    }
    return PRESETS[presetKey] || [];
  }, [b64, presetKey]);

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
      if (c.redDays) u.searchParams.set("redDays", c.redDays);

      fetch(u.toString())
        .then((r) => r.json())
        .then((data: ApiResp) => {
          setItems((prev) => {
            const copy = [...prev];
            copy[i] = { conf: c, data };
            return copy;
          });
        })
        .catch((e) => {
          setItems((prev) => {
            const copy = [...prev];
            copy[i] = { conf: c, err: String(e) };
            return copy;
          });
        });
    });
  }, [confs]);

  // ▶ Höhe stabil an Softr melden
  useIframeAutoHeight(gridRef);

  return (
    <div className="grid-container" ref={gridRef}>
      {items.map((it, idx) => <Card key={idx} {...it} />)}
    </div>
  );
}
