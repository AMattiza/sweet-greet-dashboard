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

    // NEU: optionales Feld
    const field = searchParams.get("field") || undefined;

    console.log("📊 KPI-Request:", { table, view, formula, dateField, redDays, list, field });

    // Airtable Records laden
    const recs = await listRecords({
      baseId: process.env.AIRTABLE_BASE_ID!,
      table,
      view,
      filterByFormula: formula,
      fields: field ? [field] : undefined, // falls field gesetzt ist
    });

    console.log(`✅ ${recs.length} Records geladen für Tabelle "${table}"`);

    if (list) {
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
          const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
          if (diff > maxAgeDays) maxAgeDays = diff;
        }
      }
    }

    let status: "green" | "amber" | "red" = "amber";
    if (count === 0) {
      status = "green";
    } else if (maxAgeDays > redDays) {
      status = "red";
    }

    // Feldwert extrahieren
    let value: string | number | null = null;
    if (field && recs.length > 0) {
      // hier ggf. Summe aller Records statt nur recs[0]
      const values = recs
        .map(r => r.fields[field])
        .filter(v => v !== undefined && v !== null);

      if (values.length > 0) {
        if (typeof values[0] === "number") {
          value = values.reduce((a, b) => a + (b as number), 0);
        } else {
          value = String(values[0]); // nur den ersten nehmen
        }
      }
    }

    return NextResponse.json({ count, maxAgeDays, status, value });
  } catch (err: any) {
    console.error("❌ API-Fehler:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
