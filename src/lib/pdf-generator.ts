import puppeteer from 'puppeteer';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

// Puppeteer v23+ API

interface AbrechnungData {
  id: string;
  name: string;
  stamm: string;
  email: string;
  kategorie: string;
  belegbeschreibung?: string;
  belegdatum: Date;
  betrag: number;
  status: string;
  aktion: {
    titel: string;
    startdatum: Date;
    enddatum: Date;
  };
}

export async function generateAbrechnungsPDF(
  abrechnungen: AbrechnungData[]
): Promise<Buffer> {
  if (abrechnungen.length === 0) {
    throw new Error('Keine Abrechnungen zum Exportieren');
  }

  const aktion = abrechnungen[0].aktion;

  // Kategorien gruppieren
  const byKategorie = abrechnungen.reduce((acc, item) => {
    if (!acc[item.kategorie]) {
      acc[item.kategorie] = [];
    }
    acc[item.kategorie].push(item);
    return acc;
  }, {} as Record<string, AbrechnungData[]>);

  // HTML für PDF generieren
  const html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.4;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #003D7A;
    }
    .header h1 {
      color: #003D7A;
      font-size: 24pt;
      margin: 0 0 10px 0;
    }
    .header .subtitle {
      color: #666;
      font-size: 12pt;
    }
    .info-box {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .info-box p {
      margin: 5px 0;
    }
    .kategorie {
      page-break-before: always;
      margin-bottom: 40px;
    }
    .kategorie:first-of-type {
      page-break-before: avoid;
    }
    .kategorie-header {
      background: #003D7A;
      color: white;
      padding: 10px 15px;
      margin: 20px 0 15px 0;
      font-size: 14pt;
      font-weight: bold;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background: #4A7729;
      color: white;
      padding: 8px;
      text-align: left;
      font-size: 9pt;
    }
    td {
      border-bottom: 1px solid #ddd;
      padding: 6px 8px;
      font-size: 9pt;
    }
    tr:nth-child(even) {
      background: #f9f9f9;
    }
    .betrag {
      text-align: right;
      font-weight: bold;
    }
    .summe {
      background: #E87722 !important;
      color: white;
      font-weight: bold;
      font-size: 11pt;
    }
    .gesamt-summe {
      background: #003D7A;
      color: white;
      padding: 15px;
      text-align: right;
      font-size: 16pt;
      margin-top: 30px;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #ccc;
      text-align: center;
      font-size: 8pt;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>BdP Abrechnungsübersicht</h1>
    <div class="subtitle">${aktion.titel}</div>
  </div>

  <div class="info-box">
    <p><strong>Zeitraum:</strong> ${format(new Date(aktion.startdatum), 'dd.MM.yyyy', { locale: de })} - ${format(new Date(aktion.enddatum), 'dd.MM.yyyy', { locale: de })}</p>
    <p><strong>Erstellt am:</strong> ${format(new Date(), 'dd.MM.yyyy HH:mm', { locale: de })} Uhr</p>
    <p><strong>Anzahl Positionen:</strong> ${abrechnungen.length}</p>
  </div>

  ${Object.entries(byKategorie).map(([kategorie, items]) => `
    <div class="kategorie">
      <div class="kategorie-header">${formatKategorie(kategorie)}</div>
      <table>
        <thead>
          <tr>
            <th style="width: 20%">Name</th>
            <th style="width: 15%">Stamm</th>
            <th style="width: 15%">Datum</th>
            <th style="width: 35%">Beschreibung</th>
            <th style="width: 15%" class="betrag">Betrag</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.stamm}</td>
              <td>${format(new Date(item.belegdatum), 'dd.MM.yyyy', { locale: de })}</td>
              <td>${item.belegbeschreibung || '-'}</td>
              <td class="betrag">${formatBetrag(Number(item.betrag))} €</td>
            </tr>
          `).join('')}
          <tr class="summe">
            <td colspan="4" style="text-align: right; padding-right: 10px;">
              <strong>Summe ${formatKategorie(kategorie)}:</strong>
            </td>
            <td class="betrag">
              ${formatBetrag(items.reduce((sum, item) => sum + Number(item.betrag), 0))} €
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `).join('')}

  <div class="gesamt-summe">
    <strong>Gesamtsumme:</strong> ${formatBetrag(abrechnungen.reduce((sum, item) => sum + Number(item.betrag), 0))} €
  </div>

  <div class="footer">
    <p>BdP Landesverband Baden-Württemberg e.V.</p>
    <p>Automatisch generiert durch das Abrechnungssystem v1.1.0</p>
  </div>
</body>
</html>
  `;

  // Puppeteer v23 neue API
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

// Hilfsfunktionen
function formatKategorie(kategorie: string): string {
  const mapping: Record<string, string> = {
    TEILNAHMEBEITRAEGE: 'Teilnahmebeiträge',
    FAHRTKOSTEN: 'Fahrtkosten',
    UNTERKUNFT: 'Unterkunft',
    VERPFLEGUNG: 'Verpflegung',
    MATERIAL: 'Material',
    PORTO: 'Porto',
    TELEKOMMUNIKATION: 'Telekommunikation',
    SONSTIGE_AUSGABEN: 'Sonstige Ausgaben',
    HONORARE: 'Honorare',
    VERSICHERUNGEN: 'Versicherungen',
    MIETE: 'Miete',
  };
  return mapping[kategorie] || kategorie;
}

function formatBetrag(betrag: number): string {
  return betrag.toFixed(2).replace('.', ',');
}
