export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextResponse } from "next/server";
import { listRecords } from "../../../lib/airtable";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const table = searchParams.get("table")!;
    const view = searchParams.get("view") || undefined;
    const formula = searchParams.get("formula")
      ? decodeURIComponent(searchParams.get("formula")!)
      : undefined;
    const dateField = searchParams.get("dateField") || undefined;
    const redDays = parseInt(searchParams.get("redDays") || "0");
    const list = searchParams.get("list");

    // 🧩 WICHTIG: Mehrere Felder erlauben (durch Komma oder Semikolon getrennt)
    const fieldParam = searchParams.get("field") || undefined;
    const fields = fieldParam
      ? fieldParam.split(/[;,]/).map(f => f.trim()).filter(Boolean)
      : undefined;

    const aggregate = searchParams.get("aggregate") || "first";
    const statusLogic = searchParams.get("statusLogic") || "tasks";

    console.log("📊 KPI-Request:", {
      table,
      view,
      formula,
      dateField,
      redDays,
      list,
      fields,
      aggregate,
      statusLogic,
    });

    // Airtable Records laden (mehrere Felder gleichzeitig!)
    const recs = await listRecords({
      baseId: process.env.AIRTABLE_BASE_ID!,
      table,
      view,
      filterByFormula: formula,
      fields,
    });

    if (!recs || !Array.isArray(recs)) {
      console.warn("⚠️ Keine Records empfangen – vermutlich Fehler in Formel:", formula);
      return NextResponse.json({
        count: 0,
        maxAgeDays: 0,
        status: "gray",
        value: null,
        debug: { table, view, formula, found: 0 },
      });
    }

    console.log(`✅ ${recs.length} Records geladen für Tabelle "${table}"`);

    if (list) {
      return NextResponse.json({ records: recs });
    }

    // 🟩 Distribution-Bar mit Mehrfeld-Unterstützung
    if ((statusLogic === "distribution" || statusLogic === "distribution-bar") && fields?.length) {
      const groups: Record<string, number> = {};

      for (const rec of recs) {
        for (const f of fields) {
          const val = rec.fields[f];
          if (val === undefined || val === null) continue;

          if (typeof val === "number") {
            groups[f] = (groups[f] || 0) + val;
          } else if (Array.isArray(val)) {
            for (const v of val) groups[v] = (groups[v] || 0) + 1;
          } else if (typeof val === "string" && val.trim() !== "") {
            groups[val.trim()] = (groups[val.trim()] || 0) + 1;
          }
        }
      }

      const total = Object.values(groups).reduce((a, b) => a + b, 0);
      const distribution = Object.entries(groups)
        .map(([label, count]) => ({
          label,
          count,
          percentage: total ? (count / total) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);

      console.log("📊 Distribution (multi-field) Ergebnis:", distribution);

      return NextResponse.json({
        type: "distribution",
        total,
        distribution,
        debug: { table, view, formula, fields, found: recs.length },
      });
    }

    // 🔢 Standard KPI-Berechnung
    let count = recs.length;
    let maxAgeDays = 0;

    if (dateField) {
      const now = new Date();
      for (const rec of recs) {
        const dVal = rec.fields[dateField];
        if (dVal) {
          const d = new Date(dVal as string);
          const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
          if (diff > maxAgeDays) maxAgeDays = diff;
        }
      }
    }

    // 🧭 Statuslogik
    let status: "green" | "amber" | "red" | "gray" = "amber";

    if (statusLogic === "tasks") {
      if (count === 0) status = "green";
      else if (maxAgeDays > redDays) status = "red";
    } else if (statusLogic === "pipeline") {
      status = count === 0 ? "red" : "green";
    } else if (statusLogic === "fixedGreen") {
      status = "green";
    } else if (statusLogic === "fixedRed") {
      status = "red";
    } else if (statusLogic === "fixedGray") {
      status = "gray";
    }

    // 📈 Aggregationslogik
    let value: string | number | null = null;
    if (fields?.length && recs.length > 0) {
      const values = recs
        .flatMap(r => fields.map(f => r.fields[f]))
        .filter(v => v !== undefined && v !== null);

      if (values.length > 0) {
        if (aggregate === "sum") {
          value = values.reduce(
            (sum, v) => sum + (typeof v === "number" ? v : 0),
            0
          );
        } else if (aggregate === "avg") {
          const nums = values.filter((v) => typeof v === "number") as number[];
          value = nums.length
            ? nums.reduce((a, b) => a + b, 0) / nums.length
            : 0;
        } else {
          value = typeof values[0] === "number" ? values[0] : String(values[0]);
        }
      }
    }

    return NextResponse.json({
      count,
      maxAgeDays,
      status,
      value,
      debug: { table, view, formula, found: recs.length },
    });
  } catch (err: any) {
    console.error("❌ API-Fehler:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
