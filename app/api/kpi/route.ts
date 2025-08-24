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

    console.log("📊 KPI-Request:", { table, view, formula, dateField, redDays, list });

    // 👉 Debug-Ausgabe: Welche Query geht an Airtable?
    console.log("👉 Airtable Query Params:", {
      baseId: process.env.AIRTABLE_BASE_ID!,
      table,
      view,
      formula,
    });

    // Airtable Records laden über Wrapper
    const recs = await listRecords({
      baseId: process.env.AIRTABLE_BASE_ID!,
      table,
      view,
      filterByFormula: formula,
    });

    console.log(`✅ ${recs.length} Records geladen für Tabelle "${table}"`);

    if (list) {
      console.log("🔍 Detail-List-Modus aktiv → gebe alle Records zurück");
      return NextResponse.json({ records: recs });
    }

    // Zähler & maxAge berechnen
    let count = recs.length;
    let maxAgeDays = 0;

    if (dateField) {
      const now = new Date();
      for (const rec of recs) {
        const dVal = rec.fields[dateField];
        if (dVal) {
          const d = new Date(dVal as string);
          const diff = Math.floor(
            (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (diff > maxAgeDays) maxAgeDays = diff;
        }
      }
    }

    console.log(
      `📈 Ergebnis: count=${count}, maxAgeDays=${maxAgeDays}, redDays=${redDays}`
    );

    let status: "green" | "amber" | "red" = "amber";
    if (count === 0) {
      status = "green";
    } else if (maxAgeDays > redDays) {
      status = "red";
    }

    console.log(`🎨 Status für "${table}": ${status}`);

    return NextResponse.json({ count, maxAgeDays, status });
  } catch (err: any) {
    console.error("❌ API-Fehler:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
