# Matilde - Installationsanleitung

**Abrechnungssystem für BdP Landesverband Baden-Württemberg e.V.**

## Schnellstart

### 1. Abhängigkeiten installieren

```bash
npm install
```

### 2. Umgebungsvariablen konfigurieren

```bash
cp .env.example .env.local
```

Bearbeite `.env.local` und füge deine Daten ein:

```env
# Database - Wichtig: PostgreSQL muss installiert sein!
DATABASE_URL="postgresql://user:password@localhost:5432/matilde_db?schema=public"

# NextAuth.js - Generiere ein Secret mit: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<HIER-DEIN-GENERIERTES-SECRET-EINFÜGEN>"

# Email (SMTP) - Optional für Entwicklung
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="deine-email@gmail.com"
SMTP_PASSWORD="dein-app-passwort"
SMTP_FROM="Matilde - BdP Landesverband Baden-Württemberg e.V. <noreply@bdp-bawue.de>"
LANDESKASSE_EMAIL="kasse@bdp-bawue.de"
```

### 3. Datenbank initialisieren

⚠️ **WICHTIG**: Diese Schritte müssen in dieser Reihenfolge ausgeführt werden!

```bash
# Prisma Client generieren
npm run db:generate

# Datenbank-Schema anwenden
npm run db:push

# Testdaten und Admin-Benutzer erstellen
npm run db:seed
```

Nach dem Seed werden folgende Test-Benutzer angelegt:
- **Admin**: admin@bdp-bawue.de / admin123
- **Landeskasse**: kasse@bdp-bawue.de / admin123

### 4. Entwicklungsserver starten

```bash
npm run dev
```

Die Anwendung ist nun unter http://localhost:3000 erreichbar.

## Login-Problem beheben

Falls der Admin-Login nicht funktioniert ("Ungültige Anmeldedaten"), liegt das meist an einem der folgenden Probleme:

### Problem 1: NEXTAUTH_SECRET fehlt

**Lösung:**
```bash
# Secret generieren
openssl rand -base64 32

# In .env.local eintragen:
NEXTAUTH_SECRET="das-generierte-secret"
```

### Problem 2: Datenbank nicht initialisiert

**Lösung:**
```bash
# Datenbank zurücksetzen und neu initialisieren
npm run db:push
npm run db:seed
```

### Problem 3: Falsche Zugangsdaten

**Standard-Zugänge nach Seed:**
- Email: `kasse@bdp-bawue.de`
- Passwort: `admin123`

**Tipp:** Starte mit dem Landeskasse-Account (nicht Admin), da dieser volle Rechte hat und weitere Admins anlegen kann.

## Kategorien

Das System verwendet folgende 11 Kategorien:

1. Teilnahmebeiträge
2. Sonstige Einnahmen
3. Vorschuss
4. Fahrtkosten
5. Unterkunft
6. Verpflegung
7. Material
8. Porto
9. Telekommunikation
10. Sonstige Ausgaben
11. Offene Verbindlichkeiten

## Projekt-Struktur

```
matilde-bdp-bawue/
├── prisma/
│   ├── schema.prisma      # Datenbankschema mit allen 11 Kategorien
│   └── seed.ts            # Testdaten und Admin-Benutzer
├── src/
│   ├── app/
│   │   ├── abrechnung/    # Öffentliches Abrechnungsformular
│   │   ├── admin/         # Admin-Bereich (geschützt)
│   │   └── api/           # API-Endpunkte
│   ├── components/        # React-Komponenten
│   ├── lib/               # Utilities (Auth, PDF, Email, Prisma)
│   └── types/             # TypeScript-Typen
└── public/
    ├── uploads/           # Hochgeladene Belege
    └── pdfs/              # Generierte PDFs
```

## Nächste Schritte

1. **Admin-Bereich öffnen**: http://localhost:3000/admin/login
2. **Mit Landeskasse-Account anmelden**: kasse@bdp-bawue.de / admin123
3. **Weitere Admins anlegen**: Im Admin-Bereich unter "Benutzerverwaltung"
4. **Test-Abrechnung erstellen**: http://localhost:3000/abrechnung

## Deployment

Siehe [DEPLOYMENT.md](./DEPLOYMENT.md) für Produktiv-Deployment.

## Support

Bei Problemen:
1. Logs prüfen: `npm run dev` zeigt alle Fehler an
2. Datenbank-Status prüfen: `npm run db:studio`
3. Kontakt: kasse@bdp-bawue.de
