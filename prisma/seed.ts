import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starte Seeding...')

  // Kategorien erstellen
  const kategorien = [
    { name: 'Teilnahmebeiträge', sortierung: 1 },
    { name: 'Fahrtkosten', sortierung: 2 },
    { name: 'Unterkunft', sortierung: 3 },
    { name: 'Verpflegung', sortierung: 4 },
    { name: 'Material', sortierung: 5 },
    { name: 'Porto', sortierung: 6 },
    { name: 'Telekommunikation', sortierung: 7 },
    { name: 'Honorare', sortierung: 8 },
    { name: 'Raummiete', sortierung: 9 },
    { name: 'Versicherungen', sortierung: 10 },
    { name: 'Sonstige Ausgaben', sortierung: 11 },
  ]

  console.log('📦 Erstelle Kategorien...')
  
  for (const kategorie of kategorien) {
    await prisma.kategorie.upsert({
      where: { name: kategorie.name },
      update: {},
      create: {
        name: kategorie.name,
        sortierung: kategorie.sortierung,
        beschreibung: `Kategorie für ${kategorie.name}`,
        aktiv: true,
      },
    })
  }

  console.log(`✅ ${kategorien.length} Kategorien erstellt`)

  // Admin-User erstellen
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@bdp-bawue.de'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin2025!'
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  console.log('👤 Erstelle Admin-User...')

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin',
      password: hashedPassword,
      role: 'LANDESKASSE',
    },
  })

  console.log(`✅ Admin erstellt: ${admin.email}`)

  // Test-Aktion erstellen (nur in Development)
  if (process.env.NODE_ENV !== 'production') {
    console.log('🎯 Erstelle Test-Aktion...')

    const aktion = await prisma.aktion.upsert({
      where: { id: 'test-sommerlager-2025' },
      update: {},
      create: {
        id: 'test-sommerlager-2025',
        titel: 'Sommerlager 2025',
        startdatum: new Date('2025-07-15'),
        enddatum: new Date('2025-07-27'),
        status: 'AKTIV',
        verantwortlicherId: admin.id,
      },
    })

    console.log(`✅ Test-Aktion erstellt: ${aktion.titel}`)

    // Test-Abrechnungen erstellen
    console.log('📝 Erstelle Test-Abrechnungen...')

    const fahrkostenKategorie = await prisma.kategorie.findFirst({
      where: { name: 'Fahrtkosten' },
    })

    const verpflegungKategorie = await prisma.kategorie.findFirst({
      where: { name: 'Verpflegung' },
    })

    if (fahrkostenKategorie && verpflegungKategorie) {
      // Test-Abrechnung 1: Fahrtkosten
      await prisma.abrechnung.create({
        data: {
          name: 'Max Mustermann',
          stamm: 'Stamm Phönix',
          email: 'max.mustermann@example.com',
          aktionId: aktion.id,
          kategorieId: fahrkostenKategorie.id,
          belegbeschreibung: 'Fahrt zum Sommerlager',
          belegdatum: new Date('2025-07-15'),
          betrag: 45.50,
          fahrzeugtyp: 'PKW_MITFAHRER_2',
          streckeKm: 130,
          mitfahrer: 2,
          kmSatz: 0.35,
          status: 'EINGEREICHT',
        },
      })

      // Test-Abrechnung 2: Verpflegung
      await prisma.abrechnung.create({
        data: {
          name: 'Anna Schmidt',
          stamm: 'Stamm Adler',
          email: 'anna.schmidt@example.com',
          aktionId: aktion.id,
          kategorieId: verpflegungKategorie.id,
          belegbeschreibung: 'Einkauf Lebensmittel',
          belegdatum: new Date('2025-07-16'),
          betrag: 127.89,
          status: 'EINGEREICHT',
        },
      })

      // Test-Abrechnung 3: Fahrtkosten mit Zuschlägen
      await prisma.abrechnung.create({
        data: {
          name: 'Peter Müller',
          stamm: 'Stamm Falke',
          email: 'peter.mueller@example.com',
          aktionId: aktion.id,
          kategorieId: fahrkostenKategorie.id,
          belegbeschreibung: 'Materialfahrt',
          belegdatum: new Date('2025-07-14'),
          betrag: 78.00,
          fahrzeugtyp: 'PKW_SOLO',
          streckeKm: 150,
          mitfahrer: 0,
          istLagerleitung: true,
          hatMaterial: true,
          hatAnhaenger: true,
          kmSatz: 0.45, // 0.30 + 0.05 + 0.05 + 0.05
          status: 'EINGEREICHT',
        },
      })

      console.log('✅ 3 Test-Abrechnungen erstellt')
    }
  }

  console.log('✨ Seeding abgeschlossen!')
  console.log('')
  console.log('🔑 Admin-Zugangsdaten:')
  console.log(`   Email: ${adminEmail}`)
  console.log(`   Passwort: ${adminPassword}`)
  console.log('')
  console.log('⚠️  WICHTIG: Ändere das Admin-Passwort nach dem ersten Login!')
}

main()
  .catch((e) => {
    console.error('❌ Fehler beim Seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
