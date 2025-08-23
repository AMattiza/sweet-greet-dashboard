# Sweet Greet KPI Grid (Next.js + Vercel)

**Zweck:** 4 klickbare KPI-Karten für Softr. Daten aus Airtable (serverseitig), Einbindung per iFrame.

## Deploy (kurz)
1. Dieses Repo nach GitHub pushen.
2. In **Vercel** importieren.
3. **Env Vars** setzen:
   - `AIRTABLE_API_KEY`
   - `AIRTABLE_BASE_ID`
   - `ALLOWED_ORIGINS` → `https://*.softr.io,https://*.softr.app,https://www.suesse-gruesse.online`
4. Deploy. Test: `/api/kpi?table=<Tabelle>`

## Softr-Einbindung (empfohlen, kurz)
Custom Code Block:
```html
<iframe src="https://<deine-vercel-domain>/widget/grid?preset=vertrieb"
  style="width:100%;height:600px;border:none;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,0.06);">
</iframe>
```

## Preset "vertrieb"
Liegt in `app/widget/grid/presets.ts`. Aktuell:
- Follow-up Termine (Termine / NOT({Erledigt}) / Datum / rot ab 0)
- Verpasste Follow-ups (Aktivitäten / überfällig / Follow-up Datum / rot ab 0)
- Projektfreigabe (Projekte / NOT({Freigegeben}) / LetzteAktualisierung / rot ab 2)
- Kartenproduktion (Aufträge / NOT({ProdFreigegeben}) / AngelegtAm / rot ab 2)

## Alternative: Eigene Konfig per Base64
`/widget/grid?config=<base64(JSON)>` – nicht empfohlen in Softr (zu lang).

## Farbe/Logik
- grün: keine offenen Datensätze
- gelb: offen, älteste < `redDays`
- rot: älteste ≥ `redDays`

## Sicherheit
- Airtable-Key bleibt auf dem Server.
- iFrame erlaubt via Header in `next.config.mjs`.
