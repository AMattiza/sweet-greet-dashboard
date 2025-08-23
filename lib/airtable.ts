export type AirtableRecord = { id: string; fields: Record<string, any>; createdTime: string };

const AT_URL = "https://api.airtable.com/v0";

export async function listRecords(params: {
  baseId: string;
  table: string;
  view?: string;
  filterByFormula?: string;
  fields?: string[];
}) {
  const { baseId, table, view, filterByFormula, fields } = params;
  const headers = { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY!}` };

  let url = new URL(`${AT_URL}/${baseId}/${encodeURIComponent(table)}`);
  if (view) url.searchParams.set("view", view);
  if (filterByFormula) url.searchParams.set("filterByFormula", filterByFormula);
  if (fields?.length) fields.forEach(f => url.searchParams.append("fields[]", f));
  url.searchParams.set("pageSize", "100");

  let out: AirtableRecord[] = [];
  while (true) {
    const res = await fetch(url.toString(), { headers, cache: "no-store" });
    if (!res.ok) throw new Error(`Airtable ${res.status}: ${await res.text()}`);
    const data = await res.json();
    out = out.concat(data.records as AirtableRecord[]);
    if (!data.offset) break;
    url.searchParams.set("offset", data.offset);
  }
  return out;
}
