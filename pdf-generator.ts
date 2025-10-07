import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { formatCurrency, formatDate, kategorieLabels } from './utils';

export interface AbrechnungData {
  id: string;
  name: string;
  stammGruppe: string;
  kategorie: string;
  betrag: number;
  beschreibung?: string | null;
  belegdatum: Date;
  fahrzeugtyp?: string | null;
  anzahlMitfahrer?: number | null;
  kilometerstand?: number | null;
}

export interface AktionData {
  titel: string;
  startdatum: Date;
  enddatum: Date;
  adminName: string;
}

export async function generateAbrechnungsPDF(
  aktion: AktionData,
  abrechnungen: AbrechnungData[]
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Gruppiere nach Kategorie
  const groupedByCategory: Record<string, AbrechnungData[]> = {};
  abrechnungen.forEach((ab) => {
    if (!groupedByCategory[ab.kategorie]) {
      groupedByCategory[ab.kategorie] = [];
    }
    groupedByCategory[ab.kategorie].push(ab);
  });

  // Berechne Gesamtsummen
  const gesamtsumme = abrechnungen.reduce((sum, ab) => sum + ab.betrag, 0);
  const summenProKategorie: Record<string, number> = {};
  Object.entries(groupedByCategory).forEach(([kategorie, abs]) => {
    summenProKategorie[kategorie] = abs.reduce((sum, ab) => sum + ab.betrag, 0);
  });

  // Deckblatt
  const deckblattPage = pdfDoc.addPage([595, 842]); // A4
  let y = 750;

  // Header
  deckblattPage.drawText('BdP Landesverband Baden-Württemberg e.V.', {
    x: 50,
    y,
    size: 18,
    font: helveticaBoldFont,
    color: rgb(0, 0.2, 0.4),
  });
  y -= 40;

  deckblattPage.drawText('Abrechnung', {
    x: 50,
    y,
    size: 24,
    font: helveticaBoldFont,
  });
  y -= 60;

  // Aktion Details
  deckblattPage.drawText(`Aktion: ${aktion.titel}`, {
    x: 50,
    y,
    size: 14,
    font: helveticaFont,
  });
  y -= 25;

  deckblattPage.drawText(
    `Zeitraum: ${formatDate(aktion.startdatum)} - ${formatDate(aktion.enddatum)}`,
    {
      x: 50,
      y,
      size: 12,
      font: helveticaFont,
    }
  );
  y -= 25;

  deckblattPage.drawText(`Verantwortlich: ${aktion.adminName}`, {
    x: 50,
    y,
    size: 12,
    font: helveticaFont,
  });
  y -= 25;

  deckblattPage.drawText(`Erstellungsdatum: ${formatDate(new Date())}`, {
    x: 50,
    y,
    size: 12,
    font: helveticaFont,
  });
  y -= 60;

  // Zusammenfassung
  deckblattPage.drawText('Zusammenfassung', {
    x: 50,
    y,
    size: 16,
    font: helveticaBoldFont,
  });
  y -= 35;

  Object.entries(summenProKategorie)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([kategorie, summe]) => {
      deckblattPage.drawText(
        `${kategorieLabels[kategorie] || kategorie}:`,
        {
          x: 50,
          y,
          size: 12,
          font: helveticaFont,
        }
      );
      deckblattPage.drawText(formatCurrency(summe), {
        x: 450,
        y,
        size: 12,
        font: helveticaFont,
      });
      y -= 25;
    });

  y -= 20;
  deckblattPage.drawLine({
    start: { x: 50, y },
    end: { x: 545, y },
    thickness: 2,
  });
  y -= 30;

  deckblattPage.drawText('Gesamtsumme:', {
    x: 50,
    y,
    size: 14,
    font: helveticaBoldFont,
  });
  deckblattPage.drawText(formatCurrency(gesamtsumme), {
    x: 450,
    y,
    size: 14,
    font: helveticaBoldFont,
  });

  // Detailseiten pro Kategorie
  Object.entries(groupedByCategory)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([kategorie, abs]) => {
      const page = pdfDoc.addPage([595, 842]);
      let y = 750;

      // Kategorie Titel
      page.drawText(kategorieLabels[kategorie] || kategorie, {
        x: 50,
        y,
        size: 18,
        font: helveticaBoldFont,
        color: rgb(0, 0.2, 0.4),
      });
      y -= 40;

      // Tabellen-Header
      page.drawText('Name', { x: 50, y, size: 10, font: helveticaBoldFont });
      page.drawText('Stamm', { x: 150, y, size: 10, font: helveticaBoldFont });
      page.drawText('Datum', { x: 280, y, size: 10, font: helveticaBoldFont });
      page.drawText('Beschreibung', { x: 350, y, size: 10, font: helveticaBoldFont });
      page.drawText('Betrag', { x: 480, y, size: 10, font: helveticaBoldFont });
      y -= 5;

      page.drawLine({
        start: { x: 50, y },
        end: { x: 545, y },
        thickness: 1,
      });
      y -= 20;

      // Einträge
      abs.forEach((ab) => {
        if (y < 100) {
          // Neue Seite wenn nötig
          const newPage = pdfDoc.addPage([595, 842]);
          y = 750;
        }

        page.drawText(ab.name.substring(0, 15), {
          x: 50,
          y,
          size: 9,
          font: helveticaFont,
        });
        page.drawText(ab.stammGruppe.substring(0, 20), {
          x: 150,
          y,
          size: 9,
          font: helveticaFont,
        });
        page.drawText(formatDate(ab.belegdatum), {
          x: 280,
          y,
          size: 9,
          font: helveticaFont,
        });
        page.drawText((ab.beschreibung || '').substring(0, 20), {
          x: 350,
          y,
          size: 9,
          font: helveticaFont,
        });
        page.drawText(formatCurrency(ab.betrag), {
          x: 480,
          y,
          size: 9,
          font: helveticaFont,
        });

        y -= 20;
      });

      // Summe
      y -= 20;
      page.drawLine({
        start: { x: 50, y },
        end: { x: 545, y },
        thickness: 2,
      });
      y -= 30;

      page.drawText('Zwischensumme:', {
        x: 350,
        y,
        size: 12,
        font: helveticaBoldFont,
      });
      page.drawText(formatCurrency(summenProKategorie[kategorie]), {
        x: 480,
        y,
        size: 12,
        font: helveticaBoldFont,
      });
    });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function mergeWithBelege(
  abrechnungPdf: Buffer,
  belegPdfs: Buffer[]
): Promise<Buffer> {
  const mainDoc = await PDFDocument.load(abrechnungPdf);

  for (const belegPdf of belegPdfs) {
    try {
      const belegDoc = await PDFDocument.load(belegPdf);
      const pages = await mainDoc.copyPages(belegDoc, belegDoc.getPageIndices());
      pages.forEach((page) => mainDoc.addPage(page));
    } catch (error) {
      console.error('Fehler beim Merge von Beleg:', error);
    }
  }

  const mergedPdfBytes = await mainDoc.save();
  return Buffer.from(mergedPdfBytes);
}
