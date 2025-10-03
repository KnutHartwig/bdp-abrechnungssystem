import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin-User erstellen
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bdp-bawue.de' },
    update: {},
    create: {
      email: 'admin@bdp-bawue.de',
      name: 'BdP Admin',
      password: hashedPassword,
      role: 'admin',
    },
  });

  const landeskasse = await prisma.user.upsert({
    where: { email: 'kasse@bdp-bawue.de' },
    update: {},
    create: {
      email: 'kasse@bdp-bawue.de',
      name: 'Landeskasse',
      password: hashedPassword,
      role: 'landeskasse',
    },
  });

  console.log('✅ Users created:', { admin: admin.email, landeskasse: landeskasse.email });

  // 11 Kategorien aus Excel-Vorlage
  const kategorien = [
    { name: 'Teilnahmebeiträge', beschreibung: 'Beiträge für Teilnahme an Maßnahmen', sortierung: 1 },
    { name: 'Fahrtkosten', beschreibung: 'Fahrtkosten mit km-Abrechnung', sortierung: 2 },
    { name: 'Unterkunft', beschreibung: 'Kosten für Unterkunft und Übernachtung', sortierung: 3 },
    { name: 'Verpflegung', beschreibung: 'Verpflegungskosten', sortierung: 4 },
    { name: 'Material', beschreibung: 'Materialkosten für die Maßnahme', sortierung: 5 },
    { name: 'Porto', beschreibung: 'Porto- und Versandkosten', sortierung: 6 },
    { name: 'Telekommunikation', beschreibung: 'Telefon- und Internetkosten', sortierung: 7 },
    { name: 'Versicherung', beschreibung: 'Versicherungskosten', sortierung: 8 },
    { name: 'Honorare', beschreibung: 'Honorare für externe Leistungen', sortierung: 9 },
    { name: 'Raummiete', beschreibung: 'Miete für Räumlichkeiten', sortierung: 10 },
    { name: 'Sonstige Ausgaben', beschreibung: 'Sonstige nicht kategorisierte Ausgaben', sortierung: 11 },
  ];

  for (const kat of kategorien) {
    await prisma.kategorie.upsert({
      where: { name: kat.name },
      update: {},
      create: kat,
    });
  }

  console.log('✅ Categories created: 11 Kategorien');

  // Test-Aktion erstellen
  const aktion = await prisma.aktion.upsert({
    where: { id: 'test-aktion-1' },
    update: {},
    create: {
      id: 'test-aktion-1',
      titel: 'Sommerlager 2025',
      startdatum: new Date('2025-07-15'),
      enddatum: new Date('2025-07-28'),
      status: 'aktiv',
      beschreibung: 'Testmaßnahme für das System',
    },
  });

  console.log('✅ Test-Aktion created:', aktion.titel);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
