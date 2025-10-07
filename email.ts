import nodemailer from 'nodemailer';
import { formatDate } from './utils';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
}

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

export async function sendEmail(options: EmailOptions): Promise<void> {
  const transporter = createTransporter();

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('E-Mail konnte nicht versendet werden');
  }
}

export async function sendAbrechnungEmail(
  aktionTitel: string,
  adminName: string,
  pdfBuffer: Buffer,
  gesamtsumme: number
): Promise<void> {
  const datum = formatDate(new Date());
  const subject = `Abrechnung – ${aktionTitel} – ${datum}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .header {
            background: #003366;
            color: white;
            padding: 20px;
            text-align: center;
          }
          .content {
            padding: 20px;
          }
          .info-box {
            background: #f4f4f4;
            padding: 15px;
            border-left: 4px solid #FFB400;
            margin: 20px 0;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BdP Abrechnungssystem</h1>
        </div>
        <div class="content">
          <h2>Neue Abrechnung eingereicht</h2>
          <p>Sehr geehrte Damen und Herren,</p>
          <p>anbei erhalten Sie die Abrechnung für folgende Aktion:</p>
          
          <div class="info-box">
            <strong>Aktion:</strong> ${aktionTitel}<br>
            <strong>Verantwortlich:</strong> ${adminName}<br>
            <strong>Datum:</strong> ${datum}<br>
            <strong>Gesamtsumme:</strong> ${new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
            }).format(gesamtsumme)}
          </div>

          <p>Die vollständige Abrechnung inkl. aller Belege finden Sie im Anhang als PDF-Dokument.</p>
          
          <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>

          <div class="footer">
            <p>
              BdP Landesverband Baden-Württemberg e.V.<br>
              Dieses ist eine automatisch generierte E-Mail. Bitte antworten Sie nicht direkt auf diese Nachricht.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
BdP Abrechnungssystem - Neue Abrechnung

Aktion: ${aktionTitel}
Verantwortlich: ${adminName}
Datum: ${datum}
Gesamtsumme: ${new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(gesamtsumme)}

Die vollständige Abrechnung inkl. aller Belege finden Sie im Anhang als PDF-Dokument.

---
BdP Landesverband Baden-Württemberg e.V.
  `;

  await sendEmail({
    to: process.env.LANDESKASSE_EMAIL || 'kasse@bdp-bawue.de',
    subject,
    text,
    html,
    attachments: [
      {
        filename: `Abrechnung_${aktionTitel.replace(/\s+/g, '_')}_${datum}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
}

export async function sendNotificationEmail(
  to: string,
  subject: string,
  message: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .header {
            background: #003366;
            color: white;
            padding: 20px;
            text-align: center;
          }
          .content {
            padding: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BdP Abrechnungssystem</h1>
        </div>
        <div class="content">
          ${message}
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to,
    subject,
    text: message.replace(/<[^>]*>/g, ''),
    html,
  });
}
