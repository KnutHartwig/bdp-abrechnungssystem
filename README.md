# BdP Abrechnungssystem

Automatisiertes Abrechnungssystem für den BdP Landesverband Baden-Württemberg.

## ✨ Features

- ✅ Öffentliches Eingabeformular ohne Anmeldung
- ✅ Automatische Fahrtkosten-Berechnung mit Zuschlägen
- ✅ Datei-Upload für Belege (PDF, JPG, PNG)
- ✅ Admin-Dashboard mit Übersicht und Statistiken
- ✅ Automatische PDF-Generierung mit allen Belegen
- ✅ E-Mail-Versand an Landeskasse
- ✅ 11 Abrechnungskategorien
- ✅ Responsive Design (Mobile & Desktop)

## 🚀 Schnellstart

### Voraussetzungen

- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- Git

### Installation

```bash
# Repository klonen
git clone <your-repo-url>
cd bdp-abrechnungssystem

# Dependencies installieren
npm install

# Umgebungsvariablen konfigurieren
cp .env.local.template .env.local
# Bearbeite .env.local mit deinen Werten

# Datenbank initialisieren
npx prisma db push
npx prisma db seed

# Development Server starten
npm run dev
```

Die App läuft dann auf [http://localhost:3000](http://localhost:3000)

## 📝 Umgebungsvariablen

Kopiere `.env.local.template` zu `.env.local` und fülle folgende Werte:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generiere-mit-openssl-rand-base64-32>"

# Email (SMTP)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="noreply@bdp-bawue.de"
SMTP_PASSWORD="YOUR_PASSWORD"
SMTP_FROM="BdP Abrechnungen <noreply@bdp-bawue.de>"
LANDESKASSE_EMAIL="kasse@bdp-bawue.de"

# Admin Account (wird beim Seed erstellt)
ADMIN_EMAIL="admin@bdp-bawue.de"
ADMIN_PASSWORD="change-me-on-first-login"
```

## 🏗️ Projekt-Struktur

```
bdp-abrechnungssystem/
├── prisma/
│   ├── schema.prisma       # Datenbankschema
│   └── seed.ts             # Seed-Daten
├── public/
│   ├── uploads/            # Hochgeladene Belege
│   └── pdfs/               # Generierte PDFs
├── src/
│   ├── app/
│   │   ├── api/            # API Routes
│   │   ├── abrechnung/     # Öffentliche Eingabe
│   │   └── admin/          # Admin-Bereich
│   ├── components/
│   │   ├── ui/             # Basis-UI-Komponenten
│   │   ├── forms/          # Formulare
│   │   └── admin/          # Admin-Komponenten
│   ├── lib/
│   │   ├── prisma.ts       # DB-Client
│   │   ├── auth.ts         # Authentication
│   │   ├── pdf-generator.ts # PDF-Erstellung
│   │   ├── email.ts        # E-Mail-Versand
│   │   └── utils.ts        # Hilfsfunktionen
│   └── types/
│       └── index.ts        # TypeScript-Typen
├── .env.local              # Umgebungsvariablen (nicht in Git!)
├── package.json
└── README.md
```

## 🎯 Verwendung

### Für Teilnehmende

1. Öffne [/abrechnung](/abrechnung)
2. Fülle das Formular aus
3. Lade optional einen Beleg hoch
4. Reiche die Abrechnung ein

### Für Admins

1. Login unter [/admin/login](/admin/login)
2. Standardzugangsdaten nach Seed:
   - Email: `admin@bdp-bawue.de`
   - Passwort: `Admin2025!` (sofort ändern!)
3. Dashboard zeigt alle Abrechnungen
4. Wähle eine Aktion
5. Klicke "PDF erstellen & versenden"

## 🔧 Deployment

### Option 1: Vercel (Empfohlen)

Siehe detaillierte Anleitung in `deployment-guide-vercel.md`

Kurzversion:
```bash
# Vercel CLI installieren
npm i -g vercel

# Deployment
vercel

# Production Deployment
vercel --prod
```

### Option 2: Docker

```bash
# Docker Image bauen
docker build -t bdp-abrechnungssystem .

# Container starten
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e NEXTAUTH_SECRET="..." \
  bdp-abrechnungssystem
```

## 🧪 Testing

```bash
# Development Server
npm run dev

# Production Build testen
npm run build
npm start

# Prisma Studio (DB-GUI)
npm run db:studio
```

## 📚 Technologien

- **Frontend:** Next.js 14, React 18, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL mit Prisma ORM
- **Auth:** NextAuth.js
- **PDF:** pdf-lib
- **Email:** Nodemailer

## 🔐 Sicherheit

- Passwörter werden mit bcrypt gehasht
- NextAuth Session-basierte Authentifizierung
- CSRF-Schutz durch Next.js
- Input-Validierung auf Client & Server
- SQL-Injection-Schutz durch Prisma

## 📖 API-Dokumentation

### Public Endpoints

- `POST /api/abrechnung` - Abrechnung einreichen
- `POST /api/upload` - Beleg hochladen

### Protected Endpoints (Admin only)

- `GET /api/abrechnung` - Alle Abrechnungen abrufen
- `PATCH /api/abrechnung` - Abrechnung aktualisieren
- `DELETE /api/abrechnung` - Abrechnung löschen
- `POST /api/pdf` - PDF generieren
- `GET /api/pdf?aktionId=...` - PDF herunterladen
- `POST /api/email` - Email versenden

## 🐛 Bekannte Probleme & Lösungen

### Prisma-Fehler beim ersten Start

```bash
npx prisma generate
npx prisma db push
```

### PDF-Generierung schlägt fehl

Stelle sicher, dass `/public/uploads` und `/public/pdfs` existieren:
```bash
mkdir -p public/uploads public/pdfs
```

### Email-Versand funktioniert nicht

Prüfe SMTP-Einstellungen in `.env.local` und teste mit:
```bash
node -e "require('./src/lib/email').testEmailConnection()"
```

## 📞 Support

Bei Fragen oder Problemen:
- **Email:** kasse@bdp-bawue.de
- **Dokumentation:** Siehe `SETUP.md` für Details

## 📄 Lizenz

Internes Projekt des BdP Landesverband Baden-Württemberg e.V.

## 🙏 Credits

Entwickelt für den BdP Landesverband Baden-Württemberg e.V.

---

**Version:** 1.0.0  
**Stand:** Oktober 2025
