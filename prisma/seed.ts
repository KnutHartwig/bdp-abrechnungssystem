import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Datenbank...');

  // Admin-User erstellen
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@bdp-bawue.de';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeThisPassword123!';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ Admin erstellt:', admin.email);

  // Test-Aktion erstellen
  const aktion = await prisma.aktion.upsert({
    where: { id: 'test-aktion-1' },
    update: {},
    create: {
      id: 'test-aktion-1',
      titel: 'Sommerlager 2025',
      startdatum: new Date('2025-07-15'),
      enddatum: new Date('2025-07-28'),
      status: 'AKTIV',
      beschreibung: 'Sommerlager für alle Stämme',
    },
  });

  console.log('✅ Test-Aktion erstellt:', aktion.titel);

  // Test-Abrechnungen erstellen
  const testAbrechnungen = [
    {
      name: 'Max Mustermann',
      stamm: 'Stamm Phoenix',
      email: 'max@example.com',
      aktionId: aktion.id,
      kategorie: 'TEILNAHMEBEITRAEGE' as const,
      belegbeschreibung: 'Teilnahmebeitrag Sommerlager',
      belegdatum: new Date('2025-07-15'),
      betrag: 120.0,
      status: 'FREIGEGEBEN' as const,
    },
    {
      name: 'Anna Schmidt',
      stamm: 'Stamm Adler',
      email: 'anna@example.com',
      aktionId: aktion.id,
      kategorie: 'FAHRTKOSTEN' as const,
      belegbeschreibung: 'Fahrt zum Lagerplatz',
      belegdatum: new Date('2025-07-15'),
      betrag: 45.0,
      fahrzeugtyp: 'PKW' as const,
      kilometer: 150,
      kmSatz: 0.3,
      mitfahrer: 0,
      zuschlagLagerleitung: false,
      zuschlagMaterial: false,
      zuschlagAnhaenger: false,
      status: 'FREIGEGEBEN' as const,
    },
    {
      name: 'Peter Müller',
      stamm: 'Stamm Falke',
      email: 'peter@example.com',
      aktionId: aktion.id,
      kategorie: 'VERPFLEGUNG' as const,
      belegbeschreibung: 'Lebensmitteleinkauf',
      belegdatum: new Date('2025-07-16'),
      betrag: 350.5,
      status: 'EINGEREICHT' as const,
    },
  ];

  for (const abrechnung of testAbrechnungen) {
    await prisma.abrechnung.create({
      data: abrechnung,
    });
  }

  console.log('✅ Test-Abrechnungen erstellt:', testAbrechnungen.length);

  console.log('\n🎉 Seeding abgeschlossen!\n');
  console.log('📧 Admin-Login:');
  console.log('   Email:', adminEmail);
  console.log('   Passwort:', adminPassword);
  console.log('\n⚠️  WICHTIG: Ändere das Admin-Passwort in der Produktion!\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding fehlgeschlagen:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
