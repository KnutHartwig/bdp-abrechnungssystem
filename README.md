# BdP Abrechnungssystem

Vollautomatisiertes Abrechnungssystem für den BdP Landesverband Baden-Württemberg e.V.

## 🎯 Features

- ✅ Öffentliches Eingabeformular (ohne Login)
- ✅ 11 Abrechnungskategorien (inkl. Fahrtkosten mit automatischer Berechnung)
- ✅ Datei-Upload für Belege (PDF, JPG, PNG)
- ✅ Admin-Dashboard mit Übersicht
- ✅ Freigabe-Workflow
- ✅ Automatische PDF-Generierung
- ✅ E-Mail-Versand an Landeskasse
- ✅ Responsive Design (Mobile & Desktop)

## 🛠️ Technologie-Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Datenbank**: PostgreSQL
- **Auth**: NextAuth.js
- **PDF**: Puppeteer
- **E-Mail**: Nodemailer

## 📋 Voraussetzungen

- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- SMTP-Server für E-Mail-Versand

## 🚀 Installation

### 1. Repository klonen

```bash
git clone <repository-url>
cd bdp-abrechnungssystem
```

### 2. Dependencies installieren

```bash
npm install
```

### 3. Datenbank einrichten

Erstellen Sie eine PostgreSQL-Datenbank:

```bash
createdb bdp_abrechnung
```

### 4. Environment Variables

Kopieren Sie `.env.example` zu `.env` und füllen Sie die Werte aus:

```bash
cp .env.example .env
```

Editieren Sie `.env`:

```env
# Datenbank
DATABASE_URL="postgresql://user:password@localhost:5432/bdp_abrechnung"

# NextAuth
NEXTAUTH_SECRET="generieren-sie-einen-langen-zufaelligen-string"
NEXTAUTH_URL="http://localhost:3000"

# E-Mail (SMTP)
EMAIL_SERVER="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="ihre-email@domain.de"
EMAIL_PASSWORD="ihr-app-passwort"
EMAIL_FROM="BdP Abrechnungssystem <noreply@bdp-bawue.de>"
EMAIL_TO="kasse@bdp-bawue.de"
```

**Wichtig**: Für Gmail müssen Sie ein App-Passwort erstellen (nicht Ihr normales Passwort):
https://support.google.com/accounts/answer/185833

### 5. Datenbank migrieren und seeden

```bash
npx prisma migrate dev
npx prisma db seed
```

Dies erstellt:
- Admin-User: `admin@bdp-bawue.de` / `admin123`
- Landeskasse-User: `kasse@bdp-bawue.de` / `admin123`
- 11 Kategorien
- Test-Aktion "Sommerlager 2025"

### 6. Entwicklungsserver starten

```bash
npm run dev
```

Die Anwendung ist nun verfügbar unter: http://localhost:3000

## 🌐 Deployment auf Vercel

### Automatisches Deployment via GitHub

1. **Repository auf GitHub pushen**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <ihr-github-repo-url>
   git push -u origin main
   ```

2. **Vercel Account erstellen**: https://vercel.com/signup

3. **Neues Projekt in Vercel**:
   - "Import Git Repository" wählen
   - Ihr GitHub-Repository auswählen
   - Framework Preset: **Next.js** (wird automatisch erkannt)

4. **PostgreSQL Datenbank in Vercel**:
   - Im Vercel-Dashboard: Storage → Create Database
   - Typ: **Postgres**
   - Region wählen (am besten EU für DSGVO)
   - Datenbank wird automatisch erstellt
   - `DATABASE_URL` wird automatisch als Environment Variable gesetzt

5. **Environment Variables in Vercel setzen**:
   
   Im Vercel-Dashboard unter Settings → Environment Variables:
   
   ```
   NEXTAUTH_SECRET=<langer-zufälliger-string>
   NEXTAUTH_URL=https://ihr-projekt.vercel.app
   
   EMAIL_SERVER=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=ihre-email@domain.de
   EMAIL_PASSWORD=ihr-app-passwort
   EMAIL_FROM=BdP Abrechnungssystem <noreply@bdp-bawue.de>
   EMAIL_TO=kasse@bdp-bawue.de
   ```

6. **Build & Deploy**:
   - Vercel baut und deployed automatisch
   - Bei jedem Git-Push erfolgt ein neues Deployment

7. **Datenbank initialisieren** (einmalig):
   
   Nach dem ersten Deployment im Vercel-Dashboard Terminal öffnen:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

## 📱 Verwendung

### Für Teilnehmende

1. Startseite öffnen
2. "Abrechnung einreichen" klicken
3. Formular ausfüllen:
   - Persönliche Daten
   - Maßnahme und Kategorie wählen
   - Bei Fahrtkosten: Automatische Berechnung
   - Beleg hochladen (optional)
4. Absenden

### Für Admins

1. `/admin/login` aufrufen
2. Mit Admin-Credentials einloggen
3. **Dashboard**: Übersicht aller Abrechnungen
4. **Freigabe**:
   - Maßnahme wählen
   - Abrechnungen auswählen
   - "Freigeben und versenden" klicken
   - → PDF wird erstellt und per E-Mail versendet

## 🔐 Standard-Login (Entwicklung)

```
E-Mail: admin@bdp-bawue.de
Passwort: admin123
```

**⚠️ WICHTIG**: Ändern Sie dieses Passwort in der Produktion!

```bash
# Neues Passwort hashen
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('neues-passwort', 10));"

# In Prisma Studio oder direkt in DB aktualisieren
npx prisma studio
```

## 🗂️ Projektstruktur

```
bdp-abrechnungssystem/
├── prisma/
│   ├── schema.prisma          # Datenbankschema
│   └── seed.ts                # Seed-Daten
├── public/
│   ├── uploads/               # Hochgeladene Belege
│   └── pdfs/                  # Generierte PDFs
├── src/
│   ├── app/
│   │   ├── abrechnung/        # Öffentliches Formular
│   │   ├── admin/             # Admin-Bereich
│   │   ├── api/               # API Routes
│   │   │   ├── abrechnung/
│   │   │   ├── aktionen/
│   │   │   ├── auth/
│   │   │   ├── email/
│   │   │   ├── kategorien/
│   │   │   ├── pdf/
│   │   │   └── upload/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx           # Startseite
│   ├── components/
│   │   ├── forms/
│   │   ├── admin/
│   │   └── ui/                # UI-Komponenten
│   ├── lib/
│   │   ├── auth.ts            # NextAuth Config
│   │   ├── email.ts           # E-Mail Service
│   │   ├── pdf-generator.ts   # PDF-Generierung
│   │   ├── prisma.ts          # Prisma Client
│   │   └── utils.ts           # Hilfsfunktionen
│   └── types/
│       └── index.ts           # TypeScript Types
├── .env                       # Environment Variables
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## 🐛 Troubleshooting

### Puppeteer installiert sich nicht

```bash
# Auf Linux/Debian-basierten Systemen
sudo apt-get install -y libgbm-dev

# Puppeteer neu installieren
npm install puppeteer --force
```

### E-Mail-Versand funktioniert nicht

1. Prüfen Sie SMTP-Credentials in `.env`
2. Für Gmail: App-Passwort verwenden (nicht normales Passwort)
3. Testen Sie mit:
   ```bash
   curl http://localhost:3000/api/email -X POST -H "Content-Type: application/json" -d '{"test": true}'
   ```

### Prisma Migrations schlagen fehl

```bash
# Reset der Datenbank (⚠️ Alle Daten gehen verloren!)
npx prisma migrate reset

# Oder nur neue Migration
npx prisma migrate dev --name init
```

### Vercel Build schlägt fehl

- Prüfen Sie, ob alle Environment Variables gesetzt sind
- Stellen Sie sicher, dass `DATABASE_URL` korrekt ist
- Logs in Vercel Dashboard prüfen

## 📝 Kategorien

Das System unterstützt 11 Abrechnungskategorien:

1. Teilnahmebeiträge
2. **Fahrtkosten** (mit automatischer Berechnung)
3. Unterkunft
4. Verpflegung
5. Material
6. Porto
7. Telekommunikation
8. Versicherung
9. Honorare
10. Raummiete
11. Sonstige Ausgaben

## 💡 Fahrtkosten-Berechnung

Automatische Berechnung basierend auf:
- **Fahrzeugtyp**: PKW (0,30€), Motorrad (0,20€), Kleinbus (0,35€), Bus (0,50€)
- **Zuschläge**: 
  - Lagerleitung: +0,05€/km
  - Materialtransport: +0,05€/km
  - Anhänger: +0,05€/km

## 🔒 Sicherheit

- Passwörter werden mit bcrypt gehasht
- NextAuth.js für sichere Authentifizierung
- CSRF-Schutz über Next.js
- File-Upload-Validierung (Typ & Größe)
- SQL-Injection-Schutz durch Prisma ORM

## 📧 Support

Bei Fragen oder Problemen:
- E-Mail: kasse@bdp-bawue.de
- Projekt-Repository: Issues öffnen

## 📄 Lizenz

© 2025 BdP Landesverband Baden-Württemberg e.V.

---

**Version**: 1.0  
**Stand**: Oktober 2025
