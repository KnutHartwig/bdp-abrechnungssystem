import puppeteer from 'puppeteer';
import { prisma } from './prisma';
import { formatCurrency, formatDate } from './utils';
import { KATEGORIE_LABELS } from '@/types';
import path from 'path';
import fs from 'fs/promises';

export interface PDFGenerationResult {
  success: boolean;
  pdfPath?: string;
  error?: string;
}

// HTML-Template für PDF generieren
function generateAbrechnungHTML(aktion: any, abrechnungen: any[]): string {
  // Gruppiere Abrechnungen nach Kategorie
  const kategorien = abrechnungen.reduce((acc, ab) => {
    if (!acc[ab.kategorie]) {
      acc[ab.kategorie] = [];
    }
    acc[ab.kategorie].push(ab);
    return acc;
  }, {} as Record<string, any[]>);

  // Berechne Gesamt- und Kategorie-Summen
  const gesamtBetrag = abrechnungen.reduce((sum, ab) => sum + Number(ab.betrag), 0);
  
  const kategorieHTML = Object.entries(kategorien).map(([kategorie, items]) => {
    const kategorieSumme = items.reduce((sum, ab) => sum + Number(ab.betrag), 0);
    
    const itemsHTML = items.map(ab => `
      <tr>
        <td>${ab.name}</td>
        <td>${ab.stamm}</td>
        <td>${formatDate(ab.belegdatum)}</td>
        <td>${ab.belegbeschreibung || '-'}</td>
        <td class="align-right">${formatCurrency(ab.betrag)}</td>
      </tr>
    `).join('');
    
    return `
      <div class="kategorie-section">
        <h2 class="kategorie-titel">${KATEGORIE_LABELS[kategorie as keyof typeof KATEGORIE_LABELS]}</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Stamm</th>
              <th>Datum</th>
              <th>Beschreibung</th>
              <th class="align-right">Betrag</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
            <tr class="summe-row">
              <td colspan="4"><strong>Summe ${KATEGORIE_LABELS[kategorie as keyof typeof KATEGORIE_LABELS]}</strong></td>
              <td class="align-right"><strong>${formatCurrency(kategorieSumme)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Abrechnung ${aktion.titel}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: 'Arial', sans-serif;
          font-size: 11pt;
          line-height: 1.4;
          color: #333;
        }
        
        .header {
          background-color: #003C71;
          color: white;
          padding: 30px;
          margin-bottom: 30px;
        }
        
        .header h1 {
          font-size: 28pt;
          margin-bottom: 10px;
        }
        
        .header .meta {
          font-size: 12pt;
          opacity: 0.9;
        }
        
        .deckblatt {
          page-break-after: always;
          padding: 30px;
        }
        
        .deckblatt-info {
          margin: 40px 0;
        }
        
        .deckblatt-info table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .deckblatt-info td {
          padding: 12px;
          border-bottom: 1px solid #ddd;
        }
        
        .deckblatt-info td:first-child {
          font-weight: bold;
          width: 200px;
        }
        
        .gesamtsumme {
          background-color: #003C71;
          color: white;
          padding: 30px;
          margin: 40px 0;
          text-align: center;
        }
        
        .gesamtsumme .betrag {
          font-size: 36pt;
          font-weight: bold;
          margin: 10px 0;
        }
        
        .kategorie-section {
          page-break-inside: avoid;
          margin-bottom: 40px;
        }
        
        .kategorie-titel {
          background-color: #003C71;
          color: white;
          padding: 15px;
          margin-bottom: 15px;
          font-size: 16pt;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        th {
          background-color: #f4f4f4;
          padding: 12px;
          text-align: left;
          border-bottom: 2px solid #003C71;
          font-weight: bold;
        }
        
        td {
          padding: 10px 12px;
          border-bottom: 1px solid #ddd;
        }
        
        .align-right {
          text-align: right;
        }
        
        .summe-row {
          background-color: #f9f9f9;
          border-top: 2px solid #003C71;
        }
        
        .footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 20px 30px;
          border-top: 1px solid #ddd;
          background: white;
          font-size: 9pt;
          color: #666;
        }
        
        @media print {
          .footer { position: fixed; }
        }
      </style>
    </head>
    <body>
      <!-- Deckblatt -->
      <div class="deckblatt">
        <div class="header">
          <h1>Abrechnung</h1>
          <div class="meta">BdP Landesverband Baden-Württemberg e.V.</div>
        </div>
        
        <div class="deckblatt-info">
          <table>
            <tr>
              <td>Aktion:</td>
              <td>${aktion.titel}</td>
            </tr>
            <tr>
              <td>Zeitraum:</td>
              <td>${formatDate(aktion.startdatum)} - ${formatDate(aktion.enddatum)}</td>
            </tr>
            <tr>
              <td>Erstellt am:</td>
              <td>${formatDate(new Date())}</td>
            </tr>
            <tr>
              <td>Anzahl Positionen:</td>
              <td>${abrechnungen.length}</td>
            </tr>
          </table>
        </div>
        
        <div class="gesamtsumme">
          <div>Gesamtsumme</div>
          <div class="betrag">${formatCurrency(gesamtBetrag)}</div>
        </div>
      </div>
      
      <!-- Kategorien -->
      ${kategorieHTML}
      
      <div class="footer">
        <div>Erstellt mit BdP Abrechnungssystem | ${new Date().toLocaleString('de-DE')}</div>
      </div>
    </body>
    </html>
  `;
}

// PDF generieren
export async function generateAbrechnungPDF(aktionId: string): Promise<PDFGenerationResult> {
  let browser;
  
  try {
    // Hole Aktion und Abrechnungen aus der DB
    const aktion = await prisma.aktion.findUnique({
      where: { id: aktionId },
      include: {
        abrechnungen: {
          where: {
            status: {
              in: ['EINGEREICHT', 'GEPRUEFT', 'FREIGEGEBEN', 'VERSENDET'],
            },
          },
          orderBy: [
            { kategorie: 'asc' },
            { name: 'asc' },
          ],
        },
      },
    });

    if (!aktion) {
      return { success: false, error: 'Aktion nicht gefunden' };
    }

    if (aktion.abrechnungen.length === 0) {
      return { success: false, error: 'Keine Abrechnungen zum Exportieren vorhanden' };
    }

    // HTML generieren
    const html = generateAbrechnungHTML(aktion, aktion.abrechnungen);

    // Puppeteer Browser starten
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // PDF-Pfad
    const pdfDir = path.join(process.cwd(), 'public', 'pdfs');
    await fs.mkdir(pdfDir, { recursive: true });
    
    const filename = `Abrechnung_${aktion.titel.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    const pdfPath = path.join(pdfDir, filename);

    // PDF erstellen
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '25mm',
        left: '15mm',
      },
    });

    await browser.close();

    return {
      success: true,
      pdfPath,
    };
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    
    console.error('PDF-Generierung fehlgeschlagen:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler bei PDF-Generierung',
    };
  }
}

// PDF für einzelne Kategorie generieren (für Detailansichten)
export async function generateKategoriePDF(
  aktionId: string,
  kategorie: string
): Promise<PDFGenerationResult> {
  // Ähnliche Implementierung wie generateAbrechnungPDF,
  // aber nur für eine Kategorie
  // ... (kann bei Bedarf erweitert werden)
  return { success: false, error: 'Noch nicht implementiert' };
}
