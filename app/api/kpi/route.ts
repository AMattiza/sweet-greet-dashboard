import { NextRequest, NextResponse } from "next/server";
import { listRecords } from "../../../lib/airtable";

function cors(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  const allow = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  const allowed = !allow.length || allow.some(p =>
    p.startsWith("https://*.") ? origin.endsWith(p.replace("*.","")) : origin === p
  );
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "null",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { headers: cors(req) });
}

/** 
 * Query:
 *  table (required)
 *  view
 *  formula
 *  dateField (default: 'Created')
 *  redDays  (default: 3)
 * Returns: { count, maxAgeDays, status }
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const table = searchParams.get("table");
    if (!table) return NextResponse.json({ error: "Missing table" }, { status: 400 });

    const baseId = process.env.AIRTABLE_BASE_ID!;
    const view = searchParams.get("view") || undefined;
    const formula = searchParams.get("formula") || undefined;
    const dateField = searchParams.get("dateField") || "Created";
    const redDays = Number(searchParams.get("redDays") || 3);

    const recs = await listRecords({ baseId, table, view, filterByFormula: formula, fields: [dateField] });

    const now = Date.now();
    const ages = recs.map(r => {
      const d = r.fields[dateField] ? new Date(r.fields[dateField]).getTime() : new Date(r.createdTime).getTime();
      return Math.max(0, Math.floor((now - d) / 86400000));
    });
    const maxAgeDays = ages.length ? Math.max(...ages) : 0;

    let status: "green" | "amber" | "red" = "green";
    if (recs.length === 0) status = "green";
    else if (maxAgeDays >= redDays) status = "red";
    else status = "amber";

    return new NextResponse(JSON.stringify({ count: recs.length, maxAgeDays, status }), {
      headers: { "Content-Type": "application/json", ...cors(req) }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}
