import nodemailer from 'nodemailer';
import { EmailOptions } from '@/types';

// SMTP-Transporter erstellen
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true für Port 465, false für andere
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// E-Mail senden
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@bdp-bawue.de',
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    });

    console.log('E-Mail gesendet:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Fehler beim E-Mail-Versand:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler beim E-Mail-Versand',
    };
  }
}

// Abrechnung an Landeskasse senden
export async function sendeAbrechnungAnLandeskasse(
  aktionTitel: string,
  pdfPath: string,
  gesamtBetrag: number
): Promise<{ success: boolean; error?: string }> {
  const landeskasseEmail = process.env.LANDESKASSE_EMAIL || 'kasse@bdp-bawue.de';
  
  const html = `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #003C71; color: white; padding: 20px; }
        .content { padding: 20px; }
        .footer { background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; }
        .amount { font-size: 24px; font-weight: bold; color: #003C71; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>BdP Abrechnungssystem</h1>
      </div>
      <div class="content">
        <h2>Neue Abrechnung: ${aktionTitel}</h2>
        <p>Es wurde eine neue Abrechnung für die Aktion <strong>${aktionTitel}</strong> erstellt.</p>
        
        <p>
          <strong>Gesamtbetrag:</strong> 
          <span class="amount">${new Intl.NumberFormat('de-DE', { 
            style: 'currency', 
            currency: 'EUR' 
          }).format(gesamtBetrag)}</span>
        </p>
        
        <p>Die vollständige Abrechnung mit allen Belegen finden Sie im Anhang dieser E-Mail.</p>
        
        <hr style="margin: 30px 0;">
        
        <p><strong>Nächste Schritte:</strong></p>
        <ol>
          <li>PDF-Anhang herunterladen und prüfen</li>
          <li>Alle Belege auf Vollständigkeit kontrollieren</li>
          <li>Bei Fragen oder Problemen direkt an die zuständigen Admins wenden</li>
          <li>Freigabe zur Auszahlung erteilen</li>
        </ol>
      </div>
      <div class="footer">
        <p>Diese E-Mail wurde automatisch vom BdP Abrechnungssystem generiert.</p>
        <p>BdP Landesverband Baden-Württemberg e.V.</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: landeskasseEmail,
    subject: `Abrechnung: ${aktionTitel} - ${new Date().toLocaleDateString('de-DE')}`,
    html,
    attachments: [
      {
        filename: `Abrechnung_${aktionTitel.replace(/\s+/g, '_')}.pdf`,
        path: pdfPath,
      },
    ],
  });
}

// Bestätigungs-E-Mail an Teilnehmende
export async function sendeBestaetigung(
  email: string,
  name: string,
  aktionTitel: string,
  betrag: number
): Promise<{ success: boolean; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #003C71; color: white; padding: 20px; }
        .content { padding: 20px; }
        .footer { background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>BdP Abrechnungssystem</h1>
      </div>
      <div class="content">
        <h2>Abrechnung eingegangen</h2>
        <p>Hallo ${name},</p>
        
        <p>deine Abrechnung für die Aktion <strong>${aktionTitel}</strong> ist bei uns eingegangen.</p>
        
        <p><strong>Eingereichte Daten:</strong></p>
        <ul>
          <li>Betrag: ${new Intl.NumberFormat('de-DE', { 
            style: 'currency', 
            currency: 'EUR' 
          }).format(betrag)}</li>
          <li>Datum: ${new Date().toLocaleDateString('de-DE')}</li>
        </ul>
        
        <p>Deine Abrechnung wird nun von den zuständigen Admins geprüft.</p>
        
        <p>Bei Fragen kannst du dich jederzeit an kasse@bdp-bawue.de wenden.</p>
        
        <p>Vielen Dank!</p>
      </div>
      <div class="footer">
        <p>Diese E-Mail wurde automatisch vom BdP Abrechnungssystem generiert.</p>
        <p>BdP Landesverband Baden-Württemberg e.V.</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Abrechnung eingegangen: ${aktionTitel}`,
    html,
  });
}

// Transporter-Verfügbarkeit testen
export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('SMTP-Verbindung erfolgreich');
    return true;
  } catch (error) {
    console.error('SMTP-Verbindungsfehler:', error);
    return false;
  }
}
