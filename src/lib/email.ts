import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

// Transporter-Singleton
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      throw new Error('SMTP-Konfiguration fehlt in Environment Variables');
    }

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  return transporter;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transport = getTransporter();

    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
      attachments: options.attachments,
    });

    return true;
  } catch (error) {
    console.error('E-Mail Versand fehlgeschlagen:', error);
    return false;
  }
}

export async function sendAbrechnungToLandeskasse(
  aktionTitel: string,
  pdfBuffer: Buffer,
  anzahlPositionen: number,
  gesamtbetrag: number
): Promise<boolean> {
  const landeskasseEmail = process.env.LANDESKASSE_EMAIL || 'kasse@bdp-bawue.de';

  const text = `
Hallo Landeskasse,

anbei findet ihr die Abrechnung für die Aktion "${aktionTitel}".

Details:
- Anzahl Positionen: ${anzahlPositionen}
- Gesamtbetrag: ${gesamtbetrag.toFixed(2).replace('.', ',')} €

Die PDF-Datei ist dieser E-Mail angehängt.

Mit freundlichen Grüßen,
BdP Abrechnungssystem (automatisiert)
  `;

  const html = `
<html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #003D7A;">Abrechnung: ${aktionTitel}</h2>
    
    <p>Hallo Landeskasse,</p>
    
    <p>anbei findet ihr die Abrechnung für die Aktion <strong>"${aktionTitel}"</strong>.</p>
    
    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #4A7729;">Details:</h3>
      <ul style="list-style: none; padding: 0;">
        <li>📋 <strong>Anzahl Positionen:</strong> ${anzahlPositionen}</li>
        <li>💰 <strong>Gesamtbetrag:</strong> ${gesamtbetrag.toFixed(2).replace('.', ',')} €</li>
      </ul>
    </div>
    
    <p>Die PDF-Datei ist dieser E-Mail angehängt.</p>
    
    <hr style="border: none; border-top: 1px solid #ccc; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #666;">
      Mit freundlichen Grüßen,<br>
      <strong>BdP Abrechnungssystem</strong> (automatisiert)<br>
      Landesverband Baden-Württemberg e.V.
    </p>
  </body>
</html>
  `;

  const filename = `Abrechnung_${aktionTitel.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

  return sendEmail({
    to: landeskasseEmail,
    subject: `Abrechnung: ${aktionTitel}`,
    text,
    html,
    attachments: [
      {
        filename,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
}

// SMTP-Konfiguration testen
export async function testSMTPConnection(): Promise<boolean> {
  try {
    const transport = getTransporter();
    await transport.verify();
    return true;
  } catch (error) {
    console.error('SMTP-Verbindungstest fehlgeschlagen:', error);
    return false;
  }
}
