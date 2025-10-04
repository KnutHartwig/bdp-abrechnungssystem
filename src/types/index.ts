import { Kategorie, Fahrzeugtyp, AbrechnungStatus, AktionStatus } from '@prisma/client';

// Form-Daten für neue Abrechnungen
export interface AbrechnungFormData {
  name: string;
  stamm: string;
  email: string;
  aktionId: string;
  kategorie: Kategorie;
  belegbeschreibung?: string;
  belegdatum: Date;
  betrag: number;
  
  // Fahrtkosten-spezifisch
  kilometer?: number;
  fahrzeugtyp?: Fahrzeugtyp;
  kmSatz?: number;
  mitfahrer?: number;
  zuschlagLagerleitung?: boolean;
  zuschlagMaterial?: boolean;
  zuschlagAnhaenger?: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Upload Response
export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}

// PDF Generation Options
export interface PDFOptions {
  aktionId: string;
  format?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
}

// Email Options
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: {
    filename: string;
    path: string;
  }[];
}

// Statistiken für Admin-Dashboard
export interface AbrechnungStatistik {
  gesamt: number;
  entwurf: number;
  eingereicht: number;
  geprueft: number;
  freigegeben: number;
  versendet: number;
  gesamtBetrag: number;
}

export interface AktionStatistik {
  aktionId: string;
  aktionTitel: string;
  anzahlAbrechnungen: number;
  gesamtBetrag: number;
  kategorien: {
    kategorie: Kategorie;
    betrag: number;
    anzahl: number;
  }[];
}

// Fahrtkosten-Berechnung
export interface FahrtkostenBerechnung {
  kilometer: number;
  basisSatz: number;
  zuschlaege: {
    lagerleitung?: number;
    material?: number;
    anhaenger?: number;
  };
  gesamtSatz: number;
  gesamtBetrag: number;
}

// Kategorien-Mapping für Display
export const KATEGORIE_LABELS: Record<Kategorie, string> = {
  TEILNAHMEBEITRAEGE: 'Teilnahmebeiträge',
  FAHRTKOSTEN: 'Fahrtkosten',
  UNTERKUNFT: 'Unterkunft',
  VERPFLEGUNG: 'Verpflegung',
  MATERIAL: 'Material',
  PORTO: 'Porto',
  TELEKOMMUNIKATION: 'Telekommunikation',
  VERSICHERUNG: 'Versicherung',
  HONORARE: 'Honorare',
  OFFENTLICHKEITSARBEIT: 'Öffentlichkeitsarbeit',
  SONSTIGE_AUSGABEN: 'Sonstige Ausgaben',
};

// Fahrzeugtyp-Sätze
export const FAHRZEUGTYP_SAETZE: Record<Fahrzeugtyp, number> = {
  PKW: 0.30,
  TRANSPORTER: 0.40,
  BUS: 0.50,
};

// Status-Labels
export const STATUS_LABELS: Record<AbrechnungStatus, string> = {
  ENTWURF: 'Entwurf',
  EINGEREICHT: 'Eingereicht',
  GEPRUEFT: 'Geprüft',
  FREIGEGEBEN: 'Freigegeben',
  VERSENDET: 'Versendet',
  ABGESCHLOSSEN: 'Abgeschlossen',
};

export const AKTION_STATUS_LABELS: Record<AktionStatus, string> = {
  AKTIV: 'Aktiv',
  INAKTIV: 'Inaktiv',
  ABGESCHLOSSEN: 'Abgeschlossen',
};

// Zuschläge
export const ZUSCHLAEGE = {
  LAGERLEITUNG: 0.05,
  MATERIAL: 0.05,
  ANHAENGER: 0.05,
} as const;
