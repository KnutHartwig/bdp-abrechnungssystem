import puppeteer from 'puppeteer';
import type { Abrechnung, Beleg } from '../shared/schema';

interface AbrechnungWithDetails extends Abrechnung {
  belege: Beleg[];
  aktionName?: string;
  aktionZeitraum?: string;
  aktionOrt?: string;
  verpflegungstage?: number;
  zuschusstage?: number;
}

export async function generateAbrechnungPDF(
  abrechnung: AbrechnungWithDetails
): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(generateHTML(abrechnung), {
      waitUntil: 'networkidle0'
    });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm'
      }
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

function generateHTML(data: AbrechnungWithDetails): string {
  const belegeByKategorie = groupBelegeByKategorie(data.belege);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.4;
    }
    
    .page {
      page-break-after: always;
      padding: 20px;
    }
    
    .page:last-child {
      page-break-after: auto;
    }
    
    .header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
    }
    
    .header h1 {
      font-size: 14pt;
      margin-bottom: 5px;
    }
    
    .header h2 {
      font-size: 12pt;
      font-weight: normal;
      color: #666;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 20px;
      background: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
    }
    
    .info-item {
      display: flex;
    }
    
    .info-label {
      font-weight: bold;
      min-width: 180px;
    }
    
    .info-value {
      flex: 1;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    
    th, td {
      padding: 8px;
      text-align: left;
      border: 1px solid #ddd;
    }
    
    th {
      background-color: #4a5568;
      color: white;
      font-weight: bold;
    }
    
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    
    .sum-row {
      background-color: #e2e8f0 !important;
      font-weight: bold;
    }
    
    .section-title {
      font-size: 13pt;
      font-weight: bold;
      margin-bottom: 10px;
      margin-top: 10px;
      color: #2d3748;
    }
    
    .amount {
      text-align: right;
    }
    
    .signature-section {
      margin-top: 40px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }
    
    .signature-box {
      border-top: 1px solid #333;
      padding-top: 10px;
    }
    
    .summary-box {
      background: #f7fafc;
      border: 2px solid #4a5568;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 4px;
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #cbd5e0;
    }
    
    .summary-row:last-child {
      border-bottom: none;
      font-weight: bold;
      font-size: 12pt;
      padding-top: 15px;
      border-top: 2px solid #4a5568;
    }
    
    .summary-label {
      font-weight: bold;
    }
    
    .category-table {
      margin-bottom: 30px;
    }
    
    .empty-message {
      text-align: center;
      padding: 20px;
      color: #666;
      font-style: italic;
    }
  </style>
</head>
<body>
  ${generatePage1(data, belegeByKategorie)}
  ${generatePage2(data, belegeByKategorie.TEILNAHMEBEITRAEGE)}
  ${generatePage3(data, belegeByKategorie.SONSTIGE_EINNAHMEN)}
  ${generatePage4(data, belegeByKategorie.VORSCHUSS)}
  ${generatePage5(data, belegeByKategorie.FAHRTKOSTEN)}
  ${generatePage6(data, belegeByKategorie.UNTERKUNFT)}
  ${generatePage7(data, belegeByKategorie.VERPFLEGUNG)}
  ${generatePage8(data, belegeByKategorie.MATERIAL)}
  ${generatePage9(data, belegeByKategorie.PORTO)}
  ${generatePage10(data, belegeByKategorie.TELEKOMMUNIKATION)}
  ${generatePage11(data, belegeByKategorie.SONSTIGE_AUSGABEN)}
  ${generatePage12(data, belegeByKategorie.OFFENE_VERBINDLICHKEITEN)}
  ${generatePage13(data)}
</body>
</html>
  `;
}

function groupBelegeByKategorie(belege: Beleg[]): Record<string, Beleg[]> {
  const grouped: Record<string, Beleg[]> = {
    TEILNAHMEBEITRAEGE: [],
    SONSTIGE_EINNAHMEN: [],
    VORSCHUSS: [],
    FAHRTKOSTEN: [],
    UNTERKUNFT: [],
    VERPFLEGUNG: [],
    MATERIAL: [],
    PORTO: [],
    TELEKOMMUNIKATION: [],
    SONSTIGE_AUSGABEN: [],
    OFFENE_VERBINDLICHKEITEN: []
  };

  belege.forEach(beleg => {
    if (grouped[beleg.kategorie]) {
      grouped[beleg.kategorie].push(beleg);
    }
  });

  // Sortiere Belege nach Datum
  Object.keys(grouped).forEach(key => {
    grouped[key].sort((a, b) => 
      new Date(a.datum).getTime() - new Date(b.datum).getTime()
    );
  });

  return grouped;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('de-DE');
}

function calculateSum(belege: Beleg[]): number {
  return belege.reduce((sum, beleg) => sum + beleg.betrag, 0);
}

// Seite 1: Zentrale Erfassung / Übersicht
function generatePage1(data: AbrechnungWithDetails, kategorien: Record<string, Beleg[]>): string {
  const einnahmen = [
    { label: 'Teilnahmebeiträge', value: calculateSum(kategorien.TEILNAHMEBEITRAEGE) },
    { label: 'Sonstige Einnahmen', value: calculateSum(kategorien.SONSTIGE_EINNAHMEN) },
    { label: 'Vorschuss', value: calculateSum(kategorien.VORSCHUSS) }
  ];
  
  const ausgaben = [
    { label: 'Fahrtkosten', value: calculateSum(kategorien.FAHRTKOSTEN) },
    { label: 'Unterkunft', value: calculateSum(kategorien.UNTERKUNFT) },
    { label: 'Verpflegung', value: calculateSum(kategorien.VERPFLEGUNG) },
    { label: 'Material', value: calculateSum(kategorien.MATERIAL) },
    { label: 'Porto', value: calculateSum(kategorien.PORTO) },
    { label: 'Telekommunikation', value: calculateSum(kategorien.TELEKOMMUNIKATION) },
    { label: 'Sonstige Ausgaben', value: calculateSum(kategorien.SONSTIGE_AUSGABEN) },
    { label: 'Offene Verbindlichkeiten', value: calculateSum(kategorien.OFFENE_VERBINDLICHKEITEN) }
  ];
  
  const summeEinnahmen = einnahmen.reduce((sum, e) => sum + e.value, 0);
  const summeAusgaben = ausgaben.reduce((sum, a) => sum + a.value, 0);
  const saldo = summeEinnahmen - summeAusgaben;
  
  return `
<div class="page">
  <div class="header">
    <h1>BdP Landesverband Baden-Württemberg e.V.</h1>
    <h2>ABRECHNUNG</h2>
  </div>
  
  <div class="info-grid">
    <div class="info-item">
      <span class="info-label">Maßnahme:</span>
      <span class="info-value">${data.aktionName || 'Nicht angegeben'}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Kassenverantwortliche:r:</span>
      <span class="info-value">${data.kassenverantwortlicher}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Zeitraum der Maßnahme:</span>
      <span class="info-value">${data.aktionZeitraum || 'Nicht angegeben'}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Verpflegungstage:</span>
      <span class="info-value">${data.verpflegungstage || 0}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Ort der Maßnahme:</span>
      <span class="info-value">${data.aktionOrt || 'Nicht angegeben'}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Zuschusstage:</span>
      <span class="info-value">${data.zuschusstage || 0}</span>
    </div>
  </div>
  
  <div class="summary-box">
    <div class="section-title">EINNAHMEN GESAMT</div>
    ${einnahmen.map(e => `
      <div class="summary-row">
        <span class="summary-label">${e.label}</span>
        <span class="amount">${formatCurrency(e.value)}</span>
      </div>
    `).join('')}
    <div class="summary-row">
      <span class="summary-label">SUMME EINNAHMEN</span>
      <span class="amount">${formatCurrency(summeEinnahmen)}</span>
    </div>
  </div>
  
  <div class="summary-box">
    <div class="section-title">AUSGABEN</div>
    ${ausgaben.map(a => `
      <div class="summary-row">
        <span class="summary-label">${a.label}</span>
        <span class="amount">${formatCurrency(a.value)}</span>
      </div>
    `).join('')}
    <div class="summary-row">
      <span class="summary-label">SUMME AUSGABEN</span>
      <span class="amount">${formatCurrency(summeAusgaben)}</span>
    </div>
  </div>
  
  <div class="summary-box">
    <div class="summary-row">
      <span class="summary-label">${saldo >= 0 ? 'Überschuss (bitte überweisen)' : 'Defizit überweisen an'}</span>
      <span class="amount">${formatCurrency(Math.abs(saldo))}</span>
    </div>
  </div>
  
  ${saldo < 0 ? `
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Kontoinhaber:in:</span>
        <span class="info-value">${data.kassenverantwortlicher}</span>
      </div>
      <div class="info-item">
        <span class="info-label">IBAN:</span>
        <span class="info-value">${data.iban || 'Nicht angegeben'}</span>
      </div>
    </div>
  ` : ''}
  
  <div class="signature-section">
    <div class="signature-box">
      <div>Für rechnerische und sachliche Richtigkeit</div>
      <div style="margin-top: 10px;">Datum und Unterschrift der:des Kassenverantwortlichen</div>
    </div>
  </div>
</div>
  `;
}

// Seite 2: Teilnahmebeiträge
function generatePage2(data: AbrechnungWithDetails, belege: Beleg[]): string {
  const summe = calculateSum(belege);
  
  return `
<div class="page">
  <div class="header">
    <h1>BdP Landesverband Baden-Württemberg e.V.</h1>
    <h2>Teilnahmebeiträge</h2>
  </div>
  
  <div style="margin-bottom: 15px;">
    <strong>Summe: ${formatCurrency(summe)}</strong> | 
    Anzahl der Teilnehmer:innen: ${belege.length}
  </div>
  
  ${belege.length > 0 ? `
    <table class="category-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Stamm/Gruppe</th>
          <th class="amount">Betrag</th>
        </tr>
      </thead>
      <tbody>
        ${belege.map(beleg => `
          <tr>
            <td>${beleg.person || '-'}</td>
            <td>${beleg.stammGruppe || '-'}</td>
            <td class="amount">${formatCurrency(beleg.betrag)}</td>
          </tr>
        `).join('')}
        <tr class="sum-row">
          <td colspan="2">SUMME</td>
          <td class="amount">${formatCurrency(summe)}</td>
        </tr>
      </tbody>
    </table>
  ` : `
    <div class="empty-message">Keine Teilnahmebeiträge erfasst</div>
  `}
</div>
  `;
}

// Seite 3: Sonstige Einnahmen
function generatePage3(data: AbrechnungWithDetails, belege: Beleg[]): string {
  return generateBelegPage('Sonstige Einnahmen', belege, true);
}

// Seite 4: Vorschuss
function generatePage4(data: AbrechnungWithDetails, belege: Beleg[]): string {
  const summe = calculateSum(belege);
  
  return `
<div class="page">
  <div class="header">
    <h1>BdP Landesverband Baden-Württemberg e.V.</h1>
    <h2>Vorschuss</h2>
  </div>
  
  <div style="margin-bottom: 15px;">
    <strong>Summe: ${formatCurrency(summe)}</strong>
  </div>
  
  ${belege.length > 0 ? `
    <table class="category-table">
      <thead>
        <tr>
          <th>Vorschuss erhalten von</th>
          <th>Erhalten am</th>
          <th class="amount">Betrag</th>
        </tr>
      </thead>
      <tbody>
        ${belege.map(beleg => `
          <tr>
            <td>${beleg.beschreibung || '-'}</td>
            <td>${formatDate(beleg.datum)}</td>
            <td class="amount">${formatCurrency(beleg.betrag)}</td>
          </tr>
        `).join('')}
        <tr class="sum-row">
          <td colspan="2">SUMME</td>
          <td class="amount">${formatCurrency(summe)}</td>
        </tr>
      </tbody>
    </table>
  ` : `
    <div class="empty-message">Kein Vorschuss erfasst</div>
  `}
</div>
  `;
}

// Seite 5: Fahrtkosten
function generatePage5(data: AbrechnungWithDetails, belege: Beleg[]): string {
  const summe = calculateSum(belege);
  
  return `
<div class="page">
  <div class="header">
    <h1>BdP Landesverband Baden-Württemberg e.V.</h1>
    <h2>Fahrtkosten</h2>
  </div>
  
  <div style="margin-bottom: 15px;">
    <strong>Summe: ${formatCurrency(summe)}</strong>
  </div>
  
  ${belege.length > 0 ? `
    <table class="category-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Stamm/Gruppe</th>
          <th>Beschreibung</th>
          <th>Zuordnung</th>
          <th class="amount">Betrag</th>
        </tr>
      </thead>
      <tbody>
        ${belege.map(beleg => `
          <tr>
            <td>${beleg.person || '-'}</td>
            <td>${beleg.stammGruppe || '-'}</td>
            <td>${beleg.beschreibung || '-'}</td>
            <td>${beleg.zuordnung || '-'}</td>
            <td class="amount">${formatCurrency(beleg.betrag)}</td>
          </tr>
        `).join('')}
        <tr class="sum-row">
          <td colspan="4">SUMME</td>
          <td class="amount">${formatCurrency(summe)}</td>
        </tr>
      </tbody>
    </table>
  ` : `
    <div class="empty-message">Keine Fahrtkosten erfasst</div>
  `}
</div>
  `;
}

// Seiten 6-11: Standard-Belegseiten mit Beleg-Nr., Datum, Beschreibung, Zuordnung, Betrag
function generatePage6(data: AbrechnungWithDetails, belege: Beleg[]): string {
  return generateBelegPage('Unterkunft', belege);
}

function generatePage7(data: AbrechnungWithDetails, belege: Beleg[]): string {
  return generateBelegPage('Verpflegung', belege);
}

function generatePage8(data: AbrechnungWithDetails, belege: Beleg[]): string {
  return generateBelegPage('Material', belege);
}

function generatePage9(data: AbrechnungWithDetails, belege: Beleg[]): string {
  return generateBelegPage('Porto', belege);
}

function generatePage10(data: AbrechnungWithDetails, belege: Beleg[]): string {
  return generateBelegPage('Telekommunikation', belege);
}

function generatePage11(data: AbrechnungWithDetails, belege: Beleg[]): string {
  return generateBelegPage('Sonstige Ausgaben', belege);
}

// Seite 12: Offene Verbindlichkeiten
function generatePage12(data: AbrechnungWithDetails, belege: Beleg[]): string {
  const summe = calculateSum(belege);
  
  return `
<div class="page">
  <div class="header">
    <h1>BdP Landesverband Baden-Württemberg e.V.</h1>
    <h2>Offene Verbindlichkeiten</h2>
  </div>
  
  <div style="margin-bottom: 15px;">
    <strong>Summe: ${formatCurrency(summe)}</strong>
  </div>
  
  ${belege.length > 0 ? `
    <table class="category-table">
      <thead>
        <tr>
          <th>Verbindlichkeit (z.B. Unterkunft)</th>
          <th>Rechnung erwartet am</th>
          <th class="amount">Betrag</th>
        </tr>
      </thead>
      <tbody>
        ${belege.map(beleg => `
          <tr>
            <td>${beleg.beschreibung || '-'}</td>
            <td>${formatDate(beleg.datum)}</td>
            <td class="amount">${formatCurrency(beleg.betrag)}</td>
          </tr>
        `).join('')}
        <tr class="sum-row">
          <td colspan="2">SUMME</td>
          <td class="amount">${formatCurrency(summe)}</td>
        </tr>
      </tbody>
    </table>
  ` : `
    <div class="empty-message">Keine offenen Verbindlichkeiten erfasst</div>
  `}
</div>
  `;
}

// Seite 13: Zuschussberechnung
function generatePage13(data: AbrechnungWithDetails): string {
  const maxZuschussProPersonTag = 25.00;
  const minBeteiligungLV = 0.10; // 10%
  
  const zuschusstage = data.zuschusstage || 0;
  const teilnehmer = data.belege.filter(b => b.kategorie === 'TEILNAHMEBEITRAEGE').length;
  
  const perfekteGesamtausgaben = teilnehmer * zuschusstage * maxZuschussProPersonTag / (1 - minBeteiligungLV);
  
  const ausgabenOhneOffene = data.belege
    .filter(b => b.kategorie !== 'OFFENE_VERBINDLICHKEITEN' && 
                 b.kategorie !== 'TEILNAHMEBEITRAEGE' && 
                 b.kategorie !== 'SONSTIGE_EINNAHMEN' && 
                 b.kategorie !== 'VORSCHUSS')
    .reduce((sum, b) => sum + b.betrag, 0);
    
  const offeneVerbindlichkeiten = calculateSum(
    data.belege.filter(b => b.kategorie === 'OFFENE_VERBINDLICHKEITEN')
  );
  
  const gesamtausgaben = ausgabenOhneOffene + offeneVerbindlichkeiten;
  const differenz = perfekteGesamtausgaben - gesamtausgaben;
  
  const zuschussNachTagen = teilnehmer * zuschusstage * maxZuschussProPersonTag;
  const zuschussNachKosten = gesamtausgaben * (1 - minBeteiligungLV);
  
  const zuschuss = Math.min(zuschussNachTagen, zuschussNachKosten);
  
  const einnahmen = calculateSum(
    data.belege.filter(b => 
      b.kategorie === 'TEILNAHMEBEITRAEGE' || 
      b.kategorie === 'SONSTIGE_EINNAHMEN' || 
      b.kategorie === 'VORSCHUSS'
    )
  );
  
  const gewinnVerlust = einnahmen + zuschuss - gesamtausgaben;
  
  return `
<div class="page">
  <div class="header">
    <h1>BdP Landesverband Baden-Württemberg e.V.</h1>
    <h2>Zuschussberechnung</h2>
    <p style="font-size: 10pt; color: #666;">für Seminare und Jugendgruppenleiter:innenlehrgänge</p>
  </div>
  
  <div class="section-title">1. Daten des Landesjugendplans</div>
  <div class="info-grid">
    <div class="info-item">
      <span class="info-label">Maximaler Zuschuss pro Person und Tag:</span>
      <span class="info-value">${formatCurrency(maxZuschussProPersonTag)}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Mindestbeteiligung des LV BaWü:</span>
      <span class="info-value">${(minBeteiligungLV * 100).toFixed(0)}%</span>
    </div>
    <div class="info-item">
      <span class="info-label">Zuschussberechtigte Teilnehmer:innen:</span>
      <span class="info-value">${teilnehmer}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Zuschusstage:</span>
      <span class="info-value">${zuschusstage}</span>
    </div>
  </div>
  
  <div class="summary-box" style="margin-top: 20px;">
    <div style="font-weight: bold; margin-bottom: 10px;">
      Perfekte Gesamtausgaben für den LJP-Zuschuss:
    </div>
    <div class="summary-row" style="border-top: none;">
      <span class="summary-label">Sollten nicht überschreiten:</span>
      <span class="amount">${formatCurrency(perfekteGesamtausgaben)}</span>
    </div>
  </div>
  
  <div class="section-title">2. Zuschuss-Berechnung</div>
  <table>
    <tbody>
      <tr>
        <td>Ausgaben (ohne offene Verbindlichkeiten):</td>
        <td class="amount">${formatCurrency(ausgabenOhneOffene)}</td>
      </tr>
      <tr>
        <td>Offene Verbindlichkeiten:</td>
        <td class="amount">${formatCurrency(offeneVerbindlichkeiten)}</td>
      </tr>
      <tr class="sum-row">
        <td>Gesamtausgaben für die Maßnahme:</td>
        <td class="amount">${formatCurrency(gesamtausgaben)}</td>
      </tr>
      <tr>
        <td>Differenz zu den perfekten Gesamtausgaben:</td>
        <td class="amount" style="color: ${differenz >= 0 ? 'green' : 'red'}">
          ${formatCurrency(differenz)}
        </td>
      </tr>
    </tbody>
  </table>
  
  <table style="margin-top: 20px;">
    <tbody>
      <tr>
        <td>LJP-Zuschuss (nach Zuschusstagen berechnet):</td>
        <td class="amount">${formatCurrency(zuschussNachTagen)}</td>
      </tr>
      <tr>
        <td>LJP-Zuschuss (nach Gesamtkosten berechnet):</td>
        <td class="amount">${formatCurrency(zuschussNachKosten)}</td>
      </tr>
    </tbody>
  </table>
  
  <div class="summary-box" style="margin-top: 20px; background-color: ${gewinnVerlust >= 0 ? '#d4edda' : '#f8d7da'};">
    <div class="section-title">Ergebnis</div>
    <div class="summary-row">
      <span class="summary-label">Zu erwartender LJP-Zuschuss:</span>
      <span class="amount">${formatCurrency(zuschuss)}</span>
    </div>
    <div class="summary-row">
      <span class="summary-label">Gewinn/Verlust mit dem zu erwartenden LJP-Zuschuss:</span>
      <span class="amount" style="color: ${gewinnVerlust >= 0 ? 'green' : 'red'}">
        ${formatCurrency(gewinnVerlust)}
      </span>
    </div>
  </div>
  
  <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px;">
    <strong>Was ist jetzt zu tun?</strong>
    <p style="margin-top: 10px;">
      ${differenz >= 0 
        ? 'Alles wunderbar! Schickt eure Zuschuss-Unterlagen an die:den Zuschussbeauftragte:n.'
        : 'Die Gesamtausgaben überschreiten die perfekten Ausgaben. Prüft die Kalkulation oder klärt mit der Landeskasse ab.'
      }
    </p>
  </div>
</div>
  `;
}

// Hilfsfunktion für Standard-Belegseiten
function generateBelegPage(title: string, belege: Beleg[], showBelegNr: boolean = true): string {
  const summe = calculateSum(belege);
  
  return `
<div class="page">
  <div class="header">
    <h1>BdP Landesverband Baden-Württemberg e.V.</h1>
    <h2>${title}</h2>
  </div>
  
  <div style="margin-bottom: 15px;">
    <strong>Summe: ${formatCurrency(summe)}</strong>
  </div>
  
  ${belege.length > 0 ? `
    <table class="category-table">
      <thead>
        <tr>
          ${showBelegNr ? '<th>Beleg-Nr.</th>' : ''}
          <th>Datum</th>
          <th>Beschreibung/Beleg</th>
          <th>Zuordnung</th>
          <th class="amount">Betrag</th>
        </tr>
      </thead>
      <tbody>
        ${belege.map(beleg => `
          <tr>
            ${showBelegNr ? `<td>${beleg.belegNummer || '-'}</td>` : ''}
            <td>${formatDate(beleg.datum)}</td>
            <td>${beleg.beschreibung || '-'}</td>
            <td>${beleg.zuordnung || '-'}</td>
            <td class="amount">${formatCurrency(beleg.betrag)}</td>
          </tr>
        `).join('')}
        <tr class="sum-row">
          <td colspan="${showBelegNr ? '4' : '3'}">SUMME</td>
          <td class="amount">${formatCurrency(summe)}</td>
        </tr>
      </tbody>
    </table>
  ` : `
    <div class="empty-message">Keine Einträge in dieser Kategorie</div>
  `}
</div>
  `;
}
