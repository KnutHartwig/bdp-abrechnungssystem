import nodemailer from 'nodemailer';
import { formatDate, formatCurrency } from './utils';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface EmailData {
  aktionTitel: string;
  startdatum: Date;
  enddatum: Date;
  anzahlPosten: number;
  gesamtsumme: number;
  pdfPfad: string;
}

export async function sendeAbrechnungEmail(data: EmailData): Promise<boolean> {
  try {
    const { aktionTitel, startdatum, enddatum, anzahlPosten, gesamtsumme, pdfPfad } = data;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="de">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: #003d7a; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .info-box { background: #f4f4f4; padding: 15px; margin: 20px 0; border-left: 4px solid #6ba43a; }
          .footer { background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BdP Abrechnung</h1>
        </div>
        <div class="content">
          <h2>Neue Abrechnung eingegangen</h2>
          <p>Es ist eine neue Abrechnung zur Bearbeitung bereit:</p>
          
          <div class="info-box">
            <strong>Maßnahme:</strong> ${aktionTitel}<br>
            <strong>Zeitraum:</strong> ${formatDate(startdatum)} - ${formatDate(enddatum)}<br>
            <strong>Anzahl Posten:</strong> ${anzahlPosten}<br>
            <strong>Gesamtsumme:</strong> <strong>${formatCurrency(gesamtsumme)}</strong>
          </div>
          
          <p>Die vollständige Abrechnung mit allen Belegen finden Sie im Anhang.</p>
          
          <p>
            <strong>Hinweis:</strong> Diese E-Mail wurde automatisch generiert. 
            Bei Rückfragen wenden Sie sich bitte an die zuständige Stelle.
          </p>
        </div>
        <div class="footer">
          <p>BdP Landesverband Baden-Württemberg e.V.<br>
          Abrechnungssystem v1.0</p>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: `Abrechnung - ${aktionTitel} - ${formatDate(new Date())}`,
      html: htmlContent,
      attachments: [
        {
          filename: `Abrechnung_${aktionTitel.replace(/[^a-z0-9]/gi, '_')}.pdf`,
          path: pdfPfad,
        },
      ],
    });

    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
}

export async function sendeTestEmail(): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: 'BdP Abrechnungssystem - Test',
      text: 'Dies ist eine Test-E-Mail vom BdP Abrechnungssystem.',
      html: '<p>Dies ist eine <strong>Test-E-Mail</strong> vom BdP Abrechnungssystem.</p>',
    });

    console.log('Test email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Test email error:', error);
    return false;
  }
}
