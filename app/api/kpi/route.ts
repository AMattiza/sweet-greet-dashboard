export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextResponse } from "next/server";

const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN!;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const table = searchParams.get("table")!;
    const view = searchParams.get("view") || undefined;
    const formulaRaw = searchParams.get("formula") || "";
    const formula = formulaRaw ? decodeURIComponent(formulaRaw) : undefined;
    const dateField = searchParams.get("dateField") || undefined;
    const redDays = parseInt(searchParams.get("redDays") || "0");
    const list = searchParams.get("list");

    console.log("📊 KPI-Request:", { table, view, formula, dateField, redDays, list });

    // API-URL aufbauen
    let url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(table)}`;
    const params: string[] = [];

    if (view) params.push(`view=${encodeURIComponent(view)}`);
    if (formula) params.push(`filterByFormula=${encodeURIComponent(formula)}`);

    if (params.length) {
      url += `?${params.join("&")}`;
    }

    console.log("👉 Airtable API URL:", url);

    // Fetch Airtable
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
    });

    if (!resp.ok) {
      return NextResponse.json({ error: `Airtable ${resp.status}` }, { status: resp.status });
    }

    const data = await resp.json();

    const recs = data.records;
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

    console.log(`📈 Ergebnis: count=${count}, maxAgeDays=${maxAgeDays}, redDays=${redDays}`);

    let status: "green" | "amber" | "red" = "amber";
    if (count === 0) status = "green";
    else if (maxAgeDays > redDays) status = "red";

    return NextResponse.json({ count, maxAgeDays, status });
  } catch (err: any) {
    console.error("❌ API-Fehler:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
