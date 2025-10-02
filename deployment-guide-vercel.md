# Vercel Deployment-Guide

Diese Anleitung zeigt dir, wie du die BdP-Abrechnungssystem-App auf Vercel deployest.

## Warum Vercel?

- ✅ **Kostenlos:** Hobby-Plan reicht aus
- ✅ **Einfach:** 1-Click PostgreSQL
- ✅ **Schnell:** Automatische Deployments bei Git-Push
- ✅ **Stabil:** 99.9% Uptime
- ✅ **SSL:** Automatisches HTTPS-Zertifikat

## Zeitaufwand

⏱️ **Gesamt: 15-20 Minuten**

## Voraussetzungen

- GitHub-Account
- Vercel-Account (kostenlos auf [vercel.com](https://vercel.com))
- Projekt in Git-Repository

## Schritt-für-Schritt-Anleitung

### 1. GitHub-Repository erstellen (5 Min)

```bash
# In deinem Projektverzeichnis
cd bdp-abrechnungssystem

# Git initialisieren (falls noch nicht)
git init

# .env.local NICHT committen (ist in .gitignore)
git add .
git commit -m "Initial commit"

# GitHub-Repo erstellen (z.B. bdp-abrechnungssystem)
# Dann:
git remote add origin https://github.com/DEIN-USERNAME/bdp-abrechnungssystem.git
git branch -M main
git push -u origin main
```

### 2. Vercel-Account einrichten (2 Min)

1. Gehe zu [vercel.com](https://vercel.com)
2. Klicke "Sign Up"
3. Wähle "Continue with GitHub"
4. Autorisiere Vercel

### 3. Projekt importieren (3 Min)

1. Im Vercel-Dashboard: Klicke "Add New Project"
2. Wähle dein GitHub-Repository `bdp-abrechnungssystem`
3. Klicke "Import"

**Framework Settings:**
- Framework Preset: **Next.js** (wird automatisch erkannt)
- Root Directory: `./` (Standard)
- Build Command: `npm run build` (Standard)
- Output Directory: `.next` (Standard)

✅ Alle Standardwerte sind korrekt!

### 4. PostgreSQL-Datenbank erstellen (5 Min)

1. Im Vercel-Dashboard → "Storage" Tab
2. Klicke "Create Database"
3. Wähle "Postgres"
4. Name: `bdp-abrechnungen-db`
5. Region: **Frankfurt** (am nächsten zu Deutschland)
6. Klicke "Create"

⏳ Datenbank wird erstellt (ca. 1 Minute)

### 5. Umgebungsvariablen konfigurieren (5 Min)

1. Gehe zu deinem Projekt → "Settings" → "Environment Variables"

2. **DATABASE_URL** (automatisch hinzugefügt)
   - Bereits vorhanden durch Postgres-Integration ✅

3. **NEXTAUTH_URL**
   - Name: `NEXTAUTH_URL`
   - Value: `https://dein-projekt.vercel.app` (deine Vercel-URL)
   - Environments: Production, Preview, Development

4. **NEXTAUTH_SECRET**
   ```bash
   # Lokal generieren:
   openssl rand -base64 32
   ```
   - Name: `NEXTAUTH_SECRET`
   - Value: (die generierte Ausgabe)
   - Environments: Production, Preview, Development

5. **SMTP-Einstellungen**

   Für Gmail:
   ```
   SMTP_HOST = smtp.gmail.com
   SMTP_PORT = 587
   SMTP_USER = deine-email@gmail.com
   SMTP_PASSWORD = (App-Passwort von Google)
   SMTP_FROM = BdP Abrechnungen <deine-email@gmail.com>
   LANDESKASSE_EMAIL = kasse@bdp-bawue.de
   ```

6. **Admin-Account**
   ```
   ADMIN_EMAIL = admin@bdp-bawue.de
   ADMIN_PASSWORD = (sicheres-passwort)
   ```

### 6. Datenbank initialisieren

#### Option A: Vercel CLI (Empfohlen)

```bash
# Vercel CLI installieren
npm i -g vercel

# Mit Vercel verbinden
vercel login

# Projekt verlinken
vercel link

# Umgebungsvariablen laden
vercel env pull .env.local

# Prisma Schema pushen
npx prisma db push

# Seed-Daten einfügen
npx prisma db seed
```

#### Option B: Vercel Postgres Dashboard

1. Gehe zu Storage → Deine Datenbank → "Query"
2. Kopiere den Inhalt von `prisma/schema.prisma`
3. Führe SQL-Migrations manuell aus (komplizierter)

**→ Option A ist deutlich einfacher!**

### 7. Deployment starten

```bash
# Production Deployment
vercel --prod

# Oder einfach Git pushen:
git push origin main
# → Vercel deployed automatisch
```

⏳ Deployment läuft (ca. 2-3 Minuten)

### 8. Domain konfigurieren (Optional)

1. Vercel-Dashboard → Settings → Domains
2. Klicke "Add Domain"
3. Gib deine Domain ein: `abrechnung.bdp-bawue.de`
4. Folge den DNS-Anweisungen

**DNS-Einträge bei deinem Domain-Provider:**
```
Type: CNAME
Name: abrechnung
Value: cname.vercel-dns.com
```

⏳ DNS-Propagierung dauert 10 Minuten bis 24 Stunden

## Testen

### 1. App öffnen

```
https://dein-projekt.vercel.app
```

### 2. Admin-Login testen

```
https://dein-projekt.vercel.app/admin/login

Email: admin@bdp-bawue.de
Passwort: (aus Environment Variables)
```

### 3. Test-Abrechnung einreichen

```
https://dein-projekt.vercel.app/abrechnung
```

## Automatische Deployments

Ab jetzt:

```bash
# Code ändern
git add .
git commit -m "Feature XYZ"
git push

# → Vercel deployed automatisch! 🚀
```

## Logs & Monitoring

### Logs anzeigen

1. Vercel-Dashboard → dein Projekt
2. "Deployments" Tab
3. Klicke auf neuestes Deployment
4. "Functions" Tab → Logs

### Fehler debuggen

```bash
# Vercel CLI Logs in Echtzeit
vercel logs
```

## Kosten

**Hobby-Plan (Kostenlos):**
- ✅ 100 GB Bandwidth/Monat
- ✅ Unlimited Deployments
- ✅ 1 GB Postgres Storage
- ✅ 60 Compute Hours/Monat

**Ausreichend für:**
- 500-1000 Abrechnungen/Monat
- 10-20 Admin-Benutzer
- Tausende Seitenaufrufe

**Pro-Plan (20$/Monat):**
- Mehr Bandbreite
- Mehr Storage
- Team-Features

**→ Hobby-Plan reicht für BdP aus!**

## Backup-Strategie

### Automatische Backups

Vercel Postgres macht automatisch Backups:
- Täglich für letzte 7 Tage
- Wiederherstellung per Support

### Manuelles Backup

```bash
# Datenbank exportieren
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Wiederherstellen
psql $DATABASE_URL < backup-20251002.sql
```

## Wartung

### Updates deployen

```bash
# Dependencies aktualisieren
npm update

# Testen
npm run build
npm start

# Deployen
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### Datenbank-Migrationen

```bash
# Schema ändern in prisma/schema.prisma
# Dann:
vercel env pull .env.local
npx prisma db push
git push
```

## Troubleshooting

### Problem: "Database connection failed"

**Lösung:**
1. Gehe zu Storage → Deine DB → ".env.local" Tab
2. Kopiere `DATABASE_URL`
3. Füge in Vercel Environment Variables ein

### Problem: "Build failed"

**Lösung:**
1. Prüfe Vercel Build Logs
2. Teste lokal:
   ```bash
   npm run build
   ```
3. Häufige Ursachen:
   - TypeScript-Fehler
   - Missing Environment Variables
   - Prisma Schema-Fehler

### Problem: "Email sendet nicht"

**Lösung:**
1. Prüfe SMTP-Settings in Environment Variables
2. Bei Gmail: Nutze App-Passwort
3. Teste in Vercel Functions Logs

### Problem: "Upload schlägt fehl"

**Lösung:**
Vercel hat 4.5MB Body-Limit.

Für größere Dateien:
```javascript
// next.config.js
experimental: {
  serverActions: {
    bodySizeLimit: '10mb',
  },
}
```

## Alternativen zu Vercel

### Railway.app

```bash
# Railway CLI
npm i -g @railway/cli
railway login
railway init
railway up
```

**Vorteile:**
- Mehr Kontrolle
- Bessere Postgres-Integration

**Nachteile:**
- Komplizierter
- Kostenpflichtig nach Trial

### Render.com

Ähnlich wie Railway, gute Alternative.

### Eigener Server (VPS)

Siehe separate Anleitung für Deployment auf eigenem Server.

## Nützliche Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Docs](https://vercel.com/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Next.js auf Vercel](https://nextjs.org/docs/deployment)

## Support

Bei Problemen:
- **Vercel Support:** help@vercel.com
- **BdP Support:** kasse@bdp-bawue.de

---

**Fertig!** 🎉 Deine App läuft jetzt auf Vercel!

Öffne: `https://dein-projekt.vercel.app`
