export type KPIConf = {
  label: string; table: string; view?: string; formula?: string;
  dateField?: string; redDays?: string; target?: string; targetBlank?: boolean;
};

export const PRESETS: Record<string, KPIConf[]> = {
  "vertrieb": [
    {
      label: "Follow-up Termine",
      table: "Aktivitäten",
      formula: "AND({Follow Up Abschluss} = BLANK(), IS_BEFORE({Follow-up Datum}, DATEADD(TODAY(), 8, 'days')))",
      dateField: "Follow-up Datum",
      redDays: "0",
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
      label: "Projektfreigabe",
      table: "Projekte",
      formula: "NOT({Freigegeben})",
      dateField: "LetzteAktualisierung",
      redDays: "2",
      target: "https://www.suesse-gruesse.online/freigabe"
    },
    {
      label: "Kartenproduktion",
      table: "Aufträge",
      formula: "NOT({ProdFreigegeben})",
      dateField: "AngelegtAm",
      redDays: "2",
      target: "https://www.suesse-gruesse.online/freigabe#tab2"
    }
  ]
};
