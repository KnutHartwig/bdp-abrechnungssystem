# Deployment-Anleitung für Vercel

Diese Anleitung führt Sie Schritt für Schritt durch das Deployment des BdP Abrechnungssystems auf Vercel.

## Voraussetzungen

- GitHub Account
- Vercel Account (kostenlos unter [vercel.com](https://vercel.com))
- Zugriff auf dieses Repository

## Schritt 1: Repository auf GitHub

1. Erstellen Sie ein neues Repository auf GitHub
2. Pushen Sie den Code:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Schritt 2: Vercel-Projekt erstellen

1. Gehen Sie zu [vercel.com/new](https://vercel.com/new)
2. Verbinden Sie Ihren GitHub Account (falls noch nicht geschehen)
3. Wählen Sie das Repository aus
4. Klicken Sie auf "Import"

## Schritt 3: PostgreSQL Datenbank einrichten

### Option A: Vercel Postgres (Empfohlen)

1. Im Vercel Dashboard, gehen Sie zu Ihrem Projekt
2. Klicken Sie auf "Storage" Tab
3. Klicken Sie auf "Create Database"
4. Wählen Sie "Postgres"
5. Wählen Sie eine Region (empfohlen: Frankfurt oder Amsterdam für DE)
6. Klicken Sie auf "Create"
7. Die `DATABASE_URL` wird automatisch als Umgebungsvariable gesetzt

### Option B: Externe Datenbank

Wenn Sie eine externe PostgreSQL-Datenbank verwenden (z.B. Supabase, Neon, Railway):

1. Erstellen Sie eine PostgreSQL-Datenbank bei Ihrem Provider
2. Kopieren Sie die Connection String (DATABASE_URL)
3. Fügen Sie diese in den Vercel-Umgebungsvariablen hinzu

## Schritt 4: Umgebungsvariablen einrichten

1. Im Vercel Dashboard, gehen Sie zu: Settings → Environment Variables
2. Fügen Sie folgende Variablen hinzu:

### Erforderliche Variablen:

**DATABASE_URL** (automatisch gesetzt bei Vercel Postgres, sonst manuell):
```
postgresql://user:password@host:5432/database
```

**NEXTAUTH_URL**:
```
https://ihr-projekt.vercel.app
```
(Ersetzen Sie durch Ihre tatsächliche Vercel-Domain)

**NEXTAUTH_SECRET** (Generieren Sie ein sicheres Secret):
```bash
# Lokal ausführen:
openssl rand -base64 32
```
Fügen Sie das generierte Secret ein.

**SMTP_HOST**:
```
smtp.gmail.com
```
(oder Ihr SMTP-Server)

**SMTP_PORT**:
```
587
```

**SMTP_USER**:
```
ihr-email@gmail.com
```

**SMTP_PASSWORD**:
```
ihr-app-passwort
```

**SMTP_FROM**:
```
noreply@bdp-bawue.de
```

**LANDESKASSE_EMAIL**:
```
kasse@bdp-bawue.de
```

**APP_NAME**:
```
BdP Abrechnungssystem
```

### Wichtig für alle Umgebungen:

Stellen Sie sicher, dass Sie die Variablen für **Production**, **Preview** und **Development** setzen.

## Schritt 5: Build-Einstellungen

Vercel erkennt Next.js automatisch. Standardeinstellungen sollten funktionieren:

- **Framework Preset:** Next.js
- **Build Command:** `prisma generate && prisma migrate deploy && next build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

Falls Sie andere Einstellungen benötigen, können Sie diese unter Settings → General → Build & Development Settings anpassen.

## Schritt 6: Deployment

1. Klicken Sie auf "Deploy"
2. Warten Sie, bis der Build abgeschlossen ist
3. Bei Erfolg sehen Sie die Live-URL

### Wichtig: Prisma Migrationen

Beim ersten Deployment werden die Datenbank-Migrationen automatisch ausgeführt durch:
```bash
prisma migrate deploy
```

## Schritt 7: Datenbank-Seeding

Nach dem erfolgreichen Deployment müssen Sie die Datenbank mit Test-Daten füllen:

### Option A: Vercel CLI (Empfohlen)

1. Installieren Sie Vercel CLI:
```bash
npm install -g vercel
```

2. Login:
```bash
vercel login
```

3. Link zum Projekt:
```bash
vercel link
```

4. Führen Sie das Seed-Script aus:
```bash
vercel env pull .env.local
npm run prisma:seed
```

### Option B: Manuell via Prisma Studio

1. Öffnen Sie Prisma Studio lokal:
```bash
npx prisma studio
```

2. Erstellen Sie manuell:
   - 2 User (Admin, Landeskasse)
   - 1 Aktion (Test-Aktion)
   - Optional: Test-Abrechnungen

## Schritt 8: SMTP-Konfiguration (Gmail Beispiel)

Falls Sie Gmail verwenden:

1. Gehen Sie zu [Google Account Security](https://myaccount.google.com/security)
2. Aktivieren Sie 2-Faktor-Authentifizierung
3. Erstellen Sie ein App-Passwort:
   - Security → App passwords
   - Wählen Sie "Mail" und "Other"
   - Kopieren Sie das generierte Passwort
4. Verwenden Sie dieses Passwort als `SMTP_PASSWORD`

## Schritt 9: Custom Domain (Optional)

1. Gehen Sie zu Settings → Domains
2. Klicken Sie auf "Add"
3. Geben Sie Ihre Domain ein (z.B. `abrechnung.bdp-bawue.de`)
4. Folgen Sie den DNS-Anweisungen
5. Warten Sie auf DNS-Propagierung (kann bis zu 48h dauern)
6. Aktualisieren Sie `NEXTAUTH_URL` auf die neue Domain

## Schritt 10: Testing

Nach erfolgreichem Deployment:

1. **Homepage testen:** https://ihr-projekt.vercel.app
2. **Abrechnung testen:** https://ihr-projekt.vercel.app/abrechnung
3. **Admin-Login:** https://ihr-projekt.vercel.app/admin/login
   - Test mit: admin@bdp-bawue.de / admin123

## Troubleshooting

### Build Failed

**Problem:** `Prisma Client generation failed`
**Lösung:** Stellen Sie sicher, dass `prisma generate` im Build Command enthalten ist

**Problem:** `DATABASE_URL not found`
**Lösung:** Überprüfen Sie Umgebungsvariablen in Vercel Settings

### Runtime Errors

**Problem:** `NEXTAUTH_SECRET missing`
**Lösung:** Generieren Sie ein neues Secret und fügen Sie es hinzu

**Problem:** Email sending fails
**Lösung:** 
- Überprüfen Sie SMTP-Credentials
- Bei Gmail: Verwenden Sie App-Passwort, nicht normales Passwort
- Überprüfen Sie Firewall/Port-Einstellungen

### Datenbank-Probleme

**Problem:** Can't connect to database
**Lösung:**
- Bei Vercel Postgres: Überprüfen Sie, ob DATABASE_URL korrekt gesetzt ist
- Bei externer DB: Überprüfen Sie IP-Whitelist und Connection String

**Problem:** Migrations failed
**Lösung:**
```bash
# Lokal ausführen mit Production DATABASE_URL
npx prisma migrate reset
npx prisma migrate deploy
```

## Monitoring

### Logs ansehen

1. Gehen Sie zu Ihrem Projekt in Vercel
2. Klicken Sie auf "Deployments"
3. Wählen Sie das neueste Deployment
4. Klicken Sie auf "Runtime Logs" oder "Build Logs"

### Performance überwachen

1. Gehen Sie zu "Analytics" Tab
2. Überwachen Sie:
   - Request Count
   - Error Rate
   - Response Time

## Sicherheit

### Nach dem Deployment:

1. **Ändern Sie Standard-Passwörter:**
   - Admin-Account
   - Landeskasse-Account

2. **Aktivieren Sie 2FA** (wenn verfügbar)

3. **Überprüfen Sie Zugriffsrechte:**
   - Wer hat Zugriff auf Vercel-Projekt?
   - Wer hat Zugriff auf GitHub-Repository?

4. **Backup-Strategie:**
   - Vercel Postgres erstellt automatisch Backups
   - Zusätzlich können Sie manuelle Backups erstellen

## Updates

### Code-Updates deployen:

1. Committen und pushen Sie Änderungen zu GitHub
2. Vercel deployed automatisch
3. Preview-Deployments werden für Pull Requests erstellt

### Manuelle Redeployments:

1. Gehen Sie zu Deployments
2. Wählen Sie ein Deployment
3. Klicken Sie auf "..." → "Redeploy"

## Support

Bei Problemen:

1. Überprüfen Sie die [Vercel Dokumentation](https://vercel.com/docs)
2. Überprüfen Sie die [Next.js Dokumentation](https://nextjs.org/docs)
3. Kontaktieren Sie den Support: kasse@bdp-bawue.de

## Checkliste

- [ ] Repository auf GitHub erstellt
- [ ] Vercel-Projekt erstellt
- [ ] PostgreSQL Datenbank eingerichtet
- [ ] Alle Umgebungsvariablen gesetzt
- [ ] Erfolgreich deployed
- [ ] Datenbank geseeded
- [ ] SMTP konfiguriert und getestet
- [ ] Standard-Passwörter geändert
- [ ] Custom Domain konfiguriert (optional)
- [ ] Backups verifiziert
- [ ] Monitoring eingerichtet
- [ ] Team hat Zugriff

---

Viel Erfolg beim Deployment! 🚀
