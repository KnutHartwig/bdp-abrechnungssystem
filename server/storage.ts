import { db, users, aktionen, abrechnungen } from "./db";
import type { User, NewUser, Aktion, NewAktion, Abrechnung, NewAbrechnung } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

// ==================== USER OPERATIONS ====================

export async function createUser(data: NewUser): Promise<User> {
  const [user] = await db.insert(users).values(data).returning();
  return user;
}

export async function getUserByReplId(replUserId: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.replUserId, replUserId));
  return user;
}

export async function getUserById(id: number): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function getAllUsers(): Promise<User[]> {
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUser(id: number, data: Partial<NewUser>): Promise<User | undefined> {
  const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
  return user;
}

// ==================== AKTION OPERATIONS ====================

export async function createAktion(data: NewAktion): Promise<Aktion> {
  const [aktion] = await db.insert(aktionen).values({
    ...data,
    updatedAt: new Date(),
  }).returning();
  return aktion;
}

export async function getAktionById(id: number): Promise<Aktion | undefined> {
  const [aktion] = await db.select().from(aktionen).where(eq(aktionen.id, id));
  return aktion;
}

export async function getAllAktionen(): Promise<Aktion[]> {
  return db.select().from(aktionen).orderBy(desc(aktionen.createdAt));
}

export async function getAktionenByUser(userId: number): Promise<Aktion[]> {
  return db.select().from(aktionen).where(eq(aktionen.createdBy, userId)).orderBy(desc(aktionen.createdAt));
}

export async function getActiveAktionen(): Promise<Aktion[]> {
  return db.select().from(aktionen).where(eq(aktionen.status, "AKTIV")).orderBy(desc(aktionen.createdAt));
}

export async function updateAktion(id: number, data: Partial<NewAktion>): Promise<Aktion | undefined> {
  const [aktion] = await db.update(aktionen).set({
    ...data,
    updatedAt: new Date(),
  }).where(eq(aktionen.id, id)).returning();
  return aktion;
}

export async function deleteAktion(id: number): Promise<void> {
  await db.delete(aktionen).where(eq(aktionen.id, id));
}

// ==================== ABRECHNUNG OPERATIONS ====================

export async function createAbrechnung(data: NewAbrechnung): Promise<Abrechnung> {
  const [abrechnung] = await db.insert(abrechnungen).values({
    ...data,
    updatedAt: new Date(),
  }).returning();
  return abrechnung;
}

export async function getAbrechnungById(id: number): Promise<Abrechnung | undefined> {
  const [abrechnung] = await db.select().from(abrechnungen).where(eq(abrechnungen.id, id));
  return abrechnung;
}

export async function getAbrechnungenByAktion(aktionId: number): Promise<Abrechnung[]> {
  return db.select().from(abrechnungen).where(eq(abrechnungen.aktionId, aktionId)).orderBy(desc(abrechnungen.createdAt));
}

export async function getAllAbrechnungen(): Promise<Abrechnung[]> {
  return db.select().from(abrechnungen).orderBy(desc(abrechnungen.createdAt));
}

export async function getAbrechnungenByKategorie(aktionId: number, kategorie: string): Promise<Abrechnung[]> {
  return db.select().from(abrechnungen).where(
    and(
      eq(abrechnungen.aktionId, aktionId),
      eq(abrechnungen.kategorie, kategorie)
    )
  ).orderBy(desc(abrechnungen.createdAt));
}

export async function updateAbrechnung(id: number, data: Partial<NewAbrechnung>): Promise<Abrechnung | undefined> {
  const [abrechnung] = await db.update(abrechnungen).set({
    ...data,
    updatedAt: new Date(),
  }).where(eq(abrechnungen.id, id)).returning();
  return abrechnung;
}

export async function deleteAbrechnung(id: number): Promise<void> {
  await db.delete(abrechnungen).where(eq(abrechnungen.id, id));
}

export async function updateAbrechnungStatus(id: number, status: "ENTWURF" | "EINGEREICHT" | "VERSENDET"): Promise<Abrechnung | undefined> {
  return updateAbrechnung(id, { status });
}

export async function bulkUpdateAbrechnungStatus(aktionId: number, status: "ENTWURF" | "EINGEREICHT" | "VERSENDET"): Promise<void> {
  await db.update(abrechnungen)
    .set({ status, updatedAt: new Date() })
    .where(eq(abrechnungen.aktionId, aktionId));
}

// ==================== STATISTICS & SUMMARIES ====================

export async function getAktionSummary(aktionId: number) {
  const abrechnungenList = await getAbrechnungenByAktion(aktionId);
  
  const einnahmen = abrechnungenList
    .filter(a => ["TEILNAHMEBEITRAEGE", "SONSTIGE_EINNAHMEN", "VORSCHUSS"].includes(a.kategorie))
    .reduce((sum, a) => sum + parseFloat(a.betrag), 0);
  
  const ausgaben = abrechnungenList
    .filter(a => !["TEILNAHMEBEITRAEGE", "SONSTIGE_EINNAHMEN", "VORSCHUSS"].includes(a.kategorie))
    .reduce((sum, a) => sum + parseFloat(a.betrag), 0);
  
  const kategorienSummen: Record<string, number> = {};
  abrechnungenList.forEach(a => {
    if (!kategorienSummen[a.kategorie]) {
      kategorienSummen[a.kategorie] = 0;
    }
    kategorienSummen[a.kategorie] += parseFloat(a.betrag);
  });
  
  return {
    einnahmen,
    ausgaben,
    bilanz: einnahmen - ausgaben,
    kategorienSummen,
    anzahlAbrechnungen: abrechnungenList.length,
  };
}

export async function getTeilnehmerAnzahl(aktionId: number): Promise<number> {
  const teilnehmer = await db.select().from(abrechnungen).where(
    and(
      eq(abrechnungen.aktionId, aktionId),
      eq(abrechnungen.kategorie, "TEILNAHMEBEITRAEGE")
    )
  );
  return teilnehmer.length;
}
