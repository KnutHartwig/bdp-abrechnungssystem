import { db, users, aktionen, abrechnungen } from "./db";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Tabellen leeren (in richtiger Reihenfolge wegen Foreign Keys)
    console.log("Clearing existing data...");
    await db.delete(abrechnungen);
    await db.delete(aktionen);
    await db.delete(users);

    // Sequenzen zurücksetzen
    await db.execute(sql`ALTER SEQUENCE users_id_seq RESTART WITH 1`);
    await db.execute(sql`ALTER SEQUENCE aktionen_id_seq RESTART WITH 1`);
    await db.execute(sql`ALTER SEQUENCE abrechnungen_id_seq RESTART WITH 1`);

    // Benutzer erstellen
    console.log("Creating users...");
    const [admin1] = await db.insert(users).values({
      replUserId: "test-admin-1",
      email: "admin@bdp-bawue.de",
      name: "Max Mustermann",
      role: "ADMIN",
    }).returning();

    const [admin2] = await db.insert(users).values({
      replUserId: "test-admin-2",
      email: "leiter@bdp-bawue.de",
      name: "Anna Schmidt",
      role: "ADMIN",
    }).returning();

    const [landeskasse] = await db.insert(users).values({
      replUserId: "test-landeskasse",
      email: "kasse@bdp-bawue.de",
      name: "Landeskasse BdP",
      role: "LANDESKASSE",
    }).returning();

    console.log(`✅ Created ${3} users`);

    // Aktionen erstellen
    console.log("Creating aktionen...");
    const [aktion1] = await db.insert(aktionen).values({
      name: "Sommercamp 2025",
      zeitraum: "15.07.2025 - 22.07.2025",
      ort: "Zeltplatz Schwarzwald",
      verpflegungstage: 14,
      zuschusstage: 5,
      kassenverantwortlicher: "Max Mustermann",
      iban: "DE89370400440532013000",
      status: "AKTIV",
      createdBy: admin1.id,
    }).returning();

    const [aktion2] = await db.insert(aktionen).values({
      name: "Gruppenleiter-Schulung Frühjahr",
      zeitraum: "12.04.2025 - 14.04.2025",
      ort: "Jugendhaus Stuttgart",
      verpflegungstage: 4,
      zuschusstage: 2,
      kassenverantwortlicher: "Anna Schmidt",
      iban: "DE89370400440532013001",
      status: "AKTIV",
      createdBy: admin2.id,
    }).returning();

    const [aktion3] = await db.insert(aktionen).values({
      name: "Osteraktion 2025",
      zeitraum: "10.04.2025 - 13.04.2025",
      ort: "Pfadfinderhütte Tübingen",
      verpflegungstage: 8,
      zuschusstage: 3,
      kassenverantwortlicher: "Max Mustermann",
      iban: "DE89370400440532013000",
      status: "ABGESCHLOSSEN",
      createdBy: admin1.id,
    }).returning();

    console.log(`✅ Created ${3} aktionen`);

    // Abrechnungen für Sommercamp erstellen
    console.log("Creating abrechnungen for Sommercamp...");
    
    // Teilnahmebeiträge
    await db.insert(abrechnungen).values([
      {
        aktionId: aktion1.id,
        kategorie: "TEILNAHMEBEITRAEGE",
        name: "Lisa Müller",
        stammGruppe: "Stamm Adler",
        betrag: "120.00",
        status: "EINGEREICHT",
      },
      {
        aktionId: aktion1.id,
        kategorie: "TEILNAHMEBEITRAEGE",
        name: "Tom Weber",
        stammGruppe: "Stamm Adler",
        betrag: "120.00",
        status: "EINGEREICHT",
      },
      {
        aktionId: aktion1.id,
        kategorie: "TEILNAHMEBEITRAEGE",
        name: "Sarah Klein",
        stammGruppe: "Landesleitung",
        betrag: "150.00",
        status: "EINGEREICHT",
      },
    ]);

    // Sonstige Einnahmen
    await db.insert(abrechnungen).values({
      aktionId: aktion1.id,
      kategorie: "SONSTIGE_EINNAHMEN",
      datum: "2025-07-15",
      beschreibung: "Spende vom Förderverein",
      betrag: "200.00",
      belegNr: "SP-001",
      status: "EINGEREICHT",
    });

    // Vorschuss
    await db.insert(abrechnungen).values({
      aktionId: aktion1.id,
      kategorie: "VORSCHUSS",
      beschreibung: "Vorschuss erhalten von Landeskasse",
      betrag: "500.00",
      status: "EINGEREICHT",
    });

    // Fahrtkosten
    await db.insert(abrechnungen).values([
      {
        aktionId: aktion1.id,
        kategorie: "FAHRTKOSTEN",
        name: "Max Mustermann",
        stammGruppe: "Stamm Adler",
        beschreibung: "Stuttgart - Schwarzwald - Stuttgart (240 km)",
        zuordnung: "Maßnahme",
        betrag: "72.00",
        belegNr: "FK-001",
        status: "EINGEREICHT",
      },
      {
        aktionId: aktion1.id,
        kategorie: "FAHRTKOSTEN",
        name: "Anna Schmidt",
        stammGruppe: "Landesleitung",
        beschreibung: "Karlsruhe - Schwarzwald - Karlsruhe (160 km)",
        zuordnung: "Maßnahme",
        betrag: "48.00",
        belegNr: "FK-002",
        status: "EINGEREICHT",
      },
    ]);

    // Unterkunft
    await db.insert(abrechnungen).values({
      aktionId: aktion1.id,
      kategorie: "UNTERKUNFT",
      datum: "2025-07-15",
      beschreibung: "Zeltplatzmiete für 7 Tage",
      zuordnung: "Maßnahme",
      betrag: "350.00",
      belegNr: "RE-2025-0715",
      status: "EINGEREICHT",
    });

    // Verpflegung
    await db.insert(abrechnungen).values([
      {
        aktionId: aktion1.id,
        kategorie: "VERPFLEGUNG",
        datum: "2025-07-14",
        beschreibung: "REWE - Lebensmitteleinkauf",
        betrag: "234.50",
        belegNr: "REWE-001",
        status: "EINGEREICHT",
      },
      {
        aktionId: aktion1.id,
        kategorie: "VERPFLEGUNG",
        datum: "2025-07-18",
        beschreibung: "Edeka - Nachkauf Obst und Gemüse",
        betrag: "87.30",
        belegNr: "EDEKA-001",
        status: "EINGEREICHT",
      },
    ]);

    // Material
    await db.insert(abrechnungen).values([
      {
        aktionId: aktion1.id,
        kategorie: "MATERIAL",
        datum: "2025-07-10",
        beschreibung: "Baumarkt - Holz für Lagerfeuer",
        zuordnung: "Maßnahme",
        betrag: "45.00",
        belegNr: "BM-001",
        status: "EINGEREICHT",
      },
      {
        aktionId: aktion1.id,
        kategorie: "MATERIAL",
        datum: "2025-07-12",
        beschreibung: "Bastelmaterial - Programmmaterial",
        zuordnung: "Maßnahme",
        betrag: "32.90",
        belegNr: "BS-001",
        status: "EINGEREICHT",
      },
    ]);

    // Porto
    await db.insert(abrechnungen).values({
      aktionId: aktion1.id,
      kategorie: "PORTO",
      datum: "2025-07-05",
      beschreibung: "Briefporto für Einladungen",
      zuordnung: "Verwaltung",
      betrag: "12.60",
      belegNr: "POST-001",
      status: "EINGEREICHT",
    });

    // Abrechnungen für Gruppenleiter-Schulung
    console.log("Creating abrechnungen for Gruppenleiter-Schulung...");
    
    await db.insert(abrechnungen).values([
      {
        aktionId: aktion2.id,
        kategorie: "TEILNAHMEBEITRAEGE",
        name: "Julia Berg",
        stammGruppe: "Stamm Phoenix",
        betrag: "50.00",
        status: "ENTWURF",
      },
      {
        aktionId: aktion2.id,
        kategorie: "TEILNAHMEBEITRAEGE",
        name: "Michael Wolf",
        stammGruppe: "Stamm Phoenix",
        betrag: "50.00",
        status: "ENTWURF",
      },
      {
        aktionId: aktion2.id,
        kategorie: "UNTERKUNFT",
        datum: "2025-04-12",
        beschreibung: "Jugendhaus Stuttgart - Wochenende",
        zuordnung: "Maßnahme",
        betrag: "280.00",
        belegNr: "JH-2025-04",
        status: "ENTWURF",
      },
      {
        aktionId: aktion2.id,
        kategorie: "VERPFLEGUNG",
        datum: "2025-04-11",
        beschreibung: "Catering für Schulung",
        betrag: "156.00",
        belegNr: "CAT-001",
        status: "ENTWURF",
      },
    ]);

    // Abrechnungen für Osteraktion (abgeschlossen)
    console.log("Creating abrechnungen for Osteraktion...");
    
    await db.insert(abrechnungen).values([
      {
        aktionId: aktion3.id,
        kategorie: "TEILNAHMEBEITRAEGE",
        name: "Emma Fischer",
        stammGruppe: "Stamm Falken",
        betrag: "80.00",
        status: "VERSENDET",
      },
      {
        aktionId: aktion3.id,
        kategorie: "TEILNAHMEBEITRAEGE",
        name: "Lukas Bauer",
        stammGruppe: "Stamm Falken",
        betrag: "80.00",
        status: "VERSENDET",
      },
      {
        aktionId: aktion3.id,
        kategorie: "VERPFLEGUNG",
        datum: "2025-04-09",
        beschreibung: "Lebensmitteleinkauf Ostern",
        betrag: "145.20",
        belegNr: "REWE-OST",
        status: "VERSENDET",
      },
      {
        aktionId: aktion3.id,
        kategorie: "OFFENE_VERBINDLICHKEITEN",
        beschreibung: "Hüttenmiete - Rechnung erwartet",
        betrag: "200.00",
        status: "VERSENDET",
      },
    ]);

    const abrechnungenCount = await db.select().from(abrechnungen);
    console.log(`✅ Created ${abrechnungenCount.length} abrechnungen`);

    console.log("\n✅ Seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   Users: 3 (2 Admins, 1 Landeskasse)`);
    console.log(`   Aktionen: 3 (2 aktiv, 1 abgeschlossen)`);
    console.log(`   Abrechnungen: ${abrechnungenCount.length}`);
    console.log("\n🔐 Test Accounts:");
    console.log(`   Admin 1: admin@bdp-bawue.de (Max Mustermann)`);
    console.log(`   Admin 2: leiter@bdp-bawue.de (Anna Schmidt)`);
    console.log(`   Landeskasse: kasse@bdp-bawue.de`);

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

// Wenn direkt ausgeführt
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seed };
