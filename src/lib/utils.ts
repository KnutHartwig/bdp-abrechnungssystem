import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind CSS Klassen zusammenführen
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fahrtkosten-Berechnung basierend auf Excel-Logik
export function berechneFahrtkosten(params: {
  fahrzeugtyp: 'PKW' | 'TRANSPORTER' | 'BUS' | 'MOTORRAD';
  kilometer: number;
  mitfahrer: number;
  zuschlagLagerleitung: boolean;
  zuschlagMaterial: boolean;
  zuschlagAnhaenger: boolean;
}): number {
  // Basis km-Sätze
  const basisSaetze: Record<string, number> = {
    PKW: 0.3,
    TRANSPORTER: 0.4,
    BUS: 0.5,
    MOTORRAD: 0.1,
  };

  let satz = basisSaetze[params.fahrzeugtyp];

  // Zuschläge addieren
  if (params.zuschlagLagerleitung) satz += 0.05;
  if (params.zuschlagMaterial) satz += 0.05;
  if (params.zuschlagAnhaenger) satz += 0.05;

  // Mitfahrer-Rabatt (10% pro Mitfahrer, max 30%)
  const mitfahrerRabatt = Math.min(params.mitfahrer * 0.1, 0.3);
  satz = satz * (1 - mitfahrerRabatt);

  return params.kilometer * satz;
}

// Kategorie-Formatierung
export function formatKategorie(kategorie: string): string {
  const mapping: Record<string, string> = {
    TEILNAHMEBEITRAEGE: 'Teilnahmebeiträge',
    FAHRTKOSTEN: 'Fahrtkosten',
    UNTERKUNFT: 'Unterkunft',
    VERPFLEGUNG: 'Verpflegung',
    MATERIAL: 'Material',
    PORTO: 'Porto',
    TELEKOMMUNIKATION: 'Telekommunikation',
    SONSTIGE_AUSGABEN: 'Sonstige Ausgaben',
    HONORARE: 'Honorare',
    VERSICHERUNGEN: 'Versicherungen',
    MIETE: 'Miete',
  };
  return mapping[kategorie] || kategorie;
}

// Status-Formatierung
export function formatStatus(status: string): string {
  const mapping: Record<string, string> = {
    ENTWURF: 'Entwurf',
    EINGEREICHT: 'Eingereicht',
    GEPRUEFT: 'Geprüft',
    FREIGEGEBEN: 'Freigegeben',
    VERSENDET: 'Versendet',
    ABGELEHNT: 'Abgelehnt',
  };
  return mapping[status] || status;
}

// Betrag formatieren (EUR)
export function formatBetrag(betrag: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(betrag);
}

// Datum formatieren
export function formatDatum(datum: Date | string): string {
  const date = typeof datum === 'string' ? new Date(datum) : datum;
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

// Datei-Validierung
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Datei zu groß. Maximum: ${(maxSize / 1024 / 1024).toFixed(0)}MB`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Nur PDF, JPG und PNG-Dateien sind erlaubt',
    };
  }

  return { valid: true };
}

// Zufälligen Dateinamen generieren
export function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = originalName.split('.').pop();
  return `${timestamp}-${random}.${ext}`;
}

// Status-Farben für UI
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ENTWURF: 'bg-gray-100 text-gray-800',
    EINGEREICHT: 'bg-blue-100 text-blue-800',
    GEPRUEFT: 'bg-yellow-100 text-yellow-800',
    FREIGEGEBEN: 'bg-green-100 text-green-800',
    VERSENDET: 'bg-purple-100 text-purple-800',
    ABGELEHNT: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

// Alias für formatBetrag (für Kompatibilität mit Dashboard)
export const formatCurrency = formatBetrag;

// Alias für berechneFahrtkosten (für Kompatibilität mit AbrechnungForm)
export const calculateFahrtkosten = berechneFahrtkosten;

// Kategorie-Labels für UI
export const KATEGORIE_LABELS: Record<string, string> = {
  TEILNAHMEBEITRAEGE: 'Teilnahmebeiträge',
  FAHRTKOSTEN: 'Fahrtkosten',
  UNTERKUNFT: 'Unterkunft',
  VERPFLEGUNG: 'Verpflegung',
  MATERIAL: 'Material',
  PORTO: 'Porto',
  TELEKOMMUNIKATION: 'Telekommunikation',
  SONSTIGE_AUSGABEN: 'Sonstige Ausgaben',
  HONORARE: 'Honorare',
  VERSICHERUNGEN: 'Versicherungen',
  MIETE: 'Miete',
};

// Status-Konfiguration für UI
export const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ENTWURF: { label: 'Entwurf', color: 'gray' },
  EINGEREICHT: { label: 'Eingereicht', color: 'blue' },
  GEPRUEFT: { label: 'Geprüft', color: 'yellow' },
  FREIGEGEBEN: { label: 'Freigegeben', color: 'green' },
  VERSENDET: { label: 'Versendet', color: 'purple' },
  ABGELEHNT: { label: 'Abgelehnt', color: 'red' },
};
