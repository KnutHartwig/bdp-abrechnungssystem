# 🚀 Deployment auf Vercel - Schritt-für-Schritt Anleitung

## Übersicht

Diese Anleitung führt Sie durch den kompletten Deployment-Prozess des BdP Abrechnungssystems auf Vercel mit PostgreSQL-Datenbank.

## Voraussetzungen

- ✅ GitHub Account
- ✅ Vercel Account (kostenlos)
- ✅ SMTP-Credentials für E-Mail-Versand

## Schritt 1: GitHub Repository erstellen

### 1.1 Lokales Repository initialisieren

```bash
cd bdp-abrechnungssystem
git init
git add .
git commit -m "Initial commit: BdP Abrechnungssystem"
```

### 1.2 GitHub Repository erstellen

1. Gehen Sie zu https://github.com/new
2. Repository-Name: `bdp-abrechnungssystem`
3. Visibility: **Private** (empfohlen)
4. Klicken Sie "Create repository"

### 1.3 Repository mit GitHub verbinden

```bash
git remote add origin https://github.com/IHR-USERNAME/bdp-abrechnungssystem.git
git branch -M main
git push -u origin main
```

## Schritt 2: Vercel Account einrichten

1. Gehen Sie zu https://vercel.com/signup
2. Wählen Sie "Continue with GitHub"
3. Autorisieren Sie Vercel für Ihren GitHub Account

## Schritt 3: Projekt in Vercel importieren

1. Im Vercel Dashboard: **"Add New..." → "Project"**
2. **Import Git Repository** wählen
3. Ihr GitHub-Repository `bdp-abrechnungssystem` auswählen
4. Klicken Sie **"Import"**

### 3.1 Build Settings

Vercel erkennt Next.js automatisch. Standard-Einstellungen:

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

**WICHTIG**: Klicken Sie noch **NICHT** auf "Deploy"!

## Schritt 4: PostgreSQL Datenbank erstellen

### 4.1 Datenbank in Vercel Storage

1. Im Vercel Dashboard → Ihr Projekt auswählen
2. Oben im Menü: **"Storage"** → **"Create Database"**
3. **"Postgres"** auswählen
4. Einstellungen:
   - Database Name: `bdp-abrechnung`
   - Region: **Frankfurt, Germany (fra1)** (DSGVO-konform)
5. Klicken Sie **"Create"**

### 4.2 Datenbank mit Projekt verbinden

1. In der Datenbank-Übersicht: **"Connect Project"**
2. Ihr Projekt auswählen
3. Environment: **"Production, Preview, Development"** (alle auswählen)
4. Klicken Sie **"Connect"**

Die Variable `DATABASE_URL` wird automatisch gesetzt! ✅

## Schritt 5: Environment Variables konfigurieren

### 5.1 Im Vercel Dashboard

1. Ihr Projekt → **"Settings"** → **"Environment Variables"**
2. Fügen Sie folgende Variables hinzu:

#### NEXTAUTH_SECRET

```bash
# Generieren Sie einen sicheren Secret mit:
openssl rand -base64 32
```

- Key: `NEXTAUTH_SECRET`
- Value: `<generierter-string>`
- Environments: ☑ Production ☑ Preview ☑ Development

#### NEXTAUTH_URL

- Key: `NEXTAUTH_URL`
- Value: `https://ihr-projekt-name.vercel.app`
- Environments: ☑ Production

**Hinweis**: Die URL erhalten Sie nach dem ersten Deployment.

#### E-Mail Konfiguration (Gmail Beispiel)

**EMAIL_SERVER**
- Key: `EMAIL_SERVER`
- Value: `smtp.gmail.com`
- Environments: ☑ Production ☑ Preview ☑ Development

**EMAIL_PORT**
- Key: `EMAIL_PORT`
- Value: `587`
- Environments: ☑ Production ☑ Preview ☑ Development

**EMAIL_USER**
- Key: `EMAIL_USER`
- Value: `ihre-email@gmail.com`
- Environments: ☑ Production ☑ Preview ☑ Development

**EMAIL_PASSWORD**
- Key: `EMAIL_PASSWORD`
- Value: `ihr-app-passwort` (siehe unten)
- Environments: ☑ Production ☑ Preview ☑ Development

**EMAIL_FROM**
- Key: `EMAIL_FROM`
- Value: `BdP Abrechnungssystem <noreply@bdp-bawue.de>`
- Environments: ☑ Production ☑ Preview ☑ Development

**EMAIL_TO**
- Key: `EMAIL_TO`
- Value: `kasse@bdp-bawue.de`
- Environments: ☑ Production ☑ Preview ☑ Development

### 5.2 Gmail App-Passwort erstellen

**WICHTIG**: Verwenden Sie NICHT Ihr normales Gmail-Passwort!

1. Gehen Sie zu https://myaccount.google.com/security
2. "2-Step Verification" aktivieren (falls nicht bereits aktiviert)
3. Scrollen Sie zu "App passwords"
4. Wählen Sie:
   - App: **Mail**
   - Device: **Other** → "BdP Abrechnungssystem"
5. Klicken Sie **"Generate"**
6. Kopieren Sie das 16-stellige Passwort
7. Verwenden Sie dieses als `EMAIL_PASSWORD`

### 5.3 Alternative E-Mail-Provider

**Outlook/Office365**
```
EMAIL_SERVER=smtp-mail.outlook.com
EMAIL_PORT=587
```

**SMTP.de**
```
EMAIL_SERVER=mail.smtp.de
EMAIL_PORT=587
```

## Schritt 6: Erstes Deployment

1. Im Vercel Dashboard → Ihr Projekt
2. Klicken Sie **"Deploy"** (oder "Redeploy")
3. Warten Sie ca. 2-3 Minuten
4. Bei Erfolg sehen Sie: ✅ **"Production Deployment"**

## Schritt 7: Datenbank initialisieren

### 7.1 Vercel CLI installieren (optional)

```bash
npm i -g vercel
vercel login
```

### 7.2 Datenbank migrieren

**Option A: Via Vercel Dashboard**

1. Ihr Projekt → **"Settings"** → **"Functions"**
2. Unten: **"Serverless Function Logs"**
3. Öffnen Sie eine Terminal-Session

**Option B: Via lokale Verbindung (empfohlen)**

1. Database Connection String kopieren:
   - Storage → Postgres → **".env.local"** Tab
   - Kopieren Sie `POSTGRES_URL`

2. Lokal ausführen:
   ```bash
   # Temporär in .env setzen
   echo "DATABASE_URL=<ihr-postgres-url>" > .env.local
   
   # Migrationen ausführen
   npx prisma migrate deploy
   
   # Datenbank seeden
   npx prisma db seed
   ```

### 7.3 NEXTAUTH_URL aktualisieren

Nach dem ersten Deployment:

1. Notieren Sie Ihre Vercel-URL: `https://ihr-projekt.vercel.app`
2. Aktualisieren Sie `NEXTAUTH_URL`:
   - Settings → Environment Variables
   - Suchen Sie `NEXTAUTH_URL`
   - Klicken Sie Edit
   - Value: `https://ihr-projekt.vercel.app`
   - Save

3. **Redeploy triggern**:
   - Deployments → neuestes Deployment → ... → "Redeploy"

## Schritt 8: Funktionalität testen

### 8.1 Öffentliches Formular testen

1. Öffnen Sie: `https://ihr-projekt.vercel.app`
2. Klicken Sie "Abrechnung einreichen"
3. Füllen Sie das Formular aus (Test-Daten)
4. Senden Sie ab
5. ✅ Erfolgsmeldung sollte erscheinen

### 8.2 Admin-Login testen

1. Öffnen Sie: `https://ihr-projekt.vercel.app/admin/login`
2. Login:
   - E-Mail: `admin@bdp-bawue.de`
   - Passwort: `admin123`
3. ✅ Sie sollten zum Dashboard weitergeleitet werden

### 8.3 E-Mail-Versand testen

1. Im Admin-Dashboard → "Zur Freigabe"
2. Wählen Sie die Test-Maßnahme
3. Wählen Sie Ihre Test-Abrechnung
4. Klicken Sie "Freigeben und versenden"
5. ✅ Prüfen Sie den E-Mail-Eingang

## Schritt 9: Produktiv-Absicherung

### 9.1 Admin-Passwort ändern

**⚠️ WICHTIG**: Ändern Sie das Standard-Passwort!

```bash
# 1. Neues Passwort-Hash generieren
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('NEUES-SICHERES-PASSWORT', 10));"

# 2. In Prisma Studio öffnen
npx prisma studio

# 3. User-Tabelle öffnen
# 4. admin@bdp-bawue.de Zeile bearbeiten
# 5. Password-Feld mit neuem Hash ersetzen
# 6. Speichern
```

### 9.2 Custom Domain (optional)

1. Domain bei Provider (z.B. Strato, Ionos) kaufen
2. Vercel Dashboard → Ihr Projekt → **"Settings"** → **"Domains"**
3. Klicken Sie **"Add Domain"**
4. Domain eingeben: `abrechnung.bdp-bawue.de`
5. DNS-Einträge bei Ihrem Provider setzen (wird angezeigt)
6. Warten auf Verifizierung (1-48h)
7. SSL-Zertifikat wird automatisch erstellt

### 9.3 Vercel Protection

1. Settings → **"Deployment Protection"**
2. **"Vercel Authentication"** aktivieren
3. Nur authentifizierte Vercel-Nutzer können auf Preview-Deployments zugreifen

## Automatische Updates

### Bei jedem Git Push

```bash
git add .
git commit -m "Feature: Neue Kategorie hinzugefügt"
git push
```

→ Vercel deployed automatisch! 🚀

### Preview Deployments

- Jeder Branch bekommt eine eigene Preview-URL
- Perfekt für Testing vor Production

```bash
git checkout -b feature/neue-funktion
# ... Änderungen machen ...
git push origin feature/neue-funktion
```

→ Vercel erstellt Preview-URL: `feature-neue-funktion-bdp.vercel.app`

## Monitoring & Logs

### Vercel Dashboard

1. **Analytics**: Besucher-Statistiken
2. **Logs**: Runtime-Logs in Echtzeit
3. **Insights**: Performance-Metriken

### E-Mail-Benachrichtigungen

1. Settings → **"Notifications"**
2. **"Deployment Failed"** aktivieren
3. **"Deployment Ready"** aktivieren

## Troubleshooting

### Build schlägt fehl

**Error: Missing environment variables**
- Prüfen Sie alle Environment Variables in Settings
- Alle notwendigen Variablen müssen gesetzt sein

**Error: Puppeteer not found**
```bash
# In package.json:
"dependencies": {
  "puppeteer": "^23.1.1"
}
```

### Datenbank-Verbindung schlägt fehl

1. Storage → Postgres → **"Connect"** überprüfen
2. Projekt sollte connected sein
3. `DATABASE_URL` in Environment Variables prüfen

### E-Mail-Versand schlägt fehl

1. Gmail: App-Passwort verwenden (nicht normales Passwort)
2. SMTP-Server-Einstellungen prüfen
3. In Logs nachschauen: Deployments → Functions → Logs

### 500 Internal Server Error

1. Deployments → neuestes Deployment → **"Function Logs"**
2. Fehler-Details lesen
3. Häufige Ursachen:
   - Fehlende Environment Variable
   - Datenbank nicht migriert
   - SMTP-Fehler

## Support

Bei Problemen:
- Vercel Support: https://vercel.com/support
- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs

## Checkliste: Produktiv-Deployment ✅

- [ ] GitHub Repository erstellt und gepusht
- [ ] Vercel Account erstellt
- [ ] Projekt in Vercel importiert
- [ ] PostgreSQL Datenbank erstellt
- [ ] Alle Environment Variables gesetzt
- [ ] `NEXTAUTH_SECRET` generiert
- [ ] Gmail App-Passwort erstellt
- [ ] Erstes Deployment erfolgreich
- [ ] Datenbank migriert und geseedet
- [ ] `NEXTAUTH_URL` aktualisiert
- [ ] Öffentliches Formular getestet
- [ ] Admin-Login getestet
- [ ] E-Mail-Versand getestet
- [ ] Admin-Passwort geändert
- [ ] Custom Domain konfiguriert (optional)
- [ ] Team-Mitglieder eingeladen (optional)

---

**Glückwunsch! 🎉** Ihr BdP Abrechnungssystem ist jetzt live!
