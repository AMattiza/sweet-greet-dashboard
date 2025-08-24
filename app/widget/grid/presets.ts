export type KPIConf = {
  label: string;
  table: string;
  view?: string;
  formula?: string;
  dateField?: string;
  redDays?: string;
  target?: string;
  targetBlank?: boolean;
  showDateInfo?: boolean;
  modal?: boolean;
  detailUrl?: string;

  // Organisation
  bereich?: string;        // z.B. "vertrieb", "logistik", "projekte"
  filterField?: string;    // Feldname für Personalisierung (z.B. "Vertriebsmitarbeiter")
  personen?: string[];     // Personen, für die dieses Widget relevant ist
};

import { ALL_WIDGETS } from "./widgets";

/**
 * Baut ein Personen-Preset, indem es Widgets filtert,
 * die die Person unterstützen, und die Formel anpasst.
 */
function buildPersonPreset(name: string): KPIConf[] {
  return ALL_WIDGETS
    .filter(w => w.personen?.includes(name))
    .map(w => ({
      ...w,
      formula: w.filterField
        ? `AND({${w.filterField}}='${name}', ${w.formula})`
        : w.formula
    }));
}

export const PRESETS: Record<string, KPIConf[]> = {
  // Bereichs-Presets
  vertrieb: ALL_WIDGETS.filter(w => w.bereich === "vertrieb"),
  freigaben: ALL_WIDGETS.filter(w => w.bereich === "freigaben"),
  projekte: ALL_WIDGETS.filter(w => w.bereich === "projekte"),
  logistik: ALL_WIDGETS.filter(w => w.bereich === "logistik"),

  // Personen-Presets
  rafael: buildPersonPreset("Rafael Michen"),
  patrick: buildPersonPreset("Patrick Lillpopp"),
};
