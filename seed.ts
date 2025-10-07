import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bdp-bawue.de' },
    update: {},
    create: {
      email: 'admin@bdp-bawue.de',
      name: 'Admin Test',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create Landeskasse user
  const landesPassword = await bcrypt.hash('kasse123', 10);
  const landeskasse = await prisma.user.upsert({
    where: { email: 'kasse@bdp-bawue.de' },
    update: {},
    create: {
      email: 'kasse@bdp-bawue.de',
      name: 'Landeskasse',
      passwordHash: landesPassword,
      role: 'LANDESKASSE',
    },
  });

  // Create test Aktion
  const aktion = await prisma.aktion.create({
    data: {
      titel: 'Sommerlager 2025',
      startdatum: new Date('2025-07-15'),
      enddatum: new Date('2025-07-28'),
      status: 'AKTIV',
      adminId: admin.id,
    },
  });

  // Create test Abrechnungen
  const testAbrechnungen = [
    {
      name: 'Max Mustermann',
      stammGruppe: 'Stamm Heidelberg',
      email: 'max@example.com',
      kategorie: 'FAHRTKOSTEN',
      betrag: 45.50,
      beschreibung: 'Fahrt zum Lager',
      belegdatum: new Date('2025-07-15'),
      fahrzeugtyp: 'PKW',
      anzahlMitfahrer: 3,
      kilometerstand: 350,
      zuschlaege: ['LAGERLEITUNG'],
    },
    {
      name: 'Anna Schmidt',
      stammGruppe: 'Stamm Freiburg',
      email: 'anna@example.com',
      kategorie: 'MATERIAL',
      betrag: 89.99,
      beschreibung: 'Zeltmaterial',
      belegdatum: new Date('2025-07-10'),
    },
    {
      name: 'Tom Weber',
      stammGruppe: 'Stamm Stuttgart',
      email: 'tom@example.com',
      kategorie: 'VERPFLEGUNG',
      betrag: 120.00,
      beschreibung: 'Lebensmitteleinkauf',
      belegdatum: new Date('2025-07-18'),
    },
  ];

  for (const data of testAbrechnungen) {
    await prisma.abrechnung.create({
      data: {
        ...data,
        aktionId: aktion.id,
        status: 'ENTWURF',
        kategorie: data.kategorie as any,
        fahrzeugtyp: data.fahrzeugtyp as any,
      },
    });
  }

  console.log('Seeding finished.');
  console.log(`Created users: admin@bdp-bawue.de (pw: admin123), kasse@bdp-bawue.de (pw: kasse123)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
