# BdP Abrechnungssystem

Vollautomatisiertes Abrechnungssystem für den BdP Landesverband Baden-Württemberg.

## Features

- ✅ **Öffentliches Eingabeformular** ohne Anmeldung
- ✅ **Automatische Fahrtkostenberechnung** nach aktuellen Sätzen (0,10-0,50 EUR/km)
- ✅ **Datei-Upload** für Belege (PDF, JPG, PNG bis 5MB)
- ✅ **Admin-Dashboard** zur Verwaltung und Freigabe
- ✅ **PDF-Generierung** mit allen Belegen
- ✅ **E-Mail-Versand** an die Landeskasse
- ✅ **PostgreSQL Datenbank** mit Prisma ORM
- ✅ **NextAuth** für sichere Authentifizierung
- ✅ **Modernes UI** mit Tailwind CSS und shadcn/ui
- ✅ **Vercel-optimiert** für einfaches Deployment

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Database:** PostgreSQL mit Prisma
- **Auth:** NextAuth.js
- **UI:** Tailwind CSS, shadcn/ui
- **Email:** Nodemailer
- **PDF:** pdf-lib
- **Deployment:** Vercel

## Installation

### 1. Repository klonen
```bash
git clone <repository-url>
cd bdp-abrechnungssystem
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Umgebungsvariablen einrichten
```bash
cp .env.example .env
```

Tragen Sie die folgenden Werte in `.env` ein:
- `DATABASE_URL`: PostgreSQL Connection String
- `NEXTAUTH_SECRET`: Generieren Sie mit `openssl rand -base64 32`
- `NEXTAUTH_URL`: Ihre Domain (z.B. `https://abrechnung.bdp-bawue.de`)
- SMTP-Einstellungen für E-Mail-Versand

### 4. Datenbank einrichten
```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

### 5. Entwicklungsserver starten
```bash
npm run dev
```

Die Anwendung ist nun unter `http://localhost:3000` erreichbar.

## Vercel Deployment

### Option 1: GitHub Integration (Empfohlen)

1. Repository auf GitHub pushen
2. Auf [vercel.com](https://vercel.com) mit GitHub verbinden
3. Neues Projekt erstellen und Repository auswählen
4. Umgebungsvariablen in Vercel eintragen
5. Deploy!

### Option 2: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Wichtige Vercel-Einstellungen

#### PostgreSQL Datenbank
- Option 1: **Vercel Postgres** (empfohlen)
  - Im Vercel Dashboard: Storage → Create Database → Postgres
  - DATABASE_URL wird automatisch gesetzt

- Option 2: **Externe Datenbank**
  - Supabase, Neon, Railway etc.
  - DATABASE_URL manuell in Umgebungsvariablen eintragen

#### Build Settings
```
Build Command: prisma generate && prisma migrate deploy && next build
Output Directory: .next
Install Command: npm install
```

#### Umgebungsvariablen
Alle Variablen aus `.env.example` in Vercel eintragen:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- SMTP-Konfiguration

## Standard-Zugangsdaten

Nach dem Seeding sind folgende Test-Accounts verfügbar:

**Admin:**
- E-Mail: `admin@bdp-bawue.de`
- Passwort: `admin123`

**Landeskasse:**
- E-Mail: `kasse@bdp-bawue.de`
- Passwort: `kasse123`

**⚠️ WICHTIG:** Ändern Sie diese Passwörter in der Produktion!

## Verwendung

### Für Teilnehmende
1. Öffnen Sie `/abrechnung`
2. Füllen Sie das Formular aus
3. Laden Sie optional einen Beleg hoch
4. Senden Sie die Abrechnung ab

### Für Admins
1. Login unter `/admin/login`
2. Dashboard öffnet sich
3. Abrechnungen prüfen und ergänzen
4. PDF generieren oder an Landeskasse senden

## Kategorien

Das System unterstützt folgende Abrechnungskategorien:
- Teilnahmebeiträge
- Fahrtkosten (mit automatischer Berechnung)
- Unterkunft
- Verpflegung
- Material
- Porto
- Telekommunikation
- Sonstige Ausgaben

## Fahrtkosten-Berechnung

Basis-Kilometersätze:
- PKW: 0,30 EUR/km
- Motorrad: 0,20 EUR/km
- Fahrrad: 0,10 EUR/km
- Öffentliche Verkehrsmittel: 0,00 EUR/km

Zuschläge:
- Pro Mitfahrer: +0,02 EUR/km
- Lagerleitung: +0,05 EUR/km
- Materialtransport: +0,05 EUR/km
- Anhänger: +0,05 EUR/km

Maximum: 0,50 EUR/km

## Projekt-Struktur

```
bdp-abrechnungssystem/
├── prisma/
│   ├── schema.prisma      # Datenbank-Schema
│   └── seed.ts            # Seed-Daten
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API Routes
│   │   ├── admin/         # Admin-Bereich
│   │   ├── abrechnung/    # Öffentliches Formular
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── ui/            # shadcn/ui Komponenten
│   └── lib/
│       ├── prisma.ts      # Prisma Client
│       ├── auth.ts        # NextAuth Konfiguration
│       ├── utils.ts       # Hilfsfunktionen
│       ├── pdf-generator.ts
│       └── email.ts
├── public/
│   └── uploads/           # Hochgeladene Belege
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## API-Endpoints

- `POST /api/abrechnungen` - Abrechnung erstellen
- `GET /api/abrechnungen` - Abrechnungen abrufen
- `PATCH /api/abrechnungen` - Abrechnung aktualisieren
- `DELETE /api/abrechnungen?id={id}` - Abrechnung löschen
- `POST /api/aktionen` - Aktion erstellen
- `GET /api/aktionen` - Aktionen abrufen
- `POST /api/upload` - Datei hochladen
- `POST /api/pdf/generate` - PDF generieren
- `POST /api/email/send` - E-Mail versenden

## Sicherheit

- Passwörter werden mit bcrypt gehasht
- NextAuth Session-Management
- CSRF-Schutz durch Next.js
- Input-Validierung auf Client & Server
- File-Upload-Limits und Typ-Prüfung
- Role-based Access Control (RBAC)

## Troubleshooting

### Prisma Fehler
```bash
npx prisma generate
npx prisma migrate reset
npx prisma db seed
```

### Build-Fehler auf Vercel
- Überprüfen Sie `DATABASE_URL`
- Stellen Sie sicher, dass Build Command korrekt ist
- Checken Sie Logs unter Vercel Dashboard → Deployments

### E-Mail-Versand funktioniert nicht
- SMTP-Zugangsdaten prüfen
- Firewall/Ports prüfen (587 oder 465)
- Provider-Limits beachten

## Support

Bei Fragen oder Problemen:
- E-Mail: kasse@bdp-bawue.de
- Issues: GitHub Repository

## Lizenz

© 2025 BdP Landesverband Baden-Württemberg e.V.

Alle Rechte vorbehalten.
