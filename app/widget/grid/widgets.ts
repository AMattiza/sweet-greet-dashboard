import { KPIConf } from "./presets";

// Zentrale Widget-Bibliothek
export const ALL_WIDGETS: KPIConf[] = [
  // -----------------------------
  // Vertrieb (alte Widgets)
  // -----------------------------
  {
    label: "Follow-up Termine heute",
    table: "Aktivitäten",
    formula: "AND({Follow Up Abschluss}=BLANK(), IS_SAME({Follow-up Datum}, TODAY(), 'day'))",
    dateField: "Follow-up Datum",
    redDays: "1",
    target: "https://www.suesse-gruesse.online/vertrieb#tab5",
    bereich: "vertrieb",
    filterField: "Vertriebsmitarbeiter",
    personen: ["Rafael Michen", "Patrick Lillpopp"]
  },
  {
    label: "Verpasste Follow-ups",
    table: "Aktivitäten",
    formula: "AND(IS_BEFORE({Follow-up Datum}, TODAY()), {Follow Up Abschluss}=BLANK())",
    dateField: "Follow-up Datum",
    redDays: "0",
    target: "https://www.suesse-gruesse.online/vertrieb#tab5",
    bereich: "vertrieb",
    filterField: "Vertriebsmitarbeiter",
    personen: ["Rafael Michen", "Patrick Lillpopp"]
  },

  // -----------------------------
  // Freigaben (alte Widgets)
  // -----------------------------
  {
    label: "Freigabe für Layouterstellung",
    table: "Projects",
    formula: "{Vertriebsmitarbeiter} = BLANK()",
    dateField: "Auftragsdatum",
    redDays: "2",
    target: "https://www.suesse-gruesse.online/freigabe",
    bereich: "freigaben"
  },
  {
    label: "Freigabe für Postkartenproduktion",
    table: "Projects",
    formula: "AND({Händler Freigaben} != BLANK(), {Freigaben} = BLANK())",
    dateField: "Auftragsdatum",
    redDays: "2",
    target: "https://www.suesse-gruesse.online/freigabe#tab2",
    bereich: "freigaben"
  },

  // -----------------------------
  // Projekte (neue Widgets)
  // -----------------------------
  {
    label: "Projektlizenzen vergeben",
    table: "Projects",
    formula: "{Status}='NEU'",
    dateField: "Auftragsdatum",
    redDays: "0",
    target: "https://www.suesse-gruesse.online/projekte#tab6",
    bereich: "projekte"
  },
  {
    label: "Projekte an Grafik zuweisen",
    table: "Projects",
    formula: "{Status}='OFFEN'",
    dateField: "Auftragsdatum",
    redDays: "0",
    target: "https://www.suesse-gruesse.online/projekte#tab1",
    bereich: "projekte"
  },
  {
    label: "Mockups hochladen",
    table: "Projects",
    formula: "{Status}='IN BEARBEITUNG'",
    dateField: "Auftragsdatum",
    redDays: "0",
    target: "https://www.suesse-gruesse.online/projekte#tab2",
    bereich: "projekte"
  },
  {
    label: "Layouts an Kunden freigeben",
    table: "Projects",
    formula: "{Status}='MOCKUPS BEREIT'",
    dateField: "Auftragsdatum",
    redDays: "0",
    target: "https://www.suesse-gruesse.online/projekte#tab3",
    bereich: "projekte"
  },
  {
    label: "Layouts korrigieren",
    table: "Projects",
    formula: "{Status}='IN KORREKTUR'",
    dateField: "Auftragsdatum",
    redDays: "0",
    target: "https://www.suesse-gruesse.online/projekte#tab5",
    bereich: "projekte"
  },
  {
    label: "Freigabemockups hochladen",
    table: "Freigaben",
    formula: "{Kundendatei Freigabe}=BLANK()",
    dateField: "Auftragsdatum (aus Projects)",
    redDays: "0",
    target: "https://www.suesse-gruesse.online/projekte#tab7",
    bereich: "projekte"
  },
  {
    label: "Kartenlizenzen vergeben",
    table: "Postkarten",
    formula: "AND({Postkarten-Status}='FREIGABE', {Kartennummer}=BLANK())",
    dateField: "Auftragsdatum (aus Projects)",
    redDays: "0",
    target: "https://www.suesse-gruesse.online/produktion",
    bereich: "projekte"
  },
  {
    label: "Druckdaten hochladen",
    table: "Postkarten",
    formula: "AND({Postkarten-Status}='FREIGABE', {Kartennummer}!=BLANK())",
    dateField: "Auftragsdatum (aus Projects)",
    redDays: "0",
    target: "https://www.suesse-gruesse.online/produktion",
    bereich: "projekte"
  },
  {
    label: "Postkarten bestellen",
    table: "Bestellungen",
    formula: "AND({Status Bestellung}='BEREIT FÜR DEN DRUCK', {Bestellnummer}=BLANK())",
    dateField: "Auftragsdatum (aus Projects)",
    redDays: "0",
    target: "https://www.suesse-gruesse.online/bestellung",
    bereich: "projekte"
  },
  {
    label: "Link zur Sendung hinterlegen",
    table: "Bestellungen",
    formula: "AND({Status Bestellung}='BESTELLT', {Sendungsverfolgung}=BLANK())",
    dateField: "Auftragsdatum (aus Projects)",
    redDays: "0",
    target: "https://www.suesse-gruesse.online/sendung",
    bereich: "projekte"
  },
  {
    label: "Lieferungen bestätigen",
    table: "Bestellungen",
    formula: "AND({Status Bestellung}='AUSLIEFERUNG', {Lieferdatum}=BLANK())",
    dateField: "Auftragsdatum (aus Projects)",
    redDays: "0",
    target: "https://www.suesse-gruesse.online/lieferung",
    bereich: "projekte"
  },

  // -----------------------------
  // Logistik (neues Widget)
  // -----------------------------
  {
    label: "Musterboxen versenden",
    table: "Musterbox",
    formula: "{Versanddatum}=BLANK()",
    dateField: "Auftragsdatum (Versand Musterbox)",
    redDays: "0",
    target: "https://www.suesse-gruesse.online/logistik",
    bereich: "logistik"
  }
];
