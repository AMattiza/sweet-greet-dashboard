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

  // Neu: Wert direkt aus Feld holen
  field?: string;
};
