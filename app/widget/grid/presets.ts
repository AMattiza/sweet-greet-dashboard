export type KPIConf = {
  label: string;
  table: string;
  view?: string;
  formula?: string;
  dateField?: string;
  redDays?: string;
  target?: string;
  targetBlank?: boolean;
  showDateInfo?: boolean;  // ✅ hinzufügen
  modal?: boolean;         // ✅ hinzufügen
  detailUrl?: string;      // ✅ hinzufügen
};

export const PRESETS: Record<string, KPIConf[]> = {
  "vertrieb": [
    {
      label: "Follow-up Termine heute",
      table: "Aktivitäten",
      formula: "AND({Follow Up Abschluss} = BLANK(), IS_SAME({Follow-up Datum}, TODAY(), 'day'))",
      dateField: "Follow-up Datum",
      redDays: "1",
      target: "https://www.suesse-gruesse.online/vertrieb#tab5"
    },
    {
      label: "Verpasste Follow-ups",
      table: "Aktivitäten",
      formula: "AND(IS_BEFORE({Follow-up Datum}, TODAY()), {Follow Up Abschluss} = BLANK())",
      dateField: "Follow-up Datum",
      redDays: "0",
      target: "https://www.suesse-gruesse.online/vertrieb#tab5"
    },
    {
      label: "Freigabe für Layouterstellung",
      table: "Projects",
      formula: "{Vertriebsmitarbeiter} = BLANK()",
      dateField: "Auftragsdatum",
      redDays: "2",
      target: "https://www.suesse-gruesse.online/freigabe"
    },
    {
      label: "Freigabe für Postkartenproduktion",
      table: "Projects",
      formula: "AND({Händler Freigaben} != BLANK(), {Freigaben} = BLANK())",
      dateField: "Auftragsdatum",
      redDays: "2",
      target: "https://www.suesse-gruesse.online/freigabe#tab2"
    }
  ]
};
