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
};

export const PRESETS: Record<string, KPIConf[]> = {
  "vertrieb": [
    {
      label: "Follow-up Termine heute",
      table: "Aktivitäten",
      formula: "AND({Follow Up Abschluss} = BLANK(), IS_SAME({Follow-up Datum}, TODAY(), 'day'))",
      dateField: "Follow-up Datum",
      redDays: "0",
      modal: true,
      showDateInfo: true,
      detailUrl: "https://www.suesse-gruesse.online/vertrieb/detail?id={id}"
    },
    {
      label: "Verpasste Follow-ups",
      table: "Aktivitäten",
      formula: "AND({Follow Up Abschluss} = BLANK(), IS_BEFORE({Follow-up Datum}, TODAY()))",
      dateField: "Follow-up Datum",
      redDays: "0",
      modal: true,
      showDateInfo: true,
      detailUrl: "https://www.suesse-gruesse.online/vertrieb/detail?id={id}"
    },
    {
      label: "Projektfreigabe",
      table: "Projects",
      formula: "{Vertriebsmitarbeiter} = BLANK()",
      dateField: "LetzteAktualisierung",
      redDays: "2",
      target: "https://www.suesse-gruesse.online/freigabe",
      showDateInfo: false
    },
    {
      label: "Kartenproduktion",
      table: "Aufträge",
      formula: "AND({Händler Freigaben} != BLANK(), {Freigaben} = BLANK())",
      dateField: "AngelegtAm",
      redDays: "2",
      target: "https://www.suesse-gruesse.online/freigabe#tab2",
      showDateInfo: true
    }
  ]
};
