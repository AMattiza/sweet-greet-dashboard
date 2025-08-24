import { NextResponse } from "next/server";
import Airtable from "airtable";

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID!);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const table = searchParams.get("table")!;
  const view = searchParams.get("view") || undefined;
  const formula = searchParams.get("formula") || undefined;
  const dateField = searchParams.get("dateField") || undefined;
  const redDays = parseInt(searchParams.get("redDays")||"0");
  const list = searchParams.get("list");

  const recs = await base(table).select({ view, filterByFormula: formula }).all();

  const count = recs.length;
  let maxAgeDays = 0;
  if(dateField){
    const dates = recs.map(r => r.get(dateField) ? new Date(r.get(dateField) as string) : null).filter(Boolean) as Date[];
    if(dates.length){
      const diffs = dates.map(d => Math.floor((Date.now() - d.getTime())/86400000));
      maxAgeDays = Math.max(...diffs);
    }
  }

  let status:"green"|"amber"|"red" = "amber";
  if(count===0) status="green";
  else if(maxAgeDays>redDays) status="red";

  if(list){
    return NextResponse.json({ count, maxAgeDays, status, records: recs.map(r => ({id:r.id, fields:r.fields})) });
  }
  return NextResponse.json({ count, maxAgeDays, status });
}
