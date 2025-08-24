import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN!;
const AIRTABLE_TABLE = "Widgets"; // <- so heißt deine Airtable-Tabelle

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const preset = searchParams.get("preset"); // z.B. vertrieb, projekte, rafael

    const resp = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(AIRTABLE_TABLE)}?view=Alle%20Widgets`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        },
      }
    );

    if (!resp.ok) {
      return NextResponse.json({ error: `Airtable ${resp.status}` }, { status: resp.status });
    }

    const data = await resp.json();

    let widgets = data.records.map((r: any) => ({
      id: r.id,
      ...r.fields,
      personen: r.fields.personen
        ? r.fields.personen.split(";").map((p: string) => p.trim())
        : [],
    }));

    if (preset) {
      widgets = widgets.filter((w: any) =>
        w.bereich === preset || w.personen?.includes(preset)
      );
    }

    return NextResponse.json(widgets);
  } catch (e: any) {
    console.error("❌ Widgets-API Fehler:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
