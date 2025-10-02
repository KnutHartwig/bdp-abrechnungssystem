# Setup-Anleitung BdP Abrechnungssystem

Diese Anleitung führt dich Schritt für Schritt durch die Installation und Konfiguration.

## 📋 Inhaltsverzeichnis

1. [Systemvoraussetzungen](#systemvoraussetzungen)
2. [Lokale Installation](#lokale-installation)
3. [Datenbank einrichten](#datenbank-einrichten)
4. [Umgebungsvariablen](#umgebungsvariablen)
5. [Erste Schritte](#erste-schritte)
6. [Troubleshooting](#troubleshooting)

## Systemvoraussetzungen

### Erforderlich

- **Node.js:** Version 18.0.0 oder höher
- **PostgreSQL:** Version 14.0 oder höher
- **npm oder yarn:** Neueste Version

### Optional

- **Git:** Für Versionskontrolle
- **VS Code:** Empfohlener Editor

### Installation prüfen

```bash
# Node.js Version
node --version  # sollte >= 18.0.0 sein

# npm Version
npm --version

# PostgreSQL Version
psql --version  # sollte >= 14.0 sein
```

## Lokale Installation

### 1. Projekt vorbereiten

```bash
# In Projektverzeichnis wechseln
cd bdp-abrechnungssystem

# Dependencies installieren
npm install

# Das kann 2-3 Minuten dauern
```

### 2. Verzeichnisstruktur erstellen

```bash
# Upload- und PDF-Verzeichnisse erstellen
mkdir -p public/uploads public/pdfs

# .gitkeep-Dateien anlegen (für Git)
touch public/uploads/.gitkeep
touch public/pdfs/.gitkeep
```

## Datenbank einrichten

### Option A: Lokale PostgreSQL-Datenbank

```bash
# PostgreSQL starten
sudo service postgresql start

# Als postgres-User anmelden
sudo -u postgres psql

# In psql:
CREATE DATABASE bdp_abrechnungen;
CREATE USER bdp_user WITH PASSWORD 'dein_sicheres_passwort';
GRANT ALL PRIVILEGES ON DATABASE bdp_abrechnungen TO bdp_user;
\q
```

Deine `DATABASE_URL`:
```
postgresql://bdp_user:dein_sicheres_passwort@localhost:5432/bdp_abrechnungen
```

### Option B: Vercel Postgres (Cloud)

1. Gehe zu [vercel.com/dashboard](https://vercel.com/dashboard)
2. Erstelle neues Storage → Postgres
3. Kopiere die `DATABASE_URL` aus den Settings

### Option C: Supabase (Cloud, kostenlos)

1. Gehe zu [supabase.com](https://supabase.com)
2. Erstelle neues Projekt
3. Gehe zu Settings → Database
4. Kopiere die Connection String

## Umgebungsvariablen

### 1. Template kopieren

```bash
cp .env.local.template .env.local
```

### 2. .env.local ausfüllen

Öffne `.env.local` und fülle die Werte:

#### Database

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

**Beispiele:**
- Lokal: `postgresql://bdp_user:passwort@localhost:5432/bdp_abrechnungen`
- Vercel: `postgres://user:pass@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`

#### NextAuth Secret generieren

```bash
# Im Terminal ausführen:
openssl rand -base64 32
```

Kopiere die Ausgabe in `.env.local`:

```env
NEXTAUTH_SECRET="<hier-die-generierte-ausgabe>"
```

#### Email (SMTP)

**Gmail-Beispiel:**

1. Gehe zu [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Erstelle App-Passwort für "Mail"
3. Kopiere das 16-stellige Passwort

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="deine-email@gmail.com"
SMTP_PASSWORD="xxxx xxxx xxxx xxxx"
SMTP_FROM="BdP Abrechnungen <deine-email@gmail.com>"
LANDESKASSE_EMAIL="kasse@bdp-bawue.de"
```

**Andere SMTP-Anbieter:**

- **Ionos:** smtp.ionos.de, Port 587
- **Strato:** smtp.strato.de, Port 465
- **1&1:** smtp.1und1.de, Port 587

#### Admin-Account

```env
ADMIN_EMAIL="admin@bdp-bawue.de"
ADMIN_PASSWORD="Ändere-mich-sofort-2025!"
```

⚠️ **WICHTIG:** Ändere das Admin-Passwort nach dem ersten Login!

### 3. Vollständige .env.local Beispiel

```env
# Database
DATABASE_URL="postgresql://bdp_user:geheim@localhost:5432/bdp_abrechnungen"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="7xK9mN2pQ5wR8tY4vZ6cX1bN3mL9kJ7hG5fD3sA1qW0e"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="abrechnungen@bdp-bawue.de"
SMTP_PASSWORD="abcd efgh ijkl mnop"
SMTP_FROM="BdP Abrechnungen <abrechnungen@bdp-bawue.de>"
LANDESKASSE_EMAIL="kasse@bdp-bawue.de"

# App Config
NEXT_PUBLIC_MAX_FILE_SIZE="5242880"
NEXT_PUBLIC_ALLOWED_FILE_TYPES="application/pdf,image/jpeg,image/png"

# Admin
ADMIN_EMAIL="admin@bdp-bawue.de"
ADMIN_PASSWORD="Admin2025!"
```

## Erste Schritte

### 1. Datenbank initialisieren

```bash
# Schema in Datenbank pushen
npx prisma db push

# Das erstellt alle Tabellen
```

### 2. Seed-Daten einfügen

```bash
# Kategorien und Admin-User erstellen
npx prisma db seed

# Du solltest sehen:
# ✅ 11 Kategorien erstellt
# ✅ Admin erstellt: admin@bdp-bawue.de
# ✅ Test-Aktion erstellt: Sommerlager 2025
```

### 3. Development Server starten

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

### 4. Admin-Login testen

1. Gehe zu [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
2. Login mit:
   - Email: `admin@bdp-bawue.de`
   - Passwort: Das aus `.env.local`
3. **Ändere sofort das Passwort!**

### 5. Test-Abrechnung einreichen

1. Gehe zu [http://localhost:3000/abrechnung](http://localhost:3000/abrechnung)
2. Fülle das Formular aus
3. Reiche es ein
4. Prüfe im Admin-Dashboard

## Troubleshooting

### Problem: "npm install" schlägt fehl

**Lösung:**

```bash
# Node.js Version prüfen
node --version

# Falls zu alt, aktualisieren:
# Ubuntu/Debian:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS:
brew install node@18
```

### Problem: "Prisma Client nicht gefunden"

**Lösung:**

```bash
npx prisma generate
npx prisma db push
```

### Problem: "Database connection failed"

**Lösung:**

1. Prüfe ob PostgreSQL läuft:
   ```bash
   sudo service postgresql status
   ```

2. Teste die Connection String:
   ```bash
   psql "postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
   ```

3. Prüfe `.env.local` auf Tippfehler

### Problem: "Email-Versand schlägt fehl"

**Lösung:**

1. Teste SMTP-Verbindung:
   ```bash
   telnet smtp.gmail.com 587
   ```

2. Bei Gmail: Stelle sicher, dass "App-Passwort" verwendet wird
3. Prüfe Firewall-Einstellungen

### Problem: "PDF-Generierung schlägt fehl"

**Lösung:**

1. Prüfe ob Verzeichnisse existieren:
   ```bash
   ls -la public/
   ```

2. Erstelle sie falls nötig:
   ```bash
   mkdir -p public/uploads public/pdfs
   chmod 755 public/uploads public/pdfs
   ```

### Problem: Port 3000 bereits belegt

**Lösung:**

```bash
# Anderen Port verwenden
PORT=3001 npm run dev
```

## Produktions-Deployment

Siehe `deployment-guide-vercel.md` für detaillierte Deployment-Anleitung.

Kurz:
```bash
npm run build    # Production Build erstellen
npm start        # Production Server starten
```

## Nützliche Kommandos

```bash
# Prisma Studio öffnen (DB-GUI)
npx prisma studio

# Datenbank zurücksetzen
npx prisma db push --force-reset

# TypeScript-Fehler prüfen
npx tsc --noEmit

# Build für Produktion
npm run build

# Logs anzeigen
npm run dev > logs.txt 2>&1
```

## Weitere Hilfe

- **Prisma Docs:** [prisma.io/docs](https://prisma.io/docs)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **NextAuth Docs:** [next-auth.js.org](https://next-auth.js.org)

Bei Problemen:
**Email:** kasse@bdp-bawue.de

---

**Geschafft!** 🎉 Die App sollte jetzt laufen.
