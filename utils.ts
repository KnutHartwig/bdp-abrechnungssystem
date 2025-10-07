import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function calculateKilometersatz(fahrzeugtyp: string, mitfahrer: number = 0): number {
  const baseSaetze: Record<string, number> = {
    PKW: 0.30,
    MOTORRAD: 0.20,
    FAHRRAD: 0.10,
    OEFFENTLICH: 0,
  };

  let satz = baseSaetze[fahrzeugtyp] || 0.30;

  // Mitfahrer-Zuschlag: 0,02 EUR pro Person
  satz += mitfahrer * 0.02;

  // Maximal 0,50 EUR/km
  return Math.min(satz, 0.50);
}

export function calculateFahrtkosten(
  kilometer: number,
  fahrzeugtyp: string,
  mitfahrer: number = 0,
  zuschlaege: string[] = []
): number {
  let satz = calculateKilometersatz(fahrzeugtyp, mitfahrer);

  // Zuschläge
  zuschlaege.forEach((z) => {
    if (z === 'LAGERLEITUNG') satz += 0.05;
    if (z === 'MATERIAL') satz += 0.05;
    if (z === 'ANHAENGER') satz += 0.05;
  });

  // Maximal 0,50 EUR/km
  satz = Math.min(satz, 0.50);

  return parseFloat((kilometer * satz).toFixed(2));
}

export function validateBetrag(betrag: string | number): boolean {
  const num = typeof betrag === 'string' ? parseFloat(betrag) : betrag;
  return !isNaN(num) && num > 0 && num < 100000;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const kategorieLabels: Record<string, string> = {
  TEILNAHMEBEITRAEGE: 'Teilnahmebeiträge',
  FAHRTKOSTEN: 'Fahrtkosten',
  UNTERKUNFT: 'Unterkunft',
  VERPFLEGUNG: 'Verpflegung',
  MATERIAL: 'Material',
  PORTO: 'Porto',
  TELEKOMMUNIKATION: 'Telekommunikation',
  SONSTIGE: 'Sonstige Ausgaben',
};

export const fahrzeugtypLabels: Record<string, string> = {
  PKW: 'PKW',
  MOTORRAD: 'Motorrad',
  FAHRRAD: 'Fahrrad',
  OEFFENTLICH: 'Öffentliche Verkehrsmittel',
};

export const statusLabels: Record<string, string> = {
  ENTWURF: 'Entwurf',
  EINGEREICHT: 'Eingereicht',
  VERSENDET: 'Versendet',
  ABGELEHNT: 'Abgelehnt',
};

export const aktionStatusLabels: Record<string, string> = {
  AKTIV: 'Aktiv',
  INAKTIV: 'Inaktiv',
  ABGESCHLOSSEN: 'Abgeschlossen',
};

export const zuschlaegeLabels: Record<string, string> = {
  LAGERLEITUNG: 'Lagerleitung (+0,05 EUR/km)',
  MATERIAL: 'Materialtransport (+0,05 EUR/km)',
  ANHAENGER: 'Anhänger (+0,05 EUR/km)',
};
