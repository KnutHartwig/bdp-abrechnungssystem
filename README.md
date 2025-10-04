# BdP Abrechnungssystem

> **Version 1.1.3** - Alle Build-Fehler behoben ✅  
> Status: **PRODUKTIONSBEREIT** 🚀

Automatisiertes Abrechnungssystem für den BdP Landesverband Baden-Württemberg e.V.

## 📊 Build-Status

- ✅ TypeScript kompiliert ohne Fehler
- ✅ CSS Build erfolgreich
- ✅ Webpack Build erfolgreich  
- ✅ Vercel Deployment-ready
- ✅ Alle kritischen Dependencies aktualisiert

**Was wurde in v1.1.3 behoben:**
- 🔴 CSS Build-Fehler (`bg-background` nicht existent) → BEHOBEN
- 🔴 Puppeteer Security Update (23.x → 24.23.0) → BEHOBEN
- 🟡 Node.js Engine Auto-Upgrade → BEHOBEN
- 📚 Vollständige Dokumentation aller Warnings

*Siehe: `ALL-FIXES-SUMMARY.md` und `DEPRECATED-WARNINGS.md` für Details*

---

## 📋 Features

- ✅ **Öffentliche Eingabe** - Teilnehmende können Abrechnungen ohne Login einreichen
- ✅ **11 Kategorien** aus Excel-Vorlage (Teilnahmebeiträge, Fahrtkosten, Verpflegung, etc.)
- ✅ **Automatische Fahrtkosten-Berechnung** mit Zuschlägen
- ✅ **Datei-Upload** für Belege (PDF, JPG, PNG bis 10MB)
- ✅ **Admin-Dashboard** mit Statistiken und Übersicht
- ✅ **PDF-Export** mit Excel-ähnlichem Layout
- ✅ **E-Mail-Versand** an Landeskasse
- ✅ **Responsive Design** - funktioniert auf allen Geräten

## 🚀 Schnellstart

### 1. Repository klonen

```bash
git clone https://github.com/ihr-username/bdp-abrechnungssystem.git
cd bdp-abrechnungssystem
```

### 2. Dependencies installieren

```bash
npm install
```

### 3. Umgebungsvariablen einrichten

```bash
cp .env.local.example .env.local
# .env.local bearbeiten und ausfüllen
```

**Wichtige Variablen:**
- `DATABASE_URL` - PostgreSQL-Verbindung
- `NEXTAUTH_SECRET` - Geheimer Schlüssel (min. 32 Zeichen)
- `ADMIN_EMAIL` und `ADMIN_PASSWORD` - Initial-Admin
- `SMTP_*` - E-Mail-Konfiguration

### 4. Datenbank einrichten

```bash
npm run db:push
npm run db:seed
```

### 5. Development-Server starten

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

## 📦 Deployment (Vercel)

### Vorbereitung

1. GitHub-Repository erstellen und Code pushen
2. Vercel-Account erstellen: [vercel.com](https://vercel.com)
3. PostgreSQL-Datenbank erstellen (empfohlen: Neon, Supabase oder Vercel Postgres)

### Deployment

1. **Projekt in Vercel importieren**
   - GitHub-Repository verbinden
   - Framework: Next.js (wird automatisch erkannt)

2. **Environment Variables setzen**
   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_URL=https://ihre-domain.vercel.app
   NEXTAUTH_SECRET=generierter-secret-key
   ADMIN_EMAIL=admin@bdp-bawue.de
   ADMIN_PASSWORD=sicheres-passwort
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=ihre-email
   SMTP_PASSWORD=app-password
   SMTP_FROM=noreply@bdp-bawue.de
   LANDESKASSE_EMAIL=kasse@bdp-bawue.de
   ```

3. **Deploy!**
   - Vercel deployed automatisch
   - Nach erfolgreichem Deploy: Seed-Daten einspielen

4. **Datenbank initialisieren**
   ```bash
   # Lokal mit Production-DB
   npm run db:seed
   ```

## 🔐 Admin-Zugang

Nach dem Seeding:
- **URL:** `https://ihre-domain.vercel.app/admin/login`
- **E-Mail:** Wert aus `ADMIN_EMAIL`
- **Passwort:** Wert aus `ADMIN_PASSWORD`

## 📂 Projektstruktur

```
bdp-abrechnungssystem/
├── prisma/
│   ├── schema.prisma      # Datenbankschema
│   └── seed.ts            # Seed-Daten
├── public/
│   ├── uploads/           # Hochgeladene Belege
│   └── pdfs/              # Generierte PDFs
├── src/
│   ├── app/
│   │   ├── abrechnung/    # Öffentliche Eingabe
│   │   ├── admin/         # Admin-Dashboard
│   │   └── api/           # API-Routes
│   ├── components/        # React-Komponenten
│   ├── lib/               # Utilities & Funktionen
│   └── types/             # TypeScript-Typen
├── .env.local.example     # Beispiel-Env-Variablen
└── package.json
```

## 🛠️ Technologie-Stack

- **Framework:** Next.js 14 (App Router)
- **Datenbank:** PostgreSQL + Prisma ORM (v6)
- **Auth:** NextAuth.js
- **Styling:** Tailwind CSS
- **PDF:** Puppeteer v23
- **E-Mail:** Nodemailer
- **TypeScript:** Full-Stack Type Safety

## 📧 SMTP-Konfiguration

### Gmail

1. App-Passwort erstellen: [Google Account Settings](https://myaccount.google.com/apppasswords)
2. In `.env.local`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=ihre-email@gmail.com
   SMTP_PASSWORD=generiertes-app-passwort
   ```

### Andere Anbieter

- **Outlook:** `smtp.office365.com:587`
- **Ionos:** `smtp.ionos.de:587`
- **Mailgun/SendGrid:** API-Keys verwenden

## 🧪 Testing

```bash
# Development-Server starten
npm run dev

# Prisma Studio (DB-Inspektion)
npm run db:studio
```

## 📊 Kategorien

1. Teilnahmebeiträge
2. Fahrtkosten (mit automatischer Berechnung)
3. Unterkunft
4. Verpflegung
5. Material
6. Porto
7. Telekommunikation
8. Versicherung
9. Honorare
10. Öffentlichkeitsarbeit
11. Sonstige Ausgaben

## 🚗 Fahrtkosten-Berechnung

**Basis-Sätze:**
- PKW: 0,30 €/km
- Transporter: 0,40 €/km
- Bus: 0,50 €/km

**Zuschläge (je +0,05 €/km):**
- Lagerleitung
- Material
- Anhänger

**Formel:**
```
Betrag = km × Satz × (1 + Mitfahrer/10)
```

## 🐛 Troubleshooting

### Build-Fehler bei Vercel

**Problem:** Puppeteer installation fails
**Lösung:** Bereits gelöst in v1.1.0 (optimierte Dependencies)

### Datenbank-Verbindung

**Problem:** Connection timeout
**Lösung:** SSL-Parameter prüfen: `?sslmode=require` in `DATABASE_URL`

### E-Mail-Versand

**Problem:** SMTP authentication failed
**Lösung:** App-Passwort verwenden, nicht Account-Passwort

## 📝 Lizenz

Dieses Projekt ist für den internen Gebrauch des BdP Landesverbands Baden-Württemberg e.V.

## 👥 Kontakt

Bei Fragen: **kasse@bdp-bawue.de**

---

**Version 1.1.1** - Produktionsbereit | Oktober 2025
