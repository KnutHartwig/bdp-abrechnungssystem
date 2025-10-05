import { PrismaClient, Kategorie, Fahrzeugtyp, AktionStatus, AbrechnungStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starte Seed-Prozess...');

  // Lösche existierende Daten
  await prisma.abrechnung.deleteMany();
  await prisma.aktion.deleteMany();
  await prisma.user.deleteMany();

  // 1. Admin-User erstellen
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@bdp-bawue.de',
      name: 'Admin BdP',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const landeskasseUser = await prisma.user.create({
    data: {
      email: 'kasse@bdp-bawue.de',
      name: 'Landeskasse',
      password: hashedPassword,
      role: 'LANDESKASSE',
    },
  });

  console.log('✅ Admin-User erstellt');

  // 2. Test-Aktionen erstellen
  const sommerlager2025 = await prisma.aktion.create({
    data: {
      titel: 'Sommerlager 2025',
      beschreibung: 'Landesweites Sommerlager am Bodensee mit allen Stämmen',
      startdatum: new Date('2025-08-01'),
      enddatum: new Date('2025-08-15'),
      status: AktionStatus.AKTIV,
    },
  });

  const herbstfahrt2025 = await prisma.aktion.create({
    data: {
      titel: 'Herbstfahrt 2025',
      beschreibung: 'Wochenend-Wanderfahrt im Schwarzwald',
      startdatum: new Date('2025-10-10'),
      enddatum: new Date('2025-10-12'),
      status: AktionStatus.AKTIV,
    },
  });

  const jahresschulung = await prisma.aktion.create({
    data: {
      titel: 'Jahresschulung 2024',
      beschreibung: 'Fortbildung für Gruppenleiter*innen',
      startdatum: new Date('2024-11-01'),
      enddatum: new Date('2024-11-03'),
      status: AktionStatus.ABGESCHLOSSEN,
    },
  });

  console.log('✅ Test-Aktionen erstellt');

  // 3. Beispiel-Abrechnungen mit allen Kategorien
  
  // Teilnahmebeiträge
  await prisma.abrechnung.create({
    data: {
      name: 'Max Mustermann',
      stamm: 'Stamm Heilbronn',
      email: 'max@example.com',
      iban: 'DE89370400440532013000',
      aktionId: sommerlager2025.id,
      kategorie: Kategorie.TEILNAHMEBEITRAEGE,
      belegbeschreibung: 'Teilnahmebeitrag Kind 1',
      belegdatum: new Date('2025-08-01'),
      betrag: 120.00,
      status: AbrechnungStatus.ENTWURF,
    },
  });

  // Fahrtkosten mit kmSatz
  await prisma.abrechnung.create({
    data: {
      name: 'Lisa Schmidt',
      stamm: 'Stamm Stuttgart',
      email: 'lisa@example.com',
      iban: 'DE89370400440532013001',
      aktionId: sommerlager2025.id,
      kategorie: Kategorie.FAHRTKOSTEN,
      belegbeschreibung: 'Fahrt zum Sommerlager',
      belegdatum: new Date('2025-08-01'),
      kilometer: 250,
      fahrzeugtyp: Fahrzeugtyp.PKW,
      kmSatz: 0.30, // PKW-Satz
      mitfahrer: 3,
      zuschlagLagerleitung: true,
      betrag: 88.75, // 250km * (0.30 + 0.05 Zuschlag Lagerleitung)
      status: AbrechnungStatus.EINGEREICHT,
    },
  });

  // Fahrtkosten Transporter
  await prisma.abrechnung.create({
    data: {
      name: 'Thomas Müller',
      stamm: 'Stamm Karlsruhe',
      email: 'thomas@example.com',
      iban: 'DE89370400440532013002',
      aktionId: herbstfahrt2025.id,
      kategorie: Kategorie.FAHRTKOSTEN,
      belegbeschreibung: 'Materialtransport mit Transporter',
      belegdatum: new Date('2025-10-10'),
      kilometer: 180,
      fahrzeugtyp: Fahrzeugtyp.TRANSPORTER,
      kmSatz: 0.40, // Transporter-Satz
      zuschlagMaterial: true,
      zuschlagAnhaenger: true,
      betrag: 90.00, // 180km * (0.40 + 0.05 + 0.05)
      status: AbrechnungStatus.GEPRUEFT,
    },
  });

  // Unterkunft
  await prisma.abrechnung.create({
    data: {
      name: 'Anna Weber',
      stamm: 'Stamm Freiburg',
      email: 'anna@example.com',
      iban: 'DE89370400440532013003',
      aktionId: sommerlager2025.id,
      kategorie: Kategorie.UNTERKUNFT,
      belegbeschreibung: 'Campingplatz-Gebühren',
      belegdatum: new Date('2025-08-05'),
      betrag: 450.00,
      status: AbrechnungStatus.FREIGEGEBEN,
    },
  });

  // Verpflegung
  await prisma.abrechnung.create({
    data: {
      name: 'Peter Klein',
      stamm: 'Stamm Mannheim',
      email: 'peter@example.com',
      iban: 'DE89370400440532013004',
      aktionId: sommerlager2025.id,
      kategorie: Kategorie.VERPFLEGUNG,
      belegbeschreibung: 'Lebensmitteleinkauf Tag 1-5',
      belegdatum: new Date('2025-08-03'),
      betrag: 380.50,
      status: AbrechnungStatus.EINGEREICHT,
    },
  });

  // Material
  await prisma.abrechnung.create({
    data: {
      name: 'Sarah Hoffmann',
      stamm: 'Stamm Ulm',
      email: 'sarah@example.com',
      iban: 'DE89370400440532013005',
      aktionId: herbstfahrt2025.id,
      kategorie: Kategorie.MATERIAL,
      belegbeschreibung: 'Wanderkarten und Erste-Hilfe-Material',
      belegdatum: new Date('2025-10-08'),
      betrag: 67.90,
      status: AbrechnungStatus.ENTWURF,
    },
  });

  // Porto
  await prisma.abrechnung.create({
    data: {
      name: 'Michael Braun',
      stamm: 'Stamm Heidelberg',
      email: 'michael@example.com',
      iban: 'DE89370400440532013006',
      aktionId: jahresschulung.id,
      kategorie: Kategorie.PORTO,
      belegbeschreibung: 'Versand Schulungsunterlagen',
      belegdatum: new Date('2024-10-25'),
      betrag: 24.50,
      status: AbrechnungStatus.VERSENDET,
    },
  });

  // Telekommunikation
  await prisma.abrechnung.create({
    data: {
      name: 'Julia Schneider',
      stamm: 'Stamm Pforzheim',
      email: 'julia@example.com',
      iban: 'DE89370400440532013007',
      aktionId: sommerlager2025.id,
      kategorie: Kategorie.TELEKOMMUNIKATION,
      belegbeschreibung: 'Mobilfunk-Aufladung für Notfall-Handy',
      belegdatum: new Date('2025-08-01'),
      betrag: 15.00,
      status: AbrechnungStatus.EINGEREICHT,
    },
  });

  // Versicherung
  await prisma.abrechnung.create({
    data: {
      name: 'Frank Meyer',
      stamm: 'Stamm Reutlingen',
      email: 'frank@example.com',
      iban: 'DE89370400440532013008',
      aktionId: sommerlager2025.id,
      kategorie: Kategorie.VERSICHERUNG,
      belegbeschreibung: 'Zusatzversicherung für Wassersportaktivitäten',
      belegdatum: new Date('2025-07-28'),
      betrag: 125.00,
      status: AbrechnungStatus.GEPRUEFT,
    },
  });

  // Honorare
  await prisma.abrechnung.create({
    data: {
      name: 'Laura Fischer',
      stamm: 'Stamm Tübingen',
      email: 'laura@example.com',
      iban: 'DE89370400440532013009',
      aktionId: jahresschulung.id,
      kategorie: Kategorie.HONORARE,
      belegbeschreibung: 'Referent*innen-Honorar Erste-Hilfe-Kurs',
      belegdatum: new Date('2024-11-02'),
      betrag: 350.00,
      status: AbrechnungStatus.VERSENDET,
    },
  });

  // Öffentlichkeitsarbeit
  await prisma.abrechnung.create({
    data: {
      name: 'Tim Becker',
      stamm: 'Stamm Esslingen',
      email: 'tim@example.com',
      iban: 'DE89370400440532013010',
      aktionId: sommerlager2025.id,
      kategorie: Kategorie.OFFENTLICHKEITSARBEIT,
      belegbeschreibung: 'Druck von Flyern und Plakaten',
      belegdatum: new Date('2025-07-15'),
      betrag: 89.90,
      status: AbrechnungStatus.ENTWURF,
    },
  });

  // Sonstige Ausgaben
  await prisma.abrechnung.create({
    data: {
      name: 'Nina Keller',
      stamm: 'Stamm Ludwigsburg',
      email: 'nina@example.com',
      iban: 'DE89370400440532013011',
      aktionId: herbstfahrt2025.id,
      kategorie: Kategorie.SONSTIGE_AUSGABEN,
      belegbeschreibung: 'Reparatur Zeltgestänge',
      belegdatum: new Date('2025-10-11'),
      betrag: 42.00,
      status: AbrechnungStatus.EINGEREICHT,
    },
  });

  console.log('✅ Beispiel-Abrechnungen für alle Kategorien erstellt');

  // Zähle und zeige Ergebnisse
  const userCount = await prisma.user.count();
  const aktionCount = await prisma.aktion.count();
  const abrechnungCount = await prisma.abrechnung.count();

  console.log('\n📊 Seed-Ergebnis:');
  console.log(`   ${userCount} User`);
  console.log(`   ${aktionCount} Aktionen`);
  console.log(`   ${abrechnungCount} Abrechnungen`);
  console.log('\n🎉 Seed erfolgreich abgeschlossen!\n');
  console.log('📝 Login-Daten:');
  console.log('   Admin: admin@bdp-bawue.de / admin123');
  console.log('   Kasse: kasse@bdp-bawue.de / admin123\n');
}

main()
  .catch((e) => {
    console.error('❌ Fehler beim Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
