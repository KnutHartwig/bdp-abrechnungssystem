import { z } from "zod";

// ==================== ENUMS ====================

export const RoleEnum = z.enum(["ADMIN", "LANDESKASSE"]);
export type Role = z.infer<typeof RoleEnum>;

export const AktionStatusEnum = z.enum(["AKTIV", "INAKTIV", "ABGESCHLOSSEN"]);
export type AktionStatus = z.infer<typeof AktionStatusEnum>;

export const AbrechnungStatusEnum = z.enum(["ENTWURF", "EINGEREICHT", "VERSENDET"]);
export type AbrechnungStatus = z.infer<typeof AbrechnungStatusEnum>;

export const KategorieEnum = z.enum([
  "TEILNAHMEBEITRAEGE",
  "SONSTIGE_EINNAHMEN",
  "VORSCHUSS",
  "FAHRTKOSTEN",
  "UNTERKUNFT",
  "VERPFLEGUNG",
  "MATERIAL",
  "PORTO",
  "TELEKOMMUNIKATION",
  "SONSTIGE_AUSGABEN",
  "OFFENE_VERBINDLICHKEITEN",
]);
export type Kategorie = z.infer<typeof KategorieEnum>;

// Kategorien Gruppen für UI
export const EINNAHMEN_KATEGORIEN: Kategorie[] = [
  "TEILNAHMEBEITRAEGE",
  "SONSTIGE_EINNAHMEN",
  "VORSCHUSS",
];

export const AUSGABEN_KATEGORIEN: Kategorie[] = [
  "FAHRTKOSTEN",
  "UNTERKUNFT",
  "VERPFLEGUNG",
  "MATERIAL",
  "PORTO",
  "TELEKOMMUNIKATION",
  "SONSTIGE_AUSGABEN",
  "OFFENE_VERBINDLICHKEITEN",
];

// Kategorie Labels (deutsch)
export const KATEGORIE_LABELS: Record<Kategorie, string> = {
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

// ==================== USER SCHEMAS ====================

export const insertUserSchema = z.object({
  replUserId: z.string().optional(),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
  role: RoleEnum.default("ADMIN"),
});

export const selectUserSchema = insertUserSchema.extend({
  id: z.number(),
  createdAt: z.date(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type SelectUser = z.infer<typeof selectUserSchema>;

// ==================== AKTION SCHEMAS ====================

export const insertAktionSchema = z.object({
  name: z.string().min(3, "Name muss mindestens 3 Zeichen lang sein"),
  zeitraum: z.string().min(3, "Zeitraum muss angegeben werden"),
  ort: z.string().min(2, "Ort muss angegeben werden"),
  verpflegungstage: z.number().int().min(0, "Verpflegungstage müssen >= 0 sein").default(0),
  zuschusstage: z.number().int().min(0, "Zuschusstage müssen >= 0 sein").default(0),
  kassenverantwortlicher: z.string().min(2, "Kassenverantwortlicher muss angegeben werden"),
  iban: z.string().optional(),
  status: AktionStatusEnum.default("AKTIV"),
  createdBy: z.number(),
});

export const selectAktionSchema = insertAktionSchema.extend({
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const updateAktionSchema = insertAktionSchema.partial().omit({ createdBy: true });

export type InsertAktion = z.infer<typeof insertAktionSchema>;
export type SelectAktion = z.infer<typeof selectAktionSchema>;
export type UpdateAktion = z.infer<typeof updateAktionSchema>;

// ==================== ABRECHNUNG SCHEMAS ====================

// Base Schema - Gemeinsame Felder
const baseAbrechnungSchema = z.object({
  aktionId: z.number(),
  kategorie: KategorieEnum,
  betrag: z.string().regex(/^\d+(\.\d{1,2})?$/, "Betrag muss Format haben: 123.45"),
  status: AbrechnungStatusEnum.default("ENTWURF"),
});

// Optionale Felder
const optionalAbrechnungFields = z.object({
  datum: z.string().optional(),
  beschreibung: z.string().optional(),
  name: z.string().optional(),
  stammGruppe: z.string().optional(),
  belegNr: z.string().optional(),
  zuordnung: z.string().optional(),
  fileUrl: z.string().optional(),
});

// Insert Schema - Alle optionalen Felder
export const insertAbrechnungSchema = baseAbrechnungSchema.merge(optionalAbrechnungFields);

// Select Schema - Mit ID und Timestamps
export const selectAbrechnungSchema = insertAbrechnungSchema.extend({
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Update Schema - Alle Felder optional außer ID
export const updateAbrechnungSchema = insertAbrechnungSchema.partial();

// Spezifische Schemas für verschiedene Kategorien (für bessere Validierung im Frontend)
export const teilnahmebeitraegeSchema = baseAbrechnungSchema.extend({
  kategorie: z.literal("TEILNAHMEBEITRAEGE"),
  name: z.string().min(2, "Name muss angegeben werden"),
  stammGruppe: z.string().min(2, "Stamm/Gruppe muss angegeben werden"),
}).merge(optionalAbrechnungFields.omit({ name: true, stammGruppe: true }));

export const fahrtkostenSchema = baseAbrechnungSchema.extend({
  kategorie: z.literal("FAHRTKOSTEN"),
  name: z.string().min(2, "Name muss angegeben werden"),
  stammGruppe: z.string().min(2, "Stamm/Gruppe muss angegeben werden"),
  beschreibung: z.string().min(3, "Beschreibung muss angegeben werden (z.B. Route)"),
  zuordnung: z.enum(["Maßnahme", "Verwaltung"]),
  belegNr: z.string().optional(),
}).merge(optionalAbrechnungFields.omit({ 
  name: true, 
  stammGruppe: true, 
  beschreibung: true, 
  zuordnung: true,
  belegNr: true 
}));

export const unterkunftSchema = baseAbrechnungSchema.extend({
  kategorie: z.literal("UNTERKUNFT"),
  datum: z.string().min(1, "Datum muss angegeben werden"),
  beschreibung: z.string().min(3, "Beschreibung muss angegeben werden"),
  zuordnung: z.enum(["Maßnahme", "Verwaltung"]),
  belegNr: z.string().min(1, "Beleg-Nr. muss angegeben werden"),
}).merge(optionalAbrechnungFields.omit({ 
  datum: true, 
  beschreibung: true, 
  zuordnung: true,
  belegNr: true 
}));

export const verpflegungSchema = baseAbrechnungSchema.extend({
  kategorie: z.literal("VERPFLEGUNG"),
  datum: z.string().min(1, "Datum muss angegeben werden"),
  beschreibung: z.string().min(3, "Beschreibung muss angegeben werden"),
  belegNr: z.string().min(1, "Beleg-Nr. muss angegeben werden"),
}).merge(optionalAbrechnungFields.omit({ 
  datum: true, 
  beschreibung: true,
  belegNr: true 
}));

export const materialSchema = baseAbrechnungSchema.extend({
  kategorie: z.literal("MATERIAL"),
  datum: z.string().min(1, "Datum muss angegeben werden"),
  beschreibung: z.string().min(3, "Beschreibung muss angegeben werden"),
  zuordnung: z.enum(["Maßnahme", "Verwaltung"]),
  belegNr: z.string().min(1, "Beleg-Nr. muss angegeben werden"),
}).merge(optionalAbrechnungFields.omit({ 
  datum: true, 
  beschreibung: true, 
  zuordnung: true,
  belegNr: true 
}));

export const portoSchema = baseAbrechnungSchema.extend({
  kategorie: z.literal("PORTO"),
  datum: z.string().min(1, "Datum muss angegeben werden"),
  beschreibung: z.string().min(3, "Beschreibung muss angegeben werden"),
  zuordnung: z.enum(["Maßnahme", "Verwaltung"]),
  belegNr: z.string().min(1, "Beleg-Nr. muss angegeben werden"),
}).merge(optionalAbrechnungFields.omit({ 
  datum: true, 
  beschreibung: true, 
  zuordnung: true,
  belegNr: true 
}));

export const telekommunikationSchema = baseAbrechnungSchema.extend({
  kategorie: z.literal("TELEKOMMUNIKATION"),
  datum: z.string().min(1, "Datum muss angegeben werden"),
  beschreibung: z.string().min(3, "Beschreibung muss angegeben werden"),
  zuordnung: z.enum(["Maßnahme", "Verwaltung"]),
  belegNr: z.string().min(1, "Beleg-Nr. muss angegeben werden"),
}).merge(optionalAbrechnungFields.omit({ 
  datum: true, 
  beschreibung: true, 
  zuordnung: true,
  belegNr: true 
}));

export const sonstigeAusgabenSchema = baseAbrechnungSchema.extend({
  kategorie: z.literal("SONSTIGE_AUSGABEN"),
  datum: z.string().min(1, "Datum muss angegeben werden"),
  beschreibung: z.string().min(3, "Beschreibung muss angegeben werden"),
  zuordnung: z.enum(["Maßnahme", "Verwaltung"]),
  belegNr: z.string().min(1, "Beleg-Nr. muss angegeben werden"),
}).merge(optionalAbrechnungFields.omit({ 
  datum: true, 
  beschreibung: true, 
  zuordnung: true,
  belegNr: true 
}));

export const offeneVerbindlichkeitenSchema = baseAbrechnungSchema.extend({
  kategorie: z.literal("OFFENE_VERBINDLICHKEITEN"),
  beschreibung: z.string().min(3, "Beschreibung muss angegeben werden"),
}).merge(optionalAbrechnungFields.omit({ beschreibung: true }));

export const sonstigeEinnahmenSchema = baseAbrechnungSchema.extend({
  kategorie: z.literal("SONSTIGE_EINNAHMEN"),
  datum: z.string().min(1, "Datum muss angegeben werden"),
  beschreibung: z.string().min(3, "Beschreibung muss angegeben werden"),
  belegNr: z.string().min(1, "Beleg-Nr. muss angegeben werden"),
}).merge(optionalAbrechnungFields.omit({ 
  datum: true, 
  beschreibung: true,
  belegNr: true 
}));

export const vorschussSchema = baseAbrechnungSchema.extend({
  kategorie: z.literal("VORSCHUSS"),
  beschreibung: z.string().min(3, "Beschreibung muss angegeben werden"),
}).merge(optionalAbrechnungFields.omit({ beschreibung: true }));

// Type Exports
export type InsertAbrechnung = z.infer<typeof insertAbrechnungSchema>;
export type SelectAbrechnung = z.infer<typeof selectAbrechnungSchema>;
export type UpdateAbrechnung = z.infer<typeof updateAbrechnungSchema>;

// ==================== HELPER FUNCTIONS ====================

export function isEinnahme(kategorie: Kategorie): boolean {
  return EINNAHMEN_KATEGORIEN.includes(kategorie);
}

export function isAusgabe(kategorie: Kategorie): boolean {
  return AUSGABEN_KATEGORIEN.includes(kategorie);
}

export function getKategorieLabel(kategorie: Kategorie): string {
  return KATEGORIE_LABELS[kategorie];
}

// Gibt das richtige Schema für eine Kategorie zurück
export function getSchemaForKategorie(kategorie: Kategorie) {
  switch (kategorie) {
    case "TEILNAHMEBEITRAEGE":
      return teilnahmebeitraegeSchema;
    case "FAHRTKOSTEN":
      return fahrtkostenSchema;
    case "UNTERKUNFT":
      return unterkunftSchema;
    case "VERPFLEGUNG":
      return verpflegungSchema;
    case "MATERIAL":
      return materialSchema;
    case "PORTO":
      return portoSchema;
    case "TELEKOMMUNIKATION":
      return telekommunikationSchema;
    case "SONSTIGE_AUSGABEN":
      return sonstigeAusgabenSchema;
    case "OFFENE_VERBINDLICHKEITEN":
      return offeneVerbindlichkeitenSchema;
    case "SONSTIGE_EINNAHMEN":
      return sonstigeEinnahmenSchema;
    case "VORSCHUSS":
      return vorschussSchema;
    default:
      return insertAbrechnungSchema;
  }
}
