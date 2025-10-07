# Deployment auf Vercel

## Schnellstart (5 Minuten)

### 1. Code zu GitHub pushen
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/dein-username/dein-repo.git
git push -u origin main
```

### 2. Vercel-Projekt erstellen
1. Gehe zu [vercel.com](https://vercel.com)
2. Klicke "Add New Project"
3. Wähle dein GitHub-Repository
4. Klicke "Import"

### 3. Environment Variables konfigurieren
Füge folgende Variablen hinzu (Settings → Environment Variables):

**Pflicht:**
```
DATABASE_URL=<Deine PostgreSQL-URL>
NEXTAUTH_URL=https://deine-app.vercel.app
NEXTAUTH_SECRET=<Generiere mit: openssl rand -base64 32>
```

**Optional (für E-Mail-Versand):**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=deine-email@gmail.com
SMTP_PASSWORD=dein-app-passwort
SMTP_FROM=Matilde <noreply@bdp-bawue.de>
LANDESKASSE_EMAIL=kasse@bdp-bawue.de
```

### 4. Deployment starten
Klicke "Deploy" - Vercel baut die App automatisch

### 5. Erste Anmeldung
1. Gehe zu `https://deine-app.vercel.app/admin/login`
2. Die Admin-Accounts werden **automatisch** erstellt beim ersten Laden!
3. Melde dich an mit:
   - `kasse@bdp-bawue.de` / `admin123`
   - oder `admin@bdp-bawue.de` / `admin123`

⚠️ **Wichtig:** Ändere das Passwort nach dem ersten Login!

## PostgreSQL Datenbank

### Option 1: Vercel Postgres (empfohlen)
1. In deinem Vercel-Projekt: Storage → Create Database
2. Wähle "Postgres"
3. Die `DATABASE_URL` wird automatisch gesetzt

### Option 2: Externe Datenbank
Verwende einen externen Anbieter wie:
- [Supabase](https://supabase.com) (kostenlos)
- [Railway](https://railway.app)
- [Neon](https://neon.tech) (kostenlos)

Kopiere die PostgreSQL-URL und füge sie als `DATABASE_URL` hinzu.

## Fehlerbehebung

### "Database not found"
- Prüfe die `DATABASE_URL` in den Environment Variables
- Stelle sicher, dass die Datenbank existiert

### "Login funktioniert nicht"
- Öffne `/admin/login` - User werden automatisch erstellt
- Prüfe die Browser-Console (F12) auf Fehler
- Prüfe Vercel-Logs unter Deployments → Runtime Logs

### "NEXTAUTH_SECRET missing"
- Generiere ein Secret: `openssl rand -base64 32`
- Füge es als `NEXTAUTH_SECRET` zu den Environment Variables hinzu
- Führe ein Redeploy durch

## Nach dem Deployment

✅ Öffentliche Abrechnung: `https://deine-app.vercel.app/abrechnung`
✅ Admin-Bereich: `https://deine-app.vercel.app/admin`
✅ Login: `https://deine-app.vercel.app/admin/login`

Viel Erfolg! 🚀
