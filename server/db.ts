import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, text, serial, integer, timestamp, decimal, pgEnum } from "drizzle-orm/pg-core";
import pkg from "pg";
const { Pool } = pkg;

// Enums
export const roleEnum = pgEnum("role", ["ADMIN", "LANDESKASSE"]);
export const aktionStatusEnum = pgEnum("aktion_status", ["AKTIV", "INAKTIV", "ABGESCHLOSSEN"]);
export const abrechnungStatusEnum = pgEnum("abrechnung_status", ["ENTWURF", "EINGEREICHT", "VERSENDET"]);
export const kategorieEnum = pgEnum("kategorie", [
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
  "OFFENE_VERBINDLICHKEITEN"
]);

// Users Tabelle
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  replUserId: text("repl_user_id").unique(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: roleEnum("role").notNull().default("ADMIN"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Aktionen Tabelle
export const aktionen = pgTable("aktionen", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  zeitraum: text("zeitraum").notNull(),
  ort: text("ort").notNull(),
  verpflegungstage: integer("verpflegungstage").notNull().default(0),
  zuschusstage: integer("zuschusstage").notNull().default(0),
  kassenverantwortlicher: text("kassenverantwortlicher").notNull(),
  iban: text("iban"),
  status: aktionStatusEnum("status").notNull().default("AKTIV"),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Abrechnungen Tabelle
export const abrechnungen = pgTable("abrechnungen", {
  id: serial("id").primaryKey(),
  aktionId: integer("aktion_id").notNull().references(() => aktionen.id, { onDelete: "cascade" }),
  kategorie: kategorieEnum("kategorie").notNull(),
  datum: text("datum"),
  beschreibung: text("beschreibung"),
  name: text("name"),
  stammGruppe: text("stamm_gruppe"),
  betrag: decimal("betrag", { precision: 10, scale: 2 }).notNull(),
  belegNr: text("beleg_nr"),
  zuordnung: text("zuordnung"),
  status: abrechnungStatusEnum("status").notNull().default("ENTWURF"),
  fileUrl: text("file_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Database Connection
const connectionString = process.env.DATABASE_URL!;

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool);

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Aktion = typeof aktionen.$inferSelect;
export type NewAktion = typeof aktionen.$inferInsert;
export type Abrechnung = typeof abrechnungen.$inferSelect;
export type NewAbrechnung = typeof abrechnungen.$inferInsert;
