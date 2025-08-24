import { NextResponse } from "next/server";
import { listRecords } from "../../../lib/airtable";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_TABLE = "Widgets"; // Tabellenname in Airtable prüfen!

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const preset = searchParams.get("preset"); // z.B. vertrieb, projekte, rafael

    // Records holen über die bewährte Hilfsfunktion
    const recs = await listRecords({
      baseId: AIRTABLE_BASE,
      table: AIRTABLE_TABLE,
      view: "Alle Widgets", // View-Name exakt prüfen!
    });

    let widgets = recs.map((r: any) => ({
      id: r.id,
      ...r.fields,
      personen: r.fields.personen
        ? r.fields.personen.split(";").map((p: string) => p.trim())
        : [],
    }));

    if (preset) {
      widgets = widgets.filter(
        (w: any) => w.bereich === preset || w.personen?.includes(preset)
      );
    }

    return NextResponse.json(widgets);
  } catch (e: any) {
    console.error("❌ Widgets-API Fehler:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
