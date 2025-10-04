import type { Kategorie, Fahrzeugtyp, AbrechnungStatus } from '@prisma/client';

export type { Kategorie, Fahrzeugtyp, AbrechnungStatus };

export interface AbrechnungFormData {
  name: string;
  stamm: string;
  email: string;
  aktionId: string;
  kategorie: Kategorie;
  belegbeschreibung?: string;
  belegdatum: Date;
  betrag: number;
  beleg?: File;
  
  // Fahrtkosten (optional)
  fahrzeugtyp?: Fahrzeugtyp;
  kilometer?: number;
  mitfahrer?: number;
  zuschlagLagerleitung?: boolean;
  zuschlagMaterial?: boolean;
  zuschlagAnhaenger?: boolean;
}

export interface AbrechnungWithAktion {
  id: string;
  name: string;
  stamm: string;
  email: string;
  kategorie: Kategorie;
  belegbeschreibung?: string | null;
  belegdatum: Date;
  betrag: number;
  belegUrl?: string | null;
  status: AbrechnungStatus;
  createdAt: Date;
  updatedAt: Date;
  aktion: {
    id: string;
    titel: string;
    startdatum: Date;
    enddatum: Date;
  };
  fahrzeugtyp?: Fahrzeugtyp | null;
  kilometer?: number | null;
  kmSatz?: number | null;
  mitfahrer?: number | null;
}

export interface DashboardStats {
  gesamt: number;
  anzahlEintraege: number;
  durchschnitt: number;
  nachKategorie: Record<string, number>;
  nachStatus: Record<string, number>;
}
