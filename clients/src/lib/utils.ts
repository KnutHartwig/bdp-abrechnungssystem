import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Kombiniert Tailwind CSS Klassen intelligent
 * Verhindert Konflikte zwischen ähnlichen Klassen
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatiert einen Geldbetrag in Euro
 */
export function formatEuro(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

/**
 * Formatiert ein Datum im deutschen Format
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/**
 * Formatiert ein Datum mit Uhrzeit im deutschen Format
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Konvertiert Kategorie-Enum in lesbaren Text
 */
export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    TEILNAHMEBEITRAEGE: "Teilnahmebeiträge",
    SONSTIGE_EINNAHMEN: "Sonstige Einnahmen",
    VORSCHUSS: "Vorschuss",
    FAHRTKOSTEN: "Fahrtkosten",
    UNTERKUNFT: "Unterkunft",
    VERPFLEGUNG: "Verpflegung",
    MATERIAL: "Material",
    PORTO: "Porto",
    TELEKOMMUNIKATION: "Telekommunikation",
    SONSTIGE_AUSGABEN: "Sonstige Ausgaben",
    OFFENE_VERBINDLICHKEITEN: "Offene Verbindlichkeiten",
  };
  return labels[category] || category;
}

/**
 * Konvertiert Status-Enum in lesbaren Text
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ENTWURF: "Entwurf",
    EINGEREICHT: "Eingereicht",
    VERSENDET: "Versendet",
    AKTIV: "Aktiv",
    INAKTIV: "Inaktiv",
    ABGESCHLOSSEN: "Abgeschlossen",
  };
  return labels[status] || status;
}

/**
 * Generiert eine zufällige ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Prüft ob ein String eine gültige Email ist
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Prüft ob ein String eine gültige IBAN ist (vereinfacht)
 */
export function isValidIBAN(iban: string): boolean {
  // Vereinfachte Prüfung: DE + 20 Ziffern
  const ibanRegex = /^DE\d{20}$/;
  return ibanRegex.test(iban.replace(/\s/g, ""));
}

/**
 * Formatiert IBAN mit Leerzeichen
 */
export function formatIBAN(iban: string): string {
  const cleaned = iban.replace(/\s/g, "");
  return cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
}
