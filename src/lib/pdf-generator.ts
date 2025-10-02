import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { prisma } from './prisma'
import { formatCurrency, formatDate, groupBy, sum } from './utils'
import { AbrechnungWithRelations, PDFMetadata } from '@/types'
import fs from 'fs/promises'
import path from 'path'

export async function generateAbrechnungsPDF(
  aktionId: string,
  options: { inkludiereEntwuerfe?: boolean } = {}
): Promise<{ pdfBuffer: Buffer; metadata: PDFMetadata }> {
  
  // Aktion laden
  const aktion = await prisma.aktion.findUnique({
    where: { id: aktionId },
    include: {
      verantwortlicher: true,
    },
  })

  if (!aktion) {
    throw new Error('Aktion nicht gefunden')
  }

  // Abrechnungen laden
  const whereClause: any = {
    aktionId,
  }

  if (!options.inkludiereEntwuerfe) {
    whereClause.status = {
      in: ['EINGEREICHT', 'VERSENDET'],
    }
  }

  const abrechnungen = await prisma.abrechnung.findMany({
    where: whereClause,
    include: {
      aktion: true,
      kategorie: true,
    },
    orderBy: [
      { kategorie: { name: 'asc' } },
      { name: 'asc' },
      { belegdatum: 'asc' },
    ],
  }) as AbrechnungWithRelations[]

  if (abrechnungen.length === 0) {
    throw new Error('Keine Abrechnungen gefunden')
  }

  // Statistiken berechnen
  const gesamtbetrag = sum(abrechnungen.map(a => Number(a.betrag)))
  const nachKategorie = Object.entries(groupBy(abrechnungen, 'kategorieId')).map(([_, items]) => ({
    kategorie: items[0].kategorie.name,
    anzahl: items.length,
    summe: sum(items.map(a => Number(a.betrag))),
  }))

  const metadata: PDFMetadata = {
    aktion,
    erstelltAm: new Date(),
    gesamtbetrag,
    anzahlPosten: abrechnungen.length,
    kategorien: nachKategorie,
  }

  // PDF erstellen
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Deckblatt
  await addDeckblatt(pdfDoc, font, fontBold, metadata)

  // Kategorienblätter
  const kategorien = nachKategorie.map(k => k.kategorie)
  
  for (const kategorieName of kategorien) {
    const kategorieAbrechnungen = abrechnungen.filter(
      a => a.kategorie.name === kategorieName
    )
    
    await addKategorienblatt(
      pdfDoc,
      font,
      fontBold,
      kategorieName,
      kategorieAbrechnungen,
      metadata
    )

    // Belege anhängen
    for (const abrechnung of kategorieAbrechnungen) {
      if (abrechnung.belegUrl) {
        try {
          await addBelegToPDF(pdfDoc, abrechnung.belegUrl)
        } catch (error) {
          console.error(`Fehler beim Anhängen von Beleg ${abrechnung.belegUrl}:`, error)
        }
      }
    }
  }

  // PDF als Buffer zurückgeben
  const pdfBytes = await pdfDoc.save()
  return {
    pdfBuffer: Buffer.from(pdfBytes),
    metadata,
  }
}

async function addDeckblatt(
  pdfDoc: PDFDocument,
  font: any,
  fontBold: any,
  metadata: PDFMetadata
) {
  const page = pdfDoc.addPage([595, 842]) // A4
  const { width, height } = page.getSize()
  
  let y = height - 80

  // Titel
  page.drawText('Abrechnung', {
    x: 50,
    y,
    size: 24,
    font: fontBold,
    color: rgb(0, 0.24, 0.48), // BdP Blue
  })
  
  y -= 40

  // Aktion
  page.drawText(metadata.aktion.titel, {
    x: 50,
    y,
    size: 18,
    font: fontBold,
  })
  
  y -= 30

  // Zeitraum
  page.drawText(`Zeitraum: ${formatDate(metadata.aktion.startdatum)} - ${formatDate(metadata.aktion.enddatum)}`, {
    x: 50,
    y,
    size: 12,
    font,
  })
  
  y -= 20

  // Erstellt am
  page.drawText(`Erstellt am: ${formatDate(metadata.erstelltAm, 'long')}`, {
    x: 50,
    y,
    size: 12,
    font,
  })
  
  y -= 50

  // Zusammenfassung
  page.drawText('Zusammenfassung', {
    x: 50,
    y,
    size: 14,
    font: fontBold,
  })
  
  y -= 25

  // Gesamtsumme
  page.drawText(`Gesamtsumme: ${formatCurrency(metadata.gesamtbetrag)}`, {
    x: 50,
    y,
    size: 12,
    font: fontBold,
  })
  
  y -= 20

  page.drawText(`Anzahl Posten: ${metadata.anzahlPosten}`, {
    x: 50,
    y,
    size: 12,
    font,
  })
  
  y -= 40

  // Kategorien-Übersicht
  page.drawText('Übersicht nach Kategorien', {
    x: 50,
    y,
    size: 14,
    font: fontBold,
  })
  
  y -= 25

  // Tabellenkopf
  page.drawText('Kategorie', {
    x: 50,
    y,
    size: 10,
    font: fontBold,
  })
  
  page.drawText('Anzahl', {
    x: 300,
    y,
    size: 10,
    font: fontBold,
  })
  
  page.drawText('Summe', {
    x: 400,
    y,
    size: 10,
    font: fontBold,
  })
  
  y -= 15

  // Linie
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  })
  
  y -= 15

  // Kategorien
  for (const kategorie of metadata.kategorien) {
    page.drawText(kategorie.kategorie, {
      x: 50,
      y,
      size: 10,
      font,
    })
    
    page.drawText(kategorie.anzahl.toString(), {
      x: 300,
      y,
      size: 10,
      font,
    })
    
    page.drawText(formatCurrency(kategorie.summe), {
      x: 400,
      y,
      size: 10,
      font,
    })
    
    y -= 15
  }
}

async function addKategorienblatt(
  pdfDoc: PDFDocument,
  font: any,
  fontBold: any,
  kategorieName: string,
  abrechnungen: AbrechnungWithRelations[],
  metadata: PDFMetadata
) {
  const page = pdfDoc.addPage([595, 842]) // A4
  const { width, height } = page.getSize()
  
  let y = height - 60

  // Kategorie-Titel
  page.drawText(kategorieName, {
    x: 50,
    y,
    size: 18,
    font: fontBold,
    color: rgb(0, 0.24, 0.48),
  })
  
  y -= 30

  // Tabellenkopf
  const columns = [
    { label: 'Datum', x: 50, width: 70 },
    { label: 'Name', x: 130, width: 120 },
    { label: 'Beschreibung', x: 260, width: 180 },
    { label: 'Betrag', x: 470, width: 70 },
  ]

  for (const col of columns) {
    page.drawText(col.label, {
      x: col.x,
      y,
      size: 10,
      font: fontBold,
    })
  }
  
  y -= 15

  // Linie
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  })
  
  y -= 15

  // Posten
  let kategoriesumme = 0

  for (const abrechnung of abrechnungen) {
    // Neue Seite bei Bedarf
    if (y < 100) {
      const newPage = pdfDoc.addPage([595, 842])
      y = height - 60
    }

    const betrag = Number(abrechnung.betrag)
    kategoriesumme += betrag

    // Datum
    page.drawText(formatDate(abrechnung.belegdatum), {
      x: 50,
      y,
      size: 9,
      font,
    })

    // Name
    const nameText = abrechnung.name.length > 18 
      ? abrechnung.name.substring(0, 15) + '...' 
      : abrechnung.name
    
    page.drawText(nameText, {
      x: 130,
      y,
      size: 9,
      font,
    })

    // Beschreibung
    const beschreibungText = (abrechnung.belegbeschreibung || '-').length > 30
      ? (abrechnung.belegbeschreibung || '-').substring(0, 27) + '...'
      : (abrechnung.belegbeschreibung || '-')
    
    page.drawText(beschreibungText, {
      x: 260,
      y,
      size: 9,
      font,
    })

    // Betrag
    page.drawText(formatCurrency(betrag), {
      x: 470,
      y,
      size: 9,
      font,
    })

    y -= 15
  }

  y -= 10

  // Zwischensumme
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: rgb(0, 0, 0),
  })
  
  y -= 20

  page.drawText('Zwischensumme:', {
    x: 370,
    y,
    size: 11,
    font: fontBold,
  })

  page.drawText(formatCurrency(kategoriesumme), {
    x: 470,
    y,
    size: 11,
    font: fontBold,
  })
}

async function addBelegToPDF(pdfDoc: PDFDocument, belegUrl: string) {
  try {
    const belegPath = path.join(process.cwd(), 'public', belegUrl)
    const belegBuffer = await fs.readFile(belegPath)
    
    // PDF-Beleg einbetten
    if (belegUrl.endsWith('.pdf')) {
      const belegPdf = await PDFDocument.load(belegBuffer)
      const pages = await pdfDoc.copyPages(belegPdf, belegPdf.getPageIndices())
      
      for (const page of pages) {
        pdfDoc.addPage(page)
      }
    } 
    // Bild-Beleg einbetten
    else if (belegUrl.match(/\.(jpg|jpeg|png)$/i)) {
      let image
      
      if (belegUrl.match(/\.(jpg|jpeg)$/i)) {
        image = await pdfDoc.embedJpg(belegBuffer)
      } else {
        image = await pdfDoc.embedPng(belegBuffer)
      }
      
      const page = pdfDoc.addPage([595, 842])
      const { width, height } = page.getSize()
      
      const imgDims = image.scale(1)
      const scale = Math.min(
        (width - 100) / imgDims.width,
        (height - 100) / imgDims.height,
        1
      )
      
      const scaledWidth = imgDims.width * scale
      const scaledHeight = imgDims.height * scale
      
      page.drawImage(image, {
        x: (width - scaledWidth) / 2,
        y: (height - scaledHeight) / 2,
        width: scaledWidth,
        height: scaledHeight,
      })
    }
  } catch (error) {
    console.error('Fehler beim Laden des Belegs:', error)
    // Fehler wird geloggt, aber PDF-Generierung fortgesetzt
  }
}

export async function savePDFToFile(
  pdfBuffer: Buffer,
  filename: string
): Promise<string> {
  const outputDir = path.join(process.cwd(), 'public', 'pdfs')
  
  // Verzeichnis erstellen falls nicht vorhanden
  await fs.mkdir(outputDir, { recursive: true })
  
  const filePath = path.join(outputDir, filename)
  await fs.writeFile(filePath, pdfBuffer)
  
  return `/pdfs/${filename}`
}
