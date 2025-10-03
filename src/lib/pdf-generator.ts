import puppeteer from 'puppeteer';
import { PDFExportData } from '@/types';
import { formatDate, formatCurrency } from './utils';
import fs from 'fs/promises';
import path from 'path';

export async function generiereAbrechnungsPDF(data: PDFExportData): Promise<string> {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    
    const htmlContent = generiereHTMLContent(data);
    
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    });

    const pdfDir = path.join(process.cwd(), 'public', 'pdfs');
    await fs.mkdir(pdfDir, { recursive: true });

    const filename = `Abrechnung_${data.aktionTitel.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
    const filepath = path.join(pdfDir, filename);

    await page.pdf({
      path: filepath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    });

    return filepath;
  } finally {
    await browser.close();
  }
}

function generiereHTMLContent(data: PDFExportData): string {
  const { aktionTitel, startdatum, enddatum, kategorien, gesamtsumme } = data;

  return `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <style>
        @page { margin: 20mm 15mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Arial', sans-serif;
          font-size: 11pt;
          line-height: 1.4;
          color: #333;
        }
        .header {
          background: #003d7a;
          color: white;
          padding: 20px;
          margin-bottom: 30px;
          text-align: center;
        }
        .header h1 {
          font-size: 24pt;
          margin-bottom: 10px;
        }
        .header p {
          font-size: 12pt;
          opacity: 0.9;
        }
        .info-box {
          background: #f8f9fa;
          border: 2px solid #003d7a;
          padding: 15px;
          margin-bottom: 30px;
        }
        .info-box table {
          width: 100%;
        }
        .info-box td {
          padding: 5px;
        }
        .info-box td:first-child {
          font-weight: bold;
          width: 150px;
        }
        .kategorie {
          margin-bottom: 40px;
          page-break-inside: avoid;
        }
        .kategorie h2 {
          background: #6ba43a;
          color: white;
          padding: 10px 15px;
          font-size: 14pt;
          margin-bottom: 15px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background: #f8f9fa;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background: #fafafa;
        }
        .summe-row {
          font-weight: bold;
          background: #e8f4f8 !important;
        }
        .summe-row td {
          border-top: 2px solid #003d7a;
        }
        .gesamtsumme {
          background: #003d7a;
          color: white;
          padding: 15px;
          margin-top: 30px;
          text-align: right;
          font-size: 14pt;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 9pt;
          color: #666;
        }
        .betrag {
          text-align: right;
          font-family: 'Courier New', monospace;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Abrechnung</h1>
        <p>BdP Landesverband Baden-Württemberg e.V.</p>
      </div>

      <div class="info-box">
        <table>
          <tr>
            <td>Maßnahme:</td>
            <td><strong>${aktionTitel}</strong></td>
          </tr>
          <tr>
            <td>Zeitraum:</td>
            <td>${formatDate(startdatum)} - ${formatDate(enddatum)}</td>
          </tr>
          <tr>
            <td>Erstellt am:</td>
            <td>${formatDate(new Date())}</td>
          </tr>
        </table>
      </div>

      ${kategorien.map(kategorie => `
        <div class="kategorie">
          <h2>${kategorie.name}</h2>
          <table>
            <thead>
              <tr>
                <th style="width: 15%;">Datum</th>
                <th style="width: 20%;">Name</th>
                <th style="width: 15%;">Stamm</th>
                <th style="width: 35%;">Beschreibung</th>
                <th style="width: 15%;" class="betrag">Betrag</th>
              </tr>
            </thead>
            <tbody>
              ${kategorie.posten.map(posten => `
                <tr>
                  <td>${formatDate(posten.belegdatum)}</td>
                  <td>${posten.name}</td>
                  <td>${posten.stamm}</td>
                  <td>${posten.belegbeschreibung || '-'}</td>
                  <td class="betrag">${formatCurrency(posten.betrag)}</td>
                </tr>
              `).join('')}
              <tr class="summe-row">
                <td colspan="4" style="text-align: right;">Summe ${kategorie.name}:</td>
                <td class="betrag">${formatCurrency(kategorie.summe)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `).join('')}

      <div class="gesamtsumme">
        <strong>Gesamtsumme: ${formatCurrency(gesamtsumme)}</strong>
      </div>

      <div class="footer">
        <p>BdP Landesverband Baden-Württemberg e.V. | Abrechnungssystem v1.0</p>
        <p>Erstellt am ${new Date().toLocaleString('de-DE')}</p>
      </div>
    </body>
    </html>
  `;
}
