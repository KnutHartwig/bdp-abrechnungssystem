import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Fahrzeugtyp } from '@prisma/client'
import { FAHRZEUGTYP_SAETZE, ZUSCHLAEGE, FahrkostenBerechnung } from '@/types'

// Tailwind CSS Class Merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Betrag formatieren
export function formatCurrency(betrag: number | string): string {
  const num = typeof betrag === 'string' ? parseFloat(betrag) : betrag
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(num)
}

// Datum formatieren
export function formatDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (format === 'short') {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d)
  }
  
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

// Datetime formatieren
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

// Fahrtkosten berechnen
export function berechneFahrtkosten(params: {
  fahrzeugtyp: Fahrzeugtyp
  streckeKm: number
  istLagerleitung?: boolean
  hatMaterial?: boolean
  hatAnhaenger?: boolean
}): FahrkostenBerechnung {
  const { fahrzeugtyp, streckeKm, istLagerleitung, hatMaterial, hatAnhaenger } = params
  
  // Basis km-Satz
  const basiskm = FAHRZEUGTYP_SAETZE[fahrzeugtyp] || 0.30
  
  // Zuschläge berechnen
  let zuschlagLagerleitung = 0
  let zuschlagMaterial = 0
  let zuschlagAnhaenger = 0
  
  if (istLagerleitung) {
    zuschlagLagerleitung = ZUSCHLAEGE.LAGERLEITUNG
  }
  
  if (hatMaterial) {
    zuschlagMaterial = ZUSCHLAEGE.MATERIAL
  }
  
  if (hatAnhaenger) {
    zuschlagAnhaenger = ZUSCHLAEGE.ANHAENGER
  }
  
  // Gesamt km-Satz
  const gesamtSatz = basiskm + zuschlagLagerleitung + zuschlagMaterial + zuschlagAnhaenger
  
  // Betrag berechnen
  const betrag = Math.round(streckeKm * gesamtSatz * 100) / 100
  
  return {
    basiskm,
    kmSatz: basiskm,
    zuschlagLagerleitung,
    zuschlagMaterial,
    zuschlagAnhaenger,
    gesamtSatz,
    betrag,
  }
}

// Dateivalidierung
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '5242880')
  const allowedTypes = (process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES || 'application/pdf,image/jpeg,image/png').split(',')
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Datei zu groß. Maximum: ${Math.round(maxSize / 1024 / 1024)}MB`,
    }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Ungültiger Dateityp. Erlaubt: PDF, JPG, PNG',
    }
  }
  
  return { valid: true }
}

// Email-Validierung
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// Betrag-Validierung
export function validateBetrag(betrag: number | string): { valid: boolean; error?: string } {
  const num = typeof betrag === 'string' ? parseFloat(betrag) : betrag
  
  if (isNaN(num)) {
    return { valid: false, error: 'Ungültiger Betrag' }
  }
  
  if (num < 0) {
    return { valid: false, error: 'Betrag muss positiv sein' }
  }
  
  if (num > 100000) {
    return { valid: false, error: 'Betrag zu hoch' }
  }
  
  // Maximal 2 Nachkommastellen
  if (!Number.isInteger(num * 100)) {
    return { valid: false, error: 'Maximal 2 Nachkommastellen erlaubt' }
  }
  
  return { valid: true }
}

// Slug generieren
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Dateiname generieren
export function generateFilename(prefix: string, extension: string = 'pdf'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const random = Math.random().toString(36).substring(2, 8)
  return `${prefix}_${timestamp}_${random}.${extension}`
}

// Zufälliges Passwort generieren
export function generatePassword(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return password
}

// Fehlerbehandlung
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return 'Ein unbekannter Fehler ist aufgetreten'
}

// Array nach Feld gruppieren
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key])
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {} as Record<string, T[]>)
}

// Summe berechnen
export function sum(array: number[]): number {
  return array.reduce((acc, val) => acc + val, 0)
}

// Durchschnitt berechnen
export function average(array: number[]): number {
  if (array.length === 0) return 0
  return sum(array) / array.length
}
