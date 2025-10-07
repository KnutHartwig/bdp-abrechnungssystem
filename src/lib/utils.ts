import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Fahrzeugtyp } from '@prisma/client';
import { FAHRZEUGTYP_SAETZE, ZUSCHLAEGE, FahrtkostenBerechnung } from '@/types';

// Tailwind CSS class merging
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Währungsformatierung
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(num);
}

// Datumsformatierung
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

// Fahrtkosten-Berechnung
export function berechneFahrtkosten(
  kilometer: number,
  fahrzeugtyp: Fahrzeugtyp,
  zuschlagLagerleitung: boolean = false,
  zuschlagMaterial: boolean = false,
  zuschlagAnhaenger: boolean = false
): FahrtkostenBerechnung {
  const basisSatz = FAHRZEUGTYP_SAETZE[fahrzeugtyp];
  
  const zuschlaege = {
    lagerleitung: zuschlagLagerleitung ? ZUSCHLAEGE.LAGERLEITUNG : 0,
    material: zuschlagMaterial ? ZUSCHLAEGE.MATERIAL : 0,
    anhaenger: zuschlagAnhaenger ? ZUSCHLAEGE.ANHAENGER : 0,
  };
  
  const gesamtSatz = basisSatz + zuschlaege.lagerleitung + zuschlaege.material + zuschlaege.anhaenger;
  const gesamtBetrag = kilometer * gesamtSatz;
  
  return {
    kilometer,
    basisSatz,
    zuschlaege,
    gesamtSatz,
    gesamtBetrag: Math.round(gesamtBetrag * 100) / 100, // Auf 2 Dezimalstellen runden
  };
}

// E-Mail-Validierung
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Datei-Validierung
export function validateFile(file: File, maxSize: number = 5 * 1024 * 1024): { valid: boolean; error?: string } {
  // Größe prüfen
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Datei ist zu groß. Maximal ${maxSize / (1024 * 1024)}MB erlaubt.`,
    };
  }
  
  // Dateityp prüfen
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Nur PDF, JPG und PNG Dateien sind erlaubt.',
    };
  }
  
  return { valid: true };
}

// Dateinamen sanitieren
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
}

// Zufälligen Dateinamen generieren
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalFilename.split('.').pop();
  const baseName = originalFilename.split('.').slice(0, -1).join('.');
  const sanitized = sanitizeFilename(baseName);
  
  return `${sanitized}_${timestamp}_${random}.${extension}`;
}

// Betrag validieren
export function validateBetrag(betrag: number): { valid: boolean; error?: string } {
  if (betrag <= 0) {
    return { valid: false, error: 'Betrag muss größer als 0 sein.' };
  }
  
  if (betrag > 99999.99) {
    return { valid: false, error: 'Betrag ist zu hoch (max. 99.999,99 EUR).' };
  }
  
  // Prüfe auf maximal 2 Dezimalstellen
  if (!/^\d+(\.\d{1,2})?$/.test(betrag.toString())) {
    return { valid: false, error: 'Betrag darf maximal 2 Dezimalstellen haben.' };
  }
  
  return { valid: true };
}

// Kilometer validieren
export function validateKilometer(km: number): { valid: boolean; error?: string } {
  if (km <= 0) {
    return { valid: false, error: 'Kilometer müssen größer als 0 sein.' };
  }
  
  if (km > 10000) {
    return { valid: false, error: 'Kilometer scheinen unrealistisch hoch zu sein.' };
  }
  
  return { valid: true };
}

// Slug aus String erstellen
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Statistik-Berechnungen
export function berechneStatistik(abrechnungen: any[]) {
  const gesamt = abrechnungen.length;
  const entwurf = abrechnungen.filter(a => a.status === 'ENTWURF').length;
  const eingereicht = abrechnungen.filter(a => a.status === 'EINGEREICHT').length;
  const geprueft = abrechnungen.filter(a => a.status === 'GEPRUEFT').length;
  const freigegeben = abrechnungen.filter(a => a.status === 'FREIGEGEBEN').length;
  const versendet = abrechnungen.filter(a => a.status === 'VERSENDET').length;
  
  const gesamtBetrag = abrechnungen.reduce((sum, a) => {
    return sum + (typeof a.betrag === 'string' ? parseFloat(a.betrag) : Number(a.betrag));
  }, 0);
  
  return {
    gesamt,
    entwurf,
    eingereicht,
    geprueft,
    freigegeben,
    versendet,
    gesamtBetrag,
  };
}
