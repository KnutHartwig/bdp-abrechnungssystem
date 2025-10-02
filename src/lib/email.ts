import nodemailer from 'nodemailer'
import { EmailOptions } from '@/types'

// Transporter erstellen
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

// Verbindung testen
export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify()
    console.log('✅ Email-Server verbunden')
    return true
  } catch (error) {
    console.error('❌ Email-Server-Verbindung fehlgeschlagen:', error)
    return false
  }
}

// Email senden
export async function sendEmail(options: EmailOptions): Promise<void> {
  const { to, subject, html, attachments } = options

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@bdp-bawue.de',
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html,
    attachments,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Email versendet:', info.messageId)
  } catch (error) {
    console.error('❌ Email-Versand fehlgeschlagen:', error)
    throw new Error('Email konnte nicht versendet werden')
  }
}

// Abrechnung an Landeskasse versenden
export async function sendAbrechnungEmail(
  aktionTitel: string,
  gesamtbetrag: number,
  anzahlPosten: number,
  pdfPath: string
): Promise<void> {
  const landeskasseEmail = process.env.LANDESKASSE_EMAIL || 'kasse@bdp-bawue.de'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .header {
          background-color: #003D7A;
          color: white;
          padding: 20px;
          text-align: center;
        }
        .content {
          padding: 20px;
        }
        .summary {
          background-color: #f4f4f4;
          padding: 15px;
          border-left: 4px solid #0066CC;
          margin: 20px 0;
        }
        .summary-item {
          margin: 8px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Neue Abrechnung</h1>
      </div>
      
      <div class="content">
        <h2>Abrechnung: ${aktionTitel}</h2>
        
        <p>Es wurde eine neue Abrechnung erstellt und steht zur Bearbeitung bereit.</p>
        
        <div class="summary">
          <div class="summary-item">
            <strong>Aktion:</strong> ${aktionTitel}
          </div>
          <div class="summary-item">
            <strong>Anzahl Posten:</strong> ${anzahlPosten}
          </div>
          <div class="summary-item">
            <strong>Gesamtbetrag:</strong> ${new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
            }).format(gesamtbetrag)}
          </div>
          <div class="summary-item">
            <strong>Erstellt am:</strong> ${new Date().toLocaleDateString('de-DE', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </div>
        </div>
        
        <p>Die vollständige Abrechnung mit allen Belegen finden Sie im Anhang.</p>
        
        <div class="footer">
          <p>Diese Email wurde automatisch vom BdP Abrechnungssystem generiert.</p>
          <p>Bei Fragen wenden Sie sich bitte an den zuständigen Administrator.</p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: landeskasseEmail,
    subject: `Abrechnung – ${aktionTitel} – ${new Date().toLocaleDateString('de-DE')}`,
    html,
    attachments: [
      {
        filename: `Abrechnung_${aktionTitel.replace(/[^a-z0-9]/gi, '_')}.pdf`,
        path: pdfPath,
        contentType: 'application/pdf',
      },
    ],
  })
}

// Willkommens-Email an neuen Admin
export async function sendWelcomeEmail(
  email: string,
  name: string,
  tempPassword: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .header {
          background-color: #003D7A;
          color: white;
          padding: 20px;
          text-align: center;
        }
        .content {
          padding: 20px;
        }
        .credentials {
          background-color: #f4f4f4;
          padding: 15px;
          border-left: 4px solid #E87722;
          margin: 20px 0;
        }
        .warning {
          color: #E87722;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Willkommen beim BdP Abrechnungssystem</h1>
      </div>
      
      <div class="content">
        <p>Hallo ${name},</p>
        
        <p>Dein Account für das BdP Abrechnungssystem wurde erstellt.</p>
        
        <div class="credentials">
          <p><strong>Deine Zugangsdaten:</strong></p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Temporäres Passwort:</strong> ${tempPassword}</p>
        </div>
        
        <p class="warning">⚠️ Bitte ändere dein Passwort nach der ersten Anmeldung!</p>
        
        <p>Du kannst dich unter <a href="${process.env.NEXTAUTH_URL}/admin/login">diesem Link</a> anmelden.</p>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: 'Willkommen beim BdP Abrechnungssystem',
    html,
  })
}

// Benachrichtigung bei Fehler
export async function sendErrorNotification(
  aktionId: string,
  aktionTitel: string,
  error: string
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@bdp-bawue.de'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .header {
          background-color: #E87722;
          color: white;
          padding: 20px;
          text-align: center;
        }
        .error-box {
          background-color: #fff3cd;
          border: 1px solid #E87722;
          padding: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>⚠️ Fehler bei Abrechnungserstellung</h1>
      </div>
      
      <div class="content">
        <p>Bei der Erstellung der Abrechnung ist ein Fehler aufgetreten:</p>
        
        <div class="error-box">
          <p><strong>Aktion:</strong> ${aktionTitel} (ID: ${aktionId})</p>
          <p><strong>Fehler:</strong> ${error}</p>
          <p><strong>Zeitpunkt:</strong> ${new Date().toLocaleString('de-DE')}</p>
        </div>
        
        <p>Bitte prüfen Sie die Logs für weitere Details.</p>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: adminEmail,
    subject: `⚠️ Fehler bei Abrechnung: ${aktionTitel}`,
    html,
  })
}
