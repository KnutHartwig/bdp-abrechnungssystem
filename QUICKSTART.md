# ⚡ QUICKSTART - BdP Abrechnungssystem

## 🚀 In 5 Minuten lokal starten

```bash
# 1. Dependencies installieren
npm install

# 2. Environment Variables kopieren
cp .env.example .env

# 3. .env editieren - MINDESTENS diese Werte anpassen:
# DATABASE_URL="postgresql://user:password@localhost:5432/bdp_abrechnung"
# NEXTAUTH_SECRET="<random-string>"
# EMAIL_* Werte für Ihren SMTP-Server

# 4. Datenbank erstellen und migrieren
createdb bdp_abrechnung
npx prisma migrate dev
npx prisma db seed

# 5. Entwicklungsserver starten
npm run dev
```

→ Öffnen Sie http://localhost:3000 🎉

## 📋 Standard-Login

```
E-Mail: admin@bdp-bawue.de
Passwort: admin123
```

## 🌐 Auf Vercel deployen (15 Minuten)

```bash
# 1. Git Repository
git init
git add .
git commit -m "Initial commit"

# 2. Auf GitHub pushen
# - Erstellen Sie ein neues Repository auf GitHub
# - Folgen Sie den GitHub-Anweisungen

# 3. Vercel Account
# - Gehen Sie zu vercel.com
# - "Continue with GitHub"
# - Import Ihr Repository

# 4. In Vercel:
# - Storage → Create Postgres Database
# - Settings → Environment Variables → alle aus .env.example eintragen
# - Deploy!

# 5. Datenbank initialisieren
npx prisma migrate deploy
npx prisma db seed
```

→ Fertig! Ihre App ist live 🚀

## 📖 Ausführliche Anleitung

Siehe [DEPLOYMENT.md](./DEPLOYMENT.md) für detaillierte Schritt-für-Schritt Anweisungen.

## 🆘 Probleme?

**Build Fehler**: Prüfen Sie alle Environment Variables  
**DB Fehler**: `npx prisma migrate reset` (⚠️ löscht alle Daten)  
**Email Fehler**: Für Gmail brauchen Sie ein App-Passwort

## 📁 Projektstruktur

```
src/
├── app/               # Next.js Pages
│   ├── abrechnung/    # Öffentliches Formular
│   ├── admin/         # Admin-Dashboard
│   └── api/           # API Routes
├── components/        # React Components
├── lib/              # Utilities (Auth, Email, PDF)
└── types/            # TypeScript Types

prisma/
├── schema.prisma     # Datenbank-Schema
└── seed.ts          # Initialdaten
```

## ✨ Features

✅ Öffentliches Formular ohne Login  
✅ 11 Kategorien inkl. Fahrtkosten-Berechnung  
✅ Datei-Upload (PDF, JPG, PNG)  
✅ Admin-Dashboard mit Übersicht  
✅ PDF-Export & E-Mail-Versand  
✅ Mobile-optimiert  

## 🔧 Konfiguration

Alle Einstellungen in `.env`:
- `DATABASE_URL` - PostgreSQL Connection
- `NEXTAUTH_SECRET` - Auth Secret (generieren mit `openssl rand -base64 32`)
- `EMAIL_*` - SMTP für E-Mail-Versand

## 📞 Support

Fragen? Siehe [README.md](./README.md) für ausführliche Dokumentation.

---

**Version**: 1.0 | **BdP Baden-Württemberg e.V.**
