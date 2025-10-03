export interface AbrechnungFormData {
  name: string;
  stamm: string;
  email: string;
  aktionId: string;
  kategorieId: string;
  belegbeschreibung?: string;
  belegdatum: Date;
  betrag: number;
  
  // Fahrtkosten-spezifisch
  fahrzeugtyp?: string;
  kilometer?: number;
  kmSatz?: number;
  mitfahrer?: number;
  lagerleitung?: boolean;
  material?: boolean;
  anhaenger?: boolean;
  
  // Beleg-Upload
  beleg?: File;
}

export interface AbrechnungMitRelationen {
  id: string;
  name: string;
  stamm: string;
  email: string;
  belegbeschreibung?: string;
  belegdatum: Date;
  betrag: number;
  belegUrl?: string;
  belegDateiname?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  
  aktion: {
    id: string;
    titel: string;
  };
  
  kategorie: {
    id: string;
    name: string;
  };
  
  // Fahrtkosten
  fahrzeugtyp?: string;
  kilometer?: number;
  kmSatz?: number;
  mitfahrer?: number;
  lagerleitung?: boolean;
  material?: boolean;
  anhaenger?: boolean;
}

export interface FahrtkostenBerechnung {
  basiskm: number;
  basisSatz: number;
  zuschlaege: {
    lagerleitung: number;
    material: number;
    anhaenger: number;
  };
  gesamtSatz: number;
  gesamtbetrag: number;
}

export interface PDFExportData {
  aktionId: string;
  aktionTitel: string;
  startdatum: Date;
  enddatum: Date;
  abrechnungen: AbrechnungMitRelationen[];
  kategorien: Array<{
    name: string;
    posten: AbrechnungMitRelationen[];
    summe: number;
  }>;
  gesamtsumme: number;
}

export const FAHRZEUGTYPEN = [
  'PKW',
  'Motorrad',
  'Kleinbus/Transporter',
  'Bus',
] as const;

export const KM_SAETZE: Record<string, number> = {
  'PKW': 0.30,
  'Motorrad': 0.20,
  'Kleinbus/Transporter': 0.35,
  'Bus': 0.50,
};

export const ZUSCHLAEGE = {
  lagerleitung: 0.05,
  material: 0.05,
  anhaenger: 0.05,
} as const;
