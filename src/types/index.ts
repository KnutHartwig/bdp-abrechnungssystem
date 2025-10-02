import { Abrechnung, Aktion, Kategorie, User, UserRole, AktionStatus, AbrechnungStatus, Fahrzeugtyp } from '@prisma/client'

// Extended Types with Relations
export type AbrechnungWithRelations = Abrechnung & {
  aktion: Aktion
  kategorie: Kategorie
}

export type AktionWithRelations = Aktion & {
  abrechnungen: Abrechnung[]
  verantwortlicher?: User | null
}

// Form Data Types
export interface AbrechnungsFormData {
  name: string
  stamm: string
  email: string
  aktionId: string
  kategorieId: string
  belegbeschreibung?: string
  belegdatum: Date | string
  betrag: number | string
  
  // Fahrtkosten-spezifisch (optional)
  fahrzeugtyp?: Fahrzeugtyp
  streckeKm?: number
  mitfahrer?: number
  istLagerleitung?: boolean
  hatMaterial?: boolean
  hatAnhaenger?: boolean
  
  // Beleg
  beleg?: File
}

export interface FahrkostenBerechnung {
  basiskm: number
  kmSatz: number
  zuschlagLagerleitung: number
  zuschlagMaterial: number
  zuschlagAnhaenger: number
  gesamtSatz: number
  betrag: number
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// PDF Generation Types
export interface PDFGenerationOptions {
  aktionId: string
  inkludiereEntwuerfe?: boolean
}

export interface PDFMetadata {
  aktion: Aktion
  erstelltAm: Date
  gesamtbetrag: number
  anzahlPosten: number
  kategorien: {
    kategorie: string
    anzahl: number
    summe: number
  }[]
}

// Email Types
export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  attachments?: {
    filename: string
    path?: string
    content?: Buffer
    contentType?: string
  }[]
}

// Filter & Query Types
export interface AbrechnungsFilter {
  aktionId?: string
  kategorieId?: string
  status?: AbrechnungStatus
  email?: string
  dateFrom?: Date
  dateTo?: Date
  search?: string
}

export interface AbrechnungsStats {
  gesamt: number
  entwuerfe: number
  eingereicht: number
  versendet: number
  gesamtbetrag: number
  nachKategorie: {
    kategorie: string
    anzahl: number
    summe: number
  }[]
}

// NextAuth Extensions
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
    }
  }

  interface User {
    role: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    id: string
  }
}

// Validation Schemas (will be used with Zod)
export const KATEGORIEN = [
  'Teilnahmebeiträge',
  'Fahrtkosten',
  'Unterkunft',
  'Verpflegung',
  'Material',
  'Porto',
  'Telekommunikation',
  'Honorare',
  'Raummiete',
  'Versicherungen',
  'Sonstige Ausgaben',
] as const

export type KategorieName = typeof KATEGORIEN[number]

// Fahrtkosten-Konfiguration
export const FAHRZEUGTYP_SAETZE: Record<Fahrzeugtyp, number> = {
  PKW_SOLO: 0.30,
  PKW_MITFAHRER_1: 0.35,
  PKW_MITFAHRER_2: 0.40,
  PKW_MITFAHRER_3_PLUS: 0.50,
  MOTORRAD: 0.10,
}

export const ZUSCHLAEGE = {
  LAGERLEITUNG: 0.05,
  MATERIAL: 0.05,
  ANHAENGER: 0.05,
} as const

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

export {
  UserRole,
  AktionStatus,
  AbrechnungStatus,
  Fahrzeugtyp,
}
