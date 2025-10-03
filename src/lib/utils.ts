import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { KM_SAETZE, ZUSCHLAEGE, FahrtkostenBerechnung } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('de-DE').format(new Date(date));
}

export function berechneKilometer(
  fahrzeugtyp: string,
  kilometer: number,
  optionen: {
    lagerleitung?: boolean;
    material?: boolean;
    anhaenger?: boolean;
  } = {}
): FahrtkostenBerechnung {
  const basisSatz = KM_SAETZE[fahrzeugtyp] || 0;
  
  let gesamtSatz = basisSatz;
  const zuschlaege = {
    lagerleitung: 0,
    material: 0,
    anhaenger: 0,
  };
  
  if (optionen.lagerleitung) {
    zuschlaege.lagerleitung = ZUSCHLAEGE.lagerleitung;
    gesamtSatz += ZUSCHLAEGE.lagerleitung;
  }
  
  if (optionen.material) {
    zuschlaege.material = ZUSCHLAEGE.material;
    gesamtSatz += ZUSCHLAEGE.material;
  }
  
  if (optionen.anhaenger) {
    zuschlaege.anhaenger = ZUSCHLAEGE.anhaenger;
    gesamtSatz += ZUSCHLAEGE.anhaenger;
  }
  
  const gesamtbetrag = kilometer * gesamtSatz;
  
  return {
    basiskm: kilometer,
    basisSatz,
    zuschlaege,
    gesamtSatz,
    gesamtbetrag: Math.round(gesamtbetrag * 100) / 100,
  };
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validateBetrag(betrag: number): boolean {
  return betrag > 0 && betrag <= 100000;
}

export function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_');
}
