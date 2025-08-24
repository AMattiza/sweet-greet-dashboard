import { NextResponse } from "next/server";
import base from "../../../lib/airtable";   // ✅ korrigierter Pfad

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

    // Airtable Query
    const recs = await base(table).select({
      view,
      filterByFormula: formula
    }).all();

    if (list) {
      // alle Records zurückgeben (für Modal-Ansicht)
      return NextResponse.json({
        records: recs.map(r => ({ id: r.id, fields: r.fields }))
      });
    }

    // Zähler & maxAge berechnen
    let count = recs.length;
    let maxAgeDays = 0;

    if (dateField) {
      const now = new Date();
      for (const rec of recs) {
        const dVal = rec.get(dateField);
        if (dVal) {
          const d = new Date(dVal as string);
          const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
          if (diff > maxAgeDays) maxAgeDays = diff;
        }
      }
    }

    // Status-Farbe
    let status: "green" | "amber" | "red" = "amber";
    if (count === 0) {
      status = "green";
    } else if (maxAgeDays > redDays) {
      status = "red";
    }

    return NextResponse.json({ count, maxAgeDays, status });

  } catch (err: any) {
    console.error("❌ API-Fehler:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
