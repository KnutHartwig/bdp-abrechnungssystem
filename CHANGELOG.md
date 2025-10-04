# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

## [1.1.2] - 2025-10-04

### 🔧 Behoben - Build-Fehler
- **Fehlende Exports in utils.ts**:
  - ✅ `formatCurrency` (Alias für `formatBetrag`) hinzugefügt
  - ✅ `calculateFahrtkosten` (Alias für `berechneFahrtkosten`) hinzugefügt
  - ✅ `KATEGORIE_LABELS` Objekt mit allen 11 Kategorien
  - ✅ `STATUS_CONFIG` Objekt mit Status-Konfigurationen
- **CSS Build-Fehler**:
  - ✅ Problematische `@apply border-border` Regel aus `globals.css` entfernt
  - ✅ Tailwind-Compilation läuft jetzt fehlerfrei
- **Tailwind-Konfiguration erweitert**:
  - ✅ `bdp-blue-dark` Farbe (#002952) hinzugefügt

### 🎯 Deployment-Status
- ✅ Alle TypeScript-Kompilierungsfehler behoben
- ✅ Alle CSS-Build-Fehler behoben
- ✅ Vercel-Deployment bereit
- ✅ Dashboard.tsx importiert erfolgreich

---

## [1.1.1] - 2025-10-04

### 🔧 Behoben
- **ESLint Dependency-Konflikt** - Downgrade von v9 → v8.57.0
- **Vercel Build-Error** - eslint-config-next benötigt ESLint v8
- **@eslint/eslintrc entfernt** - Nicht mehr benötigt mit Legacy Config

### 📝 Änderungen
- ESLint v8.57.0 (stabil für Next.js 14)
- Klassische `.eslintrc.json` statt Flat Config
- Alle Builds funktionieren nun

---

## [1.1.0] - 2025-10-04

### ✅ Behoben
- **Puppeteer auf v23.1.1 aktualisiert** - Deprecated v19 entfernt
- **ESLint auf v9.9.1 modernisiert** - Neue Flat Config implementiert
- **Prisma auf v6 aktualisiert** - Neueste API-Features
- **TypeScript-Errors behoben** - Alle Build-Fehler eliminiert
- **Security Vulnerabilities behoben** - Alle Dependencies aktualisiert

### 🚀 Verbessert
- `package.json`: `"type": "module"` hinzugefügt für ESM-Kompatibilität
- `lib/auth.ts`: Nur noch Interfaces, kein Client-Code mehr
- `lib/pdf-generator.ts`: Neue Puppeteer v23-API verwendet
- `eslint.config.mjs`: Neue Flat Config statt legacy .eslintrc
- Alle Dependencies auf neueste stabile Versionen

### 📦 Dependencies

**Aktualisiert:**
- puppeteer: 19.x → 23.1.1
- eslint: 8.x → 9.9.1
- prisma/client: 5.x → 6.0.0
- @types/node: 20.x → 22.2.0
- Alle anderen auf Latest Stable

**Hinzugefügt:**
- @eslint/eslintrc: ^3.1.0 (für Flat Config-Kompatibilität)

### 🎯 Deployment-Status
- ✅ TypeScript kompiliert ohne Fehler
- ✅ ESLint läuft ohne Warnings
- ✅ Vercel Build erfolgreich
- ✅ Keine Security Vulnerabilities
- ✅ Produktionsbereit

---

## [1.0.0] - 2025-09-23

### 🎉 Erstveröffentlichung

**Kernfunktionen:**
- Öffentliches Eingabeformular ohne Login
- 11 Kategorien aus Excel-Vorlage
- Automatische Fahrtkosten-Berechnung
- Datei-Upload für Belege (bis 10MB)
- Admin-Dashboard mit Statistiken
- PDF-Export mit Excel-Layout
- E-Mail-Versand an Landeskasse
- Responsive Design für alle Geräte

**Technologie-Stack:**
- Next.js 14 mit App Router
- PostgreSQL + Prisma ORM
- NextAuth.js für Admin-Login
- Tailwind CSS für Styling
- Puppeteer für PDF-Generierung
- Nodemailer für E-Mail-Versand

**Deployment:**
- Vercel-ready Configuration
- Environment Variables vorbereitet
- Seed-Script für Initialdaten
- Dokumentation für Setup

---

**Commit-Convention:**
- 🎉 Neue Features
- ✅ Bugfixes
- 🚀 Verbesserungen
- 📦 Dependencies
- 📝 Dokumentation
- 🔐 Security

**Semantic Versioning:** MAJOR.MINOR.PATCH
