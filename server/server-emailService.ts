import nodemailer from 'nodemailer';
import type { Abrechnung } from '../shared/schema';

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

// E-Mail-Konfiguration
const EMAIL_CONFIG = {
  recipient: 'kasse@bdp-bawue.de',
  from: process.env.EMAIL_FROM || 'abrechnungssystem@bdp-bawue.de',
  replyTo: process.env.EMAIL_REPLY_TO || 'kasse@bdp-bawue.de'
};

// Erstelle Transporter basierend auf Umgebungsvariablen
function createTransporter() {
  // Prüfe, ob SMTP-Konfiguration vorhanden ist
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true für Port 465, false für andere
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }
  
  // Fallback: Test-Account für Entwicklung (ethereal.email)
  // Nur für Entwicklung - E-Mails werden nicht wirklich versendet
  console.warn('⚠️  Keine SMTP-Konfiguration gefunden. Verwende Test-Account.');
  console.warn('⚠️  Setze diese Umgebungsvariablen für echten E-Mail-Versand:');
  console.warn('    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD');
  
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: process.env.ETHEREAL_USER || 'test@ethereal.email',
      pass: process.env.ETHEREAL_PASSWORD || 'test'
    }
  });
}

/**
 * Sendet eine generische E-Mail
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: EMAIL_CONFIG.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
      replyTo: EMAIL_CONFIG.replyTo,
      attachments: options.attachments
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ E-Mail versendet:', info.messageId);
    
    // Bei ethereal.email: Preview-URL ausgeben
    if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_HOST) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('📧 E-Mail-Vorschau:', previewUrl);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ E-Mail-Versand fehlgeschlagen:', error);
    throw new Error('E-Mail konnte nicht versendet werden');
  }
}

/**
 * Sendet eine Abrechnung per E-Mail an die Landeskasse
 */
export async function sendAbrechnungEmail(
  abrechnung: Abrechnung,
  pdfBuffer: Buffer,
  aktionName: string
): Promise<boolean> {
  const subject = `Neue Abrechnung: ${aktionName} - ${abrechnung.kassenverantwortlicher}`;
  
  const text = `
Hallo liebes Landeskassen-Team,

eine neue Abrechnung wurde im System eingereicht:

Aktion: ${aktionName}
Kassenverantwortliche:r: ${abrechnung.kassenverantwortlicher}
E-Mail: ${abrechnung.email}
Eingereicht am: ${new Date(abrechnung.eingereichtAm || '').toLocaleDateString('de-DE')}

Die vollständige Abrechnung findet ihr im angehängten PDF-Dokument.

Viele Grüße
BdP Abrechnungssystem
  `.trim();
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2d3748;">Neue Abrechnung eingereicht</h2>
      
      <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; width: 200px;">Aktion:</td>
            <td style="padding: 8px 0;">${aktionName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Kassenverantwortliche:r:</td>
            <td style="padding: 8px 0;">${abrechnung.kassenverantwortlicher}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">E-Mail:</td>
            <td style="padding: 8px 0;">${abrechnung.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Eingereicht am:</td>
            <td style="padding: 8px 0;">${new Date(abrechnung.eingereichtAm || '').toLocaleDateString('de-DE')}</td>
          </tr>
        </table>
      </div>
      
      <p style="color: #4a5568; line-height: 1.6;">
        Die vollständige Abrechnung findet ihr im angehängten PDF-Dokument.
      </p>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
      
      <p style="color: #718096; font-size: 12px;">
        Diese E-Mail wurde automatisch vom BdP Abrechnungssystem generiert.
      </p>
    </div>
  `;
  
  const filename = `Abrechnung_${aktionName.replace(/[^a-zA-Z0-9]/g, '_')}_${abrechnung.kassenverantwortlicher.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  
  return sendEmail({
    to: EMAIL_CONFIG.recipient,
    subject,
    text,
    html,
    attachments: [
      {
        filename,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  });
}

/**
 * Sendet eine Bestätigungsmail an den Ersteller der Abrechnung
 */
export async function sendConfirmationEmail(
  abrechnung: Abrechnung,
  aktionName: string
): Promise<boolean> {
  const subject = `Bestätigung: Abrechnung eingereicht - ${aktionName}`;
  
  const text = `
Hallo ${abrechnung.kassenverantwortlicher},

vielen Dank! Deine Abrechnung für "${aktionName}" wurde erfolgreich eingereicht.

Die Landeskasse wurde automatisch benachrichtigt und wird deine Abrechnung prüfen.

Bei Fragen melde dich gerne unter kasse@bdp-bawue.de

Viele Grüße
BdP Landesverband Baden-Württemberg e.V.
  `.trim();
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2d3748;">Abrechnung erfolgreich eingereicht! ✅</h2>
      
      <p style="color: #4a5568; line-height: 1.6;">
        Hallo ${abrechnung.kassenverantwortlicher},
      </p>
      
      <p style="color: #4a5568; line-height: 1.6;">
        vielen Dank! Deine Abrechnung für <strong>"${aktionName}"</strong> wurde erfolgreich eingereicht.
      </p>
      
      <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
        <p style="margin: 0; color: #155724;">
          <strong>✓</strong> Die Landeskasse wurde automatisch benachrichtigt und wird deine Abrechnung prüfen.
        </p>
      </div>
      
      <p style="color: #4a5568; line-height: 1.6;">
        Bei Fragen melde dich gerne unter 
        <a href="mailto:kasse@bdp-bawue.de" style="color: #3182ce;">kasse@bdp-bawue.de</a>
      </p>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
      
      <p style="color: #4a5568; line-height: 1.6;">
        Viele Grüße<br>
        BdP Landesverband Baden-Württemberg e.V.
      </p>
      
      <p style="color: #718096; font-size: 12px; margin-top: 30px;">
        Diese E-Mail wurde automatisch vom BdP Abrechnungssystem generiert.
      </p>
    </div>
  `;
  
  return sendEmail({
    to: abrechnung.email,
    subject,
    text,
    html
  });
}

/**
 * Sendet eine E-Mail, wenn eine Abrechnung abgelehnt wurde
 */
export async function sendRejectionEmail(
  abrechnung: Abrechnung,
  aktionName: string,
  reason: string
): Promise<boolean> {
  const subject = `Rückmeldung zu deiner Abrechnung - ${aktionName}`;
  
  const text = `
Hallo ${abrechnung.kassenverantwortlicher},

deine Abrechnung für "${aktionName}" benötigt noch eine Überarbeitung.

Grund:
${reason}

Bitte korrigiere die Abrechnung und reiche sie erneut ein.

Bei Fragen melde dich gerne unter kasse@bdp-bawue.de

Viele Grüße
BdP Landesverband Baden-Württemberg e.V.
  `.trim();
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2d3748;">Rückmeldung zu deiner Abrechnung</h2>
      
      <p style="color: #4a5568; line-height: 1.6;">
        Hallo ${abrechnung.kassenverantwortlicher},
      </p>
      
      <p style="color: #4a5568; line-height: 1.6;">
        deine Abrechnung für <strong>"${aktionName}"</strong> benötigt noch eine Überarbeitung.
      </p>
      
      <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #856404;">Grund:</p>
        <p style="margin: 0; color: #856404; white-space: pre-line;">${reason}</p>
      </div>
      
      <p style="color: #4a5568; line-height: 1.6;">
        Bitte korrigiere die Abrechnung und reiche sie erneut ein.
      </p>
      
      <p style="color: #4a5568; line-height: 1.6;">
        Bei Fragen melde dich gerne unter 
        <a href="mailto:kasse@bdp-bawue.de" style="color: #3182ce;">kasse@bdp-bawue.de</a>
      </p>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
      
      <p style="color: #4a5568; line-height: 1.6;">
        Viele Grüße<br>
        BdP Landesverband Baden-Württemberg e.V.
      </p>
      
      <p style="color: #718096; font-size: 12px; margin-top: 30px;">
        Diese E-Mail wurde automatisch vom BdP Abrechnungssystem generiert.
      </p>
    </div>
  `;
  
  return sendEmail({
    to: abrechnung.email,
    subject,
    text,
    html
  });
}

/**
 * Testet die E-Mail-Konfiguration
 */
export async function testEmailConnection(): Promise<boolean> {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ E-Mail-Verbindung erfolgreich getestet');
    return true;
  } catch (error) {
    console.error('❌ E-Mail-Verbindung fehlgeschlagen:', error);
    return false;
  }
}
